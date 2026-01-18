import { isLandCore } from "./islands/is-land-core.js";
import { preactIslands } from "./islands/preact.js";
import { solidIslands } from "./islands/solid.js";

export const defaultPlugins = [
	isLandCore(), // Load is-land library first
	solidIslands(),
	preactIslands(),
];
