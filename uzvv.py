IMPORTANT: Return ONLY a single, complete HTML document (one .html file). The response must contain exactly the full HTML file contents (starting with <!doctype html> and ending with </html>) enclosed in a single code block. Do NOT output extra commentary or external files. All CSS must be inside a single <style> tag and all JavaScript inside a single <script> tag. No CDN, no external libraries, no external fonts.

Task
----
Create a single-page **ASCII Art Generator** for my portfolio website. The entire project must be hacker/terminal themed (dark background, neon green/cyan glow, scanlines, flicker effects). The interface must show a **large MAQSADBEK ASCII banner at the very top**, exactly in this pixel style:

███████  ███    ███   █████   ███████   ██████   ██████  ███████ ██   ██
██       ████  ████  ██   ██  ██       ██    ██ ██       ██      ██   ██
█████    ██ ████ ██  ███████  █████    ██    ██ ██   ███ ███████ ███████
██       ██  ██  ██  ██   ██  ██       ██    ██ ██    ██      ██ ██   ██
███████  ██      ██  ██   ██  ███████   ██████   ██████  ███████ ██   ██

This header must be displayed at the top of the page exactly like the screenshot (pixel-glow, neon green, slight static/noise effect). The ASCII Art Generator UI appears below this banner.

Core Features
-------------
1) Input field:
   - Large textarea where user types text to convert into ASCII art.
   - Live preview: ASCII updates in real time.

2) Font styles:
   - Several ASCII font presets (block, outline, cyber, pixel-grid, minimal).
   - MAQSADBEK style should be available as “Pixel-Block Header Style”.

3) Options panel:
   - Foreground color chooser (neon green, cyan, magenta, white).
   - Background color chooser (black, deep grey).
   - Letter-spacing control.
   - Line-height control.
   - Output width control (wrap / no wrap).
   - Toggle neon glow.
   - Toggle scanlines.
   - Toggle CRT flicker.

4) Export tools:
   - Copy ASCII to clipboard.
   - Download as .TXT.
   - Download as .PNG (render ASCII on <canvas> with neon glow and pixel-perfect alignment).
   - Download as .SVG (monospace layout with optional glow filter).

5) Built-in samples:
   - A gallery of example ASCII texts.
   - “Insert MAQSADBEK Header” button: adds the big ASCII header to the top of the generated output.

6) UI Requirements:
   - Dark terminal aesthetic (#0b0b0b background).
   - Neon green (#39ff14) and cyan (#00f5ff) accents.
   - Monospace font only (system monospace fallback).
   - Subtle animated scanline overlay.
   - Buttons with neon glow and small flicker.
   - Fully responsive for mobile and desktop.

7) Performance & Implementation:
   - Entire logic must be client-side.
   - ASCII generation must be implemented directly in JavaScript (no external font files).
   - PNG export must use HTML5 canvas.
   - SVG export must generate a full <svg> string.
   - No network calls, no external APIs.
   - Code should be well-commented, especially:
       * ASCII generator logic
       * Canvas renderer
       * Glow effects
       * Export functions

8) Deliverable:
   - A single HTML file containing:
       * The MAQSADBEK ASCII banner at top (styled)
       * ASCII generator UI
       * Inline CSS
       * Inline JavaScript
   - Must open and work offline in any browser.

End of prompt.
