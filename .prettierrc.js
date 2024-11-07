import defaultConfig from '@epic-web/config/prettier'

/** @type {import("prettier").Options} */
export default {
	...defaultConfig,
	// .. your overrides here...
	plugins: [
		'@ianvs/prettier-plugin-sort-imports',
		'prettier-plugin-tailwindcss',
	],
	importOrder: [
		'^@remix-run/(.*)$',
		'^react',
		'^@nautikos/(.*)$',
		'<THIRD_PARTY_MODULES>',
		'',
		'^~/',
		'^[../]',
		'^[./]',
	],
	importOrderParserPlugins: ['typescript', 'jsx'],
}
