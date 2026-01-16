import { compileIslandWithConfig } from "./helpers.js";

export async function compilePreactIsland({ sourcePath, outputPath }) {
	return compileIslandWithConfig({
		sourcePath,
		outputPath,
		frameworkConfig: {
			jsx: {
				importSource: "preact",
				runtime: "automatic",
			},
			external: ["preact", "preact/hooks", "preact/jsx-runtime"],
		},
	});
}
