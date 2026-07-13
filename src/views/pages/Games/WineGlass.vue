<template>
  <main
    class="wine-game relative flex h-full max-h-full w-full max-w-[100vw] flex-col items-center overflow-hidden px-4 text-white touch-none select-none"
  >
    <GameStoreBackground
      :src="PAGE_BG.wineGlass"
      object-position="center 45%"
      variant="game"
    />

    <!-- 暖色半透明遮罩，讓背景融入餐廳氛圍 -->
    <div class="absolute inset-0 bg-gradient-to-b from-amber-950/60 via-stone-950/50 to-stone-950/70 pointer-events-none" />

    <header class="relative z-10 w-full max-w-lg shrink-0 pt-[max(1rem,env(safe-area-inset-top))] text-center">
      <h1 class="game-title text-xl font-bold tracking-widest sm:text-2xl">
        猜酒杯
      </h1>
      <p
        class="mt-2 min-h-10 text-sm leading-relaxed text-amber-200/80 sm:text-base"
        aria-live="polite"
      >
        {{ statusMessage }}
      </p>
    </header>

    <section
      class="relative z-10 flex min-h-0 w-full max-w-lg flex-1 flex-col items-center justify-center py-4"
      aria-label="遊戲區域"
    >
      <!-- 木紋桌面 -->
      <div class="table-surface w-full max-w-md rounded-2xl px-4 pb-4 pt-2">
        <div
          class="cup-track relative mx-auto w-full"
          :class="{ 'cup-track--busy': !canPickCup }"
        >
          <div
            v-for="cupId in CUP_IDS"
            :key="cupId"
            class="cup-unit absolute inset-y-0 flex flex-col items-center justify-center"
            :style="cupUnitStyle(cupId)"
          >
            <!-- Logo 硬幣 -->
            <div
              class="coin-slot flex w-full items-center justify-center overflow-visible"
              :class="isCoinVisibleAtCup(cupId) ? 'mb-1 h-9 sm:mb-1 sm:h-10' : 'h-0'"
              aria-hidden="true"
            >
              <div
                v-if="isCoinVisibleAtCup(cupId)"
                class="logo-coin"
                :class="{ 'logo-coin--correct': revealedCorrect && cupId === coinCupId }"
              >
                <img :src="logoImg" alt="硬幣" class="logo-coin__img" draggable="false" />
              </div>
            </div>

            <!-- 酒杯 -->
            <button
              type="button"
              class="cup-btn"
              :class="{
                'cup-btn--lifted': isCupLifted(cupId),
                'cup-btn--selected': selectedCupId === cupId,
                'cup-btn--correct': revealedCorrect && cupId === coinCupId,
                'cup-btn--wrong': selectedCupId === cupId && selectedCupId !== coinCupId && isCupLifted(cupId),
              }"
              :disabled="!isCupClickable(cupId)"
              :aria-label="cupAriaLabel(cupId)"
              @click="onCupClick(cupId)"
            >
              <!-- SVG 日式清酒杯：口最寬，往下漸收 -->
              <svg
                class="cup-svg"
                viewBox="0 0 80 58"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient :id="`cupGrad-${cupId}`" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stop-color="#d9ecf4" stop-opacity="0.96" />
                    <stop offset="100%" stop-color="#8eb4c8" stop-opacity="0.9" />
                  </linearGradient>
                  <linearGradient :id="`cupGradCorrect-${cupId}`" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stop-color="#d9f7e8" stop-opacity="0.96" />
                    <stop offset="100%" stop-color="#5fa882" stop-opacity="0.9" />
                  </linearGradient>
                  <linearGradient :id="`cupGradWrong-${cupId}`" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stop-color="#f8d9d9" stop-opacity="0.96" />
                    <stop offset="100%" stop-color="#c07070" stop-opacity="0.9" />
                  </linearGradient>
                  <clipPath :id="`cupShape-${cupId}`">
                    <path d="M 6 13 Q 40 9 74 13 L 56 44 L 52 50 L 28 50 L 24 44 Z M 28 50 L 52 50 L 50 56 L 30 56 Z" />
                  </clipPath>
                  <pattern :id="`cupSpeckle-${cupId}`" width="7" height="7" patternUnits="userSpaceOnUse">
                    <circle cx="1.5" cy="2" r="0.35" fill="#6b8fa3" opacity="0.14" />
                    <circle cx="5" cy="4.5" r="0.3" fill="#5a7d92" opacity="0.1" />
                  </pattern>
                </defs>

                <!-- 杯身：上寬下窄，側邊直線內收 -->
                <path
                  d="M 6 13 Q 40 9 74 13 L 56 44 L 24 44 Z"
                  :fill="cupBodyFill(cupId)"
                  :stroke="cupRimStroke(cupId)"
                  stroke-width="1"
                  stroke-linejoin="round"
                />

                <!-- 釉面斑點 -->
                <rect
                  x="0"
                  y="0"
                  width="80"
                  height="58"
                  :fill="`url(#cupSpeckle-${cupId})`"
                  :clip-path="`url(#cupShape-${cupId})`"
                />

                <!-- 杯足 -->
                <path
                  d="M 28 50 L 52 50 L 50 56 L 30 56 Z"
                  :fill="cupFootFill(cupId)"
                  :stroke="cupRimStroke(cupId)"
                  stroke-width="0.8"
                />
                <path
                  d="M 32 53 H 48"
                  :stroke="cupInteriorFill(cupId)"
                  stroke-width="1.2"
                  stroke-linecap="round"
                  opacity="0.7"
                />

                <!-- 杯口（最寬處） -->
                <ellipse
                  cx="40"
                  cy="12"
                  rx="33"
                  ry="4.2"
                  fill="none"
                  :stroke="cupTopColor(cupId)"
                  stroke-width="1.2"
                  opacity="0.9"
                />
                <ellipse
                  cx="40"
                  cy="12.5"
                  rx="27"
                  ry="2.8"
                  :fill="cupInteriorFill(cupId)"
                  opacity="0.88"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <p
        v-if="phase === 'shuffling'"
        class="mt-4 text-sm font-medium tracking-widest text-amber-300 animate-pulse"
      >
        ◈ 交換中… ◈
      </p>
    </section>

    <footer class="relative z-10 flex w-full max-w-xs shrink-0 flex-col items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <template v-if="phase === 'idle'">
        <button
          class="restaurant-btn w-full"
          @click="startRound"
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
      title-id="wine-end-dialog-title"
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
import { PAGE_BG } from '@/views/pages/Games/gameStore.config'
import logoImg from '@/assets/logo.png'

const CUP_IDS = [0, 1, 2] as const
type CupId = (typeof CUP_IDS)[number]

type GamePhase =
  | 'idle'
  | 'reveal'
  | 'cover'
  | 'shuffling'
  | 'guessing'
  | 'revealing'
  | 'ended'

const REVEAL_MS = 1500
const COVER_MS = 500
const SHUFFLE_MS = 5000
const SWAP_ANIM_MS = 260
const WRONG_REVEAL_DELAY_MS = 600

const router = useRouter()
const phase = ref<GamePhase>('idle')
const coinCupId = ref<CupId>(0)
/** cupId → visual slot index (0=left, 1=center, 2=right) */
const cupSlot = ref<Record<CupId, number>>({ 0: 0, 1: 1, 2: 2 })
const liftedCups = ref<Set<CupId>>(new Set())
const selectedCupId = ref<CupId | null>(null)
const revealedCorrect = ref(false)
const showEndDialog = ref(false)
const lastResult = ref<'win' | 'lose'>('win')
const { handleGameWin } = useGameCouponReward()
const endDialogTitle = ref('遊戲結束')
const endDialogMessage = ref('')
const isSwapping = ref(false)

let timeoutIds: ReturnType<typeof setTimeout>[] = []

function schedule(fn: () => void, ms: number) {
  const id = setTimeout(fn, ms)
  timeoutIds.push(id)
}

function clearAllTimers() {
  for (const id of timeoutIds) {
    clearTimeout(id)
  }
  timeoutIds = []
}

function randomCupId(): CupId {
  return Math.floor(Math.random() * 3) as CupId
}

function randomSlotPair(): [number, number] {
  const a = Math.floor(Math.random() * 3)
  let b = Math.floor(Math.random() * 3)
  while (b === a) {
    b = Math.floor(Math.random() * 3)
  }
  return [a, b]
}

function resetCupPositions() {
  cupSlot.value = { 0: 0, 1: 1, 2: 2 }
}

function initRoundState() {
  coinCupId.value = randomCupId()
  resetCupPositions()
  liftedCups.value = new Set()
  selectedCupId.value = null
  revealedCorrect.value = false
  showEndDialog.value = false
  isSwapping.value = false
}

async function showWinCouponDialog() {
  const content = await handleGameWin({
    couponTitle: '酒杯遊戲優惠券',
    couponSubtitle: '猜中硬幣位置即可兌換',
  })
  endDialogTitle.value = content.title
  endDialogMessage.value = content.message
  showEndDialog.value = true
}

const canPickCup = computed(() => phase.value === 'guessing' && !isSwapping.value)

const statusMessage = computed(() => {
  switch (phase.value) {
    case 'idle':
      return '記住硬幣在哪個酒杯下，5 秒快速交換後猜猜看'
    case 'reveal':
      return '記住硬幣的位置…'
    case 'cover':
      return '蓋起來了…'
    case 'shuffling':
      return '專心看酒杯交換'
    case 'guessing':
      return '時間到！點選你認為有硬幣的酒杯'
    case 'revealing':
      return '揭曉中…'
    case 'ended':
      return '本局已結束'
    default:
      return ''
  }
})

function cupUnitStyle(cupId: CupId) {
  const slot = cupSlot.value[cupId]
  return {
    left: `${slot * (100 / 3)}%`,
    transition: isSwapping.value
      ? `left ${SWAP_ANIM_MS}ms ease-in-out`
      : 'left 0ms',
  }
}

function isCoinVisibleAtCup(cupId: CupId): boolean {
  if (cupId !== coinCupId.value) return false
  if (liftedCups.value.has(cupId)) return true
  if (phase.value === 'reveal') return true
  return false
}

function isCupLifted(cupId: CupId): boolean {
  return liftedCups.value.has(cupId)
}

function isCupClickable(cupId: CupId): boolean {
  if (!canPickCup.value) return false
  if (liftedCups.value.has(cupId)) return false
  return true
}

function cupAriaLabel(cupId: CupId): string {
  const slot = cupSlot.value[cupId]
  const pos = ['左', '中', '右'][slot] ?? ''
  if (!canPickCup.value) return `${pos}側酒杯`
  if (liftedCups.value.has(cupId)) return `${pos}側酒杯（已掀開）`
  return `${pos}側酒杯，點選猜測`
}

function liftCup(cupId: CupId) {
  liftedCups.value = new Set([...liftedCups.value, cupId])
}

function cupIdAtSlot(slot: number): CupId {
  return CUP_IDS.find((id) => cupSlot.value[id] === slot)!
}

function swapSlots(slotA: number, slotB: number): Promise<void> {
  const cupAtA = cupIdAtSlot(slotA)
  const cupAtB = cupIdAtSlot(slotB)

  isSwapping.value = true
  cupSlot.value = {
    ...cupSlot.value,
    [cupAtA]: slotB,
    [cupAtB]: slotA,
  }

  return new Promise((resolve) => {
    schedule(() => {
      isSwapping.value = false
      resolve()
    }, SWAP_ANIM_MS)
  })
}

async function runShuffle() {
  phase.value = 'shuffling'
  const deadline = Date.now() + SHUFFLE_MS

  while (Date.now() < deadline) {
    const [slotA, slotB] = randomSlotPair()
    await swapSlots(slotA, slotB)
  }

  phase.value = 'guessing'
}

function startRound() {
  clearAllTimers()
  initRoundState()
  phase.value = 'reveal'
  liftCup(coinCupId.value)

  schedule(() => {
    phase.value = 'cover'
    liftedCups.value = new Set()

    schedule(async () => {
      await runShuffle()
    }, COVER_MS)
  }, REVEAL_MS)
}

function onCupClick(cupId: CupId) {
  if (!isCupClickable(cupId)) return

  phase.value = 'revealing'
  selectedCupId.value = cupId
  liftCup(cupId)

  const isCorrect = cupId === coinCupId.value

  if (isCorrect) {
    revealedCorrect.value = true
    schedule(() => {
      phase.value = 'ended'
      lastResult.value = 'win'
      void showWinCouponDialog()
    }, SWAP_ANIM_MS)
    return
  }

  schedule(() => {
    liftCup(coinCupId.value)
    revealedCorrect.value = true

    schedule(() => {
      phase.value = 'ended'
      lastResult.value = 'lose'
      endDialogTitle.value = '遊戲結束'
      endDialogMessage.value = '硬幣藏在另一個酒杯裡，再接再厲！'
      showEndDialog.value = true
    }, SWAP_ANIM_MS)
  }, WRONG_REVEAL_DELAY_MS)
}

function onPlayAgain() {
  showEndDialog.value = false
  clearAllTimers()
  initRoundState()
  phase.value = 'idle'
}

function goHub() {
  showEndDialog.value = false
  router.push('/')
}

function cupBodyFill(cupId: CupId): string {
  if (revealedCorrect.value && cupId === coinCupId.value) return `url(#cupGradCorrect-${cupId})`
  if (selectedCupId.value === cupId && selectedCupId.value !== coinCupId.value && isCupLifted(cupId)) return `url(#cupGradWrong-${cupId})`
  return `url(#cupGrad-${cupId})`
}
function cupFootFill(cupId: CupId): string {
  if (revealedCorrect.value && cupId === coinCupId.value) return `url(#cupGradCorrect-${cupId})`
  if (selectedCupId.value === cupId && selectedCupId.value !== coinCupId.value && isCupLifted(cupId)) return `url(#cupGradWrong-${cupId})`
  return `url(#cupGrad-${cupId})`
}
function cupTopColor(cupId: CupId): string {
  if (revealedCorrect.value && cupId === coinCupId.value) return '#b8ebd0'
  if (selectedCupId.value === cupId && selectedCupId.value !== coinCupId.value && isCupLifted(cupId)) return '#f0c4c4'
  return '#e8f4f8'
}
function cupRimStroke(cupId: CupId): string {
  if (revealedCorrect.value && cupId === coinCupId.value) return '#4f9f72'
  if (selectedCupId.value === cupId && selectedCupId.value !== coinCupId.value && isCupLifted(cupId)) return '#c06060'
  return '#8aa8b8'
}
function cupInteriorFill(cupId: CupId): string {
  if (revealedCorrect.value && cupId === coinCupId.value) return '#ecfdf3'
  if (selectedCupId.value === cupId && selectedCupId.value !== coinCupId.value && isCupLifted(cupId)) return '#fff1f1'
  return '#eef7fb'
}

onUnmounted(() => {
  clearAllTimers()
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
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,180,80,0.15);
}

.cup-track {
  display: flex;
  align-items: center;
  height: clamp(10rem, 38vw, 14rem);
}

.cup-track--busy {
  pointer-events: none;
}

.cup-unit {
  width: calc(100% / 3);
  height: 100%;
  will-change: left;
}

/* Logo 硬幣 */
.logo-coin {
  position: relative;
  width: clamp(1.75rem, 8vw, 2.5rem);
  height: clamp(1.75rem, 8vw, 2.5rem);
  border-radius: 50%;
  background:
    radial-gradient(circle at 38% 32%, #fff8dc 0%, #f5c842 35%, #d4a017 70%, #9a7209 100%);
  border: 2px solid #c9a227;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.45),
    inset 0 1px 2px rgba(255, 255, 255, 0.55),
    inset 0 -2px 5px rgba(80, 50, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.3s ease;
  overflow: hidden;
}

.logo-coin::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  border: 1px solid rgba(154, 114, 9, 0.45);
  pointer-events: none;
}

.logo-coin--correct {
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.45),
    0 0 0 3px #22c55e,
    0 0 18px rgba(34, 197, 94, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.55),
    inset 0 -2px 5px rgba(0, 80, 0, 0.2);
}

.logo-coin__img {
  position: relative;
  z-index: 1;
  width: 68%;
  height: 68%;
  object-fit: contain;
  border-radius: 50%;
  display: block;
}

/* 酒杯按鈕 */
.cup-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 0;
  cursor: default;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.35s ease, filter 0.3s ease;
}

.cup-btn:not(:disabled) {
  cursor: pointer;
}

.cup-svg {
  width: clamp(3.5rem, 18vw, 5.5rem);
  height: auto;
  display: block;
  margin-inline: auto;
  transform-origin: bottom center;
  transition: transform 0.35s ease, filter 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
}

.cup-btn--lifted .cup-svg {
  transform: translateY(-1.5rem) scale(0.9);
}

.cup-btn--correct .cup-svg {
  filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.7));
}

.cup-btn--wrong .cup-svg {
  filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.6));
}

.cup-btn:not(:disabled):not(.cup-btn--lifted):hover .cup-svg {
  transform: translateY(-0.25rem);
}

.cup-btn--lifted:hover .cup-svg {
  transform: translateY(-1.5rem) scale(0.9);
}

/* 底部按鈕 */
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
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,200,80,0.2);
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  min-height: 2.75rem;
}
.restaurant-btn:active {
  background: linear-gradient(180deg, #6b2d07, #4a1c04);
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  transform: translateY(1px);
}
</style>
