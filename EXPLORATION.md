# Exploration & Learnings

**AI-generated doc capturing my SSG/reactivity exploration**

## 🎯 Core Principles

### 1. Learning & Fun First, Production Second

Building `reef` taught more about reactivity than using a framework ever would. This is an educational project - if it ever becomes a useful tool, that's a bonus.

### 2. Keep It Simple

Most SSG value comes from ~20% of features. For markdown → HTML, DIY beats learning framework quirks. Don't add features "just in case" - add them when they solve a real problem. Or, if I'm having fun building it.

### 3. Keep It Small (But Readable)

Be mindful about adding features, covering edge cases, "future-proofing". If I don't like or need it myself, then maybe don't build it.
Code should be well-formatted, organized, self-documenting (JSDoc, comments, logs, clear naming).

### 4. Good DX

Colored logs with clear messages, proper error handling, live reload, fast rebuilds. Should have everything that I consider necessary for a tool to be enjoyable to use.

### 5. Less Defensive Programming

Don't wrap everything with try/catch. Leverage native errors. Let bugs surface loudly during development. Runtime failures degrade gracefully only where expected.

---

## 🔍 Key Discoveries

### Web Components = Natural Island Boundary

You can write Solid/Preact/etc. components and wrap them in a web component.

`connectedCallback()` fires when element is added to DOM - perfect hydration point. The browser already provides lifecycle hooks, attribute observation, custom element registry, and automatic instantiation. Use that instead of tackling partial hydration and fighting dragons.

Inside the web component boundary, you can run a full Solid/Preact app with routing, state management, and nested components.

### Bring Your Own Framework

Provide framework-specific plugins, and let users choose based on their preference.

---

## 📊 Framework Comparison (Research Phase)

**Astro**: Multi-framework support with custom partial hydration, client directives, content management, and much more.

**Mastro Reactive** (2.8kb): Data-bind attributes + custom wrapper for web components.

```js
<my-counter>
  Count is <span data-bind="count">0</span>
  <button data-onclick="inc">+</button>
</my-counter>

<script>
  import { ReactiveElement, signal } from "@mastrojs/reactive"

  customElements.define("my-counter", class extends ReactiveElement {
    count = signal(0)
    inc () {
      this.count.set(c => c + 1)
    }
  })
</script>
```

**Enhance**: Also wraps web components around, uses tagged template literals for markup.

```js
export default function MyHeader({ html, state }) {
	const { attrs, store } = state;
	const { heading = "Default" } = attrs;
	const { description = "A default description" } = store;

	return html`
		<header>
			<h1>${heading}</h1>
			<p>${description}</p>
		</header>
	`;
}
```

**11ty**: Template languages + plugin ecosystem. Good inspiration for "static first" but we chose markdown + JSX over template soup. Has is-land plugin supporting multiple frameworks .

---

## 🎨 Architectural Patterns

### Web Components as Island Containers

Browser handles instantiation, lifecycle, and cleanup. We just render Preact/Solid inside `connectedCallback()`.

### Runtime via Import Maps

Framework runtime loaded via CDN import maps. Shared across all islands on the page - only pay the runtime cost once.

### Build-Time Wrapper Generation

User writes clean JSX components (`islands-solid/counter.jsx`). Build generates web component wrappers automatically. No boilerplate in source code.

---

## 🛠️ Technical Decisions

### esbuild + Babel for JSX Compilation

esbuild for bundling, Babel presets for JSX transforms (`babel-preset-solid` and `@babel/plugin-transform-react-jsx`). Fast, well-tested, good plugin ecosystem.

### Dedicated islands-{framework} Directories

`islands-solid/` and `islands-preact/` for clear separation. Easy to glob, conventional naming, supports multiple frameworks cleanly.

### CSS: Global Styles (for now)

Island CSS files copied to dist alongside components. No Shadow DOM, no CSS Modules yet. Keep it simple until scoping becomes a real problem.
