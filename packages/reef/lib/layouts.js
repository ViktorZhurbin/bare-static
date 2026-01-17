import { access, glob, mkdir, rm } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { styleText } from "node:util";
import { LAYOUTS_DIR } from "../constants/dir.js";
import { createTempDirPath } from "../utils/dir.js";
import { compileJSX, loadCompiledModule } from "../utils/jsx-compiler.js";

const TEMP_DIR = createTempDirPath("layouts");

/**
 * @import { LayoutComponent } from '../types/layout.js';
 */

/**
 * Discover, compile, and load all JSX layouts
 * @returns {Promise<Map<string, LayoutComponent>>} Map of layout name to render function
 */
export async function loadLayouts() {
	// Check if layouts directory exists
	try {
		await access(LAYOUTS_DIR);
	} catch (err) {
		if (err.code === "ENOENT") {
			throw new Error(
				`Layouts directory not found: ${LAYOUTS_DIR}\nCreate it and add at least default.jsx`,
			);
		}
		throw err;
	}

	// Ensure a clean temp dir
	await rm(TEMP_DIR, { recursive: true, force: true });
	await mkdir(TEMP_DIR, { recursive: true });

	// Process layouts concurrently using Array.fromAsync + glob
	const layoutEntries = await Array.fromAsync(
		glob(join(LAYOUTS_DIR, "**/*.{jsx,tsx}")),
		async (sourceFilePath) => {
			const fileName = basename(sourceFilePath);
			const layoutName = basename(fileName, extname(fileName));

			try {
				const tempPath = join(TEMP_DIR, `${layoutName}.mjs`);

				// Compile and load layout module
				await compileJSX(sourceFilePath, tempPath);
				const layoutModule = await loadCompiledModule(tempPath);

				if (!layoutModule.default) {
					throw new Error(
						`Layout ${fileName} must have a default export function`,
					);
				}

				// Return as a [key, value] pair for Map construction
				return [layoutName, layoutModule.default];
			} catch (err) {
				throw new Error(`Failed to load layout ${fileName}: ${err.message}`);
			}
		},
	);

	// Validate results
	if (layoutEntries.length === 0) {
		throw new Error(
			`No layout files found in ${LAYOUTS_DIR}\nCreate at least default.jsx`,
		);
	}

	/** @type {Map<string, LayoutComponent>} */
	const layouts = new Map(layoutEntries);

	console.info(
		styleText("green", "✓ Loaded layouts:"),
		Array.from(layouts.keys()).join(", "),
	);

	// Ensure default layout exists
	if (!layouts.has("default")) {
		throw new Error("Required layout 'default.jsx' not found in layouts/");
	}

	return layouts;
}
