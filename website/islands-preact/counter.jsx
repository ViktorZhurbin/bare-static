import { useState } from "preact/hooks";

export default function Counter({ initial = 0 }) {
	const [count, setCount] = useState(initial);

	return (
		<div style="padding: 20px; border: 2px solid #673ab8; border-radius: 8px; max-width: 300px;">
			<h3>Preact Counter Island</h3>
			<p style="font-size: 24px; margin: 10px 0;">Count: {count}</p>
			<div style="display: flex; gap: 10px;">
				<button
					onClick={() => setCount(count - 1)}
					style="padding: 10px 20px; cursor: pointer;"
				>
					-
				</button>
				<button
					onClick={() => setCount(count + 1)}
					style="padding: 10px 20px; cursor: pointer;"
				>
					+
				</button>
				<button
					onClick={() => setCount(initial)}
					style="padding: 10px 20px; cursor: pointer;"
				>
					Reset
				</button>
			</div>
		</div>
	);
}
