import fsPromises from "node:fs/promises";
import path from "node:path";

const COMPONENTS_DIR = "components";
const OUTPUT_DIR = "dist";

/**
 * Bare Islands Plugin
 * Enables interactive islands architecture by discovering and injecting web components
 *
 * @param {Object} options
 * @param {string} [options.componentsDir] - Your components folder
 * @returns {Object} Plugin instance with hooks
 */
export function bareIslands(options = {}) {
	const componentsDir = options.componentsDir || COMPONENTS_DIR;
	let discoveredComponents = [];

	return {
		name: "bare-islands",

		/**
		 * Hook: Called during build to copy component files and dependencies
		 * @param {Object} context - Build context
		 * @param {string} [context.outputDir] - The output directory path
		 */
		async onBuild({ outputDir = OUTPUT_DIR }) {
			discoveredComponents = [];

			// Copy components directory if it exists and has files
			try {
				const files = await fsPromises.readdir(componentsDir);
				const jsFiles = files.filter((f) => f.endsWith(".js"));

				if (!jsFiles.length) return;

				await fsPromises.mkdir(path.join(outputDir, componentsDir), {
					recursive: true,
				});

				for (const fileName of jsFiles) {
					try {
						await fsPromises.copyFile(
							path.join(componentsDir, fileName),
							path.join(outputDir, componentsDir, fileName),
						);

						// Track discovered components for script generation
						discoveredComponents.push({
							dir: componentsDir,
							file: fileName,
						});
					} catch (err) {
						throw new Error(
							`Failed to copy component ${fileName}: ${err.message}`,
						);
					}
				}

				// Copy bare-signals from package if it exists
				const bareSignalsSource = "../bare-signals/lib/index.js";
				try {
					await fsPromises.access(bareSignalsSource);
					const vendorDir = path.join(outputDir, "vendor");
					await fsPromises.mkdir(vendorDir, { recursive: true });
					await fsPromises.copyFile(
						bareSignalsSource,
						path.join(vendorDir, "bare-signals.js"),
					);
				} catch {
					// bare-signals package not found, skip (user will handle dependencies)
				}
			} catch (err) {
				// If it's ENOENT (directory doesn't exist), silently skip - nothing to do
				if (err.code === "ENOENT") return;

				// Otherwise, it's a real error - rethrow it
				throw err;
			}
		},

		/**
		 * Hook: Returns script tags to inject into pages
		 * @param {Object} context - Script context
		 * @param {string} context.outputDir - The output directory path
		 * @returns {Promise<string[]>} Array of script tag strings
		 */
		async getScripts({ outputDir }) {
			return discoveredComponents.map(
				({ dir, file }) =>
					`<script type="module" src="/${dir}/${file}"></script>`,
			);
		},
	};
}
