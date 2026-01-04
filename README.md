# Micro Blog

A minimal markdown-to-HTML blog generator with only 1 dependency.

## Features

- ✓ Converts markdown files to HTML
- ✓ Dev server with live reload
- ✓ Only 1 npm dependency (`marked`)
- ✓ ~150 lines of code total
- ✓ Built with Node.js built-ins

## Quick Start

```bash
# Install dependency
npm install

# Build static HTML files
npm run build

# Run dev server with live reload
npm run dev
```

Then open http://localhost:3000 in your browser.

## Project Structure

```
/
├── content/          # Your .md files go here
├── scripts/          # Build and dev scripts
│   ├── build.js      # Production build script
│   ├── server.js     # Dev server with live reload
│   └── live-reload.js # Client-side live reload script
├── lib/              # Shared build utilities
│   └── builder.js    # Reusable build logic
├── dist/            # Generated .html files
├── template.html    # HTML template with placeholders
└── package.json     # Just one dependency: marked
```

## Usage

### Writing Posts

1. Create a `.md` file in the `content/` folder
2. Write your content in markdown
3. Run `npm run build` or `npm run dev`
4. Find your HTML in `dist/`

### Development

The dev server watches for changes in `content/` and automatically rebuilds. The browser will reload when changes are detected.

### Production

Run `npm run build` to generate HTML files, then deploy the `dist/` folder to any static host.

## How It Works

**template.html**:
- HTML template with `{{title}}` and `{{content}}` placeholders
- Easy to customize - just edit the HTML file
- Includes basic styling for clean typography

**lib/builder.js** (~75 lines):
- Shared build logic used by both build and dev scripts
- Reads template and converts markdown to HTML
- Supports optional script injection (for live reload)
- Exports reusable `buildAll()` and `generateHtml()` functions

**scripts/build.js** (~4 lines):
- Simple production build script
- Imports and calls `buildAll()` from lib/builder.js
- Generates static HTML files without live reload

**scripts/server.js** (~55 lines):
- Dev server with file watching and live reload
- Uses `buildAll()` with live reload script injection
- Watches `content/` for changes and rebuilds automatically
- Serves files from `dist/` via HTTP
- Provides `/reload-check` endpoint for live reload polling

**scripts/live-reload.js**:
- Client-side script for browser live reload
- Polls server every 2 seconds for changes
- Automatically reloads page when content updates

## Why So Minimal?

This project demonstrates that you don't need complex frameworks or build tools to create a static site generator. Just Node.js built-ins and one tiny dependency.
