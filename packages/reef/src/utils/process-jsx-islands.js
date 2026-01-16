import { basename, extname, join } from "node:path";
import { styleText } from "node:util";

/**
 * @import { IslandComponent } from '../types/island.js';
 */

/**
 * Process JSX island files - compile and register as web components
 *
 * @param {Object} options - Processing options
 * @param {string} options.islandsDir - Directory containing JSX island files
 * @param {string} options.outputDir - Build output directory
 * @param {string} options.elementSuffix - Suffix for custom element names
 * @param {Function} options.compileIsland - Compiler function
 * @param {string} options.framework - Framework identifier (e.g., 'preact', 'solid')
 * @returns {Promise<IslandComponent[]>} Array of discovered components
 */
export async function processJSXIslands({
	islandsDir,
	outputDir,
	elementSuffix,
	compileIsland,
	framework,
}) {
	const OUTPUT_COMPONENTS_DIR = "components";

	// Discover island files using Bun.Glob
	const glob = new Bun.Glob("*.{jsx,tsx}");
	const jsxFiles = [];

	try {
		for await (const fileName of glob.scan(islandsDir)) {
			jsxFiles.push(fileName);
		}
	} catch (err) {
		if (err.code === "ENOENT") {
			console.warn(
				styleText("red", `Islands directory not found:`),
				styleText("magenta", islandsDir),
			);
			return [];
		}
		throw err;
	}

	const discoveredComponents = [];
	const compiledIslands = [];

	if (jsxFiles.length === 0) return discoveredComponents;

	const outputComponentsDir = join(outputDir, OUTPUT_COMPONENTS_DIR);

	for (const fileName of jsxFiles) {
		const elementName = getElementName(fileName, elementSuffix);
		const outputFileName = `${elementName}.js`;

		const sourcePath = join(islandsDir, fileName);
		const outputPath = join(outputComponentsDir, outputFileName);

		try {
			const compilationResult = await compileIsland({
				sourcePath,
				outputPath,
			});

			/** @type {IslandComponent} */
			const component = {
				elementName,
				outputPath: `/${OUTPUT_COMPONENTS_DIR}/${outputFileName}`,
				framework,
			};

			// Add CSS path if it exists
			if (compilationResult?.cssOutputPath) {
				const cssFileName = basename(compilationResult.cssOutputPath);
				component.cssPath = `/${OUTPUT_COMPONENTS_DIR}/${cssFileName}`;
			}

			discoveredComponents.push(component);
			compiledIslands.push({ sourcePath, elementName });
		} catch (err) {
			throw new Error(`Failed to process island ${fileName}: ${err.message}`);
		}

		// Log compiled islands
		if (compiledIslands.length > 0) {
			console.info(
				styleText(
					"green",
					`✓ Compiled ${compiledIslands.length} island${
						compiledIslands.length > 1 ? "s" : ""
					}:`,
				),
			);
			for (const { sourcePath, elementName } of compiledIslands) {
				console.info(
					`  ${styleText("cyan", sourcePath)} → ${styleText(
						"magenta",
						`<${elementName}>`,
					)}`,
				);
			}
		}

		return discoveredComponents;
	}
}

function getElementName(fileName, suffix = "-component") {
	const ext = extname(fileName);
	const baseName = basename(fileName, ext);

	return `${baseName}${suffix}`;
}
