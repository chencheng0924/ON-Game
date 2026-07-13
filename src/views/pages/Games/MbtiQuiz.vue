<template>
  <main class="mbti-game relative h-full max-h-full w-full overflow-hidden text-[var(--on-cream)]">
    <GameStoreBackground
      :src="PAGE_BG.mbtiQuiz"
      object-position="center 40%"
      intensity="light"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-black/35 via-black/18 to-black/42 pointer-events-none z-[1]" />

    <div class="mbti-inner relative z-10">
      <!-- 開始畫面 -->
      <section v-if="phase === 'intro'" class="mbti-panel mbti-panel--intro">
        <p class="brand-mark">ON</p>
        <h1 class="mbti-title">MBTI 韓式吃貨人格</h1>
        <p class="mbti-lead">
          八題選擇題，找出你的韓式湯飯靈魂型別。答完即可解鎖專屬結果與優惠券。
        </p>
        <button type="button" class="on-btn w-full max-w-xs" @click="startQuiz">
          開始測驗
        </button>
        <RouterLink to="/" class="back-link">返回遊戲中心</RouterLink>
      </section>

      <!-- 答題 -->
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

        <div class="quiz-options" role="group" :aria-label="`第 ${currentIndex + 1} 題選項`">
          <button
            v-for="(option, optionIndex) in currentQuestion.options"
            :key="`${currentQuestion.id}-${optionIndex}`"
            type="button"
            class="quiz-option"
            @click="selectOption(option.letter)"
          >
            <span class="quiz-option__marker" aria-hidden="true">{{ optionIndex === 0 ? 'A' : 'B' }}</span>
            <span class="quiz-option__text">{{ option.text }}</span>
          </button>
        </div>
      </section>
    </div>

    <GameCouponDialog
      :visible="showResult"
      :title="dialogTitle"
      :message="dialogMessage"
      title-id="mbti-result-dialog-title"
      play-again-label="再測一次"
      @play-again="onPlayAgain"
      @go-hub="goHub"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameCouponDialog from '@/views/pages/Games/components/GameCouponDialog.vue'
import GameStoreBackground from '@/views/pages/Games/components/GameStoreBackground.vue'
import { useGameCouponReward } from '@/composables/useGameCouponReward'
import {
  getMbtiProfile,
  MBTI_QUESTIONS,
  resolveMbtiType,
  type MbtiLetter,
} from '@/views/pages/Games/mbtiQuiz.config'
import { PAGE_BG } from '@/views/pages/Games/gameStore.config'

type Phase = 'intro' | 'quiz'

const router = useRouter()
const { handleGameWin } = useGameCouponReward()

const phase = ref<Phase>('intro')
const currentIndex = ref(0)
const answers = ref<MbtiLetter[]>([])
const showResult = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')

const currentQuestion = computed(() => MBTI_QUESTIONS[currentIndex.value])

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
  const profile = getMbtiProfile(type)
  await handleGameWin({
    couponTitle: 'MBTI 韓式吃貨人格優惠券',
    couponSubtitle: `${profile.type} · ${profile.title}`,
  })

  dialogTitle.value = `你是 ${profile.type}`
  dialogMessage.value = `「${profile.title}」\n${profile.description}\n\n恭喜通關！優惠券已準備好（開發階段暫不寄送 Email）。`
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
  width: min(100%, 26rem);
  margin: auto;
  border-radius: 1.25rem;
  border: 1px solid rgb(0 0 0 / 0.08);
  background: rgb(240 232 226 / 0.96);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 48px rgb(0 0 0 / 0.35);
  padding: clamp(1.25rem, 4vw, 2rem);
  color: var(--on-black);
}

.mbti-panel--intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.brand-mark {
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 12vw, 3.75rem);
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 1;
  color: var(--on-black);
  text-shadow: none;
  animation: brand-glow 3s ease-in-out infinite;
}

.mbti-title {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 4.5vw, 1.65rem);
  font-weight: 700;
  color: var(--on-black);
  letter-spacing: 0.06em;
}

.mbti-lead {
  max-width: 22rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.65;
  color: rgb(0 0 0 / 0.72);
}

.back-link {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: rgb(0 0 0 / 0.45);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.back-link:hover {
  color: var(--on-black);
}

.quiz-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  color: rgb(0 0 0 / 0.55);
}

.quiz-progress__bar {
  height: 0.35rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.12);
  overflow: hidden;
}

.quiz-progress__fill {
  height: 100%;
  border-radius: inherit;
  background: var(--on-black);
  transition: width 0.35s ease;
}

.quiz-prompt {
  font-family: var(--font-display);
  font-size: clamp(1rem, 3.8vw, 1.15rem);
  font-weight: 700;
  line-height: 1.55;
  color: var(--on-black);
  margin-bottom: 1.25rem;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quiz-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  text-align: left;
  padding: 0.9rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid rgb(0 0 0 / 0.14);
  background: var(--on-white);
  color: var(--on-black);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}

.quiz-option:hover {
  border-color: var(--on-black);
  background: var(--on-cream);
}

.quiz-option:active {
  transform: scale(0.99);
  background: var(--on-black);
  color: var(--on-cream);
}

.quiz-option:active .quiz-option__marker {
  background: var(--on-cream);
  color: var(--on-black);
}

.quiz-option:active .quiz-option__text {
  color: var(--on-cream);
}

.quiz-option__marker {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.4rem;
  background: var(--on-black);
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--on-cream);
}

.quiz-option__text {
  flex: 1;
  font-size: 0.85rem;
  line-height: 1.55;
  color: rgb(0 0 0 / 0.85);
}

.on-btn {
  background: var(--on-black);
  border: 1px solid var(--on-black);
  color: var(--on-cream);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.2);
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  min-height: 2.75rem;
}

.on-btn:active {
  transform: translateY(1px);
  background: #111;
}

@keyframes brand-glow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.82;
  }
}
</style>
