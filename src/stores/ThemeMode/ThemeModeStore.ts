import { defineStore } from "pinia"
import { ref, computed, watch } from "vue"

const STORAGE_KEY = 'theme-mode'
export type ThemeMode = 'light' | 'dark' | 'system'
export enum ThemeModeList {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export const ThemeModeStore = defineStore('ThemeModeStore', () => {
  const sidebarVisible = ref<boolean>(true)
  const updateSidebarVisible = (visible?: boolean) => {
    if (visible) {
      sidebarVisible.value = visible
      return
    }
    sidebarVisible.value = !sidebarVisible.value
  }
  const setVisible = (visible?: boolean) => {
    sidebarVisible.value = visible ?? sidebarVisible.value
  }

  // --- 深淺色主題（作法 A：html 上 class="dark"）---
  const mode = ref<ThemeMode>(ThemeModeList.System)

  const isDark = computed(() => {
    if (mode.value === ThemeModeList.Dark) return true
    if (mode.value === ThemeModeList.Light) return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const applyTheme = () => {
    const dark = isDark.value
    document.documentElement.classList.toggle('dark', dark)
  }

  const setMode = (value: ThemeMode) => {
    mode.value = value
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // ignore
    }
    applyTheme()
  }

  const initFromStorage = () => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (saved === ThemeModeList.Light || saved === ThemeModeList.Dark || saved === ThemeModeList.System) {
      mode.value = saved
    }
    applyTheme()

    const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null
    if (mq) {
      mq.addEventListener('change', () => {
        if (mode.value === ThemeModeList.System) applyTheme()
      })
    }
  }

  watch(isDark, () => applyTheme(), { flush: 'sync' })

  return {
    sidebarVisible,
    updateSidebarVisible,
    setVisible,
    mode,
    isDark,
    setMode,
    applyTheme,
    initFromStorage,
  }
})