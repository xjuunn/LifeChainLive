
export function useAppI18n() {
  const { t, locale, locales, setLocale } = useI18n()
  const STORAGE_KEY = 'app-locale'
  type LocaleType = 'zh-CN' | 'zh-TW' | 'en'
  const isValidLocale = (v: string | null): v is LocaleType => {
    return v === 'zh-CN' || v === 'zh-TW' || v === 'en'
  }
  if (import.meta.client) {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (isValidLocale(saved)) {
      setLocale(saved)
    } else {
      let system: LocaleType =
        navigator.language === 'zh-TW'
          ? 'zh-TW'
          : navigator.language.startsWith('en')
            ? 'en'
            : 'zh-CN'

      setLocale(system)
      localStorage.setItem(STORAGE_KEY, system)
    }
  }
  function changeLocale(code: LocaleType) {
    setLocale(code)
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, code)
    }
  }

  function currentLocaleShort() {
    return (
      {
        'zh-CN': 'CN',
        'zh-TW': 'TW',
        en: 'EN'
      }[locale.value] || locale.value
    )
  }

  return {
    t,
    locale,
    locales,
    changeLocale,
    currentLocaleShort
  }
}
