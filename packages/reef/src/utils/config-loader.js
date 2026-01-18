import { access } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { CONFIG_FILE } from "../constants/config.js";

/**
 * @import { ReefConfig } from '../types/config.js';
 */

/**
 * Load configuration file with plugins
 * @returns {Promise<ReefConfig|null>} Configuration object or null if file doesn't exist
 */
export async function loadConfig() {
	try {
		await access(CONFIG_FILE);
		const configUrl = pathToFileURL(CONFIG_FILE).href;
		const config = await import(configUrl);
		return config.default;
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		if (err.code === "ENOENT") return null; // No config file, that's fine
		throw new Error(`Failed to load config: ${err.message}`);
	}
}
