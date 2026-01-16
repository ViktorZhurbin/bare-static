import { resolve } from "node:path";
import { CONFIG_FILE } from "../constants/config.js";

/**
 * @import { ReefConfig } from '../types/config.js';
 */

/**
 * Load configuration file with plugins
 * @returns {Promise<ReefConfig|null>} Configuration object or null if file doesn't exist
 */
export async function loadConfig() {
	// Use Bun's fast synchronous file check
	const configExists = await Bun.file(CONFIG_FILE).exists();
	if (!configExists) return null;

	try {
		const configPath = resolve(CONFIG_FILE);
		const config = await import(configPath);
		return config.default;
	} catch (err) {
		throw new Error(`Failed to load config: ${err.message}`);
	}
}
