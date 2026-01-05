import { buildAll } from "./lib/builder.js";

// Build all markdown files to HTML
await buildAll({ verbose: true });
