/**
 * 接菜品遊戲設定（之後調整分數、機率、速度請改此檔）
 */

import food1 from '@/assets/food/food1.png'
import food2 from '@/assets/food/food2.png'
import food3 from '@/assets/food/food3.png'
import food4 from '@/assets/food/food4.png'
import food5 from '@/assets/food/food5.png'
import food6 from '@/assets/food/food6.png'
import food7 from '@/assets/food/food7.png'
import food8 from '@/assets/food/food8.png'
import westernBurger from '@/assets/food/western-burger.png'
import westernChicken from '@/assets/food/western-chicken.png'
import westernFries from '@/assets/food/western-fries.png'
import westernSteak from '@/assets/food/western-steak.png'

export const CATCH_GAME_DURATION_SEC = 30

export type DishId =
  | 'burger'
  | 'sandwich'
  | 'meat'
  | 'pizza'
  | 'ramen'
  | 'sushi'
  | 'chicken'
  | 'bento'

export interface DishTypeConfig {
  id: DishId
  image: string
  score: number
  /** 掉落權重，數字越大越容易出現 */
  spawnWeight: number
}

export const DISH_TYPES: readonly DishTypeConfig[] = [
  { id: 'burger', image: food1, score: 10, spawnWeight: 18 },
  { id: 'sandwich', image: food2, score: 8, spawnWeight: 18 },
  { id: 'meat', image: food3, score: 12, spawnWeight: 14 },
  { id: 'pizza', image: food4, score: 9, spawnWeight: 16 },
  { id: 'ramen', image: food5, score: 7, spawnWeight: 16 },
  { id: 'sushi', image: food6, score: 11, spawnWeight: 14 },
  { id: 'chicken', image: food7, score: 8, spawnWeight: 16 },
  { id: 'bento', image: food8, score: 15, spawnWeight: 8 },
] as const

/** 猜料理遊戲用的菜品圖片（與 DISH_TYPES 順序一致） */
export const DISH_IMAGES = DISH_TYPES.map((dish) => dish.image)

export type TrapFoodId = 'burger' | 'friedChicken' | 'steak' | 'fries'

export interface TrapFoodConfig {
  id: TrapFoodId
  name: string
  image: string
}

/** 接到即結束的非 TTAN 料理（隨機掉落） */
export const TRAP_FOOD_TYPES: readonly TrapFoodConfig[] = [
  { id: 'burger', name: '漢堡', image: westernBurger },
  { id: 'friedChicken', name: '炸雞', image: westernChicken },
  { id: 'steak', name: '牛排', image: westernSteak },
  { id: 'fries', name: '薯條', image: westernFries },
] as const

export const TRAP_FOOD_CONFIG = {
  /** 每次生成時變成陷阱食物的機率（0～1） */
  spawnChance: 0.45,
} as const

export const CATCH_SPAWN_CONFIG = {
  /** 生成間隔（毫秒） */
  intervalMs: 750,
  /** 垂直下落速度（% 高度 / 秒） */
  fallSpeedMin: 28,
  fallSpeedMax: 42,
  /** 水平初速度（% 寬度 / 秒），製造不同角度 */
  driftSpeedMin: -18,
  driftSpeedMax: 18,
} as const

export const CATCH_PLAYER_CONFIG = {
  /** 玩家寬度（佔顯示層寬度 %） */
  widthPercent: 14,
  /** 玩家距離底部的 % */
  bottomPercent: 2,
  /** 移動速度（% 寬度 / 秒） */
  moveSpeed: 55,
  /** 托盤碰撞區高度（佔顯示層高度 %，對齊 SVG 托盤位置） */
  trayHitboxHeightPercent: 7,
} as const

export const CATCH_ITEM_CONFIG = {
  /** 掉落物尺寸（vmin） */
  sizeVmin: 15,
} as const
