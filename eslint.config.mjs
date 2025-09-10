// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
// stylistc rules reference: \.nuxt\eslint-typegen.d.ts
export default withNuxt(
	// Your custom configs here
	{
		files: [ '**/*.vue', '**/*.ts', '**/*.js', '**/*.mjs' ],
		rules: {
			'vue/multi-word-component-names': 0,
			// 'vue/script-setup-uses-vars': 'error',
			'vue/arrow-spacing': [ 'warn', {
				before: true,
				after: true
			} ],
			'no-unused-vars': 'warn',
			'vue/html-indent': [
				'warn',
				'tab',
				{
					attribute: 1,
					baseIndent: 1,
					closeBracket: 0,
					alignAttributesVertically: true,
					ignores: []
				}
			],
			'no-var': 2,
			'vue/multiline-html-element-content-newline': [
				'warn',
				{
					ignoreWhenEmpty: false,
					ignores: [],
					allowEmptyLines: false
				}
			],
			'vue/singleline-html-element-content-newline': [
				'warn',
				{
					ignoreWhenNoAttributes: false,
					ignoreWhenEmpty: false,
					ignores: []
				}
			],
			'vue/html-closing-bracket-newline': [
				'error',
				{
					singleline: 'never',
					multiline: 'always',
					selfClosingTag: {
						singleline: 'never',
						multiline: 'always'
					}
				}
			],
			'vue/block-order': [
				'error', {
					order: [
						'template',
						'script[setup]',
						'script:not([setup])',
						'style[scoped]',
						'style:not([scoped])'
					]
				}
			],
			'vue/array-element-newline': [
				'error',
				{
					multiline: true,
					minItems: 2
				}
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'vue/array-bracket-spacing': [ 'error', 'never' ],
			'vue/no-v-html': 0,
			'import/namespace': 0,
			'import/no-duplicates': 0,
			'import/named': 0,
			'import/no-named-as-default': 0,
			'import/no-named-as-default-member': 0,
			'import/default': 0
		},
		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': [ '.ts', '.vue' ]
			}
		}
	}
).override('nuxt/stylistic', { // sometimes stylistic rules are not applied and need overriden because of nuxt
	rules: {
		'vue/no-v-html': 0,
		'import/order': 0,
		'@typescript-eslint/no-explicit-any': 'off',
		'@stylistic/semi': [ 'error', 'never' ],
		'@stylistic/quotes': [ 'error', 'single' ],
		'@stylistic/array-bracket-spacing': [ 'error', 'always' ],
		'@stylistic/padded-blocks': [ 'error', 'never' ],
		'@stylistic/no-multiple-empty-lines': [ 'error', {
			max: 1,
			maxEOF: 0
		} ],
		'@stylistic/no-tabs': 0, // turn off the stylistic no‑tabs
		'@stylistic/array-element-newline': [ 'error', 'consistent' ],
		'@stylistic/arrow-parens': [ 'error', 'as-needed' ],
		'@stylistic/brace-style': [ 'error', '1tbs' ],
		'@stylistic/comma-dangle': [ 'error', 'never' ],
		'@stylistic/indent': [ 'error', 'tab' ],
		'@stylistic/no-trailing-spaces': 'error',
		'@stylistic/object-curly-newline': [
			'error',
			{
				// ObjectExpression: 'always',
				ObjectPattern: {
					multiline: true,
					minProperties: 2
				},
				ImportDeclaration: {
					multiline: true,
					minProperties: 2
				},
				ExportDeclaration: {
					multiline: true,
					minProperties: 1
				}
			}
		],
		'@stylistic/object-curly-spacing': [ 'error', 'always' ],
		'@stylistic/object-property-newline': [
			'error',
			{
				allowAllPropertiesOnSameLine: false
			}
		],
		'@stylistic/space-before-function-paren': [
			'error',
			{
				anonymous: 'never',
				named: 'never',
				asyncArrow: 'always'
			}
		]
	}
})
