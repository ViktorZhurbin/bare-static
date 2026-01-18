import { access, glob, mkdir } from "node:fs/promises";
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

	try {
		// 1. Check if islands directory exists
		await access(islandsDir);
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		if (err.code === "ENOENT") {
			console.warn(
				styleText("red", `Islands directory not found:`),
				styleText("magenta", islandsDir),
			);
			return [];
		}
		throw err;
	}

	// 2. Prepare output directory
	const outputComponentsDir = join(outputDir, OUTPUT_COMPONENTS_DIR);
	await mkdir(outputComponentsDir, { recursive: true });

	// 3. Glob files and process them using Array.fromAsync
	// This iterates over the glob generator and runs the async mapper for each file
	const discoveredComponents = [];
	const compiledIslands = [];

	await Array.fromAsync(
		glob(join(islandsDir, "**/*.{jsx,tsx}")),
		async (sourcePath) => {
			const fileName = basename(sourcePath);
			const elementName = getElementName(fileName, elementSuffix);
			const outputFileName = `${elementName}.js`;
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
			} catch (e) {
				const err = /** @type {NodeJS.ErrnoException} */ (e);

				throw new Error(`Failed to process island ${fileName}: ${err.message}`);
			}
		},
	);

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

function getElementName(fileName, suffix = "-component") {
	const ext = extname(fileName);
	const baseName = basename(fileName, ext);

	return `${baseName}${suffix}`;
}
