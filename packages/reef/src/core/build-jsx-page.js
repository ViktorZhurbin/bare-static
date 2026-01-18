import { basename, extname, join } from "node:path";
import { styleText } from "node:util";
import { renderToString } from "preact-render-to-string";
import { layouts } from "../layout/registry.js";
import { resolveLayout } from "../layout/resolver.js";
import { compileJSX } from "../utils/compile-jsx.js";
import { createTempDirPath } from "../utils/dir.js";
import { builderShell } from "./builder-shell.js";
import { writeHtmlPage } from "./write-html-page.js";

const TEMP_DIR = createTempDirPath("pages");

/**
 * Build a single JSX page to HTML
 * @param {string} sourceFileName
 * @param {object} [options] - Build options
 * @param {boolean} [options.logOnSuccess] - Log when build succeeds
 * @param {boolean} [options.logOnStart] - Log when build starts
 */
export async function buildJSXPage(sourceFileName, options = {}) {
	await builderShell(sourceFileName, /\.[jt]sx$/, options, async (ctx) => {
		const { sourceFilePath, outputFilePath } = ctx;

		const allLayouts = layouts.getAll();

		const tempFileName = `${basename(sourceFileName, extname(sourceFileName))}.mjs`;
		const tempPath = join(TEMP_DIR, tempFileName);

		const pageModule = await compileJSX(sourceFilePath, tempPath);

		if (!pageModule.default || typeof pageModule.default !== "function") {
			throw new Error(
				`JSX page ${sourceFileName} must have a default export function`,
			);
		}

		// Extract metadata (includes layout preference)
		const meta = pageModule.meta || {};

		let layoutVNode;

		if (meta.layout === false) {
			layoutVNode = pageModule.default();
		} else {
			const contentVNode = pageModule.default();

			const layoutName = await resolveLayout(sourceFilePath, meta);

			const layoutFn = allLayouts.get(layoutName);

			if (!layoutFn) {
				throw new Error(
					`Layout '${styleText("magenta", layoutName)}' not found in layouts/`,
				);
			}

			const title = meta.title || sourceFileName.replace(/\.[jt]sx$/, "");
			const contentHtml = renderToString(contentVNode);

			layoutVNode = layoutFn({
				title,
				content: contentHtml,
				...meta,
			});
		}

		const layoutHtml = renderToString(layoutVNode);

		await writeHtmlPage(layoutHtml, outputFilePath);
	});
}
