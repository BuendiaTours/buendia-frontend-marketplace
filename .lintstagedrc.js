export default {
	'*.{js,ts,svelte}': (files) => {
		const filtered = files.filter((file) => !file.includes('src/lib/icons/dist/'));
		if (filtered.length === 0) return [];

		return [`prettier --write ${filtered.join(' ')}`, `eslint --fix ${filtered.join(' ')}`];
	},
	'*.{json,css,md,html,yaml,yml}': 'prettier --write'
};
