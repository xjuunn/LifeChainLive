import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss() as any],
  },
  css: ["./app/assets/app.css"],

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