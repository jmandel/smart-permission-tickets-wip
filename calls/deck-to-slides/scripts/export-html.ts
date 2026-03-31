/**
 * Export slide images into an HTML deck that references images by relative path.
 *
 * Usage: bun run export-html.ts <slides-dir> <out.html>
 *
 * The HTML references images as relative paths from the HTML file's location
 * to the slides directory. Both must be served from the same origin.
 */

import { readdir } from "fs/promises";
import { relative, dirname } from "path";

async function main() {
  const [slidesDir, outPath] = process.argv.slice(2);

  if (!slidesDir || !outPath) {
    console.error("Usage: bun run export-html.ts <slides-dir> <out.html>");
    process.exit(1);
  }

  const files = await readdir(slidesDir);
  const slideFiles = files
    .filter((f) => f.match(/^slide-\d+\.(png|jpg|jpeg)$/))
    .sort((a, b) => parseInt(a.match(/\d+/)![0]) - parseInt(b.match(/\d+/)![0]));

  if (slideFiles.length === 0) {
    console.error(`No slide images found in ${slidesDir}/`);
    process.exit(1);
  }

  // Compute relative path from HTML file to slides directory
  const relDir = relative(dirname(outPath), slidesDir) || ".";
  const slides = slideFiles.map((f) => `${relDir}/${f}`);

  for (const file of slideFiles) {
    console.log(`  Referenced: ${relDir}/${file}`);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Slide Deck</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #111; display: flex; align-items: center; justify-content: center;
    height: 100vh; font-family: system-ui, sans-serif; overflow: hidden; user-select: none;
  }
  .slide-container {
    position: relative; width: 100vw; height: 56.25vw;
    max-height: 100vh; max-width: 177.78vh;
  }
  .slide-container img { width: 100%; height: 100%; object-fit: contain; }
  .controls { position: fixed; bottom: 12px; right: 16px; color: #888; font-size: 13px; z-index: 10; pointer-events: none; }
  .nav-btn { position: fixed; top: 0; width: 15%; height: 100%; cursor: pointer; z-index: 5; background: transparent; border: none; }
  .nav-btn.prev { left: 0; }
  .nav-btn.next { right: 0; }
  .nav-btn:hover { background: rgba(255,255,255,0.02); }
</style>
</head>
<body>
<div class="slide-container"><img id="slide" src="" alt="Slide"></div>
<button class="nav-btn prev" onclick="go(-1)"></button>
<button class="nav-btn next" onclick="go(1)"></button>
<div class="controls"><span id="counter"></span> &middot; &larr;&rarr; or click &middot; F for fullscreen</div>
<script>
const slides = ${JSON.stringify(slides)};
let current = 0;
const img = document.getElementById('slide');
const counter = document.getElementById('counter');
function show(i) { current = Math.max(0, Math.min(slides.length - 1, i)); img.src = slides[current]; counter.textContent = (current + 1) + ' / ' + slides.length; }
function go(d) { show(current + d); }
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  if (e.key === 'Home') { e.preventDefault(); show(0); }
  if (e.key === 'End') { e.preventDefault(); show(slides.length - 1); }
  if (e.key === 'f' || e.key === 'F') { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }
});
show(0);
</script>
</body>
</html>`;

  await Bun.write(outPath, html);
  console.log(`HTML deck saved: ${outPath} (${slides.length} slides)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
