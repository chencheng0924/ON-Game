/**
 * Shared coupon rules
 *
 * 70% 六人同行醬蟹、30% 10% off
 */

import type { MbtiLetter } from '@/views/pages/Games/mbtiQuiz.config'

export type CouponId = 'group_crab' | 'takeout_discount'

export interface GameCoupon {
  id: CouponId
}

/** 六人同行醬蟹機率；其餘為 10% off */
const GROUP_CRAB_CHANCE = 0.7

export function pickGameCoupon(): GameCoupon {
  return {
    id: Math.random() < GROUP_CRAB_CHANCE ? 'group_crab' : 'takeout_discount',
  }
}

export function pickBoilCatchBaseCoupon(): GameCoupon {
  return pickGameCoupon()
}

/**
 * MBTI: based on Q1–Q2 (E/I)
 * - 2E → group crab
 * - 2I → 10% off
 * - 1E1I → 70/30 random
 */
export function pickMbtiBaseCoupon(answers: readonly MbtiLetter[]): GameCoupon {
  const ei = answers.slice(0, 2).filter((letter): letter is 'E' | 'I' => letter === 'E' || letter === 'I')
  const eCount = ei.filter((letter) => letter === 'E').length
  const iCount = ei.filter((letter) => letter === 'I').length

  if (eCount === 2) return { id: 'group_crab' }
  if (iCount === 2) return { id: 'takeout_discount' }
  return pickGameCoupon()
}

export function resolveFinalCoupon(baseCoupon: GameCoupon): GameCoupon {
  return baseCoupon
}

type TranslateFn = (key: string) => string

const COUPON_I18N_KEY: Record<CouponId, string> = {
  group_crab: 'games.coupon.groupCrab',
  takeout_discount: 'games.coupon.takeoutDiscount',
}

export function getCouponCopy(coupon: GameCoupon, t: TranslateFn): {
  title: string
  subtitle: string
} {
  const base = COUPON_I18N_KEY[coupon.id]
  return {
    title: t(`${base}.title`),
    subtitle: t(`${base}.subtitle`),
  }
}
