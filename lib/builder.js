import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { colorLog } from './logger.js';

// Shared constants
export const CONTENT_DIR = './content';
export const OUTPUT_DIR = './dist';
export const TEMPLATE_FILE = './template.html';

// Read template once at module load
const template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

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
 */
export function buildAll(options = {}) {
  const { injectScript = '', verbose = false } = options;
  const startTime = performance.now();


  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read all .md files
  const mdFileNames = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  for (const mdFileName of mdFileNames) {
    const title = mdFileName.replace('.md', '');
    const htmlFileName = `${title}.html`;

    if (verbose) {
      console.log(`Writing ${OUTPUT_DIR}/${htmlFileName} ${colorLog(`from ${CONTENT_DIR}/${mdFileName}`, "dim")}`);
    }

    const markdown = fs.readFileSync(path.join(CONTENT_DIR, mdFileName), 'utf-8');
    const contentHtml = marked(markdown);
    const pageHtml = generateHtml(title, contentHtml, injectScript);

    const htmlFilePath = path.join(OUTPUT_DIR, htmlFileName);

    fs.writeFileSync(htmlFilePath, pageHtml);
  };

  const buildTime = msToSeconds(performance.now() - startTime);
  console.log(`${colorLog(`Wrote ${mdFileNames.length} files in ${buildTime}`, 'green')}`)
}

function msToSeconds (ms) {
  const seconds = ms / 1000;

  if (seconds < 0.01) {
    return `${ms.toFixed(0)} ms`
  }

  return `${seconds.toFixed(2)} seconds`
}
