<template>
  <main
    class="card-guess-game relative flex h-full max-h-full w-full max-w-[100vw] flex-col items-center overflow-hidden px-4 text-white touch-none select-none"
  >
    <GameStoreBackground
      :src="PAGE_BG.cardGuess"
      object-position="center 50%"
      variant="game"
    />

    <div class="absolute inset-0 bg-gradient-to-b from-amber-950/60 via-stone-950/50 to-stone-950/70 pointer-events-none" />

    <header class="relative z-10 w-full max-w-lg shrink-0 pt-[max(1rem,env(safe-area-inset-top))] text-center">
      <h1 class="game-title text-xl font-bold tracking-widest sm:text-2xl">
        猜菜品
      </h1>
      <p
        class="mt-2 min-h-10 text-sm leading-relaxed text-amber-200/80 sm:text-base"
        aria-live="polite"
      >
        {{ statusMessage }}
      </p>
      <p
        v-if="phase === 'playing'"
        class="mt-2 inline-block rounded-full border border-amber-700/50 bg-amber-950/50 px-3 py-1 text-xs text-amber-200/90 sm:px-4 sm:py-1.5 sm:text-sm"
      >
        已配對 {{ matchedCount }} / 8 組 · 錯誤 {{ wrongGuessCount }} / {{ MAX_WRONG_GUESSES }}
      </p>
    </header>

    <section
      class="relative z-10 flex min-h-0 w-full max-w-lg flex-1 flex-col items-center justify-center py-4"
      aria-label="遊戲區域"
    >
      <div class="table-surface w-full max-w-md rounded-2xl px-3 py-4 sm:px-4">
        <div
          class="game-board min-w-0 w-full overflow-hidden"
          :class="{ 'pointer-events-none': isInteractionBlocked }"
        >
          <div class="grid grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
          <button
            v-for="card in cards"
            :key="card.id"
            type="button"
            class="card aspect-square w-full touch-manipulation"
            :class="{
              'card--flipped': card.flipped || card.matched || phase === 'memorizing',
              'card--matched': card.matched,
            }"
            :disabled="card.matched || isInteractionBlocked"
            :aria-label="cardAriaLabel(card)"
            @click="onCardClick(card)"
          >
            <div class="card-inner">
              <div class="card-face card-back">
                <span class="card-back-mark">?</span>
              </div>
              <div class="card-face card-front">
                <img
                  :src="dishImages[card.pairId]"
                  class="card-symbol"
                  alt=""
                >
              </div>
            </div>
          </button>
          </div>
        </div>
      </div>
    </section>

    <footer class="relative z-10 flex w-full max-w-xs shrink-0 flex-col items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <template v-if="phase === 'idle'">
        <button
          type="button"
          class="restaurant-btn w-full"
          @click="startGame"
        >
          開始遊戲
        </button>
        <RouterLink
          to="/"
          class="text-sm text-amber-200/50 underline-offset-2 hover:text-amber-200/80 hover:underline"
        >
          返回遊戲中心
        </RouterLink>
      </template>
    </footer>

    <GameCouponDialog
      :visible="showEndDialog"
      :title="endDialogTitle"
      :message="endDialogMessage"
      title-id="card-guess-end-dialog-title"
      @play-again="onPlayAgain"
      @go-hub="goHub"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameCouponDialog from '@/views/pages/Games/components/GameCouponDialog.vue'
import GameStoreBackground from '@/views/pages/Games/components/GameStoreBackground.vue'
import { useGameCouponReward } from '@/composables/useGameCouponReward'
import { DISH_IMAGES } from '@/views/pages/Games/gameDishes.config'
import { PAGE_BG } from '@/views/pages/Games/gameStore.config'

interface Card {
  id: number
  pairId: number
  flipped: boolean
  matched: boolean
}

const PAIR_COUNT = 8
const MAX_WRONG_GUESSES = 3
const MEMORIZE_MS = 5000
const FLIP_BACK_DELAY_MS = 800

type GamePhase = 'idle' | 'memorizing' | 'playing' | 'won' | 'lost'

const dishImages = DISH_IMAGES

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function createDeck(): Card[] {
  const deck: Card[] = []
  let id = 0
  for (let pairId = 0; pairId < PAIR_COUNT; pairId++) {
    deck.push({ id: id++, pairId, flipped: false, matched: false })
    deck.push({ id: id++, pairId, flipped: false, matched: false })
  }
  return shuffle(deck)
}

const router = useRouter()
const cards = ref<Card[]>(createDeck())
const firstPickId = ref<number | null>(null)
const isResolving = ref(false)
const phase = ref<GamePhase>('idle')
const wrongGuessCount = ref(0)
const showEndDialog = ref(false)
const lastResult = ref<'win' | 'lose'>('win')
const { handleGameWin } = useGameCouponReward()
const endDialogTitle = ref('遊戲結束')
const endDialogMessage = ref('')

let memorizeTimerId: ReturnType<typeof setTimeout> | null = null
let flipBackTimerId: ReturnType<typeof setTimeout> | null = null

const matchedCount = computed(
  () => cards.value.filter((c) => c.matched).length / 2,
)

const isInteractionBlocked = computed(
  () => isResolving.value || phase.value !== 'playing',
)

const statusMessage = computed(() => {
  switch (phase.value) {
    case 'idle':
      return '翻開兩張相同的牌即可配對，配對全部 8 組即過關'
    case 'memorizing':
      return '記住所有菜品的位置，5 秒後將全部蓋起來…'
    case 'playing':
      return '翻開兩張相同的牌即可配對，配對全部 8 組即過關'
    case 'won':
      return '恭喜過關！'
    case 'lost':
      return '猜錯次數已達上限，再試一次吧'
    default:
      return ''
  }
})

function clearTimers() {
  if (memorizeTimerId) clearTimeout(memorizeTimerId)
  if (flipBackTimerId) clearTimeout(flipBackTimerId)
  memorizeTimerId = null
  flipBackTimerId = null
}

function resetSelection() {
  firstPickId.value = null
}

function startMemorizePhase() {
  phase.value = 'memorizing'
  wrongGuessCount.value = 0
  memorizeTimerId = setTimeout(() => {
    phase.value = 'playing'
    memorizeTimerId = null
  }, MEMORIZE_MS)
}

function startGame() {
  clearTimers()
  cards.value = createDeck()
  resetSelection()
  isResolving.value = false
  showEndDialog.value = false
  startMemorizePhase()
}

function onPlayAgain() {
  showEndDialog.value = false
  phase.value = 'idle'
  cards.value = createDeck()
  resetSelection()
  isResolving.value = false
  wrongGuessCount.value = 0
}

function goHub() {
  showEndDialog.value = false
  router.push('/')
}

function checkWin() {
  if (cards.value.every((c) => c.matched)) {
    phase.value = 'won'
    lastResult.value = 'win'
    void showWinCouponDialog()
  }
}

async function showWinCouponDialog() {
  const content = await handleGameWin({
    couponTitle: '猜菜品優惠券',
    couponSubtitle: '配對全部料理牌即可兌換',
  })
  endDialogTitle.value = content.title
  endDialogMessage.value = content.message
  showEndDialog.value = true
}

function endGameAsLost() {
  phase.value = 'lost'
  lastResult.value = 'lose'
  endDialogTitle.value = '遊戲結束'
  endDialogMessage.value = `已猜錯 ${MAX_WRONG_GUESSES} 次，再接再厲！`
  showEndDialog.value = true
}

function cardAriaLabel(card: Card): string {
  if (phase.value === 'memorizing') return '記憶階段，菜品已翻開'
  if (card.matched) return '已配對的牌'
  if (card.flipped) return '已翻開的牌'
  return '蓋著的牌，點擊翻開'
}

function onCardClick(card: Card) {
  if (isInteractionBlocked.value || card.matched || card.flipped) return

  card.flipped = true

  if (firstPickId.value === null) {
    firstPickId.value = card.id
    return
  }

  const firstCard = cards.value.find((c) => c.id === firstPickId.value)
  if (!firstCard || firstCard.id === card.id) return

  isResolving.value = true

  if (firstCard.pairId === card.pairId) {
    firstCard.matched = true
    card.matched = true
    resetSelection()
    isResolving.value = false
    checkWin()
    return
  }

  wrongGuessCount.value++

  flipBackTimerId = setTimeout(() => {
    firstCard.flipped = false
    card.flipped = false
    resetSelection()
    isResolving.value = false
    flipBackTimerId = null

    if (wrongGuessCount.value >= MAX_WRONG_GUESSES) {
      endGameAsLost()
    }
  }, FLIP_BACK_DELAY_MS)
}

onUnmounted(() => {
  clearTimers()
})
</script>

<style scoped>
.game-title {
  color: #fde68a;
  text-shadow: 0 2px 12px rgba(180, 80, 0, 0.6);
  letter-spacing: 0.25em;
}

.table-surface {
  background:
    repeating-linear-gradient(
      92deg,
      transparent,
      transparent 38px,
      rgba(120, 60, 10, 0.12) 38px,
      rgba(120, 60, 10, 0.12) 40px
    ),
    linear-gradient(180deg, #3b1f08 0%, #2a1404 100%);
  border: 1px solid #6a3010;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 180, 80, 0.15);
}

.restaurant-btn {
  background: linear-gradient(180deg, #92400e, #6b2d07);
  border: 1px solid #d97706;
  color: #fde68a;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 200, 80, 0.2);
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  min-height: 2.75rem;
}

.restaurant-btn:active {
  background: linear-gradient(180deg, #6b2d07, #4a1c04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transform: translateY(1px);
}

.card {
  perspective: 600px;
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.card:disabled {
  cursor: default;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.35s ease;
  border-radius: clamp(0.5rem, 2vw, 0.875rem);
}

.card--flipped .card-inner {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  backface-visibility: hidden;
  border-radius: inherit;
  border: 2px solid #92400e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.card-back {
  background: linear-gradient(135deg, #6b3a12, #3b1f08);
}

.card-front {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  transform: rotateY(180deg);
}

.card--matched .card-front {
  border-color: #22c55e;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.45);
}

.card-back-mark {
  font-size: clamp(1.125rem, 5vw, 1.5rem);
  font-weight: 700;
  color: #fde68a;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.card-symbol {
  width: 72%;
  height: 72%;
  object-fit: contain;
}

@media (min-width: 640px) {
  .card-back-mark {
    font-size: clamp(1.125rem, 3vw, 1.375rem);
  }
}

@media (min-width: 1024px) {
  .card-back-mark {
    font-size: 1.5rem;
  }
}

@media (hover: hover) and (pointer: fine) {
  .card:not(:disabled):hover .card-inner {
    transform: scale(1.03);
  }

  .card--flipped:not(:disabled):hover .card-inner {
    transform: rotateY(180deg) scale(1.03);
  }
}
</style>
