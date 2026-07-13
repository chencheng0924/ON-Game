import onWelcome from '@/assets/store/on-welcome.png'
import onWelcomeMobile from '@/assets/store/on-welcome-mobile.png'
import onExterior from '@/assets/store/on-exterior.png'
import onBoilBg from '@/assets/store/on-boil-bg.png'

/** ON 店面場景圖片 */
export const STORE_IMAGES = {
  /** 歡迎牌（手繪食材） */
  welcome: onWelcome,
  /** 歡迎牌（手機直式裁切） */
  welcomeMobile: onWelcomeMobile,
  /** 店外招牌 */
  exterior: onExterior,
  /** 熬煮遊戲背景（店內小菜牆） */
  boilBg: onBoilBg,
} as const

/** 各頁面背景圖配置 */
export const PAGE_BG = {
  /** 遊戲中心歡迎圖 */
  hub: STORE_IMAGES.welcome,
  hubMobile: STORE_IMAGES.welcomeMobile,
  /** 熬煮時間與食材 */
  boilCatch: {
    idle: STORE_IMAGES.boilBg,
    playing: STORE_IMAGES.boilBg,
  },
  /** MBTI 韓式吃貨人格 */
  mbtiQuiz: STORE_IMAGES.exterior,
  // 舊遊戲路由相容（選單已隱藏）
  wineGlass: STORE_IMAGES.boilBg,
  coinCatch: {
    idle: STORE_IMAGES.exterior,
    playing: STORE_IMAGES.exterior,
  },
  pinball: STORE_IMAGES.boilBg,
  cardGuess: STORE_IMAGES.boilBg,
} as const
