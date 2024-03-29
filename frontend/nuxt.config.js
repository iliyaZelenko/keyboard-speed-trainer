import colors from 'vuetify/es5/util/colors'

const routerBase = process.env.DEPLOY_ENV === 'GH_PAGES' ? {
  router: {
    base: '/keyboard-speed-trainer/'
  }
} : {}
export default {
  ...routerBase,

  ssr: false,

  /*
   ** Headers of the page
   */
  head: {
    // titleTemplate: '%s - Keyboard speed trainer',
    title: 'Keyboard speed trainer',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Slabo+27px&display=swap' }
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Merriweather:300' }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['~/plugins/firebase'],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxt/typescript-build',
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    'cookie-universal-nuxt'
    // [
    //   '@nuxtjs/firebase',
    //   {
    //     config: {
    //       apiKey: 'AIzaSyBN9S58IVuZuQwezIYxMI80QMRxAJKxZ_Q',
    //       authDomain: 'keyboard-speed-trainer.firebaseapp.com',
    //       projectId: 'keyboard-speed-trainer',
    //       storageBucket: 'keyboard-speed-trainer.appspot.com',
    //       messagingSenderId: '549225906484',
    //       appId: '1:549225906484:web:3b52af894ce13b02112561',
    //       measurementId: 'G-EQCFL53LGG'
    //     },
    //     services: {
    //       auth: true
    //     }
    //   }
    // ]
  ],

  pwa: {
    manifest: {
      name: 'Keyboard speed trainer'
    },
    meta: {
      name: 'Keyboard speed trainer'
    }
  },

  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  /*
   ** Build configuration
   */
  build: {
    transpile: ['chart.js'],
    /*
     ** You can extend webpack config here
     */
    extend (config, ctx) {}
  }
}
