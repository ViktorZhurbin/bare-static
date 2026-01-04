import { marked } from 'marked';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './content';
const OUTPUT_DIR = './dist';
const TEMPLATE_FILE = './template.html';

// Read template once
const template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

// HTML template wrapper
function htmlTemplate(title, content) {
  return template
    .replace('{{title}}', title)
    .replace('{{content}}', content);
}

// Build function
function build() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read all .md files
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  console.log(`Building ${files.length} file(s)...`);

  files.forEach(file => {
    const markdown = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const html = marked(markdown);
    const title = file.replace('.md', '');
    const output = htmlTemplate(title, html);

    const outputPath = path.join(OUTPUT_DIR, file.replace('.md', '.html'));
    fs.writeFileSync(outputPath, output);
    console.log(`✓ ${file} -> ${path.basename(outputPath)}`);
  });

  console.log('Build complete!');
}

build();
