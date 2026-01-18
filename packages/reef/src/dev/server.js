import { watch } from "node:fs/promises";
import { join } from "node:path";
import { styleText } from "node:util";
import polka from "polka";
import sirv from "sirv";
import { CONFIG_FILE } from "../constants/config.js";
import { LAYOUTS_DIR, OUTPUT_DIR, PAGES_DIR } from "../constants/dir.js";
import { buildJSXPage } from "../core/build-jsx-page.js";
import { buildMdPage } from "../core/build-md-page.js";
import { buildAll } from "../core/builder.js";
import { layouts } from "../layout/registry.js";
import { LiveReloadEvents } from "./constants.js";

const PORT = 3000;

export async function startDevServer() {
	process.env.NODE_ENV = "development";

	// Initial build
	await buildAll();

	console.info("Watching...");
	console.info(`Server at ${styleText("cyan", `http://localhost:${PORT}`)}`);

	// Track SSE connections
	const connections = new Set();

	const server = polka()
		.get("/events", (req, res) => {
			res.writeHead(200, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
			});
			connections.add(res);
			req.on("close", () => connections.delete(res));
		})
		.use(sirv(OUTPUT_DIR, { dev: true }))
		.listen(PORT);

	server.server.on("error", (err) => {
		console.error("Server error:", err.message);
		process.exit(1);
	});

	// Watch config file for changes
	(async () => {
		try {
			const watcher = watch(CONFIG_FILE);
			for await (const _event of watcher) {
				console.info(styleText("yellow", "\n⚙️  Config changed, restarting..."));
				server.server.close();
				process.exit(0);
			}
		} catch {
			// Config file doesn't exist, that's fine (optional)
		}
	})();

	// Watch pages directory for pages and reef.js changes
	(async () => {
		const watcher = watch(PAGES_DIR, { recursive: true });

		for await (const event of watcher) {
			if (event.filename) {
				const filePath = join(PAGES_DIR, event.filename);

				logFileChanged(filePath);
			}

			if (event.filename?.endsWith(".md")) {
				await buildMdPage(event.filename, {
					logOnSuccess: true,
				});
			} else if (event.filename?.match(/\.[jt]sx$/)) {
				await buildJSXPage(event.filename, {
					logOnSuccess: true,
				});
			} else if (event.filename?.endsWith("reef.js")) {
				// Full rebuild when reef.js changes (layout config changed)
				await buildAll({ verbose: true });
			}

			notifyReload();
		}
	})();

	// Collect all watch directories
	const watchDirs = [LAYOUTS_DIR];

	// Watch plugin directories (for components, islands, etc.)
	// Separate watcher from PAGES_DIR for layouts and plugin directories
	for (const dir of watchDirs) {
		(async () => {
			try {
				const watcher = watch(dir, { recursive: true });
				for await (const event of watcher) {
					if (event.filename) {
						logFileChanged(`${dir}/${event.filename}`);

						// Reload layouts if layout files changed
						if (dir === LAYOUTS_DIR) {
							await layouts.load();
						}

						// Full rebuild when plugin/layout files change
						await buildAll();
						notifyReload();
					}
				}
			} catch (e) {
				const err = /** @type {NodeJS.ErrnoException} */ (e);

				// Directory doesn't exist yet, that's fine
				if (err.code !== "ENOENT") {
					console.warn(`Could not watch ${dir}:`, err.message);
				}
			}
		})();
	}

	function logFileChanged(filePath) {
		console.info(`${styleText("gray", "File changed:")} ${filePath}`);
	}

	// Helper to notify all connections to reload
	function notifyReload() {
		for (const res of connections) {
			try {
				res.write(`data: ${LiveReloadEvents.Reload}\n\n`);
			} catch {
				// Connection closed, will be cleaned up on 'close' event
				connections.delete(res);
			}
		}
	}
}
