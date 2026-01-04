import { buildAll, CONTENT_DIR, OUTPUT_DIR } from '../lib/builder.js';
import http from 'http';
import fs from 'fs';
import path from 'path';

const LIVE_RELOAD_SCRIPT = './scripts/live-reload.js';
const PORT = 3000;

// Read live reload script and wrap in <script> tag
const liveReloadJs = fs.readFileSync(LIVE_RELOAD_SCRIPT, 'utf-8');
const liveReloadScript = `<script>\n${liveReloadJs}\n</script>`;

// Initial build
console.log('Building site...');
const count = buildAll({ injectScript: liveReloadScript });
console.log(`Built ${count} page(s)`);

// Watch for changes
let lastModified = Date.now();
fs.watch(CONTENT_DIR, (eventType, filename) => {
  if (filename && filename.endsWith('.md')) {
    console.log(`Change detected: ${filename}`);
    buildAll({ injectScript: liveReloadScript });
    lastModified = Date.now();
    console.log('Rebuilt!');
  }
});

// HTTP server
const server = http.createServer((req, res) => {
  // Live reload check endpoint
  if (req.url === '/reload-check') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ modified: lastModified }));
    return;
  }

  // Serve HTML files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(OUTPUT_DIR, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\nDev server running at http://localhost:${PORT}`);
  console.log('Watching for changes...\n');
});
