// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

	modules: [
		'@nuxt/eslint',
		'@nuxt/ui'
	],

	devtools: {
		enabled: true
	},

	css: [ '~/assets/css/main.css' ],

	routeRules: {
		'/': { prerender: true }
	},

	// HTTPS configuration for Spotify API compatibility
	devServer: {
		https: {
			key: './localhost+2-key.pem',
			cert: './localhost+2.pem'
		}
	},
	compatibilityDate: '2025-01-15',

	eslint: {
		config: {
			stylistic: {
				commaDangle: 'never',
				braceStyle: '1tbs'
			}
		}
	}
})
