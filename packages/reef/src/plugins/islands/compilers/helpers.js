import { basename, dirname } from "node:path";
import * as esbuild from "esbuild";
import { writeBuildOutput } from "../../../utils/write-build-output.js";

/**
 * Creates virtual entry that exports the component
 */
export function createVirtualEntry(sourcePath) {
	return `
import Component from './${basename(sourcePath)}';
export default Component;
`.trim();
}

/**
 * Base esbuild config shared by all frameworks
 */
export const baseEsbuildConfig = {
	bundle: true,
	format: "esm",
	target: "es2020",
	write: false,
	logLevel: "warning",
};

/**
 * Compiles island with framework-specific esbuild config
 */
export async function compileIslandWithConfig({
	sourcePath,
	outputPath,
	frameworkConfig,
}) {
	const virtualEntry = createVirtualEntry(sourcePath);

	const result = await esbuild.build({
		stdin: {
			contents: virtualEntry,
			resolveDir: dirname(sourcePath),
			loader: "js",
		},
		...baseEsbuildConfig,
		outfile: outputPath,
		...frameworkConfig,
	});

	return writeBuildOutput(result, outputPath);
}
