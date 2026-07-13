/**
 * 熬煮時間與食材 — 遊戲設定
 */

export const BOIL_GAME_DURATION_SEC = 20

export interface BoilIngredientConfig {
  id: string
  name: string
  emoji: string
  /** 接到後加分 */
  score: number
  spawnWeight: number
}

/** 優質新鮮食材（要接住） */
export const GOOD_INGREDIENTS: readonly BoilIngredientConfig[] = [
  { id: 'bone', name: '牛大骨', emoji: '🦴', score: 12, spawnWeight: 22 },
  { id: 'radish', name: '新鮮蘿蔔', emoji: '🥕', score: 10, spawnWeight: 26 },
  { id: 'garlic', name: '新鮮大蒜', emoji: '🧄', score: 10, spawnWeight: 26 },
  { id: 'scallion', name: '蔥', emoji: '🧅', score: 8, spawnWeight: 26 },
] as const

export interface BoilTrapConfig {
  id: string
  name: string
  emoji: string
}

/** 劣質調味粉／加工品（要閃避） */
export const TRAP_SEASONINGS: readonly BoilTrapConfig[] = [
  { id: 'msg', name: 'MSG 味精包', emoji: '🧂' },
  { id: 'dye', name: '人工化學色素', emoji: '🧪' },
  { id: 'processed', name: '加工調味粉', emoji: '📦' },
  { id: 'chemical', name: '化學添加物', emoji: '⚠️' },
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
  potHitboxHeightPercent: 8,
} as const

export const BOIL_ITEM_CONFIG = {
  sizeVmin: 14,
} as const

export const BOIL_RULES = {
  title: '玩法說明',
  body: 'ON 堅持採用新鮮食材，湯頭長時間的熬煮才能真正做出好吃的食物給客人。請您在時間內接住「新鮮天然食材」，與我們一起製作出最 ON 的湯。',
  howTo: '左右滑動鐵鍋，在 20 秒內接住優質食材（牛大骨、新鮮蘿蔔、新鮮大蒜、蔥），閃避劣質調味粉（MSG 味精包、人工化學色素、加工調味粉）。只要 20 秒內沒有接到劣質調味粉，即可獲得優惠券！',
} as const
