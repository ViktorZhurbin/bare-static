# Reef Roadmap

## 🎯 Current Focus

Build reef's docs site with reef (dogfooding)

Then: Clean up based on real usage pain points

## 🏗️ Core Architecture

### Code Organization

- [ ] Reorganize lib/ and utils/ by domain (routing, compilation, plugins)
- [ ] Extract shared compilation logic (layouts + islands + pages)

### Configuration

- [ ] Make paths configurable via reef.config.js
  - `contentDir`, `pagesDir`, `layoutsDir`, `outputDir`
  - Currently hardcoded in constants/dir.js

### Error Handling

- [ ] Better error messages ("Island X used but not found in islands-*/")
- [ ] Validate JSX compilation errors with helpful context
- [ ] Catch routing conflicts (pages/about.jsx + content/about.md)

---

### Refactoring
- use import.meta

#### 1. Getting Current File Path (Most Useful)
Current approach:
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use __dirname
const configPath = path.join(__dirname, '../config.js');
With import.meta.dirname (Node 20.11+):
// That's it - no imports needed
const configPath = path.join(import.meta.dirname, '../config.js');
Where in Reef:
lib/dev.js - loading live-reload.js
lib/layouts.js - temp directory handling
Any file that needs to know "where am I?"

#### 2. Import Resolution
Current approach:
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(tempPath).href;
const module = await import(`${moduleUrl}?t=${Date.now()}`);

With import.meta.resolve (Node 20.6+):

const moduleUrl = import.meta.resolve(tempPath);
const module = await import(`${moduleUrl}?t=${Date.now()}`);

Simpler, but honestly not a huge win.

#### 3. Cache Busting (What You Already Do)
// You already do this correctly:
await import(`${moduleUrl}?t=${Date.now()}`);

// import.meta.url changes per file, useful for:
const uniqueId = import.meta.url + Date.now();
Actual Simplification Potential
Realistic savings in Reef: ~10-15 LOC total
Most of your code doesn't need file path introspection. The main wins would be in:
dev.js (loading live-reload script)
layouts.js (temp director

---

## 🎨 Features

### JSX Pages v2 - Layout Support

- [ ] Add metadata export pattern for pages/
  ```jsx
  export const metadata = {
    title: 'Page Title',
    layout: 'default',
    // custom fields...
  };
  ```
- [ ] Implement data cascade: default > reef.js > metadata
- [ ] Support CSS imports!
- [ ] Pass all metadata fields as props to layout
- [ ] Detect full-page vs content-only (warn if layout + )

### Island Lazy Loading

Decision: Try is-land library first

- [ ] Wrap components in <is-land on:visible> during build
- [ ] Add is-land.js to import maps
- [ ] Register framework init types (preact/solid)

Alternative: Build custom ReefIsland if is-land feels limiting

- [ ] IntersectionObserver for on:visible
- [ ] requestIdleCallback for on:idle
- [ ] Promise-based state machine (~60 LOC)

### Developer Experience

- [ ] reef create <project-name> CLI command (scaffold new projects)
- [ ] Improved dev server logging (clearer rebuild messages)


## 🔬 Research & Learning

### Explore Similar Projects

- Astro
- 11ty
- SolidStart, SvelteKit - DX, conventions, approach to SSG
- Fresh (Deno) - Islands without build step
- Lume - Modern 11ty-style SSG with JSX
- Lit - Native web components reactivity
- Vite, esbuild, Parcel - for plugin architecture

## 📚 Documentation

### User Guides

- [ ] Quick start: "From static to your first island"
- [ ] Folder structure and routing conventions
- [ ] Config file reference (reef.config.js)

### Island Usage

- [ ] Component naming conventions (Counter.jsx → counter-solid)
- [ ] Props and attributes (how to pass data to islands)
- [ ] Web component wrapper pattern explanation

### Examples

- [ ] Simple nested components
- [ ] Complex example: mini dashboard with multiple islands
- [ ] Real-world: Build reef's own docs site with reef

## ⚡ Production Ready

### Performance

- [ ] Minify JS in production builds

```js
// In island compilers
await esbuild.build({
  // ... existing config
  minify: process.env.NODE_ENV === 'production',
});
```

- [ ] Content hash in filenames (cache busting).
```js
// Only rebuild changed files
const cache = new Map();
if (cache.get(filePath) === hash(content)) {
  return; // Skip rebuild
}
```
- [ ] CSS bundling and optimization
```js
// Granular updates (CSS without page reload)
if (changedFile.endsWith('.css')) {
  broadcast({ type: 'css-update', href: '/styles.css' });
} else {
  broadcast({ type: 'reload' });
}
```

### Testing

- [ ] Define testing strategy (unit? integration? e2e?)
- [ ] Test island detection and injection
- [ ] Test layout resolution cascade

## 🧹 Polish

### Routing

- [ ] Research Astro, 11ty, etc routing conventions
- [ ] Handle duplicate routes (pages/ vs content/)
- [ ] Document routing priority/conflicts

### Refactoring

- [ ] Extract duplicate compilation logic
- [ ] Simplify plugin API surface
- [ ] Review complexity added this week
