<template>
  <header
    class="sticky top-0 z-40 w-full border-b border-base-content/5 bg-base-100/80 backdrop-blur-md transition-all">
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
      <div class="flex items-center gap-2 cursor-pointer" @click="navigateTo('/live')">
        <div class="flex h-8 w-8 items-center justify-center rounded-full text-primary-content">
          <img src="/favicon.ico" alt="logo">
        </div>
        <span class="text-xl font-bold tracking-tight text-base-content">{{ t('header.title') }}</span>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn btn-ghost btn-circle btn-sm" @click="toggleTheme">
          <Icon :name="isDark ? 'mingcute:moon-fill' : 'mingcute:sun-fill'" class="text-xl" />
        </button>

        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-sm px-2 font-normal">
            {{ currentLocaleShort() }}
            <Icon name="mingcute:down-line" />
          </div>
          <ul tabindex="0"
            class="menu dropdown-content z-[1] mt-4 w-32 rounded-box bg-base-100 p-2 shadow-xl border border-base-content/5">
            <li v-for="l in locales" :key="l.code">
              <a :class="{ 'active': locale === l.code }" @click="changeLocale(l.code as any)">
                {{ l.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { isDark, toggleTheme } = useThemeStore()
const { locale, locales, changeLocale, currentLocaleShort } = useAppI18n()
const { t } = useI18n();
</script>

<i18n lang="json">{
  "zh-CN": {
    "header": {
      "title": "LifeChain 社区直播"
    }
  },
  "zh-TW": {
    "header": {
      "title": "LifeChain 社區直播"
    }
  },
  "en": {
    "header": {
      "title": "LifeChain Community Live"
    }
  }
}</i18n>