# TODO: Bare Static Evolution

## Phase 1: Plugin Architecture (Priority: HIGH)

### Goal

Extract islands functionality into a separate `@vktrz/bare-islands` plugin package to keep the core SSG minimal and lean.

### Benefits

- Core SSG stays ~200 LOC (pure markdown→HTML)
- Users who don't need interactivity don't pay the complexity cost
- Clean separation of concerns
- Sets foundation for future plugins

### Design Decisions Made

1. **Plugin discovery**: Explicit config file (`bare.config.js`)
2. **Dependency handling**: Plugin handles its own copying
3. **Signals abstraction**: None - user imports directly (maximum flexibility)
4. **Plugin scope**: Minimal - just component discovery + script injection
5. **Error handling**: Error on real problems, silent when nothing to do

### Implementation Plan

#### 1. Create `@vktrz/bare-islands` package

```
packages/bare-islands/
├── lib/
│   └── index.js       # Plugin implementation
├── package.json
└── README.md
```

**Plugin API:**

```javascript
// packages/bare-islands/lib/index.js
export function bareIslands(options = {}) {
	return {
		name: "bare-islands",

		// Hook: Called during build
		async onBuild({ outputDir, contentDir }) {
			// 1. Discover ./components/*.js files
			// 2. Copy them to outputDir/components/
			// 3. Return array of <script> tags
		},

		// Hook: Returns scripts to inject into pages
		async getScripts({ outputDir }) {
			// Return array of script tag strings
		},
	};
}
```

**Usage in project:**

```javascript
// bare.config.js
import { bareIslands } from "@vktrz/bare-islands";

export default {
	plugins: [bareIslands()],
};
```

#### 2. Add plugin system to bare-static core

**Changes needed in `builder.js`:**

```javascript
// Load config if it exists
const config = await loadConfig(); // From ./bare.config.js

export async function buildAll(options = {}) {
	const { injectScript = "", verbose = false, plugins = [] } = options;

	// Merge plugins from config and options
	const allPlugins = [...(config?.plugins || []), ...plugins];

	// Run plugin hooks
	let pluginScripts = [];
	for (const plugin of allPlugins) {
		if (plugin.onBuild) {
			await plugin.onBuild({ outputDir: OUTPUT_DIR, contentDir: CONTENT_DIR });
		}
		if (plugin.getScripts) {
			const scripts = await plugin.getScripts({ outputDir: OUTPUT_DIR });
			pluginScripts.push(...scripts);
		}
	}

	// Combine plugin scripts with injected scripts
	const combinedScripts = [...pluginScripts, injectScript]
		.filter(Boolean)
		.join("\n");

	// ... rest of build
}
```

**New file: `lib/config-loader.js`**

```javascript
import { pathToFileURL } from "node:url";
import fsPromises from "node:fs/promises";

const CONFIG_FILE = "./bare.config.js";

export async function loadConfig() {
	try {
		await fsPromises.access(CONFIG_FILE);
		const configUrl = pathToFileURL(CONFIG_FILE).href;
		const config = await import(configUrl);
		return config.default;
	} catch (err) {
		if (err.code === "ENOENT") return null; // No config file, that's fine
		throw new Error(`Failed to load config: ${err.message}`);
	}
}
```

#### 3. Move current logic to plugin

- Move `static-assets.js` → `packages/bare-islands/lib/index.js`
- Refactor to match plugin API
- Update bare-signals copying logic (plugin's responsibility)

#### 4. Update documentation

- README: Explain plugin system
- Example: Show how to use bare-islands plugin
- Document plugin API for future plugin authors

---

## Phase 2: Component Improvements (Priority: MEDIUM)

### 2.1 Smart Component Loading

**Current problem**: All component scripts are injected into every page.

**Goal**: Only inject component scripts on pages that use them.

**Approach:**

1. Parse markdown content before HTML generation
2. Detect custom element tags (e.g., `<counter-component>`)
3. Only inject corresponding script tags

**Implementation sketch:**

```javascript
// In plugin's getScripts()
async getScripts({ outputDir, currentPage }) {
  const pageContent = await fsPromises.readFile(currentPage, 'utf-8');
  const usedComponents = detectComponents(pageContent);

  return usedComponents.map(comp =>
    `<script type="module" src="/components/${comp}.js"></script>`
  );
}
```

### 2.2 Component Props Support

**Goal**: Pass data from markdown to components.

**Syntax ideas:**

```html
<!-- Option A: HTML attributes -->
<counter-component initial="5"></counter-component>

<!-- Option B: JSON data attribute -->
<counter-component data='{"initial": 5, "step": 2}'></counter-component>
```

**Implementation**: Components read attributes in `connectedCallback()`.

### 2.3 Component Metadata

**Goal**: Components declare their requirements/configuration.

**Approach:**

```javascript
// counter.js
export const meta = {
	name: "counter-component",
	dependencies: ["bare-signals"],
	props: {
		initial: { type: "number", default: 0 },
		step: { type: "number", default: 1 },
	},
};

class CounterComponent extends HTMLElement {
	// ...
}
```

Plugin can read metadata for validation/optimization.

### 2.4 Better Auto-Discovery

**Current**: Naive - copies all `*.js` files.

**Issues:**

- `utils.js` (helpers) shouldn't be treated as components
- `counter.test.js` shouldn't be copied
- Hidden files (`.config.js`) shouldn't be included

**Solutions to explore:**

1. **File naming convention**: `*.component.js` for components
2. **Export checking**: Only copy files that export web components
3. **Manifest file**: `components.json` lists components explicitly
4. **Directory structure**: `components/counter/index.js`, `components/counter/utils.js`

**Research:** How do other frameworks handle this?

- Svelte: `*.svelte` files
- Astro: `*.astro` files + special frontmatter
- 11ty: Explicit registration in config

---

## Phase 3: JSX Support (Priority: LOW - Long-term Vision)

### Goal

Allow writing components in JSX, compile to vanilla web components with islands architecture.

### Vision

```jsx
// counter.jsx
import { createSignal } from "bare-signals";

export default function Counter({ initial = 0 }) {
	const [count, setCount] = createSignal(initial);

	return (
		<div class="counter">
			<p>Count: {count()}</p>
			<button onClick={() => setCount(count() + 1)}>+</button>
		</div>
	);
}
```

Compiles to:

```javascript
class Counter extends HTMLElement {
	connectedCallback() {
		const initial = this.getAttribute("initial") || 0;
		const [count, setCount] = createSignal(initial);
		// ... render logic
	}
}
customElements.define("counter-component", Counter);
```

### Implementation Research Needed

1. **JSX transformer**: esbuild plugin, babel, or custom?
2. **Build step**: How to integrate with bare-static?
3. **HMR**: Hot module reload for development?
4. **Component composition**: How do components use other components?
5. **Reactivity**: How to wire signals to DOM efficiently?

### References to study

- Solid.js compiler (fine-grained reactivity)
- Preact with htm (no build step)
- Lit (web components + declarative templates)
- petite-vue (progressive enhancement)

---

## Phase 4: Signals Abstraction (Priority: LOW)

### Goal

Make signals swappable - users choose their reactivity system.

### Approach: No abstraction needed!

Components import directly:

```javascript
// Using bare-signals
import { createSignal } from "/vendor/bare-signals.js";

// Using Solid
import { createSignal } from "solid-js";

// Using Preact Signals
import { signal } from "@preact/signals";
```

**Plugin's job**: Copy the chosen signals library to vendor/.

**User's job**: Import the right library in components.

**Future enhancement**: Plugin option to configure which signals library to use:

```javascript
bareIslands({
	signals: "@vktrz/bare-signals", // or 'solid-js' or '@preact/signals'
});
```

Plugin could then:

1. Copy the specified library
2. Generate import maps
3. Provide helpful error messages if imports fail

---

## Quick Wins / Minor Improvements

### Documentation

- [ ] Add "Interactive Islands" section to README
- [ ] Document component conventions (file naming, props, etc.)
- [ ] Add example components beyond counter (form, chart, toggle)
- [ ] Document bare-signals integration

### Developer Experience

- [ ] Add `bare-static create-component <name>` CLI command
- [ ] Better error messages (e.g., "Component X imported but not found")
- [ ] Validate component file names (no spaces, special chars)
- [ ] Add component template/boilerplate

### Performance

- [ ] Minify component scripts in production
- [ ] Add cache busting (content hash in filenames)
- [ ] Lazy load components (Intersection Observer)
- [ ] Tree-shake unused code from signals library

### Testing

- [ ] Test suite for bare-islands plugin
- [ ] Test component mounting/unmounting
- [ ] Test error handling (missing files, syntax errors)
- [ ] Integration tests for full build pipeline

---

## Open Questions / Decisions Needed

1. **Config file name**: `bare.config.js` vs `static.config.js` vs `.barerc.js`?
2. **Plugin naming**: `@vktrz/bare-islands` vs `@vktrz/bare-static-islands`?
3. **Monorepo vs separate repos**: Keep all in one monorepo or split out?
4. **TypeScript**: Add TypeScript support? (types for plugins, components?)
5. **Browser support**: Modern browsers only or transpile down?
6. **CSS**: How should component styles work? Scoped? CSS modules?

---

## Non-Goals (Keep Scope Tight)

Things explicitly NOT planned:

- ❌ Server-side rendering (SSR)
- ❌ Hybrid rendering (some pages static, some dynamic)
- ❌ Data fetching / API integration (user's job)
- ❌ State management beyond signals (Redux, etc.)
- ❌ Routing (simple multi-page site, HTML links work fine)
- ❌ Build optimization (bundling, code splitting) - keep it simple
- ❌ Framework-specific adapters (React, Vue, Svelte components)

---

## Timeline / Phases

**Phase 1 (Plugin Architecture)**: ~1-2 weeks

- Most impactful change
- Cleans up core SSG
- Enables future work

**Phase 2 (Component Improvements)**: ~2-3 weeks

- Incremental enhancements
- Can be done piece by piece
- Each improvement stands alone

**Phase 3 (JSX Support)**: ~4-6 weeks

- Biggest undertaking
- Requires research + experimentation
- May change based on learnings

**Phase 4 (Signals Abstraction)**: ~1 week

- Simple once Phase 1 is done
- Mostly configuration/conventions

---

## Success Criteria

**For Phase 1 (Plugins):**

- [ ] Core SSG is <200 LOC (excluding plugins)
- [ ] Plugin system is <50 LOC
- [ ] No breaking changes to existing users
- [ ] Documentation is clear and complete
- [ ] Can build website package with plugin enabled

**For Phase 2 (Components):**

- [ ] Components only load on pages that use them
- [ ] Props work intuitively
- [ ] Clear conventions documented

**For Phase 3 (JSX):**

- [ ] Can write components in JSX
- [ ] Compilation happens transparently
- [ ] Dev experience is smooth (fast rebuilds, good errors)
- [ ] Output is still simple web components

---

## Notes

- This is a learning project first, production tool second
- Prioritize simplicity and understandability over features
- Each phase should result in a working, usable state
- Document learnings and tradeoffs
- It's okay to change direction based on discoveries
