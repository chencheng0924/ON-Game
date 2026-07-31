import emailjs from '@emailjs/browser'

/**
 * 開發階段關閉寄信；上線前改為 true 即可恢復 EmailJS 流程。
 */
export const EMAIL_SENDING_ENABLED = true

/** 寄給客人的優惠券信（原測試帳號） */
const CUSTOMER_EMAILJS = {
  serviceId: 'service_q2tnnyg',
  templateId: 'template_nganqbh',
  publicKey: '3bAFQj1mn5zBagdoY',
} as const

/** 寄到內部信箱、搜集客人資料（原正式帳號） */
const LEAD_EMAILJS = {
  serviceId: 'service_ewm5gs5',
  templateId: 'template_dz022dk',
  publicKey: 'w7umiByLTZKdD62a8',
} as const

const LEAD_INBOX = 'onkoreannyc@gmail.com'

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

function formatEmailjsError(error: unknown): Error {
  const status = (error as { status?: number })?.status
  const text = (error as { text?: string })?.text
  console.error('[coupon] EmailJS 失敗', { status, text, error })
  return new Error(text || (error as Error)?.message || 'EmailJS send failed')
}

export interface CouponContactPayload {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export interface CouponEmailPayload extends CouponContactPayload {
  couponTitle: string
  couponSubtitle?: string
}

async function sendCustomerCouponEmail(payload: CouponEmailPayload): Promise<void> {
  const couponImageUrl = resolveCouponImageUrl()

  await emailjs.send(
    CUSTOMER_EMAILJS.serviceId,
    CUSTOMER_EMAILJS.templateId,
    {
      to_email: payload.email,
      user_email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone,
      coupon_title: payload.couponTitle,
      coupon_subtitle: payload.couponSubtitle ?? '',
      coupon_image_url: couponImageUrl,
    },
    { publicKey: CUSTOMER_EMAILJS.publicKey },
  )
}

function formatSentAt(date = new Date()): string {
  // 美東時間（紐約），方便現場對帳
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date)
}

async function sendLeadCollectionEmail(payload: CouponEmailPayload): Promise<void> {
  await emailjs.send(
    LEAD_EMAILJS.serviceId,
    LEAD_EMAILJS.templateId,
    {
      to_email: LEAD_INBOX,
      user_email: payload.email,
      customer_email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone,
      coupon_title: payload.couponTitle,
      sent_at: formatSentAt(),
    },
    { publicKey: LEAD_EMAILJS.publicKey },
  )
}

/** 同時寄：客人優惠券信 + 內部資料搜集信 */
export async function sendCouponEmail(payload: CouponEmailPayload): Promise<void> {
  if (!EMAIL_SENDING_ENABLED) {
    console.info('[coupon] 開發模式：略過 Email 寄送', payload)
    return
  }

  try {
    await Promise.all([
      sendCustomerCouponEmail(payload),
      sendLeadCollectionEmail(payload),
    ])
  } catch (error: unknown) {
    throw formatEmailjsError(error)
  }
}
