import { readFile } from "node:fs/promises";
import tsPreset from "@babel/preset-typescript";
import solidPreset from "babel-preset-solid";
import { compileIslandWithConfig } from "./helpers.js";

/**
 * A tiny esbuild plugin to handle Solid JSX via Babel
 */
const solidBabelPlugin = {
	name: "solid-babel",
	setup(build) {
		build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
			const source = await readFile(args.path, "utf8");

			const { code } = await import("@babel/core").then((babel) =>
				babel.transformAsync(source, {
					filename: args.path,
					presets: [
						[solidPreset, { generate: "dom", hydratable: false }],
						[tsPreset],
					],
				}),
			);

			return { contents: code, loader: "js" };
		});
	},
};

export async function compileSolidIsland({ sourcePath, outputPath }) {
	return compileIslandWithConfig({
		sourcePath,
		outputPath,
		frameworkConfig: {
			plugins: [solidBabelPlugin],
			external: ["solid-js", "solid-js/web"],
		},
	});
}
