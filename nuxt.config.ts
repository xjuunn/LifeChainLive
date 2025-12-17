import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss() as any],
  },
  css: ["./app/assets/app.css"],
  components: true,
  imports: {
    dirs: [
      'stores/**',
      'utils/**',
    ]
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/ico', href: '/favicon.ico' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  build: {
    transpile: ['gsap'],
  },
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'zh-CN',
    detectBrowserLanguage: {
      useCookie: true,
      fallbackLocale: 'zh-CN',
      alwaysRedirect: false,
    },
    langDir: 'locales/',
    locales: [
      { code: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'zh-TW', name: '繁體中文', file: 'zh-TW.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ]
  },
  runtimeConfig: {
    public: {
      life_url: process.env.VITE_LIFE_URL
    }
  },
  nitro: {
    routeRules: {
      '/bg.life.tires/**': {
        proxy: `${process.env.VITE_LIFE_URL}/**`
      }
    }
  },
  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    'pinia-plugin-persistedstate',
    '@vueuse/nuxt',
    '@pinia/nuxt'
  ]
})