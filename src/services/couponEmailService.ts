import emailjs from '@emailjs/browser'

/**
 * 開發階段關閉寄信；上線前改為 true 即可恢復 EmailJS 流程。
 */
export const EMAIL_SENDING_ENABLED = false

/** EmailJS 與優惠券圖片設定（寫死，無需 .env） */
const EMAILJS_SERVICE_ID = 'service_wc6rtfg'
const EMAILJS_TEMPLATE_ID = 'template_qq7qdys'
const EMAILJS_PUBLIC_KEY = 'xN8DZaI-Qs-hH1yg8'
const COUPON_IMAGE_URL =
  'https://master.d3akv27kk2324e.amplifyapp.com/coupon.png'

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

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email: payload.toEmail,
      user_email: payload.toEmail,
      coupon_title: payload.couponTitle,
      coupon_subtitle: payload.couponSubtitle ?? '',
      coupon_image_url: COUPON_IMAGE_URL,
    },
    { publicKey: EMAILJS_PUBLIC_KEY },
  )
}
