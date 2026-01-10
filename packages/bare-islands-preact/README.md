# @vktrz/bare-islands-preact

Plugin for [@vktrz/bare-static](https://www.npmjs.com/package/@vktrz/bare-static) that enables interactive islands with Preact.

## Installation

```bash
npm install @vktrz/bare-islands-preact
```

## Usage

**1. Configure the plugin** in `bare.config.js`:

```javascript
import { bareIslandsPreact } from "@vktrz/bare-islands-preact";

export default {
	plugins: [bareIslandsPreact()],
};
```

**2. Create Preact components** in `islands-preact/`:

```jsx
// islands-preact/counter.jsx
import { useState } from "preact/hooks";

export default function Counter(props) {
	const [count, setCount] = useState(props.initial ?? 0);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}
```

**3. Use components in markdown** with the `-preact` suffix:

```markdown
# My Page

<counter-preact initial="5"></counter-preact>
```

## How It Works

- Discovers `.jsx` and `.tsx` files in `islands-preact/`
- Compiles them to web components using `preact-custom-element`
- Loads Preact runtime from CDN via import maps (~4kb)
- Injects scripts only on pages that use the components

**Element naming:** `counter.jsx` → `<counter-preact>`

## Options

```javascript
bareIslandsPreact({
	islandsDir: "./islands-preact", // Default
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
