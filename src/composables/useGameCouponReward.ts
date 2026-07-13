import { EMAIL_SENDING_ENABLED, sendCouponEmail } from '@/services/couponEmailService'
import { usePlayerStore } from '@/stores/playerStore'

export interface GameCouponDialogContent {
  title: string
  message: string
}

export interface GameWinCouponOptions {
  couponTitle?: string
  couponSubtitle?: string
  /** 遊戲專屬補充說明（顯示於優惠券訊息下方） */
  detail?: string
}

const DEFAULT_COUPON_TITLE = 'ON GAME 優惠券'
const DEFAULT_COUPON_SUBTITLE = '憑此券至櫃台兌換優惠'

export function useGameCouponReward() {
  const playerStore = usePlayerStore()

  async function handleGameWin(
    options: GameWinCouponOptions = {},
  ): Promise<GameCouponDialogContent> {
    const couponTitle = options.couponTitle ?? DEFAULT_COUPON_TITLE
    const couponSubtitle = options.couponSubtitle ?? DEFAULT_COUPON_SUBTITLE
    const detailSuffix = options.detail ? `\n${options.detail}` : ''

    // 開發階段：不索取 email、不寄信，直接顯示優惠券結果
    if (!EMAIL_SENDING_ENABLED) {
      return {
        title: '獲得優惠券！',
        message: `恭喜通關！優惠券已準備好（開發階段暫不寄送 Email）。\n${couponTitle} — ${couponSubtitle}${detailSuffix}`,
      }
    }

    if (!playerStore.couponSent) {
      try {
        const toEmail = await playerStore.requestEmailForCoupon()
        playerStore.couponSending = true
        await sendCouponEmail({
          toEmail,
          couponTitle,
          couponSubtitle,
        })
        playerStore.markCouponSent()
        return {
          title: '獲得優惠券！',
          message: `優惠券已發送至您的信箱，請查收！${detailSuffix}`,
        }
      } catch (error) {
        console.error('[coupon] 寄送優惠券失敗', error)
        return {
          title: '獲得優惠券！',
          message: `優惠券寄送失敗，請稍後再試或聯絡客服。${detailSuffix}`,
        }
      } finally {
        playerStore.dismissEmailPrompt()
      }
    }

    return {
      title: '獲得優惠券！',
      message: `優惠券已發送！${detailSuffix}`,
    }
  }

  return {
    handleGameWin,
  }
}
