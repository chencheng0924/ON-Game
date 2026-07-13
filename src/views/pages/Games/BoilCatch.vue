<template>
  <main class="boil-game relative grid h-full max-h-full w-full max-w-[100vw] grid-rows-[9fr_1fr] overflow-hidden text-[var(--on-cream)] touch-none select-none">
    <GameStoreBackground
      :src="currentBg"
      :object-position="gameState === 'idle' ? 'center 35%' : 'center 40%'"
      variant="game"
    />

    <div class="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/40 pointer-events-none z-[1]" />

    <section
      ref="displayRef"
      class="boil-display relative z-10 min-h-0 overflow-hidden"
      aria-label="遊戲顯示區"
    >
      <div class="boil-hud pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
        <div class="hud-badge">
          食材 <span class="font-bold text-[var(--on-white)]">{{ score }}</span>
        </div>
        <div
          class="hud-badge"
          :class="timeLeft <= 5 ? 'hud-badge--urgent' : ''"
        >
          {{ timeLeft }} 秒
        </div>
      </div>

      <div
        v-if="gameState === 'idle'"
        class="boil-idle absolute inset-0 z-10 flex flex-col items-center justify-center p-4"
      >
        <p class="brand-mark">ON</p>
        <h1 class="game-title">
          熬煮時間與食材
        </h1>
        <p class="mt-2 max-w-sm text-center text-sm leading-relaxed text-[var(--on-cream)]/90 sm:text-base">
          20 秒內接住新鮮食材，閃避劣質調味粉
        </p>
        <div class="mt-6 flex w-full max-w-xs flex-col items-center gap-3">
          <button
            type="button"
            class="on-btn w-full min-w-[10rem] px-8"
            @click="showRules = true"
          >
            開始遊戲
          </button>
          <RouterLink
            to="/"
            class="text-sm text-[var(--on-cream)]/55 underline-offset-2 hover:text-[var(--on-white)] hover:underline"
          >
            返回遊戲中心
          </RouterLink>
        </div>
      </div>

      <div
        v-for="item in fallingItems"
        :key="item.id"
        class="falling-item pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        :class="{ 'falling-item--trap': item.kind === 'trap' }"
        :style="itemStyle(item)"
      >
        <span class="falling-item__emoji" aria-hidden="true">{{ item.emoji }}</span>
        <span class="falling-item__name">{{ item.name }}</span>
      </div>

      <div
        class="player absolute -translate-x-1/2"
        :style="playerStyle"
        aria-label="鐵鍋，左右移動接取食材"
      >
        <PlayerWithPot />
      </div>
    </section>

    <section
      class="boil-controls relative z-10 flex min-h-12 items-center justify-between gap-4 border-t border-[var(--on-cream)]/25 bg-black/90 px-6 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:min-h-14 sm:px-12 md:px-16"
      aria-label="操作區"
    >
      <button
        type="button"
        class="control-btn"
        aria-label="向左移動"
        :disabled="!canMove"
        @pointerdown.prevent="onMoveStart(-1)"
        @pointerup="onMoveEnd"
        @pointerleave="onMoveEnd"
        @pointercancel="onMoveEnd"
      >
        <ChevronLeft class="size-8 sm:size-10 md:size-12" stroke-width="2.5" />
      </button>
      <button
        type="button"
        class="control-btn"
        aria-label="向右移動"
        :disabled="!canMove"
        @pointerdown.prevent="onMoveStart(1)"
        @pointerup="onMoveEnd"
        @pointerleave="onMoveEnd"
        @pointercancel="onMoveEnd"
      >
        <ChevronRight class="size-8 sm:size-10 md:size-12" stroke-width="2.5" />
      </button>
    </section>

    <!-- 玩法說明彈窗 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showRules"
          class="rules-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="boil-rules-title"
        >
          <div class="rules-panel">
            <h2 id="boil-rules-title" class="rules-panel__title">
              {{ BOIL_RULES.title }}
            </h2>
            <p class="rules-panel__body">{{ BOIL_RULES.body }}</p>
            <p class="rules-panel__how">{{ BOIL_RULES.howTo }}</p>
            <div class="mt-5 flex flex-col gap-2">
              <button type="button" class="on-btn w-full" @click="confirmRulesAndStart">
                開始熬煮
              </button>
              <button type="button" class="on-btn on-btn--ghost w-full" @click="showRules = false">
                先不要
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <GameCouponDialog
      :visible="showEndDialog"
      :title="dialogTitle"
      :message="dialogMessage"
      title-id="boil-game-dialog-title"
      @play-again="onPlayAgain"
      @go-hub="goHub"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import GameCouponDialog from '@/views/pages/Games/components/GameCouponDialog.vue'
import GameStoreBackground from '@/views/pages/Games/components/GameStoreBackground.vue'
import PlayerWithPot from '@/views/pages/Games/components/PlayerWithPot.vue'
import { useGameCouponReward } from '@/composables/useGameCouponReward'
import {
  BOIL_GAME_DURATION_SEC,
  BOIL_ITEM_CONFIG,
  BOIL_PLAYER_CONFIG,
  BOIL_RULES,
  BOIL_SPAWN_CONFIG,
  BOIL_TRAP_CONFIG,
  GOOD_INGREDIENTS,
  TRAP_SEASONINGS,
  type BoilIngredientConfig,
  type BoilTrapConfig,
} from '@/views/pages/Games/boilCatch.config'
import { PAGE_BG } from '@/views/pages/Games/gameStore.config'

type GameState = 'idle' | 'playing' | 'ended'

type FallingItem =
  | {
      id: number
      kind: 'good'
      emoji: string
      name: string
      score: number
      x: number
      y: number
      vx: number
      vy: number
    }
  | {
      id: number
      kind: 'trap'
      emoji: string
      name: string
      score: number
      x: number
      y: number
      vx: number
      vy: number
    }

const router = useRouter()
const displayRef = ref<HTMLElement | null>(null)
const gameState = ref<GameState>('idle')
const score = ref(0)
const timeLeft = ref(BOIL_GAME_DURATION_SEC)
const playerX = ref(50)
const moveDirection = ref(0)
const fallingItems = shallowRef<FallingItem[]>([])
const showEndDialog = ref(false)
const showRules = ref(false)
const { handleGameWin } = useGameCouponReward()
const dialogTitle = ref('時間到！')
const dialogMessage = ref('')

let itemIdSeq = 0
let rafId = 0
let lastFrameTs = 0
let spawnAccumulator = 0
let timerIntervalId = 0

const canMove = computed(() => gameState.value === 'playing')
const currentBg = computed(() =>
  gameState.value === 'idle' ? PAGE_BG.boilCatch.idle : PAGE_BG.boilCatch.playing,
)

const playerStyle = computed(() => ({
  left: `${playerX.value}%`,
  bottom: `${BOIL_PLAYER_CONFIG.bottomPercent}%`,
  width: `${BOIL_PLAYER_CONFIG.widthPercent}%`,
  maxWidth: 'min(7rem, 28vw)',
}))

function itemStyle(item: FallingItem) {
  const size = `${BOIL_ITEM_CONFIG.sizeVmin}vmin`
  return {
    left: `${item.x}%`,
    top: `${item.y}%`,
    width: size,
    height: size,
  }
}

function pickRandomTrap(): BoilTrapConfig {
  return TRAP_SEASONINGS[Math.floor(Math.random() * TRAP_SEASONINGS.length)]
}

function pickWeightedGood(): BoilIngredientConfig {
  const total = GOOD_INGREDIENTS.reduce((sum, d) => sum + d.spawnWeight, 0)
  let roll = Math.random() * total
  for (const item of GOOD_INGREDIENTS) {
    roll -= item.spawnWeight
    if (roll <= 0) return item
  }
  return GOOD_INGREDIENTS[0]
}

function spawnItem() {
  const isTrap = Math.random() < BOIL_TRAP_CONFIG.spawnChance
  const spawnX = 8 + Math.random() * 84
  const drift =
    BOIL_SPAWN_CONFIG.driftSpeedMin
    + Math.random()
      * (BOIL_SPAWN_CONFIG.driftSpeedMax - BOIL_SPAWN_CONFIG.driftSpeedMin)
  const fall =
    BOIL_SPAWN_CONFIG.fallSpeedMin
    + Math.random()
      * (BOIL_SPAWN_CONFIG.fallSpeedMax - BOIL_SPAWN_CONFIG.fallSpeedMin)

  if (isTrap) {
    const trap = pickRandomTrap()
    fallingItems.value = [
      ...fallingItems.value,
      {
        id: ++itemIdSeq,
        kind: 'trap',
        emoji: trap.emoji,
        name: trap.name,
        score: 0,
        x: spawnX,
        y: -4,
        vx: drift,
        vy: fall,
      },
    ]
    return
  }

  const good = pickWeightedGood()
  fallingItems.value = [
    ...fallingItems.value,
    {
      id: ++itemIdSeq,
      kind: 'good',
      emoji: good.emoji,
      name: good.name,
      score: good.score,
      x: spawnX,
      y: -4,
      vx: drift,
      vy: fall,
    },
  ]
}

function getPlayerHitbox() {
  const halfW = BOIL_PLAYER_CONFIG.widthPercent / 2
  const potH = BOIL_PLAYER_CONFIG.potHitboxHeightPercent
  const bottom = BOIL_PLAYER_CONFIG.bottomPercent
  return {
    left: playerX.value - halfW,
    right: playerX.value + halfW,
    top: 100 - bottom - potH,
    bottom: 100 - bottom + 1,
  }
}

function hitsPlayer(item: FallingItem, hitbox: ReturnType<typeof getPlayerHitbox>) {
  const radius = BOIL_ITEM_CONFIG.sizeVmin * 0.35
  return (
    item.x + radius > hitbox.left
    && item.x - radius < hitbox.right
    && item.y + radius > hitbox.top
    && item.y - radius < hitbox.bottom
  )
}

function endGame(reason: 'trap' | 'timeout') {
  if (gameState.value === 'ended') return
  gameState.value = 'ended'
  moveDirection.value = 0
  void showEndDialogForReason(reason)
  stopLoops()
}

async function showEndDialogForReason(reason: 'trap' | 'timeout') {
  if (reason === 'timeout') {
    const content = await handleGameWin({
      couponTitle: '熬煮時間與食材優惠券',
      couponSubtitle: '與 ON 一起熬出最溫的湯',
      detail: `本次接住優質食材得分 ${score.value} 分`,
    })
    dialogTitle.value = content.title
    dialogMessage.value = content.message
  } else {
    dialogTitle.value = '湯頭失準…'
    dialogMessage.value = '接到劣質調味粉，本局熬煮失敗。再試一次，堅持新鮮食材！'
  }
  showEndDialog.value = true
}

function stopLoops() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  if (timerIntervalId) {
    window.clearInterval(timerIntervalId)
    timerIntervalId = 0
  }
}

function gameLoop(timestamp: number) {
  if (gameState.value !== 'playing') return

  if (!lastFrameTs) lastFrameTs = timestamp
  const deltaSec = Math.min((timestamp - lastFrameTs) / 1000, 0.05)
  lastFrameTs = timestamp

  if (moveDirection.value !== 0) {
    const halfW = BOIL_PLAYER_CONFIG.widthPercent / 2
    playerX.value = Math.min(
      100 - halfW,
      Math.max(halfW, playerX.value + moveDirection.value * BOIL_PLAYER_CONFIG.moveSpeed * deltaSec),
    )
  }

  spawnAccumulator += deltaSec * 1000
  if (spawnAccumulator >= BOIL_SPAWN_CONFIG.intervalMs) {
    spawnAccumulator = 0
    spawnItem()
  }

  const hitbox = getPlayerHitbox()
  const nextItems: FallingItem[] = []

  for (const item of fallingItems.value) {
    const next: FallingItem = {
      ...item,
      x: item.x + item.vx * deltaSec,
      y: item.y + item.vy * deltaSec,
    }

    if (hitsPlayer(next, hitbox)) {
      if (next.kind === 'trap') {
        endGame('trap')
        return
      }
      score.value += next.score
      continue
    }

    if (next.y < 108 && next.x > -8 && next.x < 108) {
      nextItems.push(next)
    }
  }

  fallingItems.value = nextItems
  rafId = requestAnimationFrame(gameLoop)
}

function confirmRulesAndStart() {
  showRules.value = false
  startGame()
}

function startGame() {
  stopLoops()
  gameState.value = 'playing'
  score.value = 0
  timeLeft.value = BOIL_GAME_DURATION_SEC
  playerX.value = 50
  moveDirection.value = 0
  fallingItems.value = []
  showEndDialog.value = false
  spawnAccumulator = BOIL_SPAWN_CONFIG.intervalMs * 0.5
  lastFrameTs = 0
  itemIdSeq = 0

  spawnItem()
  rafId = requestAnimationFrame(gameLoop)

  timerIntervalId = window.setInterval(() => {
    if (gameState.value !== 'playing') return
    timeLeft.value -= 1
    if (timeLeft.value <= 0) {
      timeLeft.value = 0
      endGame('timeout')
    }
  }, 1000)
}

function onMoveStart(direction: -1 | 1) {
  if (!canMove.value) return
  moveDirection.value = direction
}

function onMoveEnd() {
  moveDirection.value = 0
}

function onPlayAgain() {
  showEndDialog.value = false
  gameState.value = 'idle'
  fallingItems.value = []
}

function goHub() {
  showEndDialog.value = false
  router.push('/')
}

function onKeyDown(e: KeyboardEvent) {
  if (!canMove.value) return
  if (e.key === 'ArrowLeft') moveDirection.value = -1
  if (e.key === 'ArrowRight') moveDirection.value = 1
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' && moveDirection.value === -1) moveDirection.value = 0
  if (e.key === 'ArrowRight' && moveDirection.value === 1) moveDirection.value = 0
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})

onUnmounted(() => {
  stopLoops()
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<style scoped>
.boil-display {
  touch-action: none;
}

.brand-mark {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 10vw, 3.5rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--on-white);
  text-shadow: 0 4px 24px rgb(0 0 0 / 0.55);
  line-height: 1;
}

.game-title {
  margin-top: 0.35rem;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 4.5vw, 1.75rem);
  font-weight: 700;
  color: var(--on-cream);
  letter-spacing: 0.12em;
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.5);
}

.hud-badge {
  border-radius: 0.5rem;
  border: 1px solid rgb(240 232 226 / 0.35);
  background: rgb(0 0 0 / 0.78);
  color: var(--on-cream);
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  backdrop-filter: blur(4px);
}

@media (min-width: 640px) {
  .hud-badge {
    font-size: 1rem;
  }
}

.hud-badge--urgent {
  border-color: var(--on-white);
  background: rgb(0 0 0 / 0.9);
  color: var(--on-white);
}

.boil-idle {
  background: linear-gradient(
    to bottom,
    rgb(0 0 0 / 0.22) 0%,
    rgb(0 0 0 / 0.06) 45%,
    rgb(0 0 0 / 0.28) 100%
  );
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

.on-btn--ghost {
  background: transparent;
  border-color: rgb(0 0 0 / 0.35);
  color: var(--on-black);
  box-shadow: none;
}

.rules-overlay {
  padding: max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
}

.rules-panel {
  width: min(100%, 22rem);
  max-height: min(90dvh, 100%);
  overflow-y: auto;
  border-radius: 1rem;
  border: 1px solid rgb(0 0 0 / 0.1);
  background: var(--on-cream);
  padding: 1.5rem;
  color: var(--on-black);
  box-shadow: 0 16px 48px rgb(0 0 0 / 0.35);
}

.rules-panel__title {
  font-family: var(--font-display);
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--on-black);
}

.rules-panel__body,
.rules-panel__how {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.65;
  color: rgb(0 0 0 / 0.78);
}

.rules-panel__how {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgb(0 0 0 / 0.12);
  color: rgb(0 0 0 / 0.7);
}

.falling-item {
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.55));
}

.falling-item__emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--on-cream);
  border: 2px solid var(--on-black);
  font-size: clamp(1.25rem, 5vmin, 2rem);
  line-height: 1;
}

.falling-item__name {
  max-width: 110%;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.8);
  color: var(--on-cream);
  font-size: clamp(0.55rem, 2.2vmin, 0.7rem);
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.falling-item--trap .falling-item__emoji {
  background: var(--on-black);
  border-color: var(--on-white);
  box-shadow: 0 0 10px rgb(255 255 255 / 0.35);
}

.player {
  z-index: 15;
  aspect-ratio: 120 / 100;
  height: auto;
  min-width: 3.5rem;
  max-height: min(6.5rem, 20vh);
}

.control-btn {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  max-width: 45%;
  min-height: 2.75rem;
  border-radius: 0.75rem;
  background: var(--on-black);
  color: var(--on-cream);
  border: 1px solid rgb(240 232 226 / 0.45);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.35);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, transform 0.1s ease, color 0.15s ease;
}

.control-btn:active:not(:disabled) {
  background: var(--on-cream);
  color: var(--on-black);
  transform: translateY(1px);
}

.control-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
