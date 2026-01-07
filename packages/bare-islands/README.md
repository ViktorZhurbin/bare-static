# @vktrz/bare-islands

Plugin for [@vktrz/bare-static](https://www.npmjs.com/package/@vktrz/bare-static) that enables interactive islands architecture with web components.

## What It Does

The bare-islands plugin automatically:

- Discovers web component files in your `./components` directory
- Copies them to the build output
- Injects `<script>` tags into your pages
- Handles dependency copying (like bare-signals)

This keeps the core SSG minimal while providing interactive capabilities for those who need them.

## Installation

```bash
npm install @vktrz/bare-islands
```

## Usage

Create a `bare.config.js` file in your project root:

```javascript
import { bareIslands } from "@vktrz/bare-islands";

export default {
	plugins: [bareIslands()],
};
```

Create your web components in `./components/`:

```javascript
// components/counter.js
import { createSignal, createEffect } from "/vendor/bare-signals.js";

class CounterComponent extends HTMLElement {
	connectedCallback() {
		const [count, setCount] = createSignal(0);

		const button = document.createElement("button");
		button.onclick = () => setCount(count() + 1);

		createEffect(() => {
			button.textContent = `Count: ${count()}`;
		});

		this.appendChild(button);
	}
}

customElements.define("counter-component", CounterComponent);
```

Use the component in your markdown:

```markdown
# My Page

<counter-component></counter-component>
```

## Options

```javascript
bareIslands({
	componentsDir: "./components", // Default: './components'
});
```

## How It Works

The plugin uses the bare-static plugin system with two hooks:

- **`onBuild()`** - Discovers `.js` files in components directory and copies them to `dist/components/`
- **`getScripts()`** - Returns `<script type="module">` tags for each discovered component

These script tags are injected into the `<head>` of every page during build.

## Requirements

- Node.js >= 24.0.0
- @vktrz/bare-static >= 1.0.0

## Philosophy

This plugin follows the bare-static philosophy:

- **Keep it simple** - No complex configuration
- **Keep it small** - Minimal code, maximum clarity
- **Error on real problems** - Silent when nothing to do
- **No defensive programming** - Trust the file system

## License

MIT
