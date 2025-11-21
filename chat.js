// api/chat.js - Vercel Edge Runtime Chat API
// Handles room creation, message posting, and polling for updates

export const config = { runtime: 'edge' };

// In-memory store (resets on cold start - use Redis/KV for production)
const rooms = new Map();
const ROOM_TTL = 30 * 60 * 1000; // 30 min
const MAX_MSG = 100;
const MAX_USERS = 50;

function cleanup() {
  const now = Date.now();
  for (const [k, r] of rooms) {
    if (now - r.updated > ROOM_TTL) rooms.delete(k);
    else {
      // Remove stale users
      for (const [uid, u] of r.users) {
        if (now - u.last > 15000) r.users.delete(uid);
      }
    }
  }
}

function getRoom(code) {
  cleanup();
  return rooms.get(code);
}

function createRoom(code) {
  const room = { code, users: new Map(), messages: [], updated: Date.now(), typing: new Map() };
  rooms.set(code, room);
  return room;
}

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return cors(new Response(null, { status: 204 }));
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const roomCode = url.searchParams.get('room');
  const userId = url.searchParams.get('uid');
  const userName = url.searchParams.get('user');

  // Create room
  if (action === 'create' && req.method === 'POST') {
    const code = roomCode || Math.random().toString(36).substr(2, 5).toUpperCase();
    let room = getRoom(code);
    if (!room) room = createRoom(code);
    return cors(new Response(JSON.stringify({ ok: true, room: code }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  // Join room
  if (action === 'join' && req.method === 'POST') {
    let room = getRoom(roomCode);
    if (!room) {
      return cors(new Response(JSON.stringify({ ok: false, error: 'Room not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      }));
    }
    if (room.users.size >= MAX_USERS) {
      return cors(new Response(JSON.stringify({ ok: false, error: 'Room full' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      }));
    }
    room.users.set(userId, { name: userName, joined: Date.now(), last: Date.now() });
    room.messages.push({ type: 'system', msg: `${userName} joined`, ts: Date.now(), time: new Date().toTimeString().slice(0,8) });
    room.updated = Date.now();
    return cors(new Response(JSON.stringify({ ok: true, users: Array.from(room.users.values()).map(u => u.name) }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  // Leave room
  if (action === 'leave' && req.method === 'POST') {
    const room = getRoom(roomCode);
    if (room && room.users.has(userId)) {
      const user = room.users.get(userId);
      room.users.delete(userId);
      room.messages.push({ type: 'system', msg: `${user.name} left`, ts: Date.now(), time: new Date().toTimeString().slice(0,8) });
      room.updated = Date.now();
    }
    return cors(new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  // Send message
  if (action === 'send' && req.method === 'POST') {
    const room = getRoom(roomCode);
    if (!room) {
      return cors(new Response(JSON.stringify({ ok: false, error: 'Room not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      }));
    }
    try {
      const body = await req.json();
      const msg = (body.msg || '').slice(0, 500);
      if (msg) {
        room.messages.push({
          type: 'chat',
          user: userName,
          msg,
          ts: Date.now(),
          time: new Date().toTimeString().slice(0, 8)
        });
        if (room.messages.length > MAX_MSG) room.messages = room.messages.slice(-MAX_MSG);
        room.updated = Date.now();
      }
      // Update user last seen
      if (room.users.has(userId)) room.users.get(userId).last = Date.now();
      return cors(new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      }));
    } catch (e) {
      return cors(new Response(JSON.stringify({ ok: false, error: 'Invalid body' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      }));
    }
  }

  // Typing indicator
  if (action === 'typing' && req.method === 'POST') {
    const room = getRoom(roomCode);
    if (room) {
      room.typing.set(userId, { name: userName, ts: Date.now() });
      if (room.users.has(userId)) room.users.get(userId).last = Date.now();
    }
    return cors(new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  // Poll for updates
  if (action === 'poll' && req.method === 'GET') {
    const room = getRoom(roomCode);
    if (!room) {
      return cors(new Response(JSON.stringify({ ok: false, error: 'Room not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      }));
    }
    const since = parseInt(url.searchParams.get('since') || '0', 10);
    // Update user heartbeat
    if (room.users.has(userId)) room.users.get(userId).last = Date.now();
    // Get new messages
    const newMsgs = room.messages.filter(m => m.ts > since);
    // Get active users
    const users = Array.from(room.users.values()).filter(u => Date.now() - u.last < 15000).map(u => u.name);
    // Get typing users
    const typing = Array.from(room.typing.entries())
      .filter(([k, v]) => k !== userId && Date.now() - v.ts < 3000)
      .map(([k, v]) => v.name);
    // Cleanup old typing
    for (const [k, v] of room.typing) {
      if (Date.now() - v.ts > 5000) room.typing.delete(k);
    }
    return cors(new Response(JSON.stringify({
      ok: true,
      messages: newMsgs,
      users,
      typing,
      ts: Date.now()
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  // Check if room exists
  if (action === 'check' && req.method === 'GET') {
    const room = getRoom(roomCode);
    return cors(new Response(JSON.stringify({
      exists: !!room,
      users: room ? room.users.size : 0
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  return cors(new Response(JSON.stringify({ error: 'Unknown action' }), {
    status: 400, headers: { 'Content-Type': 'application/json' }
  }));
}