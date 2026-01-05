import http from 'http';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import {ColorLog} from '../lib/colorLog.js';
import { buildAll, buildSingle, CONTENT_DIR, OUTPUT_DIR } from '../lib/builder.js';

const LIVE_RELOAD_SCRIPT = './scripts/live-reload.js';
const PORT = 3000;

// Event emitter for live reload notifications
const reloadEmitter = new EventEmitter();
reloadEmitter.setMaxListeners(100); // Prevent warnings with 10+ connected tabs


// Read live reload script and wrap in <script> tag
let liveReloadJs;
try {
  liveReloadJs = fs.readFileSync(LIVE_RELOAD_SCRIPT, 'utf-8');
} catch (err) {
  console.error(`Failed to read live reload script: ${LIVE_RELOAD_SCRIPT}`);
  console.error(err.message);
  process.exit(1);
}
const liveReloadScript = `<script>\n${liveReloadJs}\n</script>`;

// Initial build
await buildAll({ injectScript: liveReloadScript });

console.log("Watching...")
console.log(`Server at ${ColorLog.cyan(`http://localhost:${PORT}`)}`);


// Watch for changes
let watcher;
try {
  watcher = fs.watch(CONTENT_DIR, async (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(`${ColorLog.dim("File changed:")} ${CONTENT_DIR}/${filename}`);

      await buildSingle(filename, { injectScript: liveReloadScript, logOnSuccess: true });

      // Notify all connected SSE clients
      reloadEmitter.emit('reload');
    }
  });

  watcher.on('error', (err) => {
    console.error(ColorLog.yellow(`Watch error: ${err.message}`));
  });
} catch (err) {
  console.error(`Failed to watch directory: ${CONTENT_DIR}`);
  console.error(err.message);
  process.exit(1);
}

// HTTP server
const server = http.createServer((req, res) => {
  // Server-Sent Events endpoint for live reload
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    });

    // Send keepalive ping every 30 seconds to prevent connection timeout
    const keepAlive = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch (e) {
        clearInterval(keepAlive);
      }
    }, 30000);

    // Listen for reload events and notify client
    const onReload = () => {
      try {
        res.write('data: reload\n\n');
      } catch (e) {
        // Connection closed, cleanup handled by 'close' event
      }
    };
    reloadEmitter.on('reload', onReload);

    // Cleanup on client disconnect
    req.on('close', () => {
      clearInterval(keepAlive);
      reloadEmitter.off('reload', onReload);
    });

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

server.listen(PORT, (err) => {
  if (err) {
    console.error(`Failed to start server on port ${PORT}`);
    console.error(err.message);
    process.exit(1);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(ColorLog.yellow(`Port ${PORT} is already in use`));
    console.error('Try stopping other servers or use a different port');
  } else {
    console.error(`Server error: ${err.message}`);
  }
  process.exit(1);
});
