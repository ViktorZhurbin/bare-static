/**
 * Core utilities for plugins
 *
 * These are optional helpers that plugins can use to simplify common tasks.
 * Plugins are free to implement their own versions if they need custom behavior.
 */

export { generateScriptsForUsedComponents } from "./ generate-scripts-for-used-components.js";
export { detectCustomElements } from "./detect-custom-elements.js";
export { filterUsedComponents } from "./filter-used-components.js";
export { generateScriptTag } from "./generate-script-tag.js";
export { getElementName } from "./get-element-name.js";
export { processJSXIslands } from "./process-jsx-islands.js";

// Types are available via JSDoc imports:
// @typedef {import('@vktrz/bare-static/plugin-utils/types.js').IslandComponent} IslandComponent
