import { createI18n } from 'vue-i18n'
import zhTW from '@/languages/zh-TW.json'
import enUS from '@/languages/en-US.json'

/**
 * 目前產品文案以英文為主。
 * zh-TW 訊息已保留；之後可用 useLangStore().setLang('zh-TW' | 'en-US') 切換。
 */
export const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'zh-TW': zhTW as Record<string, unknown>,
    'en-US': enUS as Record<string, unknown>,
  },
})
