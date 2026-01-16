import { buildAll } from "../core/builder.js";

process.env.NODE_ENV = "production";

await buildAll({ verbose: true });
