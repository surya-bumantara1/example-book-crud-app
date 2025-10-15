export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxtjs/i18n',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap'
  ],
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    typeCheck: true
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.FRONTEND_URL || 'http://localhost:3000/api'
    }
  },
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Español', file: 'es.json' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    vueI18n: {
      fallbackLocale: 'en'
    }
  },
  googleFonts: {
    families: {
      'Inter': [400, 500, 600, 700]
    }
  },
  robots: {
    UserAgent: '*',
    Disallow: '/admin'
  },
  sitemap: {
    hostname: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  nitro: {
    experimental: {
      wasm: true
    }
  }
})
