/**
 * MBTI Korean Foodie Personality — structure (copy via i18n)
 */

export type MbtiDimension = 'EI' | 'SN' | 'TF' | 'JP'
export type MbtiLetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'

export interface MbtiQuestionDef {
  id: number
  dimension: MbtiDimension
  optionLetters: readonly [MbtiLetter, MbtiLetter]
}

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

export interface MbtiResultProfile {
  type: string
  title: string
  description: string
}

export const MBTI_QUESTIONS: readonly MbtiQuestionDef[] = [
  { id: 1, dimension: 'EI', optionLetters: ['E', 'I'] },
  { id: 2, dimension: 'EI', optionLetters: ['E', 'I'] },
  { id: 3, dimension: 'SN', optionLetters: ['S', 'N'] },
  { id: 4, dimension: 'SN', optionLetters: ['S', 'N'] },
  { id: 5, dimension: 'TF', optionLetters: ['T', 'F'] },
  { id: 6, dimension: 'TF', optionLetters: ['T', 'F'] },
  { id: 7, dimension: 'JP', optionLetters: ['J', 'P'] },
  { id: 8, dimension: 'JP', optionLetters: ['J', 'P'] },
] as const

export function resolveMbtiType(answers: MbtiLetter[]): string {
  const count = (a: MbtiLetter, b: MbtiLetter) => {
    const aN = answers.filter((x) => x === a).length
    const bN = answers.filter((x) => x === b).length
    return aN >= bN ? a : b
  }

  return `${count('E', 'I')}${count('S', 'N')}${count('T', 'F')}${count('J', 'P')}`
}

type TranslateFn = (key: string) => string

export function buildMbtiQuestion(def: MbtiQuestionDef, t: TranslateFn): MbtiQuestion {
  const [a, b] = def.optionLetters
  return {
    id: def.id,
    dimension: def.dimension,
    prompt: t(`games.mbti.questions.${def.id}.prompt`),
    options: [
      { letter: a, text: t(`games.mbti.questions.${def.id}.options.${a}`) },
      { letter: b, text: t(`games.mbti.questions.${def.id}.options.${b}`) },
    ],
  }
}

export function getMbtiProfile(type: string, t: TranslateFn): MbtiResultProfile {
  const titleKey = `games.mbti.profiles.${type}.title`
  const descKey = `games.mbti.profiles.${type}.description`
  const title = t(titleKey)
  const description = t(descKey)

  // vue-i18n returns the key itself when missing
  if (title === titleKey || description === descKey) {
    return {
      type,
      title: t('games.mbti.profiles.fallback.title'),
      description: t('games.mbti.profiles.fallback.description'),
    }
  }

  return { type, title, description }
}
