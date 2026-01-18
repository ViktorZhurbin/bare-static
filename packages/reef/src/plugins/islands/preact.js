import { createIslandPlugin } from "./index.js";
import { compilePreactIsland } from "./compilers/preact.js";

/**
 * Reef Islands Preact Plugin
 * Enables interactive islands architecture with Preact JSX components
 */
export const preactIslands = createIslandPlugin({
	framework: "preact",
	defaultDir: "islands-preact",
	elementSuffix: "-preact",
	compileIsland: compilePreactIsland,
	importMap: {
		preact: "https://cdn.jsdelivr.net/npm/preact@10.28.2/+esm",
		"preact/hooks": "https://cdn.jsdelivr.net/npm/preact@10.28.2/hooks/+esm",
		"preact/jsx-runtime":
			"https://cdn.jsdelivr.net/npm/preact@10.28.2/jsx-runtime/+esm",
	},
});
