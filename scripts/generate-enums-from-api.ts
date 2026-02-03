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

interface EnumConfig {
	name: string;
	endpoint: string;
	typeName: string;
	section?: string;
	includeDescription?: boolean;
}

const ENUM_CONFIGS: EnumConfig[] = [
	{
		name: 'ACTIVITY_STATUS_OPTIONS',
		endpoint: '/activity-status',
		typeName: 'ActivityStatus',
		section: 'Activities'
	},
	{
		name: 'STAGE_REQUIREMENT_OPTIONS',
		endpoint: '/stage-requirements',
		typeName: 'StageRequirement',
		section: 'Stages'
	},
	{
		name: 'STAGE_KIND_OPTIONS',
		endpoint: '/stage-kinds',
		typeName: 'StageKind',
		section: 'Stages',
		includeDescription: true
	},
	{
		name: 'STAGE_RELEVANCE_OPTIONS',
		endpoint: '/stage-relevances',
		typeName: 'StageRelevance',
		section: 'Stages'
	}
];

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

function generateEnumBlock(config: EnumConfig, items: EnumItem[]): string {
	const optionsName = config.name;
	const valuesName = config.name.replace('_OPTIONS', '_VALUES');
	const typeName = config.typeName;

	const itemsData = items.map((item) => {
		const obj: Record<string, string> = { id: item.id, name: item.name };
		if (config.includeDescription && item.description) {
			obj.description = item.description;
		}
		return obj;
	});

	return `export const ${optionsName} = ${JSON.stringify(itemsData, null, '\t')} as const;

export type ${typeName} = (typeof ${optionsName})[number]['id'];
export const ${valuesName} = ${optionsName}.map((opt) => opt.id) as [string, ...string[]];
`;
}

async function generateEnums() {
	console.log('🔄 Fetching enums from API...');
	console.log(`📡 API Base: ${API_BASE}\n`);

	try {
		// Fetch all enums in parallel
		const enumsData = await Promise.all(
			ENUM_CONFIGS.map(async (config) => {
				const items = await fetchEnum(config.endpoint);
				console.log(`✅ ${config.name}: ${items.length} items`);
				return { config, items };
			})
		);

		console.log('');

		const timestamp = new Date().toISOString();

		// Group by section
		const sections = new Map<string, { config: EnumConfig; items: EnumItem[] }[]>();
		enumsData.forEach((data) => {
			const section = data.config.section || 'Other';
			if (!sections.has(section)) {
				sections.set(section, []);
			}
			sections.get(section)!.push(data);
		});

		// Generate TypeScript file content
		let content = `/**
 * Auto-generated enums from API
 * Generated: ${timestamp}
 * API Base: ${API_BASE}
 * 
 * DO NOT EDIT MANUALLY
 * Run: npm run generate:enums
 */

`;

		// Generate blocks for each section
		sections.forEach((sectionEnums, sectionName) => {
			content += `// ${sectionName}\n\n`;
			sectionEnums.forEach(({ config, items }) => {
				content += generateEnumBlock(config, items);
				content += '\n';
			});
		});

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
		enumsData.forEach(({ config, items }) => {
			console.log(`   - ${config.name}: ${items.map((i) => i.id).join(', ')}`);
		});
	} catch (error) {
		console.error('\n❌ Failed to generate enums:', error);
		process.exit(1);
	}
}

// Run the script
generateEnums();
