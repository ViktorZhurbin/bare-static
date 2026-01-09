import fsPromises from "node:fs/promises";
import path from "node:path";
import * as babel from "@babel/core";
import tsPreset from "@babel/preset-typescript";
import solidPreset from "babel-preset-solid";
import * as esbuild from "esbuild";

export async function compileJSXIsland({
	sourcePath,
	outputPath,
	elementName,
}) {
	const absoluteSourcePath = path.resolve(sourcePath);
	const sourceCode = await fsPromises.readFile(absoluteSourcePath, "utf8");

	// --- STEP 1: Compile JSX with Babel using the Solid Preset ---
	// This turns JSX into Solid's reactive template instructions
	const babelResult = await babel.transformAsync(sourceCode, {
		filename: absoluteSourcePath,
		presets: [
			[solidPreset, { generate: "dom", hydratable: false }],
			[tsPreset],
		],
	});

	// --- STEP 2: Create the Virtual Entry ---
	// We use the transformed code from Babel
	const virtualEntry = `
    import { customElement, noShadowDOM } from 'solid-element';

    // Injected Babel Code
    ${babelResult.code.replace(/export default/g, "const Component = ")}

    const observedAttributes = Component.defaultProps
      ? Object.keys(Component.defaultProps)
      : ['initial'];

    customElement(
      '${elementName}',
      observedAttributes.reduce((acc, curr) => ({ ...acc, [curr]: undefined }), {}),
      (props) => {
        noShadowDOM();
        return Component(props);
      }
    );
  `.trim();

	// --- STEP 3: Bundle with esbuild ---
	// Now esbuild doesn't handle JSX at all; it just bundles imports
	const result = await esbuild.build({
		stdin: {
			contents: virtualEntry,
			resolveDir: path.dirname(absoluteSourcePath),
			loader: "js",
		},
		bundle: true,
		format: "esm",
		target: "es2020",
		write: false,
		// Keep these external so they load from your Import Map
		external: ["solid-js", "solid-js/web", "solid-element"],
		logLevel: "warning",
	});

	await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
	await fsPromises.writeFile(outputPath, result.outputFiles[0].text);
}
