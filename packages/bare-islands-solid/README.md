# @vktrz/bare-islands-solid

Plugin for [@vktrz/bare-static](https://www.npmjs.com/package/@vktrz/bare-static) that enables interactive islands with Solid.js.

## Installation

```bash
npm install @vktrz/bare-islands-solid
```

## Usage

**1. Configure the plugin** in `bare.config.js`:

```javascript
import { bareIslandsSolid } from "@vktrz/bare-islands-solid";

export default {
	plugins: [bareIslandsSolid()],
};
```

**2. Create Solid components** in `islands-solid/`:

```jsx
// islands-solid/counter.jsx
import { createSignal } from "solid-js";

export default function Counter(props) {
	const [count, setCount] = createSignal(props.initial ?? 0);

	return (
		<div>
			<p>Count: {count()}</p>
			<button onClick={() => setCount(count() + 1)}>Increment</button>
		</div>
	);
}
```

**3. Use components in markdown** with the `-solid` suffix:

```markdown
# My Page

<counter-solid initial="5"></counter-solid>
```

## How It Works

- Discovers `.jsx` and `.tsx` files in `islands-solid/`
- Compiles them to web components using `solid-element`
- Loads Solid.js runtime from CDN via import maps
- Injects scripts only on pages that use the components

**Element naming:** `counter.jsx` → `<counter-solid>`

## Options

```javascript
bareIslandsSolid({
	islandsDir: "./islands-solid", // Default
});
```

## Use with Other Frameworks

You can use multiple island plugins together:

```javascript
import { bareIslandsSolid } from "@vktrz/bare-islands-solid";
import { bareIslandsPreact } from "@vktrz/bare-islands-preact";

export default {
	plugins: [bareIslandsSolid(), bareIslandsPreact()],
};
```

Both frameworks can coexist on the same page: `<counter-solid>` and `<counter-preact>`.

## License

MIT
