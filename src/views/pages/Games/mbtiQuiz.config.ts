/**
 * MBTI 韓式吃貨人格 — 題庫與結果
 */

export type MbtiDimension = 'EI' | 'SN' | 'TF' | 'JP'
export type MbtiLetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'

export interface MbtiOption {
  letter: MbtiLetter
  text: string
}

export interface MbtiQuestion {
  id: number
  dimension: MbtiDimension
  prompt: string
  options: [MbtiOption, MbtiOption]
}

export const MBTI_QUESTIONS: readonly MbtiQuestion[] = [
  {
    id: 1,
    dimension: 'EI',
    prompt: '週五晚上，好不容易搶到了大排長龍的 LIC 人氣韓餐，你的理想吃法是？',
    options: [
      {
        letter: 'E',
        text: '瘋狂揪朋友組成「4人吃貨團」，大鍋才能加拉麵、炒飯、配燒啤才夠嗨！',
      },
      {
        letter: 'I',
        text: '找個角落的一人位（Hon-bap），戴上耳機默默享受大口啃骨頭的療癒感。',
      },
    ],
  },
  {
    id: 2,
    dimension: 'EI',
    prompt: '在辦公室忙了一整天，下班時同事突然在群組揪：「今晚下雨，有人要去吃醬蟹配燒酒嗎？」',
    options: [
      {
        letter: 'E',
        text: '「+1！下雨就是要衝這局！」跟同事續攤聊天能讓你瞬間滿血復活。',
      },
      {
        letter: 'I',
        text: '默默已讀，內心想著：「下雨天我只想點 Uber Eats 外送，回我的小窩躺著吃。」',
      },
    ],
  },
  {
    id: 3,
    dimension: 'SN',
    prompt: '當你發現這家韓式湯品專賣店的名字叫做「ON (溫/온)」時，你的第一聯想是？',
    options: [
      {
        letter: 'S',
        text: '應該是主打「溫度控制得很剛好」的滾燙石鍋湯。',
      },
      {
        letter: 'N',
        text: '「ON」是開啟、線上，代表喝了這碗湯就能重新開啟紐約生活的正能量，很有文青感！',
      },
    ],
  },
  {
    id: 4,
    dimension: 'SN',
    prompt: '在選購店內的韓式伴餐（Banchan，小菜）時，你通常怎麼決定？',
    options: [
      {
        letter: 'S',
        text: '根據營養和口味搭配：有辣泡菜就要配清爽的醃黃瓜，再加一個有飽足感的馬鈴薯泥。',
      },
      {
        letter: 'N',
        text: '點一堆顏色看起來最漂亮、擺盤最和諧，或者自己從來沒聽過名字的隱藏版小菜。',
      },
    ],
  },
  {
    id: 5,
    dimension: 'TF',
    prompt: '朋友跟你抱怨說：「今天被主管罵，我現在壓力大到好想大哭一場……」這時你會怎麼處理？',
    options: [
      {
        letter: 'T',
        text: '「那你要吃『辣牛肉湯』，辣椒素可以刺激內啡肽分泌，物理性幫你紓壓。」',
      },
      {
        letter: 'F',
        text: '「天啊辛苦了！我們今晚去吃『ON』，用熱湯好好抱抱受傷的你。」',
      },
    ],
  },
  {
    id: 6,
    dimension: 'TF',
    prompt: '看完一部非常感人的韓劇《請回答1988》，看到主角們聚在一起吃熱騰騰的濃湯，你的舉動是？',
    options: [
      {
        letter: 'T',
        text: '開始上網搜尋「紐約哪裡有賣同款耐熱陶瓷石鍋」，研究它的保溫原理。',
      },
      {
        letter: 'F',
        text: '淚眼汪汪，立刻打電話給閨蜜大喊：「我想你了！我們明天去吃 ON 好不好？」',
      },
    ],
  },
  {
    id: 7,
    dimension: 'JP',
    prompt: '韓式湯飯最具爭議的「神聖儀式」：白飯端上桌時，你的靈魂吃法是？',
    options: [
      {
        letter: 'J',
        text: '絕對是【飯湯分離派】。我有嚴格的步驟：先喝三口純湯、吃幾口配料，最後白飯只能一口一口沾湯吃，絕不弄混！',
      },
      {
        letter: 'P',
        text: '毫無疑問【整碗泡湯派】。白飯直接整碗倒進石鍋裡瘋狂攪拌，隨性大口扒飯才是最高境界！',
      },
    ],
  },
  {
    id: 8,
    dimension: 'JP',
    prompt: '你的冰箱裡永遠會固定存放哪些韓式食品？',
    options: [
      {
        letter: 'J',
        text: '嚴格分類：保鮮盒裝的熟成泡菜（煮湯用）、新泡菜（配飯用），以及按有效期限排好隊的辛拉麵。',
      },
      {
        letter: 'P',
        text: '塞滿了各種不知道哪天叫外送留下來的醃蘿蔔包、便利商店買的微波年糕，和幾瓶隨手塞的燒酒。',
      },
    ],
  },
] as const

export interface MbtiResultProfile {
  type: string
  title: string
  description: string
}

/** 16 型韓式吃貨人格文案 */
export const MBTI_PROFILES: Record<string, Omit<MbtiResultProfile, 'type'>> = {
  ESTJ: {
    title: '湯頭總指揮',
    description: '你點餐有SOP、吃飯有節奏，石鍋溫度與小菜配比都在你的掌控中。ON 的滾燙湯頭，正好配上你的效率靈魂。',
  },
  ESTP: {
    title: '辣味冒險家',
    description: '你敢加辣、敢續鍋、敢當場試隱藏菜單。熱湯一上桌就開吃，紐約夜生活的能量全靠這一碗。',
  },
  ESFJ: {
    title: '暖心分湯人',
    description: '你總記得誰不吃香菜、誰要多飯。和朋友一起坐在 ON，把熱湯與關心一起端上桌，就是你的超能力。',
  },
  ESFP: {
    title: '氣氛加拉麵王',
    description: '大鍋、燒啤、自拍、加料——你讓每一頓韓餐都變成派對。ON 的石鍋一開蓋，全場氣氛瞬間 ON。',
  },
  ENTJ: {
    title: '菜單戰略家',
    description: '你掃一眼菜單就能排出最佳 CP 值組合。湯、飯、小菜、燒酒全線優化，吃得漂亮也吃得精準。',
  },
  ENTP: {
    title: '湯碗辯論家',
    description: '飯湯分離還是整碗泡？你能辯到打烊。創意加料與天馬行空的吃法，正是你在 ON 的娛樂項目。',
  },
  ENFJ: {
    title: '靈魂湯治癒師',
    description: '你相信一碗熱湯能修復一天。邀朋友來 ON，不只是吃飯，更是用溫度把人重新點亮。',
  },
  ENFP: {
    title: '靈感泡菜旅人',
    description: '你為店名「ON」腦補整套宇宙觀，小菜顏色都能講出故事。每一口湯都像開啟新副本。',
  },
  ISTJ: {
    title: '經典石鍋守門人',
    description: '你忠於原味、忠於步驟、忠於那碗剛剛好的溫度。ON 的長時間熬煮，剛好對上你的品質標準。',
  },
  ISTP: {
    title: '湯溫工程師',
    description: '你默默觀察石鍋保溫、湯頭層次與骨膠質口感。少話多喝湯，專業藏在每一口裡。',
  },
  ISFJ: {
    title: '一人溫柔席',
    description: '角落 Hon-bap、熱湯與耳機——你用安靜把疲惫熬成療癒。ON 的溫度，就是你的充電站。',
  },
  ISFP: {
    title: '感官湯詩人',
    description: '你吃的是香氣、色澤與當下心情。ON 的蒸汽與紅湯，剛好寫進你今日的情緒日記。',
  },
  INTJ: {
    title: '長熬理論家',
    description: '你理解為什麼湯頭要熬那麼久。新鮮食材、時間與火候——你在心裡畫好了美味的藍圖。',
  },
  INTP: {
    title: '石鍋原理控',
    description: '耐熱陶瓷、保溫曲線、辣椒素與內啡肽……你邊喝湯邊做研究。ON 是你的美味實驗室。',
  },
  INFJ: {
    title: '意義湯信徒',
    description: '對你來說，「ON」不只是店名，是重新開啟生活的儀式。這一碗溫，承載比味道更深的東西。',
  },
  INFP: {
    title: '熱湯浪漫派',
    description: '韓劇名場面與真實湯香在你心裡疊加。你為友情、為情緒、為一碗 ON 而感動。',
  },
}

export function resolveMbtiType(answers: MbtiLetter[]): string {
  const count = (a: MbtiLetter, b: MbtiLetter) => {
    const aN = answers.filter((x) => x === a).length
    const bN = answers.filter((x) => x === b).length
    return aN >= bN ? a : b
  }

  return `${count('E', 'I')}${count('S', 'N')}${count('T', 'F')}${count('J', 'P')}`
}

export function getMbtiProfile(type: string): MbtiResultProfile {
  const profile = MBTI_PROFILES[type] ?? {
    title: '韓式吃貨旅人',
    description: '你有自己獨特的湯飯哲學。無論哪一型，ON 都歡迎你來一碗熱湯。',
  }
  return { type, ...profile }
}
