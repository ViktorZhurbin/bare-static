import { join } from "node:path";
import { defaultPlugins } from "../plugins/defaultPlugins.js";

/**
 * Centralized asset and import map collection
 */

/**
 * @import { Asset, ImportMapConfig, ReefPlugin } from '../types/plugin.js';
 */

/**
 * Collect all assets and import maps from plugins and auto-inject dev scripts
 * @param {Object} params
 * @param {string} params.pageContent - Page content to scan for component usage
 * @returns {Promise<{ assets: Asset[], importMapConfigs: ImportMapConfig[] }>}
 */
export async function collectAssets({ pageContent }) {
	/** @type {ImportMapConfig[]} */
	const importMapConfigs = [];
	/** @type {Asset[]} */
	const assets = [];

	// Collect from plugins
	for (const plugin of defaultPlugins) {
		if (plugin.getImportMap) {
			const importMapConfig = await plugin.getImportMap();
			if (importMapConfig) importMapConfigs.push(importMapConfig);
		}

		if (plugin.getAssets) {
			const pluginAssets = await plugin.getAssets({ pageContent });
			assets.push(...pluginAssets);
		}
	}

	// Auto-inject live reload asset in dev mode
	if (process.env.NODE_ENV === "development") {
		// Bundle live reload script as an asset (will be auto-injected)
		const liveReloadBundle = await Bun.build({
			entrypoints: [join(import.meta.dirname, "../dev/live-reload.js")],
			target: "browser",
			minify: true,
		});

		const liveReloadJs = await liveReloadBundle.outputs[0].text();

		assets.push({
			tag: "script",
			attrs: { type: "module" },
			content: liveReloadJs,
		});
	}

	return { assets, importMapConfigs };
}
