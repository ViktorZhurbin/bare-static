import { createSignal } from "solid-js";

export default function Counter() {
	const [count, setCount] = createSignal(0);

	return (
		<div style="padding: 20px; border: 2px solid var(--border); border-radius: 8px; max-width: 300px; background-color: var(--bg-secondary); color: var(--text);">
			<h3 style="margin-top: 0;">Solid Counter Island</h3>
			<p style="font-size: 24px; margin: 10px 0; font-weight: 600;">Count: {count()}</p>
			<div style="display: flex; gap: 10px; flex-wrap: wrap;">
				<button
					onClick={() => {
						setCount(count() - 1);
					}}
					style="padding: 10px 16px; border-radius: 4px; border: none; background-color: var(--link); color: #fff; cursor: pointer; font-weight: 500;"
				>
					−
				</button>
				<button
					onClick={() => {
						setCount(count() + 1);
					}}
					style="padding: 10px 16px; border-radius: 4px; border: none; background-color: var(--link); color: #fff; cursor: pointer; font-weight: 500;"
				>
					+
				</button>
				<button
					onClick={() => setCount(0)}
					style="padding: 10px 16px; border-radius: 4px; border: 1px solid var(--border); background-color: transparent; color: var(--text); cursor: pointer; font-weight: 500;"
				>
					Reset
				</button>
			</div>
		</div>
	);
}
