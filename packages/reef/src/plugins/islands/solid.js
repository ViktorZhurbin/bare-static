import { createIslandPlugin } from "./index.js";
import { compileSolidIsland } from "./compilers/solid.js";

/**
 * Reef Islands Solid Plugin
 * Enables interactive islands architecture with Solid JSX components
 */
export const solidIslands = createIslandPlugin({
	framework: "solid",
	defaultDir: "islands-solid",
	elementSuffix: "-solid",
	compileIsland: compileSolidIsland,
	importMap: {
		"solid-js": "https://esm.sh/solid-js",
		"solid-js/web": "https://esm.sh/solid-js/web",
	},
});
