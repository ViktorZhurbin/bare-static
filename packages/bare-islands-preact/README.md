# @vktrz/bare-islands-preact

Plugin for [@vktrz/bare-static](https://www.npmjs.com/package/@vktrz/bare-static) that enables interactive islands architecture with Preact web components.

## What It Does

The bare-islands-preact plugin automatically:

- Discovers `*.jsx` and `*.tsx` files in your `./islands-preact` directory
- Compiles them using Babel and esbuild
- Wraps them as web components using `preact-custom-element`
- Copies them to the build output
- Injects `<script>` tags only on pages that use them
- Adds import maps for Preact runtime from CDN

This keeps the core SSG minimal while providing interactive capabilities with Preact's lightweight runtime (~4kb).

## Installation

```bash
npm install @vktrz/bare-islands-preact preact
```

## Usage

Create a `bare.config.js` file in your project root:

```javascript
import { bareIslandsPreact } from "@vktrz/bare-islands-preact";

export default {
	plugins: [bareIslandsPreact()],
};
```

Create your Preact components in `./islands-preact/`:

```javascript
// islands-preact/counter.jsx
import { useState } from "preact/hooks";

export default function Counter({ initial = 0 }) {
	const [count, setCount] = useState(initial);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}
```

Use the component in your markdown:

```markdown
# My Page

<counter-preact></counter-preact>
```

## Options

```javascript
bareIslandsPreact({
	islandsDir: "./islands-preact", // Default: './islands-preact'
});
```

## How It Works

The plugin uses the bare-static plugin system with these hooks:

- **`watchDirs`** - Watches the islands directory for changes in dev mode
- **`onBuild()`** - Discovers `.jsx/.tsx` files and compiles them to web components
- **`getImportMap()`** - Returns import map for Preact runtime from esm.sh CDN
- **`getScripts()`** - Analyzes each page's content and returns `<script type="module">` tags **only for components used on that page**

### Smart Component Loading

The plugin automatically detects which components are used on each page by scanning for custom element tags. Only the necessary scripts are injected, improving performance by avoiding unused JavaScript.

**Example:**

- `index.md` contains `<counter-preact>` → gets counter-preact.js script
- `about.md` has no components → gets no component scripts

This "islands architecture" means interactive components are loaded only where needed.

### Component Naming Convention

Component files can be named anything (e.g., `counter.jsx`, `my-widget.jsx`). The plugin automatically:

1. Extracts the base filename
2. Adds the `-preact` suffix
3. Creates a custom element with that name

**Examples:**

- `counter.jsx` → `<counter-preact>`
- `my-widget.jsx` → `<my-widget-preact>`

This naming convention ensures components don't conflict with other framework plugins (like `@vktrz/bare-islands-solid` for Solid.js).

## Coexistence with Other Frameworks

You can use multiple island plugins together:

```javascript
import { bareIslandsSolid } from "@vktrz/bare-islands-solid";
import { bareIslandsPreact } from "@vktrz/bare-islands-preact";

export default {
	plugins: [
		bareIslandsSolid(), // Solid.js islands from islands/
		bareIslandsPreact(), // Preact islands from islands-preact/
	],
};
```

Both frameworks can be used on the same page without conflicts thanks to framework-specific element names (`<counter-solid>` vs `<counter-preact>`).

## Requirements

- Node.js >= 24.0.0
- @vktrz/bare-static >= 1.0.0
- preact >= 10.0.0

## Philosophy

This plugin follows the bare-static philosophy:

- **Keep it simple** - No complex configuration
- **Keep it small** - Minimal code, maximum clarity (~4kb runtime)
- **Error on real problems** - Silent when nothing to do
- **No defensive programming** - Trust the file system

## Bundle Size

Preact is significantly smaller than other frameworks:

- **Preact runtime**: ~4kb (preact + preact-custom-element)
- Solid.js runtime: ~7kb (solid-js + solid-js/web + solid-element)
- React runtime: ~45kb (react + react-dom)

## License

MIT
