export interface PinballCoupon {
  id: string
  title: string
  subtitle: string
  /** 底部格顯示用短標 */
  shortLabel: string
}

export const PINBALL_COUPONS: PinballCoupon[] = [
  {
    id: 'mock-01',
    title: '全單 9 折',
    subtitle: '單筆消費滿 500 元',
    shortLabel: '9折',
  },
  {
    id: 'mock-02',
    title: '飲料 50 元折抵',
    subtitle: '任選一杯飲品',
    shortLabel: '飲料',
  },
  {
    id: 'mock-03',
    title: '小菜免費券',
    subtitle: '指定小菜乙份',
    shortLabel: '小菜',
  },
  {
    id: 'mock-04',
    title: '甜點 30 元折抵',
    subtitle: '單筆消費滿 300 元',
    shortLabel: '甜點',
  },
  {
    id: 'mock-05',
    title: '二人套餐 88 折',
    subtitle: '限指定套餐',
    shortLabel: '套餐',
  },
  {
    id: 'mock-06',
    title: '現金 100 元折抵',
    subtitle: '單筆消費滿 800 元',
    shortLabel: '100元',
  },
]
