import { useI18n } from 'vue-i18n'
import { EMAIL_SENDING_ENABLED, sendCouponEmail } from '@/services/couponEmailService'
import { usePlayerStore } from '@/stores/playerStore'

export interface GameCouponDialogContent {
  title: string
  message: string
  prizeTitle: string
  prizeSubtitle: string
}

export interface GameWinCouponOptions {
  couponTitle?: string
  couponSubtitle?: string
  /** Extra detail under the status message */
  detail?: string
}

export function useGameCouponReward() {
  const playerStore = usePlayerStore()
  const { t } = useI18n()

  async function handleGameWin(
    options: GameWinCouponOptions = {},
  ): Promise<GameCouponDialogContent> {
    const couponTitle = options.couponTitle ?? t('games.coupon.gotTitle')
    const couponSubtitle = options.couponSubtitle ?? ''
    const detailSuffix = options.detail ? `\n${options.detail}` : ''
    const prize = {
      prizeTitle: couponTitle,
      prizeSubtitle: couponSubtitle,
    }

    if (!EMAIL_SENDING_ENABLED) {
      return {
        title: t('games.coupon.gotTitle'),
        message: `${t('games.coupon.sentDev')}${detailSuffix}`,
        ...prize,
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
          title: t('games.coupon.gotTitle'),
          message: `${t('games.coupon.sentInbox')}${detailSuffix}`,
          ...prize,
        }
      } catch (error) {
        console.error('[coupon] 寄送優惠券失敗', error)
        const reason = error instanceof Error && error.message
          ? `\n(${error.message})`
          : ''
        return {
          title: t('games.coupon.gotTitle'),
          message: `${t('games.coupon.sendFailed')}${reason}${detailSuffix}`,
          ...prize,
        }
      } finally {
        playerStore.dismissEmailPrompt()
      }
    }

    return {
      title: t('games.coupon.gotTitle'),
      message: `${t('games.coupon.sentAgain')}${detailSuffix}`,
      ...prize,
    }
  }

  return {
    handleGameWin,
  }
}
