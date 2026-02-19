#!/usr/bin/env node
/**
 * Script to generate custom Svelte icon components from SVG files
 *
 * Usage:
 *   1. Place SVG files in static/icons/custom/
 *   2. Run: npm run generate:icons
 *   3. Icons will be generated in src/lib/icons/custom/Linear/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_SOURCE_DIR = path.join(__dirname, '../static/icons/custom');
const ICONS_OUTPUT_DIR = path.join(__dirname, '../src/lib/icons/custom/Linear');
const EXPORTS_FILE = path.join(__dirname, '../src/lib/icons/custom/Linear.ts');

// Colors
const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	blue: '\x1b[34m',
	yellow: '\x1b[33m',
	red: '\x1b[31m'
};

function log(message: string, color = colors.reset) {
	/* console.log(`${color}${message}${colors.reset}`); */
}

/**
 * Convert filename to PascalCase component name
 * Example: custom-logo.svg -> CustomLogo
 */
function toPascalCase(filename: string): string {
	return filename
		.replace('.svg', '')
		.split(/[-_]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('');
}

/**
 * Extract SVG content (everything inside <svg> tags)
 */
function extractSvgContent(svgContent: string): string {
	// Remove XML declaration if present
	const content = svgContent.replace(/<\?xml[^?]*\?>/g, '').trim();

	// Extract content between <svg> tags
	const match = content.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
	if (!match) {
		throw new Error('Invalid SVG format');
	}

	return match[1].trim();
}

/**
 * Generate Svelte component from SVG content
 */
function generateComponent(iconName: string, svgContent: string): string {
	return `<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	${svgContent}
</Icon>
`;
}

/**
 * Generate TypeScript export statement
 */
function generateExport(iconName: string): string {
	return `export { default as ${iconName} } from './Linear/${iconName}.svelte';`;
}

/**
 * Main generation function
 */
async function generateIcons() {
	log('\n🎨 Generating custom icons...\n', colors.blue);

	// Ensure directories exist
	if (!fs.existsSync(ICONS_SOURCE_DIR)) {
		log(`❌ Source directory not found: ${ICONS_SOURCE_DIR}`, colors.red);
		log('📁 Creating directory...', colors.yellow);
		fs.mkdirSync(ICONS_SOURCE_DIR, { recursive: true });
		log('✅ Please add SVG files to static/icons/custom/', colors.green);
		return;
	}

	if (!fs.existsSync(ICONS_OUTPUT_DIR)) {
		fs.mkdirSync(ICONS_OUTPUT_DIR, { recursive: true });
	}

	// Read SVG files
	const files = fs.readdirSync(ICONS_SOURCE_DIR).filter((file) => file.endsWith('.svg'));

	if (files.length === 0) {
		log('⚠️  No SVG files found in static/icons/custom/', colors.yellow);
		log('📝 Add SVG files and run this script again.', colors.yellow);
		return;
	}

	const exports: string[] = [];
	let generatedCount = 0;
	let errorCount = 0;

	for (const file of files) {
		try {
			const iconName = toPascalCase(file);
			const svgPath = path.join(ICONS_SOURCE_DIR, file);
			const outputPath = path.join(ICONS_OUTPUT_DIR, `${iconName}.svelte`);

			// Read SVG file
			const svgContent = fs.readFileSync(svgPath, 'utf-8');

			// Extract content
			const innerContent = extractSvgContent(svgContent);

			// Generate component
			const component = generateComponent(iconName, innerContent);

			// Write component file
			fs.writeFileSync(outputPath, component, 'utf-8');

			// Add to exports
			exports.push(generateExport(iconName));

			log(`  ✓ ${file} → ${iconName}.svelte`, colors.green);
			generatedCount++;
		} catch (error) {
			log(`  ✗ ${file} - ${error instanceof Error ? error.message : 'Unknown error'}`, colors.red);
			errorCount++;
		}
	}

	// Generate exports file
	if (exports.length > 0) {
		const exportsContent = exports.sort().join('\n') + '\n';
		fs.writeFileSync(EXPORTS_FILE, exportsContent, 'utf-8');
		log(`\n📦 Updated ${EXPORTS_FILE}`, colors.blue);
	}

	// Summary
	log(`\n✨ Done!`, colors.green);
	log(`   Generated: ${generatedCount} icons`, colors.green);
	if (errorCount > 0) {
		log(`   Errors: ${errorCount} files`, colors.red);
	}
	log('');
}

// Run the script
generateIcons().catch((error) => {
	log(`\n❌ Error: ${error.message}`, colors.red);
	process.exit(1);
});
