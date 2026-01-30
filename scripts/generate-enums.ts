/**
 * Script para generar enums desde la API
 *
 * Uso: npm run generate:enums
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Cargar variables de entorno desde .env
function loadEnv(): Record<string, string> {
	const envPath = join(process.cwd(), '.env');
	const env: Record<string, string> = {};

	if (existsSync(envPath)) {
		const envFile = readFileSync(envPath, 'utf-8');
		envFile.split('\n').forEach((line) => {
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith('#')) {
				const [key, ...valueParts] = trimmed.split('=');
				if (key) {
					env[key.trim()] = valueParts.join('=').trim();
				}
			}
		});
	}

	return env;
}

const env = loadEnv();
const API_BASE =
	env.PUBLIC_API_BASE_URL || process.env.PUBLIC_API_BASE_URL || 'http://localhost:3333';

interface EnumItem {
	id: string;
	name: string;
	description?: string;
}

async function fetchEnum(endpoint: string): Promise<EnumItem[]> {
	try {
		const response = await fetch(`${API_BASE}${endpoint}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error(`❌ Error fetching ${endpoint}:`, error);
		throw error;
	}
}

async function generateEnums() {
	console.log('🔄 Fetching enums from API...');
	console.log(`📡 API Base: ${API_BASE}\n`);

	try {
		// Fetch all enums in parallel
		const [stageKinds, stageRelevances, stageRequirements, activityStatuses] = await Promise.all([
			fetchEnum('/stage-kinds'),
			fetchEnum('/stage-relevances'),
			fetchEnum('/stage-requirements'),
			fetchEnum('/activity-status')
		]);

		console.log(`✅ Stage Kinds: ${stageKinds.length} items`);
		console.log(`✅ Stage Relevances: ${stageRelevances.length} items`);
		console.log(`✅ Stage Requirements: ${stageRequirements.length} items`);
		console.log(`✅ Activity Statuses: ${activityStatuses.length} items\n`);

		const timestamp = new Date().toISOString();

		// Generate TypeScript file content
		const content = `/**
 * Auto-generated enums from API
 * Generated: ${timestamp}
 * API Base: ${API_BASE}
 * 
 * DO NOT EDIT MANUALLY
 * Run: npm run generate:enums
 */

// ============================================================================
// STAGE KINDS
// ============================================================================

export const STAGE_KINDS = ${JSON.stringify(
			stageKinds.map((k) => k.id),
			null,
			2
		)} as const;

export type StageKind = (typeof STAGE_KINDS)[number];

export const STAGE_KINDS_OPTIONS = ${JSON.stringify(
			stageKinds.map((k) => ({ id: k.id, name: k.name })),
			null,
			2
		)};

export const STAGE_KINDS_MAP = {
${stageKinds.map((k) => `\t${k.id}: ${JSON.stringify(k)}`).join(',\n')}
} as const;

// ============================================================================
// STAGE RELEVANCES
// ============================================================================

export const STAGE_RELEVANCES = ${JSON.stringify(
			stageRelevances.map((r) => r.id),
			null,
			2
		)} as const;

export type StageRelevance = (typeof STAGE_RELEVANCES)[number];

export const STAGE_RELEVANCES_OPTIONS = ${JSON.stringify(
			stageRelevances.map((r) => ({ id: r.id, name: r.name })),
			null,
			2
		)};

export const STAGE_RELEVANCES_MAP = {
${stageRelevances.map((r) => `\t${r.id}: ${JSON.stringify(r)}`).join(',\n')}
} as const;

// ============================================================================
// STAGE REQUIREMENTS
// ============================================================================

export const STAGE_REQUIREMENTS = ${JSON.stringify(
			stageRequirements.map((r) => r.id),
			null,
			2
		)} as const;

export type StageRequirement = (typeof STAGE_REQUIREMENTS)[number];

export const STAGE_REQUIREMENTS_OPTIONS = ${JSON.stringify(
			stageRequirements.map((r) => ({ id: r.id, name: r.name })),
			null,
			2
		)};

export const STAGE_REQUIREMENTS_MAP = {
${stageRequirements.map((r) => `\t${r.id}: ${JSON.stringify(r)}`).join(',\n')}
} as const;

// ============================================================================
// ACTIVITY STATUSES
// ============================================================================

export const ACTIVITY_STATUSES = ${JSON.stringify(
			activityStatuses.map((s) => s.id),
			null,
			2
		)} as const;

export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const ACTIVITY_STATUSES_OPTIONS = ${JSON.stringify(
			activityStatuses.map((s) => ({ id: s.id, name: s.name })),
			null,
			2
		)};

export const ACTIVITY_STATUSES_MAP = {
${activityStatuses.map((s) => `\t${s.id}: ${JSON.stringify(s)}`).join(',\n')}
} as const;
`;

		// Write to file
		const fs = await import('fs');
		const path = await import('path');

		const outputDir = path.join(process.cwd(), 'src', 'lib', 'generated');
		const outputFile = path.join(outputDir, 'enums.ts');

		// Create directory if it doesn't exist
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		fs.writeFileSync(outputFile, content, 'utf-8');

		console.log(`✅ Enums generated successfully!`);
		console.log(`📁 File: src/lib/generated/enums.ts\n`);

		// Show summary
		console.log('📊 Summary:');
		console.log(`   - Stage Kinds: ${stageKinds.map((k) => k.id).join(', ')}`);
		console.log(`   - Stage Relevances: ${stageRelevances.map((r) => r.id).join(', ')}`);
		console.log(`   - Stage Requirements: ${stageRequirements.map((r) => r.id).join(', ')}`);
		console.log(`   - Activity Statuses: ${activityStatuses.map((s) => s.id).join(', ')}`);
	} catch (error) {
		console.error('\n❌ Failed to generate enums:', error);
		process.exit(1);
	}
}

// Run the script
generateEnums();
