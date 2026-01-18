import { OUTPUT_DIR } from "../../constants/dir.js";
import { processJSXIslands } from "../../utils/process-jsx-islands.js";
import { wrapWithIsland } from "../../utils/wrap-with-island.js";

/**
 * @import { IslandComponent } from '../../types/island.js';
 * @import { ReefPlugin, IslandPluginOptions, PluginBuildContext, PluginTransformContext } from '../../types/plugin.js';
 */

/**
 * Factory function to create island plugins for different frameworks
 *
 * @param {Object} config - Framework configuration
 * @param {string} config.framework - Framework identifier (e.g., "preact", "solid")
 * @param {string} config.defaultDir - Default islands directory
 * @param {string} config.elementSuffix - Element name suffix
 * @param {Record<string, string>} config.importMap - CDN import map
 * @param {Function} config.compileIsland - Compiler function
 * @returns {(options?: IslandPluginOptions) => ReefPlugin} Plugin factory
 */
export function createIslandPlugin({
	framework,
	defaultDir,
	elementSuffix,
	importMap,
	compileIsland,
}) {
	/**
	 * @param {IslandPluginOptions} [options] - Plugin configuration
	 * @returns {ReefPlugin} Plugin instance with hooks
	 */
	return (options = {}) => {
		const { islandsDir = defaultDir } = options;

		/** @type {IslandComponent[]} */
		let discoveredComponents = [];

		return {
			name: `islands-${framework}`,

			// Watch islands directory for changes in dev mode
			watchDirs: [islandsDir],

			/**
			 * Hook: Called during build to discover, compile, and copy components
			 * @param {PluginBuildContext} context - Build context
			 */
			async onBuild({ outputDir = OUTPUT_DIR }) {
				discoveredComponents = [];

				// Process JSX islands
				discoveredComponents = await processJSXIslands({
					islandsDir,
					outputDir,
					elementSuffix,
					compileIsland,
					framework,
				});
			},

			/**
			 * Hook: Returns import map configuration for framework runtime from CDN
			 * @returns {Promise<import('../../types/plugin.js').ImportMapConfig|null>} Import map config or null
			 */
			async getImportMap() {
				if (discoveredComponents.length === 0) return null;

				return {
					imports: importMap,
				};
			},

			/**
			 * Hook: Transform HTML to wrap components in <is-land> tags
			 * @param {PluginTransformContext} context - Transform context
			 * @returns {Promise<string>} Transformed HTML
			 */
			async transform({ content }) {
				if (discoveredComponents.length === 0) return content;
				return wrapWithIsland(content, discoveredComponents, "on:visible");
			},
		};
	};
}
