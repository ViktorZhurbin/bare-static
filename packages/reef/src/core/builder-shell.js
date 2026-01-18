import { join } from "node:path";
import { styleText } from "node:util";
import { OUTPUT_DIR, PAGES_DIR } from "../constants/dir.js";
import { formatMs } from "../utils/format.js";

/**
 * Shared wrapper for page builders that handles paths, timing, logging, and errors.
 *
 * @param {string} sourceFileName - The relative path of the source file
 * @param {RegExp|string} extensionPattern - Pattern to replace with .html
 * @param {Object} options - Build options (logOnStart, logOnSuccess)
 * @param {Function} builderFn - Functional logic for specific page type
 */
export async function builderShell(
	sourceFileName,
	extensionPattern,
	options,
	builderFn,
) {
	const { logOnSuccess, logOnStart } = options;
	const startTime = performance.now();

	const outputFileName = sourceFileName.replace(extensionPattern, ".html");
	const outputFilePath = join(OUTPUT_DIR, outputFileName);
	const sourceFilePath = join(PAGES_DIR, sourceFileName);

	try {
		if (logOnStart) {
			console.info(
				`Writing ${styleText("cyan", sourceFileName)} → ${styleText("gray", outputFileName)}`,
			);
		}

		await builderFn({
			sourceFilePath,
			outputFilePath,
			outputFileName,
		});

		if (logOnSuccess) {
			const buildTime = formatMs(performance.now() - startTime);
			console.info(
				styleText("green", `✓ ${outputFileName}`) +
					styleText("gray", ` (${buildTime})`),
			);
		}
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		console.error(
			styleText("red", `✗ Failed to build ${sourceFileName}:`),
			err.message,
		);
		throw err;
	}
}
