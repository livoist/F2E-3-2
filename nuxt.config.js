import path from 'path'

const routerBase =
  process.env.DEPLOY_ENV === 'GH_PAGES'
    ? {
        router: {
          base: '/F2E-3-2/'
        }
    } : {}

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'F2E-3-2',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://api.mapbox.com/mapbox-gl-js/v1.10.0/mapbox-gl.css' }
    ]
  },

  // all resource endpoint path(資源路徑！！！非常重要)
  router: {
    base: '/F2E-3-2/'
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/css/style.sass',
    '@/assets/css/reset.sass'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/axios',
    { src: "@plugins/vue2-leaflet-markercluster.js", mode: 'client' },
    '@/plugins/mapbox.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    'nuxt-leaflet'
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },

  alias: {
    '@img': path.resolve(__dirname, './assets/img')
  }
}
