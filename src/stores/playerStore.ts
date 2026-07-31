import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CouponContactPayload } from '@/services/couponEmailService'

const FIRST_NAME_KEY = 'ny-game-player-first-name'
const LAST_NAME_KEY = 'ny-game-player-last-name'
const PHONE_KEY = 'ny-game-player-phone'
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
  const firstName = ref(readStorage(FIRST_NAME_KEY) ?? '')
  const lastName = ref(readStorage(LAST_NAME_KEY) ?? '')
  const phone = ref(readStorage(PHONE_KEY) ?? '')
  const email = ref(readStorage(EMAIL_KEY) ?? '')
  const couponSent = ref(readStorage(COUPON_SENT_KEY) === '1')
  const issuedPrize = ref<IssuedCouponPrize | null>(readIssuedPrize())
  const emailPromptVisible = ref(false)
  const couponSending = ref(false)

  let contactPromptResolve: ((value: CouponContactPayload) => void) | null = null

  const contactInfo = computed<CouponContactPayload>(() => ({
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
  }))

  const hasContactInfo = computed(() => {
    const c = contactInfo.value
    return !!(c.firstName && c.lastName && c.phone && c.email)
  })

  const hasIssuedPrize = computed(() => !!issuedPrize.value?.title)

  function setContactInfo(value: CouponContactPayload) {
    const next = {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      phone: value.phone.trim(),
      email: value.email.trim(),
    }
    firstName.value = next.firstName
    lastName.value = next.lastName
    phone.value = next.phone
    email.value = next.email
    writeStorage(FIRST_NAME_KEY, next.firstName)
    writeStorage(LAST_NAME_KEY, next.lastName)
    writeStorage(PHONE_KEY, next.phone)
    writeStorage(EMAIL_KEY, next.email)
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

  function requestContactForCoupon(): Promise<CouponContactPayload> {
    if (hasContactInfo.value) {
      return Promise.resolve(contactInfo.value)
    }

    return new Promise((resolve) => {
      contactPromptResolve = resolve
      emailPromptVisible.value = true
    })
  }

  function confirmEmailPrompt() {
    couponSending.value = true
    contactPromptResolve?.(contactInfo.value)
    contactPromptResolve = null
  }

  function dismissEmailPrompt() {
    emailPromptVisible.value = false
    couponSending.value = false
  }

  function initFromStorage() {
    firstName.value = readStorage(FIRST_NAME_KEY) ?? ''
    lastName.value = readStorage(LAST_NAME_KEY) ?? ''
    phone.value = readStorage(PHONE_KEY) ?? ''
    email.value = readStorage(EMAIL_KEY) ?? ''
    couponSent.value = readStorage(COUPON_SENT_KEY) === '1'
    issuedPrize.value = readIssuedPrize()
  }

  return {
    firstName,
    lastName,
    phone,
    email,
    couponSent,
    issuedPrize,
    emailPromptVisible,
    couponSending,
    contactInfo,
    hasContactInfo,
    hasIssuedPrize,
    setContactInfo,
    lockIssuedPrize,
    markCouponSent,
    requestContactForCoupon,
    confirmEmailPrompt,
    dismissEmailPrompt,
    initFromStorage,
  }
})
