import { compileIslandWithConfig } from "./helpers.js";

export async function compilePreactIsland({ sourcePath, outputPath }) {
	return compileIslandWithConfig({
		sourcePath,
		outputPath,
		frameworkConfig: {
			jsx: "automatic",
			jsxImportSource: "preact",
			external: ["preact", "preact/hooks", "preact/jsx-runtime"],
		},
	});
}
