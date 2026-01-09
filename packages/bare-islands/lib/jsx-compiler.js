import fsPromises from "node:fs/promises";
import path from "node:path";
import * as babel from "@babel/core";
import tsPreset from "@babel/preset-typescript";
import solidPreset from "babel-preset-solid";
import * as esbuild from "esbuild";

/**
 * A tiny esbuild plugin to handle Solid JSX via Babel
 */
const solidBabelPlugin = {
	name: "solid-babel",
	setup(build) {
		build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
			const source = await fsPromises.readFile(args.path, "utf8");

			const { code } = await babel.transformAsync(source, {
				filename: args.path,
				presets: [
					[solidPreset, { generate: "dom", hydratable: false }],
					[tsPreset],
				],
			});

			return { contents: code, loader: "js" };
		});
	},
};

export async function compileJSXIsland({
	sourcePath,
	outputPath,
	elementName,
}) {
	const absoluteSourcePath = path.resolve(sourcePath);
	const sourceFileName = path.basename(absoluteSourcePath);

	/**
	 * Now the virtual entry is extremely clean.
	 * We just import the component normally; esbuild will use the
	 * plugin above to transform it during the "bundle" phase.
	 */
	const virtualEntry = `
    import { customElement, noShadowDOM } from 'solid-element';
    import Component from './${sourceFileName}';

		const defaultPropsKeys = Object.keys(Component.defaultProps ?? {});
		const defaultProps = defaultPropsKeys.reduce((acc, curr) => {
			acc[curr] = undefined;
			return acc;
		}, {});

    customElement('${elementName}', defaultProps, (props) => {
    	noShadowDOM();

			return Component(props);
		});
  `.trim();

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
		plugins: [solidBabelPlugin], // <--- Injecting our specialist worker
		external: ["solid-js", "solid-js/web", "solid-element"],
		logLevel: "warning",
	});

	await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
	await fsPromises.writeFile(outputPath, result.outputFiles[0].text);
}
