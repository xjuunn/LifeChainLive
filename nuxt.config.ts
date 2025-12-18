import tailwindcss from "@tailwindcss/vite";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  css: ["./app/assets/app.css"],
  components: true,

  build: {
    transpile: ['tuikit-atomicx-vue3']
  },

  vite: {
    plugins: [tailwindcss() as any],
    resolve: {
      alias: {
        '@tencentcloud/chat': require.resolve('@tencentcloud/chat'),
        '@tencentcloud/uikit-base-component-vue3': require.resolve('@tencentcloud/uikit-base-component-vue3'),
        '@tencentcloud/tui-core': require.resolve('@tencentcloud/tui-core'),
        '@tencentcloud/tuiroom-engine-js': require.resolve('@tencentcloud/tuiroom-engine-js'),
        '@tencentcloud/chat-uikit-engine': require.resolve('@tencentcloud/chat-uikit-engine')
      }
    },
    optimizeDeps: {
      include: [
        'tuikit-atomicx-vue3',
        '@tencentcloud/chat',
        '@tencentcloud/uikit-base-component-vue3',
        '@tencentcloud/tui-core',
        '@tencentcloud/tuiroom-engine-js',
        '@tencentcloud/chat-uikit-engine',
        'tim-upload-plugin',
        'tim-profiler-plugin'
      ]
    },

    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [
          /@tencentcloud/,
          /tuikit-atomicx-vue3/,
          /node_modules/
        ]
      }
    }
  },

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