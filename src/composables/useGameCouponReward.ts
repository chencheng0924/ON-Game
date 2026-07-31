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
    const detailSuffix = options.detail ? `\n${options.detail}` : ''

    // 已發過券：不論哪款遊戲，都固定顯示第一次的獎項
    const locked = playerStore.issuedPrize
    const couponTitle = locked?.title || options.couponTitle || t('games.coupon.gotTitle')
    const couponSubtitle = locked?.subtitle || options.couponSubtitle || ''
    const prize = {
      prizeTitle: couponTitle,
      prizeSubtitle: couponSubtitle,
    }

    if (!EMAIL_SENDING_ENABLED) {
      // 開發模式也鎖定第一次出現的獎項，避免換遊戲看到不同券
      playerStore.lockIssuedPrize({ title: couponTitle, subtitle: couponSubtitle })
      return {
        title: t('games.coupon.gotTitle'),
        message: `${t('games.coupon.sentDev')}${detailSuffix}`,
        prizeTitle: playerStore.issuedPrize?.title || couponTitle,
        prizeSubtitle: playerStore.issuedPrize?.subtitle || couponSubtitle,
      }
    }

    if (!playerStore.couponSent) {
      try {
        const contact = await playerStore.requestContactForCoupon()
        playerStore.couponSending = true
        await sendCouponEmail({
          ...contact,
          couponTitle,
          couponSubtitle,
        })
        playerStore.markCouponSent({ title: couponTitle, subtitle: couponSubtitle })
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
      prizeTitle: playerStore.issuedPrize?.title || couponTitle,
      prizeSubtitle: playerStore.issuedPrize?.subtitle || couponSubtitle,
    }
  }

  return {
    handleGameWin,
  }
}
