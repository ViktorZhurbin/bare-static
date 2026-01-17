// TODO: css doesn't work
import "./index.css"

export const meta = {
	layout: "default",
	title: "About Reef",
};

export default function About() {
	return (
		<>
			<h1>About Reef</h1>
			<p>
				This is a JSX page that uses the <code>default</code> layout!
			</p>
			<p>
				Before the unified pages directory, JSX pages had to include full HTML
				structure. Now they can just focus on content, like markdown pages.
			</p>

			<h2>Key Benefits</h2>
			<ul>
				<li>No need to write boilerplate HTML structure</li>
				<li>Automatic layout application via <code>meta.layout</code></li>
				<li>Same DX as markdown pages</li>
				<li>Can still opt-out with <code>layout: false</code></li>
			</ul>
		</>
	);
}
