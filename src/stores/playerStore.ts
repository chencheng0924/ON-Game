import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const EMAIL_KEY = 'ny-game-player-email'
const COUPON_SENT_KEY = 'ny-game-coupon-sent'

function readStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

export const usePlayerStore = defineStore('playerStore', () => {
  const email = ref(readStorage(EMAIL_KEY) ?? '')
  const couponSent = ref(readStorage(COUPON_SENT_KEY) === '1')
  const emailPromptVisible = ref(false)
  const couponSending = ref(false)

  let emailPromptResolve: ((value: string) => void) | null = null

  const hasEmail = computed(() => email.value.trim().length > 0)

  function setEmail(value: string) {
    const trimmed = value.trim()
    email.value = trimmed
    writeStorage(EMAIL_KEY, trimmed)
  }

  function markCouponSent() {
    couponSent.value = true
    writeStorage(COUPON_SENT_KEY, '1')
  }

  function requestEmailForCoupon(): Promise<string> {
    const trimmed = email.value.trim()
    if (trimmed.length > 0) {
      return Promise.resolve(trimmed)
    }

    return new Promise((resolve) => {
      emailPromptResolve = resolve
      emailPromptVisible.value = true
    })
  }

  function confirmEmailPrompt() {
    const trimmed = email.value.trim()
    couponSending.value = true
    emailPromptResolve?.(trimmed)
    emailPromptResolve = null
  }

  function dismissEmailPrompt() {
    emailPromptVisible.value = false
    couponSending.value = false
  }

  function initFromStorage() {
    email.value = readStorage(EMAIL_KEY) ?? ''
    couponSent.value = readStorage(COUPON_SENT_KEY) === '1'
  }

  return {
    email,
    couponSent,
    emailPromptVisible,
    couponSending,
    hasEmail,
    setEmail,
    markCouponSent,
    requestEmailForCoupon,
    confirmEmailPrompt,
    dismissEmailPrompt,
    initFromStorage,
  }
})
