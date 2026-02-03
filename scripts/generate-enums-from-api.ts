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
		const [stageKinds, stageRelevances, stageRequirements, activityStatuses, notSuitableFor] =
			await Promise.all([
				fetchEnum('/stage-kinds'),
				fetchEnum('/stage-relevances'),
				fetchEnum('/stage-requirements'),
				fetchEnum('/activity-status'),
				fetchEnum('/not-suitable-for')
			]);

		console.log(`✅ Stage Kinds: ${stageKinds.length} items`);
		console.log(`✅ Stage Relevances: ${stageRelevances.length} items`);
		console.log(`✅ Stage Requirements: ${stageRequirements.length} items`);
		console.log(`✅ Activity Statuses: ${activityStatuses.length} items`);
		console.log(`✅ Not Suitable For: ${notSuitableFor.length} items\n`);

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

// Activities

export const ACTIVITY_NOT_SUITABLE_FOR_OPTIONS = ${JSON.stringify(
			notSuitableFor.map((n) => ({ id: n.id, name: n.name })),
			null,
			'\t'
		)} as const;

export type ActivityNotSuitableFor = (typeof ACTIVITY_NOT_SUITABLE_FOR_OPTIONS)[number]['id'];
export const ACTIVITY_NOT_SUITABLE_FOR_VALUES = ACTIVITY_NOT_SUITABLE_FOR_OPTIONS.map((opt) => opt.id) as [string, ...string[]];

export const ACTIVITY_STATUS_OPTIONS = ${JSON.stringify(
			activityStatuses.map((s) => ({ id: s.id, name: s.name })),
			null,
			'\t'
		)} as const;

export type ActivityStatus = (typeof ACTIVITY_STATUS_OPTIONS)[number]['id'];
export const ACTIVITY_STATUS_VALUES = ACTIVITY_STATUS_OPTIONS.map((opt) => opt.id) as [string, ...string[]];

// Stages

export const STAGE_REQUIREMENT_OPTIONS = ${JSON.stringify(
			stageRequirements.map((r) => ({ id: r.id, name: r.name })),
			null,
			'\t'
		)} as const;

export type StageRequirement = (typeof STAGE_REQUIREMENT_OPTIONS)[number]['id'];
export const STAGE_REQUIREMENT_VALUES = STAGE_REQUIREMENT_OPTIONS.map((opt) => opt.id) as [string, ...string[]];

export const STAGE_KIND_OPTIONS = ${JSON.stringify(
			stageKinds.map((k) => ({ id: k.id, name: k.name, description: k.description })),
			null,
			'\t'
		)} as const;

export type StageKind = (typeof STAGE_KIND_OPTIONS)[number]['id'];
export const STAGE_KIND_VALUES = STAGE_KIND_OPTIONS.map((opt) => opt.id) as [string, ...string[]];

export const STAGE_RELEVANCE_OPTIONS = ${JSON.stringify(
			stageRelevances.map((r) => ({ id: r.id, name: r.name })),
			null,
			'\t'
		)} as const;

export type StageRelevance = (typeof STAGE_RELEVANCE_OPTIONS)[number]['id'];
export const STAGE_RELEVANCE_VALUES = STAGE_RELEVANCE_OPTIONS.map((opt) => opt.id) as [string, ...string[]];
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
		console.log(`📁 File: src/lib/generated/generated-enums-from-api.ts\n`);

		// Show summary
		console.log('📊 Summary:');
		console.log(`   - Stage Kinds: ${stageKinds.map((k) => k.id).join(', ')}`);
		console.log(`   - Stage Relevances: ${stageRelevances.map((r) => r.id).join(', ')}`);
		console.log(`   - Stage Requirements: ${stageRequirements.map((r) => r.id).join(', ')}`);
		console.log(`   - Activity Statuses: ${activityStatuses.map((s) => s.id).join(', ')}`);
		console.log(`   - Not Suitable For: ${notSuitableFor.map((n) => n.id).join(', ')}`);
	} catch (error) {
		console.error('\n❌ Failed to generate enums:', error);
		process.exit(1);
	}
}

// Run the script
generateEnums();
