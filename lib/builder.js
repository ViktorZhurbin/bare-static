import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { ColorLog } from './colorLog.js';

// Shared constants
export const CONTENT_DIR = './content';
export const OUTPUT_DIR = './dist';
export const TEMPLATE_FILE = './template.html';

// Read template once at module load
let template;
try {
  template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
} catch (err) {
  console.error(`Failed to read template file: ${TEMPLATE_FILE}`);
  console.error(err.message);
  process.exit(1);
}

/**
 * Generate HTML from template with optional script injection
 * @param {string} title - Page title
 * @param {string} content - HTML content
 * @param {string} injectScript - Optional script to inject before </head>
 */
function generateHtml(title, content, injectScript = '') {
  let html = template
    .replace('{{title}}', title)
    .replace('{{content}}', content);

  if (injectScript) {
    html = html.replace('</head>', `${injectScript}\n</head>`);
  }

  return html;
}

/**
 * Build all markdown files to HTML
 * @param {Object} options - Build options
 * @param {string} options.injectScript - Optional script to inject
 * @param {boolean} options.verbose - Whether to log build progress
 */
export function buildAll(options = {}) {
  const { injectScript = '', verbose = false } = options;
  const startTime = performance.now();

  // Create output directory if it doesn't exist
  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  } catch (err) {
    console.error(`Failed to create output directory: ${OUTPUT_DIR}`);
    console.error(err.message);
    process.exit(1);
  }

  // Read all .md files
  let mdFileNames;
  try {
    mdFileNames = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  } catch (err) {
    console.error(`Failed to read content directory: ${CONTENT_DIR}`);
    console.error(err.message);
    process.exit(1);
  }

  if (mdFileNames.length === 0) {
    console.warn(ColorLog.yellow(`No markdown files found in ${CONTENT_DIR}`));
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const mdFileName of mdFileNames) {
    const title = mdFileName.replace('.md', '');
    const htmlFileName = `${title}.html`;

    try {
      if (verbose) {
        console.log(`Writing ${OUTPUT_DIR}/${htmlFileName} ${ColorLog.dim(`from ${CONTENT_DIR}/${mdFileName}`)}`);
      }

      const markdown = fs.readFileSync(path.join(CONTENT_DIR, mdFileName), 'utf-8');
      const contentHtml = marked(markdown);
      const pageHtml = generateHtml(title, contentHtml, injectScript);

      const htmlFilePath = path.join(OUTPUT_DIR, htmlFileName);

      fs.writeFileSync(htmlFilePath, pageHtml);
      successCount++;
    } catch (err) {
      failCount++;
      console.error(`${ColorLog.dim('Failed to build')} ${mdFileName}: ${err.message}`);
    }
  }

  const buildTime = msToSeconds(performance.now() - startTime);

  const successMessage = ColorLog.green(`Wrote ${successCount} files in ${buildTime}`);
  if (failCount > 0) {
    console.log(`${successMessage} ${ColorLog.yellow(`(${failCount} failed)`)}`);
  } else {
    console.log(successMessage);
  }
}

function msToSeconds (ms) {
  const seconds = ms / 1000;

  if (seconds < 0.01) {
    return `${ms.toFixed(0)} ms`
  }

  return `${seconds.toFixed(2)} seconds`
}
