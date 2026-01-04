import { marked } from 'marked';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './content';
const OUTPUT_DIR = './dist';
const TEMPLATE_FILE = './template.html';
const PORT = 3000;

// Read template once
const template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

// Live reload script for dev server
const liveReloadScript = `
  <script>
    // Simple live reload: poll every 2 seconds
    let lastModified = Date.now();
    setInterval(async () => {
      try {
        const res = await fetch('/reload-check');
        const { modified } = await res.json();
        if (modified > lastModified) {
          location.reload();
        }
      } catch(e) {}
    }, 2000);
  </script>`;

// HTML template wrapper with live reload
function htmlTemplate(title, content) {
  return template
    .replace('{{title}}', title)
    .replace('{{content}}', content)
    .replace('</head>', `${liveReloadScript}\n</head>`);
}

// Build all markdown files
function buildAll() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  files.forEach(file => {
    const markdown = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const html = marked(markdown);
    const title = file.replace('.md', '');
    const output = htmlTemplate(title, html);
    const outputPath = path.join(OUTPUT_DIR, file.replace('.md', '.html'));
    fs.writeFileSync(outputPath, output);
  });

  return files.length;
}

// Initial build
console.log('Building site...');
const count = buildAll();
console.log(`Built ${count} page(s)`);

// Watch for changes
let lastModified = Date.now();
fs.watch(CONTENT_DIR, (eventType, filename) => {
  if (filename && filename.endsWith('.md')) {
    console.log(`Change detected: ${filename}`);
    buildAll();
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
