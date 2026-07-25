import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const EMAIL_KEY = 'ny-game-player-email'
const COUPON_SENT_KEY = 'ny-game-coupon-sent'
const COUPON_PRIZE_KEY = 'ny-game-coupon-prize'

export interface IssuedCouponPrize {
  title: string
  subtitle: string
}

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

function readIssuedPrize(): IssuedCouponPrize | null {
  const raw = readStorage(COUPON_PRIZE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<IssuedCouponPrize>
    if (typeof parsed.title === 'string' && parsed.title.trim()) {
      return {
        title: parsed.title,
        subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : '',
      }
    }
  } catch {
    // ignore
  }
  return null
}

export const usePlayerStore = defineStore('playerStore', () => {
  const email = ref(readStorage(EMAIL_KEY) ?? '')
  const couponSent = ref(readStorage(COUPON_SENT_KEY) === '1')
  const issuedPrize = ref<IssuedCouponPrize | null>(readIssuedPrize())
  const emailPromptVisible = ref(false)
  const couponSending = ref(false)

  let emailPromptResolve: ((value: string) => void) | null = null

  const hasEmail = computed(() => email.value.trim().length > 0)
  const hasIssuedPrize = computed(() => !!issuedPrize.value?.title)

  function setEmail(value: string) {
    const trimmed = value.trim()
    email.value = trimmed
    writeStorage(EMAIL_KEY, trimmed)
  }

  /** 鎖定本次 session 已發過的獎項（之後各遊戲都顯示同一張） */
  function lockIssuedPrize(prize: IssuedCouponPrize) {
    if (issuedPrize.value?.title) return
    const next = {
      title: prize.title.trim(),
      subtitle: prize.subtitle.trim(),
    }
    if (!next.title) return
    issuedPrize.value = next
    writeStorage(COUPON_PRIZE_KEY, JSON.stringify(next))
  }

  function markCouponSent(prize?: IssuedCouponPrize) {
    couponSent.value = true
    writeStorage(COUPON_SENT_KEY, '1')
    if (prize) lockIssuedPrize(prize)
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
    issuedPrize.value = readIssuedPrize()
  }

  return {
    email,
    couponSent,
    issuedPrize,
    emailPromptVisible,
    couponSending,
    hasEmail,
    hasIssuedPrize,
    setEmail,
    lockIssuedPrize,
    markCouponSent,
    requestEmailForCoupon,
    confirmEmailPrompt,
    dismissEmailPrompt,
    initFromStorage,
  }
})
