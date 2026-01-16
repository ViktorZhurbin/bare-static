import { basename, dirname, resolve } from "node:path";
import { styleText } from "node:util";

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
 * @type {import('bun').BuildConfig}
 */
export const baseBuildConfig = {
	format: "esm",
	target: "browser",
	minify: false,
	packages: "external",
};

/**
 * Compiles island with framework-specific esbuild config
 */
export async function compileIslandWithConfig({
	sourcePath,
	outputPath,
	frameworkConfig,
}) {
	const absoluteSourceDir = resolve(dirname(sourcePath));
	const absoluteSourcePath = resolve(sourcePath);
	const virtualEntryPath = resolve(absoluteSourceDir, basename(outputPath));
	const virtualEntryContent = createVirtualEntry(absoluteSourcePath);

	try {
		const result = await Bun.build({
			entrypoints: [virtualEntryPath],
			files: {
				[virtualEntryPath]: virtualEntryContent,
			},
			root: absoluteSourceDir,
			outdir: dirname(resolve(outputPath)),
			...baseBuildConfig,
			...frameworkConfig,
		});

		if (!result.success) {
			const errorDetails = result.logs
				.map((log) => `${log.level}: ${log.message}`)
				.join("\n");
			throw new Error(`Island build failed:\n${errorDetails}`);
		}

		const cssOutputPath = result.outputs.find((output) =>
			output.path.endsWith(".css"),
		)?.path;

		return { cssOutputPath };
	} catch (err) {
		console.info(styleText("red", "Island build failed: "), err);
	}
}
