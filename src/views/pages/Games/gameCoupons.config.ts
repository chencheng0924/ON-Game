/**
 * Shared coupon rules for both games
 *
 * 50% 六人同行醬蝦、50% 10% off (for lunch)
 */

export type CouponId = 'group_crab' | 'takeout_discount'

export interface GameCoupon {
  id: CouponId
}

/** 六人同行醬蝦機率；其餘為午餐 10% off */
const GROUP_SHRIMP_CHANCE = 0.5

export function pickGameCoupon(): GameCoupon {
  return {
    id: Math.random() < GROUP_SHRIMP_CHANCE ? 'group_crab' : 'takeout_discount',
  }
}

export function pickBoilCatchBaseCoupon(): GameCoupon {
  return pickGameCoupon()
}

export function pickMbtiBaseCoupon(): GameCoupon {
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
