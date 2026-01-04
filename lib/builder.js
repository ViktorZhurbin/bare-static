import { marked } from 'marked';
import fs from 'fs';
import path from 'path';

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
export function generateHtml(title, content, injectScript = '') {
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
 * @returns {number} Number of files built
 */
export function buildAll(options = {}) {
  const { injectScript = '', verbose = false } = options;

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read all .md files
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  if (verbose) {
    console.log(`Building ${files.length} file(s)...`);
  }

  files.forEach(file => {
    const markdown = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const html = marked(markdown);
    const title = file.replace('.md', '');
    const output = generateHtml(title, html, injectScript);

    const outputPath = path.join(OUTPUT_DIR, file.replace('.md', '.html'));
    fs.writeFileSync(outputPath, output);

    if (verbose) {
      console.log(`✓ ${file} -> ${path.basename(outputPath)}`);
    }
  });

  if (verbose) {
    console.log('Build complete!');
  }

  return files.length;
}
