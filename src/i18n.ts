import { createI18n } from 'vue-i18n'
import zhTW from '@/languages/zh-TW.json'
import enUS from '@/languages/en-US.json'
import { Session } from '@/utils/sessionManagement'

const savedLocale = Session.getSessionLang()
const initialLocale = savedLocale === 'en-US' || savedLocale === 'zh-TW' ? savedLocale : 'zh-TW'

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en-US',
  messages: {
    'zh-TW': zhTW as Record<string, unknown>,
    'en-US': enUS as Record<string, unknown>,
  },
})
