import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { i18n } from '@/i18n'
import { Session } from '@/utils/sessionManagement'

const EN = 'en-US'
const TW = 'zh-TW'
export type LocaleCode = 'en-US' | 'zh-TW'

const isValidLocale = (v: string): v is LocaleCode => v === EN || v === TW

export const useLangStore = defineStore('lang', () => {
  const langCode = ref<LocaleCode>(i18n.global.locale.value as LocaleCode)
  const currentLang = computed(() => i18n.global.locale.value as LocaleCode)

  const setLang = (current?: string) => {
    if (current == null) {
      const next: LocaleCode = currentLang.value === EN ? TW : EN
      i18n.global.locale.value = next
      langCode.value = next
      Session.setSessionLang(next)
    }
  }

  const reloadSetLang = () => {
    const lang = Session.getSessionLang()
    if (lang != null && lang !== '') {
      setLang(lang)
    }
  }

  return {
    currentLang,
    setLang,
    reloadSetLang,
    langCode,
  }
})
