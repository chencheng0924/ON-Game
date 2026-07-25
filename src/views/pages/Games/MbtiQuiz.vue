<template>
  <main class="mbti-game relative h-full max-h-full w-full overflow-hidden text-[var(--on-cream)]">
    <GameStoreBackground
      :src="PAGE_BG.mbtiQuiz"
      object-position="center 40%"
      intensity="light"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-black/35 via-black/18 to-black/42 pointer-events-none z-[1]" />

    <div class="mbti-inner relative z-10">
      <section v-if="phase === 'intro'" class="mbti-panel mbti-panel--intro">
        <img class="brand-logo" :src="onLogo" alt="ON">
        <h1 class="mbti-title">{{ t('games.mbti.title') }}</h1>
        <p class="mbti-lead">
          {{ t('games.mbti.lead') }}
        </p>
        <button type="button" class="on-btn w-full max-w-xs" @click="startQuiz">
          {{ t('games.mbti.start') }}
        </button>
        <RouterLink to="/" class="back-link">{{ t('common.backToHub') }}</RouterLink>
      </section>

      <section v-else-if="phase === 'quiz'" class="mbti-panel mbti-panel--quiz">
        <div class="quiz-progress" aria-live="polite">
          <span>Q{{ currentIndex + 1 }} / {{ MBTI_QUESTIONS.length }}</span>
          <div class="quiz-progress__bar" aria-hidden="true">
            <div
              class="quiz-progress__fill"
              :style="{ width: `${((currentIndex + 1) / MBTI_QUESTIONS.length) * 100}%` }"
            />
          </div>
        </div>

        <h2 class="quiz-prompt">{{ currentQuestion.prompt }}</h2>

        <div
          class="quiz-options"
          role="group"
          :aria-label="t('games.mbti.optionsAria', { n: currentIndex + 1 })"
        >
          <button
            v-for="(option, optionIndex) in currentQuestion.options"
            :key="`${currentQuestion.id}-${optionIndex}`"
            type="button"
            class="quiz-option"
            @click="selectOption(option.letter)"
          >
            <span class="quiz-option__marker" aria-hidden="true">{{ option.letter }}</span>
            <span class="quiz-option__text">{{ option.text }}</span>
          </button>
        </div>
      </section>
    </div>

    <GameCouponDialog
      :visible="showResult"
      :title="dialogTitle"
      :message="dialogMessage"
      :prize-title="dialogPrizeTitle"
      :prize-subtitle="dialogPrizeSubtitle"
      title-id="mbti-result-dialog-title"
      :play-again-label="t('games.mbti.playAgain')"
      @play-again="onPlayAgain"
      @go-hub="goHub"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import GameCouponDialog from '@/views/pages/Games/components/GameCouponDialog.vue'
import GameStoreBackground from '@/views/pages/Games/components/GameStoreBackground.vue'
import { useGameCouponReward } from '@/composables/useGameCouponReward'
import {
  getCouponCopy,
  pickMbtiBaseCoupon,
  resolveFinalCoupon,
} from '@/views/pages/Games/gameCoupons.config'
import {
  buildMbtiQuestion,
  getMbtiProfile,
  MBTI_QUESTIONS,
  resolveMbtiType,
  type MbtiLetter,
} from '@/views/pages/Games/mbtiQuiz.config'
import { PAGE_BG, STORE_IMAGES } from '@/views/pages/Games/gameStore.config'

const onLogo = STORE_IMAGES.logo

type Phase = 'intro' | 'quiz'

const { t } = useI18n()
const router = useRouter()
const { handleGameWin } = useGameCouponReward()

const phase = ref<Phase>('intro')
const currentIndex = ref(0)
const answers = ref<MbtiLetter[]>([])
const showResult = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogPrizeTitle = ref('')
const dialogPrizeSubtitle = ref('')

const currentQuestion = computed(() =>
  buildMbtiQuestion(MBTI_QUESTIONS[currentIndex.value], t),
)

function startQuiz() {
  phase.value = 'quiz'
  currentIndex.value = 0
  answers.value = []
  showResult.value = false
}

async function selectOption(letter: MbtiLetter) {
  answers.value = [...answers.value, letter]

  if (currentIndex.value < MBTI_QUESTIONS.length - 1) {
    currentIndex.value += 1
    return
  }

  const type = resolveMbtiType(answers.value)
  const profile = getMbtiProfile(type, t)
  const coupon = resolveFinalCoupon(pickMbtiBaseCoupon(answers.value))
  const copy = getCouponCopy(coupon, t)
  const content = await handleGameWin({
    couponTitle: copy.title,
    couponSubtitle: copy.subtitle,
    detail: t('games.mbti.resultDetail', {
      type: profile.type,
      title: profile.title,
      description: profile.description,
    }),
  })

  dialogTitle.value = t('games.mbti.resultTitle', { type: profile.type })
  dialogMessage.value = content.message
  dialogPrizeTitle.value = content.prizeTitle
  dialogPrizeSubtitle.value = content.prizeSubtitle
  showResult.value = true
}

function onPlayAgain() {
  showResult.value = false
  phase.value = 'intro'
  currentIndex.value = 0
  answers.value = []
}

function goHub() {
  showResult.value = false
  router.push('/')
}
</script>

<style scoped>
.mbti-game {
  box-sizing: border-box;
}

.mbti-inner {
  box-sizing: border-box;
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding:
    max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
  overflow-y: auto;
}

.mbti-panel {
  box-sizing: border-box;
  width: min(100%, 28rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.mbti-panel--intro {
  text-align: center;
}

.brand-logo {
  display: block;
  width: min(7.5rem, 36vw);
  height: auto;
  margin: 0 auto;
  filter: drop-shadow(0 4px 24px rgb(0 0 0 / 0.55));
}

.mbti-title {
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 5vw, 1.85rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--on-cream);
  text-shadow: 0 2px 14px rgb(0 0 0 / 0.5);
}

.mbti-lead {
  max-width: 22rem;
  font-size: clamp(0.9rem, 3vw, 1.05rem);
  line-height: 1.55;
  color: rgb(240 232 226 / 0.88);
}

.on-btn {
  background: var(--on-black);
  border: 1px solid var(--on-cream);
  color: var(--on-cream);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.35);
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  min-height: 2.75rem;
}

.on-btn:active {
  transform: translateY(1px);
  background: #111;
}

.back-link {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: rgb(240 232 226 / 0.55);
  text-underline-offset: 2px;
}

.back-link:hover {
  color: var(--on-white);
  text-decoration: underline;
}

.mbti-panel--quiz {
  width: min(100%, 34rem);
  align-items: stretch;
  gap: 1.25rem;
}

.quiz-progress {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  color: rgb(240 232 226 / 0.75);
}

.quiz-progress__bar {
  height: 0.35rem;
  border-radius: 999px;
  background: rgb(240 232 226 / 0.2);
  overflow: hidden;
}

.quiz-progress__fill {
  height: 100%;
  border-radius: inherit;
  background: var(--on-cream);
  transition: width 0.25s ease;
}

.quiz-prompt {
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 3.6vw, 1.25rem);
  font-weight: 700;
  line-height: 1.45;
  color: var(--on-cream);
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.45);
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quiz-option {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  width: 100%;
  text-align: left;
  border-radius: 0.85rem;
  border: 1px solid rgb(240 232 226 / 0.35);
  background: rgb(240 232 226 / 0.94);
  color: var(--on-black);
  padding: 0.9rem 1rem;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.quiz-option:hover {
  transform: translateY(-2px);
  border-color: var(--on-black);
  background: var(--on-white);
}

.quiz-option:active {
  transform: translateY(0);
}

.quiz-option__marker {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 999px;
  background: var(--on-black);
  color: var(--on-cream);
  font-size: 0.8rem;
  font-weight: 700;
}

.quiz-option__text {
  flex: 1;
  min-width: 0;
  font-size: clamp(0.85rem, 2.8vw, 0.95rem);
  line-height: 1.5;
}
</style>
