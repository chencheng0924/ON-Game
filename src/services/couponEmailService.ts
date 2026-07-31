import emailjs from '@emailjs/browser'

/**
 * 開發階段關閉寄信；上線前改為 true 即可恢復 EmailJS 流程。
 */
export const EMAIL_SENDING_ENABLED = true

/** true = 測試帳號；false = 正式帳號。測完上線前改回 false */
const USE_TEST_EMAILJS = true

const EMAILJS_PROD = {
  serviceId: 'service_ewm5gs5',
  templateId: 'template_dz022dk',
  publicKey: 'w7umiByLTZKdD62a8',
} as const

const EMAILJS_TEST = {
  serviceId: 'service_q2tnnyg',
  templateId: 'template_nganqbh',
  publicKey: '3bAFQj1mn5zBagdoY',
} as const

const emailjsConfig = USE_TEST_EMAILJS ? EMAILJS_TEST : EMAILJS_PROD

const EMAILJS_SERVICE_ID =
  import.meta.env.VITE_EMAILJS_SERVICE_ID || emailjsConfig.serviceId
const EMAILJS_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID || emailjsConfig.templateId
const EMAILJS_PUBLIC_KEY =
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY || emailjsConfig.publicKey

/**
 * 寄信內嵌圖必須是「公開 HTTPS」網址。
 * 不能用 localhost（郵件客戶端讀不到，會變成破圖）。
 *
 * 優先：VITE_COUPON_IMAGE_URL → 非本機站點 /newCoupon.jpg → 正式站公開網址
 */
const PUBLIC_COUPON_IMAGE_URL =
  'https://www.onkoreannyc.com/newCoupon.jpg'

function isLocalHost(hostname: string): boolean {
  return (
    hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '[::1]'
    || hostname.endsWith('.local')
  )
}

function resolveCouponImageUrl(): string {
  const fromEnv = import.meta.env.VITE_COUPON_IMAGE_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.trim()

  if (typeof window !== 'undefined' && window.location?.origin) {
    const { origin, hostname } = window.location
    if (!isLocalHost(hostname)) {
      return `${origin}/newCoupon.jpg`
    }
  }

  return PUBLIC_COUPON_IMAGE_URL
}

export interface CouponEmailPayload {
  toEmail: string
  couponTitle: string
  couponSubtitle?: string
}

export async function sendCouponEmail(payload: CouponEmailPayload): Promise<void> {
  if (!EMAIL_SENDING_ENABLED) {
    console.info('[coupon] 開發模式：略過 Email 寄送', payload)
    return
  }

  const couponImageUrl = resolveCouponImageUrl()

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: payload.toEmail,
        user_email: payload.toEmail,
        coupon_title: payload.couponTitle,
        coupon_subtitle: payload.couponSubtitle ?? '',
        coupon_image_url: couponImageUrl,
      },
      { publicKey: EMAILJS_PUBLIC_KEY },
    )
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status
    const text = (error as { text?: string })?.text
    console.error('[coupon] EmailJS 失敗', { status, text, error })
    throw new Error(text || (error as Error)?.message || 'EmailJS send failed')
  }
}
