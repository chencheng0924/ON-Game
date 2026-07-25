/**
 * Simmering Soups & Selected Ingredients — game config
 */

export const BOIL_GAME_DURATION_SEC = 20
/** Reach this score within time to win early (also survive without traps) */
export const BOIL_WIN_SCORE = 100

export interface BoilIngredientConfig {
  id: string
  nameKey: string
  emoji: string
  score: number
  spawnWeight: number
}

/** Fresh ingredients (catch these) */
export const GOOD_INGREDIENTS: readonly BoilIngredientConfig[] = [
  { id: 'bone', nameKey: 'games.boil.ingredients.bone', emoji: '🦴', score: 12, spawnWeight: 22 },
  { id: 'vegetables', nameKey: 'games.boil.ingredients.vegetables', emoji: '🥬', score: 10, spawnWeight: 26 },
  { id: 'scallion', nameKey: 'games.boil.ingredients.scallion', emoji: '🧅', score: 8, spawnWeight: 26 },
  { id: 'salt', nameKey: 'games.boil.ingredients.salt', emoji: '🧂', score: 10, spawnWeight: 26 },
] as const

export interface BoilTrapConfig {
  id: string
  nameKey: string
  emoji: string
}

/** Low-quality additives (dodge these) */
export const TRAP_SEASONINGS: readonly BoilTrapConfig[] = [
  { id: 'msg', nameKey: 'games.boil.traps.msg', emoji: '☠️' },
  { id: 'dye', nameKey: 'games.boil.traps.dye', emoji: '🧪' },
  { id: 'processed', nameKey: 'games.boil.traps.processed', emoji: '📦' },
  { id: 'chemical', nameKey: 'games.boil.traps.chemical', emoji: '⚠️' },
] as const

export const BOIL_TRAP_CONFIG = {
  spawnChance: 0.38,
} as const

export const BOIL_SPAWN_CONFIG = {
  intervalMs: 700,
  fallSpeedMin: 30,
  fallSpeedMax: 46,
  driftSpeedMin: -16,
  driftSpeedMax: 16,
} as const

export const BOIL_PLAYER_CONFIG = {
  widthPercent: 18,
  bottomPercent: 1,
  moveSpeed: 58,
  /**
   * Pot mouth catch zone (ratios relative to player element)
   */
  potMouth: {
    leftRatio: 0.22,
    rightRatio: 0.78,
    topRatio: 0.42,
    bottomRatio: 0.62,
  },
} as const

export const BOIL_ITEM_CONFIG = {
  sizeVmin: 14,
  hitRadiusPercent: 2.2,
  hitCenterYOffsetPercent: -1.8,
} as const
