#!/usr/bin/env npx tsx
/* eslint-disable */
/**
 * Script to find usages of CSS color alias variables that should be replaced
 * with their base variables or Tailwind utility classes.
 *
 * Usage:
 *   npx tsx scripts/find-color-aliases.ts
 *   npx tsx scripts/find-color-aliases.ts --no-color   (plain output)
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, relative } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const COLORS_CSS = resolve(ROOT, 'src/lib/styles/marketplace/core/colors.css');

// Parse :root block from the CSS file and extract alias mappings
function parseAliases(css: string): Map<string, string> {
	const aliases = new Map<string, string>();
	const rootMatch = css.match(/:root\s*\{([^}]+)\}/s);
	if (!rootMatch) return aliases;

	const lines = rootMatch[1].split('\n');
	for (const line of lines) {
		const m = line.match(/--([a-z0-9-]+)\s*:\s*var\(--([a-z0-9-]+)\)/);
		if (!m) continue;
		const varName = `--${m[1]}`;
		const baseVar = `--${m[2]}`;
		// Skip --color-accent-* aliases (those we keep)
		if (varName.startsWith('--color-accent-')) continue;
		aliases.set(varName, baseVar);
	}
	return aliases;
}

// Resolve a chain of aliases to the final base variable
function resolveChain(varName: string, aliases: Map<string, string>): string {
	const seen = new Set<string>();
	let current = varName;
	while (aliases.has(current) && !seen.has(current)) {
		seen.add(current);
		current = aliases.get(current)!;
	}
	return current;
}

// Search for usages using grep
function findUsages(varName: string): Array<{ file: string; line: number; text: string }> {
	const pattern = `var(${varName})`;
	try {
		const output = execSync(
			`grep -rn --include="*.svelte" --include="*.css" --include="*.ts" -F "${pattern}" src`,
			{ cwd: ROOT, encoding: 'utf-8' }
		);
		return output
			.trim()
			.split('\n')
			.filter(Boolean)
			.filter((l) => !l.startsWith('src/lib/styles/marketplace/core/colors.css'))
			.map((l) => {
				const idx1 = l.indexOf(':');
				const idx2 = l.indexOf(':', idx1 + 1);
				const file = l.slice(0, idx1);
				const lineNum = parseInt(l.slice(idx1 + 1, idx2), 10);
				const text = l.slice(idx2 + 1).trim();
				return { file: relative(ROOT, file), line: lineNum, text };
			});
	} catch {
		return [];
	}
}

const css = readFileSync(COLORS_CSS, 'utf-8');
const aliases = parseAliases(css);

const useMd = process.argv.includes('--md');
const useColor = !process.argv.includes('--no-color') && !useMd;
const RESET = useColor ? '\x1b[0m' : '';
const DIM = useColor ? '\x1b[2m' : '';
const CYAN = useColor ? '\x1b[36m' : '';
const YELLOW = useColor ? '\x1b[33m' : '';
const GREEN = useColor ? '\x1b[32m' : '';
const BOLD = useColor ? '\x1b[1m' : '';

let totalUsages = 0;

if (useMd) {
	console.log('# Color alias usages\n');
}

for (const [varName, directAlias] of aliases) {
	const baseVar = resolveChain(varName, aliases);
	const usages = findUsages(varName);
	if (usages.length === 0) continue;

	totalUsages += usages.length;

	if (useMd) {
		console.log(`## \`${varName}\``);
		console.log(
			`- aliased to: \`${directAlias}\`${directAlias !== baseVar ? ` → \`${baseVar}\`` : ''}`
		);
		console.log(`- replace with: \`var(${baseVar})\`\n`);
		for (const { file, line, text } of usages) {
			console.log(`- [${file}:${line}](${file}#L${line}) — \`${text}\``);
		}
		console.log();
	} else {
		console.log(`\n${BOLD}${YELLOW}${varName}${RESET}`);
		console.log(
			`${DIM}  → aliased to: ${directAlias}${directAlias !== baseVar ? ` → ${baseVar}` : ''}${RESET}`
		);
		console.log(`${DIM}  → replace with: ${GREEN}var(${baseVar})${RESET}`);
		for (const { file, line, text } of usages) {
			console.log(`  ${CYAN}${file}:${line}${RESET}`);
			console.log(`    ${DIM}${text}${RESET}`);
		}
	}
}

if (useMd) {
	console.log(
		`---\n**Total: ${totalUsages} usage(s) across ${aliases.size} alias variable(s) checked**`
	);
} else {
	console.log(
		`\n${BOLD}Total: ${totalUsages} usage(s) across ${aliases.size} alias variable(s) checked${RESET}`
	);
}
