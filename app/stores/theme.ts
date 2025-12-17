export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'light' | 'dark'>('dark')

  const isDark = computed(() => theme.value === 'dark')

  function initTheme() {
    const saved = localStorage.getItem('life-theme')
    theme.value = (saved === 'light' || saved === 'dark') ? saved : 'dark'
    applyTheme()
  }

  function toggleTheme() {
    theme.value = isDark.value ? 'light' : 'dark'
    applyTheme()
  }

  function setTheme(value: 'light' | 'dark') {
    theme.value = value
    applyTheme()
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem('life-theme', theme.value)
  }

  return { theme, isDark, initTheme, toggleTheme, setTheme, applyTheme }
})