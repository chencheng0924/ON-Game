/**
 * Shared coupon rules for Boil Catch / MBTI
 *
 * 1. Resolve base coupon (Boil: 50/50; MBTI: EI answers)
 * 2. Roll again: 90% keep base, 10% hidden opening pack
 */

import type { MbtiLetter } from '@/views/pages/Games/mbtiQuiz.config'

export type StandardCouponId = 'group_crab' | 'takeout_discount'
export type CouponId = StandardCouponId | 'opening_pack'

export interface GameCoupon {
  id: CouponId
}

const STANDARD_COUPON_IDS: readonly StandardCouponId[] = [
  'group_crab',
  'takeout_discount',
]

/** Hidden coupon chance */
export const HIDDEN_COUPON_CHANCE = 0.1

function pickRandomStandardCoupon(): GameCoupon {
  const id = STANDARD_COUPON_IDS[Math.floor(Math.random() * STANDARD_COUPON_IDS.length)]
  return { id }
}

export function pickBoilCatchBaseCoupon(): GameCoupon {
  return pickRandomStandardCoupon()
}

/**
 * MBTI: based on Q1–Q2 (E/I)
 * - 2E → group crab
 * - 2I → takeout discount
 * - 1E1I → random
 */
export function pickMbtiBaseCoupon(answers: readonly MbtiLetter[]): GameCoupon {
  const ei = answers.slice(0, 2).filter((letter): letter is 'E' | 'I' => letter === 'E' || letter === 'I')
  const eCount = ei.filter((letter) => letter === 'E').length
  const iCount = ei.filter((letter) => letter === 'I').length

  if (eCount === 2) return { id: 'group_crab' }
  if (iCount === 2) return { id: 'takeout_discount' }
  return pickRandomStandardCoupon()
}

export function resolveFinalCoupon(baseCoupon: GameCoupon): GameCoupon {
  if (Math.random() < HIDDEN_COUPON_CHANCE) {
    return { id: 'opening_pack' }
  }
  return baseCoupon
}

type TranslateFn = (key: string) => string

const COUPON_I18N_KEY: Record<CouponId, string> = {
  group_crab: 'games.coupon.groupCrab',
  takeout_discount: 'games.coupon.takeoutDiscount',
  opening_pack: 'games.coupon.openingPack',
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
