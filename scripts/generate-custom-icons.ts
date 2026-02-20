#!/usr/bin/env node
/**
 * Script to generate custom Svelte icon components from SVG files
 *
 * Usage:
 *   1. Place SVG files in src/lib/icons/src/ organized in folders (e.g., Linear/, Outline/)
 *   2. Run: npm run generate:icons
 *   3. Icons will be generated in src/lib/icons/dist/ preserving folder structure
 *   4. Export files will be created for each folder (e.g., Linear.ts, Outline.ts)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_SOURCE_DIR = path.join(__dirname, '../src/lib/icons/src');
const ICONS_OUTPUT_DIR = path.join(__dirname, '../src/lib/icons/dist');

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
 * Replace color attributes with currentColor and stroke-width with CSS variable
 */
function replaceColorsWithCurrentColor(svgContent: string): string {
	return svgContent
		.replace(/\bfill="[^"]*"/g, 'fill="currentColor"')
		.replace(/\bstroke="[^"]*"/g, 'stroke="currentColor"')
		.replace(/\bfill='[^']*'/g, "fill='currentColor'")
		.replace(/\bstroke='[^']*'/g, "stroke='currentColor'")
		.replace(/\bstroke-width="[^"]*"/g, 'stroke-width="var(--icon-stroke-width)"')
		.replace(/\bstroke-width='[^']*'/g, "stroke-width='var(--icon-stroke-width)'");
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

	// Replace color attributes with currentColor
	return replaceColorsWithCurrentColor(match[1].trim());
}

/**
 * Generate Svelte component from SVG content
 */
function generateComponent(iconName: string, folderName: string, svgContent: string): string {
	return `<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon iconName="${folderName}.${iconName}" {...props}>
	${svgContent}
</Icon>
`;
}

/**
 * Generate TypeScript export statement
 */
function generateExport(iconName: string, folderName: string): string {
	return `export { default as ${iconName} } from './${folderName}/${iconName}.svelte';`;
}

/**
 * Main generation function
 */
async function generateIcons() {
	log('\n🎨 Generating custom icons...\n', colors.blue);

	// Ensure source directory exists
	if (!fs.existsSync(ICONS_SOURCE_DIR)) {
		log(`❌ Source directory not found: ${ICONS_SOURCE_DIR}`, colors.red);
		log('📁 Creating directory...', colors.yellow);
		fs.mkdirSync(ICONS_SOURCE_DIR, { recursive: true });
		log('✅ Please add SVG files to src/lib/icons/src/', colors.green);
		return;
	}

	// Ensure output directory exists
	if (!fs.existsSync(ICONS_OUTPUT_DIR)) {
		fs.mkdirSync(ICONS_OUTPUT_DIR, { recursive: true });
	}

	// Get all subdirectories in the source directory
	const folders = fs
		.readdirSync(ICONS_SOURCE_DIR, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	if (folders.length === 0) {
		log('⚠️  No folders found in src/lib/icons/src/', colors.yellow);
		log('📝 Add folders with SVG files and run this script again.', colors.yellow);
		return;
	}

	let totalGeneratedCount = 0;
	let totalErrorCount = 0;

	// Process each folder
	for (const folder of folders) {
		log(`\n📁 Processing folder: ${folder}`, colors.blue);

		const folderSourcePath = path.join(ICONS_SOURCE_DIR, folder);
		const folderOutputPath = path.join(ICONS_OUTPUT_DIR, folder);
		const exportsFile = path.join(ICONS_OUTPUT_DIR, `${folder}.ts`);

		// Ensure output folder exists
		if (!fs.existsSync(folderOutputPath)) {
			fs.mkdirSync(folderOutputPath, { recursive: true });
		}

		// Read SVG files from this folder
		const files = fs.readdirSync(folderSourcePath).filter((file) => file.endsWith('.svg'));

		if (files.length === 0) {
			log(`  ⚠️  No SVG files found in ${folder}/`, colors.yellow);
			continue;
		}

		const exports: string[] = [];
		let generatedCount = 0;
		let errorCount = 0;

		// Process each SVG file
		for (const file of files) {
			try {
				const iconName = toPascalCase(file);
				const svgPath = path.join(folderSourcePath, file);
				const outputPath = path.join(folderOutputPath, `${iconName}.svelte`);

				// Read SVG file
				const svgContent = fs.readFileSync(svgPath, 'utf-8');

				// Extract content
				const innerContent = extractSvgContent(svgContent);

				// Generate component
				const component = generateComponent(iconName, folder, innerContent);

				// Write component file
				fs.writeFileSync(outputPath, component, 'utf-8');

				// Add to exports
				exports.push(generateExport(iconName, folder));

				log(`  ✓ ${file} → ${iconName}.svelte`, colors.green);
				generatedCount++;
			} catch (error) {
				log(
					`  ✗ ${file} - ${error instanceof Error ? error.message : 'Unknown error'}`,
					colors.red
				);
				errorCount++;
			}
		}

		// Generate exports file for this folder
		if (exports.length > 0) {
			const exportsContent = exports.sort().join('\n') + '\n';
			fs.writeFileSync(exportsFile, exportsContent, 'utf-8');
			log(`\n  📦 Updated ${folder}.ts (${exports.length} exports)`, colors.blue);
		}

		// Folder summary
		log(`  ✨ ${folder}: ${generatedCount} icons generated`, colors.green);
		if (errorCount > 0) {
			log(`  ⚠️  ${folder}: ${errorCount} errors`, colors.red);
		}

		totalGeneratedCount += generatedCount;
		totalErrorCount += errorCount;
	}

	// Overall summary
	log(`\n✨ Done!`, colors.green);
	log(`   Total folders processed: ${folders.length}`, colors.blue);
	log(`   Total icons generated: ${totalGeneratedCount}`, colors.green);
	if (totalErrorCount > 0) {
		log(`   Total errors: ${totalErrorCount}`, colors.red);
	}
	log('');
}

// Run the script
generateIcons().catch((error) => {
	log(`\n❌ Error: ${error.message}`, colors.red);
	process.exit(1);
});
