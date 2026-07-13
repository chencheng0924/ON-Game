import storeExterior1 from '@/assets/store/TTAN-1.jpg'
import storeExterior2 from '@/assets/store/TTAN-2.jpg'
import storeExterior3 from '@/assets/store/TTAN-3.jpg'
import storeExterior from '@/assets/store/TTAN.jpg'
import storeHall from '@/assets/store/TTAN9.jpg'
import storeWelcome from '@/assets/store/TTAN10.jpg'
import storeCounter from '@/assets/store/TTAN11.jpg'
import storeDining from '@/assets/store/TTAN13.jpg'

/** 小吃店場景圖片 */
export const STORE_IMAGES = {
  exterior1: storeExterior1,
  exterior2: storeExterior2,
  exterior3: storeExterior3,
  exterior: storeExterior,
  /** 用餐大廳（酒桶、窗邊吧台） */
  hall: storeHall,
  /** 迎賓牆（おかえり） */
  welcome: storeWelcome,
  /** 吧台／出餐區 */
  counter: storeCounter,
  /** 用餐區（白磚牆、紅椅） */
  dining: storeDining,
} as const

/** 各頁面背景圖配置（四個遊戲各用不同圖，不重複） */
export const PAGE_BG = {
  hub: STORE_IMAGES.exterior2,
  wineGlass: STORE_IMAGES.counter,
  coinCatch: {
    idle: STORE_IMAGES.exterior,
    playing: STORE_IMAGES.welcome,
  },
  pinball: STORE_IMAGES.hall,
  cardGuess: STORE_IMAGES.dining,
} as const
