<template>
  <main class="catch-game relative grid h-full max-h-full w-full max-w-[100vw] grid-rows-[9fr_1fr] overflow-hidden text-white touch-none select-none">
    <GameStoreBackground
      :src="currentBg"
      :object-position="gameState === 'idle' ? 'center 55%' : 'center 42%'"
      variant="game"
    />

    <div class="absolute inset-0 bg-gradient-to-b from-amber-950/60 via-stone-950/50 to-stone-950/70 pointer-events-none z-[1]" />

    <!-- 顯示層 90% -->
    <section
      ref="displayRef"
      class="catch-display relative z-10 min-h-0 overflow-hidden"
      aria-label="遊戲顯示區"
    >
      <div class="catch-hud pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
        <div class="hud-badge">
          得分 <span class="font-bold text-amber-300">{{ score }}</span>
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
        class="catch-idle absolute inset-0 z-10 flex flex-col items-center justify-center p-4"
      >
        <h1 class="game-title text-xl font-bold tracking-widest sm:text-2xl">
          接菜品
        </h1>
        <p class="mt-2 max-w-xs text-center text-sm leading-relaxed text-amber-200/80 sm:text-base">
          30 秒內接住料理得分，接到非 TTAN 料理即結束
        </p>
        <div class="mt-6 flex w-full max-w-xs flex-col items-center gap-3">
          <button
            type="button"
            class="restaurant-btn w-full min-w-[10rem] px-8"
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
        </div>
      </div>

      <div
        v-for="item in fallingItems"
        :key="item.id"
        class="falling-item pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        :class="{ 'falling-item--trap': item.kind === 'trap' }"
        :style="itemStyle(item)"
      >
        <img
          :src="item.image"
          class="falling-item__image"
          :class="{ 'falling-item__image--trap': item.kind === 'trap' }"
          alt=""
        >
      </div>

      <div
        class="player absolute -translate-x-1/2"
        :style="playerStyle"
        aria-label="玩家，手持托盤接取料理"
      >
        <PlayerWithTray />
      </div>
    </section>

    <!-- 操作層 10% -->
    <section
      class="catch-controls relative z-10 flex min-h-12 items-center justify-between gap-4 border-t border-amber-800/40 bg-stone-950/85 px-6 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:min-h-14 sm:px-12 md:px-16"
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

    <GameCouponDialog
      :visible="showEndDialog"
      :title="dialogTitle"
      :message="dialogMessage"
      title-id="catch-game-dialog-title"
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
import PlayerWithTray from '@/views/pages/Games/components/PlayerWithTray.vue'
import { useGameCouponReward } from '@/composables/useGameCouponReward'
import {
  CATCH_GAME_DURATION_SEC,
  CATCH_ITEM_CONFIG,
  CATCH_PLAYER_CONFIG,
  CATCH_SPAWN_CONFIG,
  DISH_TYPES,
  TRAP_FOOD_CONFIG,
  TRAP_FOOD_TYPES,
  type DishTypeConfig,
  type TrapFoodConfig,
} from '@/views/pages/Games/gameDishes.config'
import { PAGE_BG } from '@/views/pages/Games/gameStore.config'

type GameState = 'idle' | 'playing' | 'ended'

type FallingItem =
  | {
      id: number
      kind: 'dish'
      image: string
      score: number
      x: number
      y: number
      vx: number
      vy: number
    }
  | {
      id: number
      kind: 'trap'
      image: string
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
const timeLeft = ref(CATCH_GAME_DURATION_SEC)
const playerX = ref(50)
const moveDirection = ref(0)
const fallingItems = shallowRef<FallingItem[]>([])
const showEndDialog = ref(false)
const endReason = ref<'trap' | 'timeout'>('timeout')
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
  gameState.value === 'idle' ? PAGE_BG.coinCatch.idle : PAGE_BG.coinCatch.playing,
)

const playerStyle = computed(() => ({
  left: `${playerX.value}%`,
  bottom: `${CATCH_PLAYER_CONFIG.bottomPercent}%`,
  width: `${CATCH_PLAYER_CONFIG.widthPercent}%`,
  maxWidth: 'min(5.5rem, 18vw)',
}))

function itemStyle(item: FallingItem) {
  const size = `${CATCH_ITEM_CONFIG.sizeVmin}vmin`
  return {
    left: `${item.x}%`,
    top: `${item.y}%`,
    width: size,
    height: size,
  }
}

function pickRandomTrapFood(): TrapFoodConfig {
  return TRAP_FOOD_TYPES[Math.floor(Math.random() * TRAP_FOOD_TYPES.length)]
}

function pickWeightedDish(): DishTypeConfig {
  const total = DISH_TYPES.reduce((sum, d) => sum + d.spawnWeight, 0)
  let roll = Math.random() * total
  for (const dish of DISH_TYPES) {
    roll -= dish.spawnWeight
    if (roll <= 0) return dish
  }
  return DISH_TYPES[0]
}

function spawnItem() {
  const isTrap = Math.random() < TRAP_FOOD_CONFIG.spawnChance
  const spawnX = 8 + Math.random() * 84
  const drift =
    CATCH_SPAWN_CONFIG.driftSpeedMin
    + Math.random()
      * (CATCH_SPAWN_CONFIG.driftSpeedMax - CATCH_SPAWN_CONFIG.driftSpeedMin)
  const fall =
    CATCH_SPAWN_CONFIG.fallSpeedMin
    + Math.random()
      * (CATCH_SPAWN_CONFIG.fallSpeedMax - CATCH_SPAWN_CONFIG.fallSpeedMin)

  if (isTrap) {
    const trap = pickRandomTrapFood()
    fallingItems.value = [
      ...fallingItems.value,
      {
        id: ++itemIdSeq,
        kind: 'trap',
        image: trap.image,
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

  const dish = pickWeightedDish()
  fallingItems.value = [
    ...fallingItems.value,
    {
      id: ++itemIdSeq,
      kind: 'dish',
      image: dish.image,
      score: dish.score,
      x: spawnX,
      y: -4,
      vx: drift,
      vy: fall,
    },
  ]
}

function getPlayerHitbox() {
  const halfW = CATCH_PLAYER_CONFIG.widthPercent / 2
  const trayH = CATCH_PLAYER_CONFIG.trayHitboxHeightPercent
  const bottom = CATCH_PLAYER_CONFIG.bottomPercent
  return {
    left: playerX.value - halfW,
    right: playerX.value + halfW,
    top: 100 - bottom - trayH,
    bottom: 100 - bottom + 1,
  }
}

function hitsPlayer(item: FallingItem, hitbox: ReturnType<typeof getPlayerHitbox>) {
  const radius = CATCH_ITEM_CONFIG.sizeVmin * 0.35
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
  endReason.value = reason
  void showEndDialogForReason(reason)
  stopLoops()
}

async function showEndDialogForReason(reason: 'trap' | 'timeout') {
  if (reason === 'timeout') {
    const content = await handleGameWin({
      couponTitle: '接菜品優惠券',
      couponSubtitle: '時間內接住料理即可兌換',
      detail: `本次得分 ${score.value} 分`,
    })
    dialogTitle.value = content.title
    dialogMessage.value = content.message
  } else {
    dialogTitle.value = '遊戲結束'
    dialogMessage.value = '接到非 TTAN 料理，本局結束。'
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
    const halfW = CATCH_PLAYER_CONFIG.widthPercent / 2
    playerX.value = Math.min(
      100 - halfW,
      Math.max(halfW, playerX.value + moveDirection.value * CATCH_PLAYER_CONFIG.moveSpeed * deltaSec),
    )
  }

  spawnAccumulator += deltaSec * 1000
  if (spawnAccumulator >= CATCH_SPAWN_CONFIG.intervalMs) {
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

function startGame() {
  stopLoops()
  gameState.value = 'playing'
  score.value = 0
  timeLeft.value = CATCH_GAME_DURATION_SEC
  playerX.value = 50
  moveDirection.value = 0
  fallingItems.value = []
  showEndDialog.value = false
  spawnAccumulator = CATCH_SPAWN_CONFIG.intervalMs * 0.5
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
.catch-display {
  touch-action: none;
}

.game-title {
  color: #fde68a;
  text-shadow: 0 2px 12px rgba(180, 80, 0, 0.6);
  letter-spacing: 0.25em;
}

.hud-badge {
  border-radius: 0.5rem;
  border: 1px solid rgba(217, 119, 6, 0.35);
  background: rgba(42, 20, 4, 0.75);
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
  border-color: rgba(220, 38, 38, 0.6);
  background: rgba(69, 10, 10, 0.85);
  color: #fecaca;
}

.catch-idle {
  background: linear-gradient(
    to bottom,
    rgba(69, 26, 3, 0.35) 0%,
    rgba(28, 25, 23, 0.15) 45%,
    rgba(28, 25, 23, 0.4) 100%
  );
  backdrop-filter: blur(1px);
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

.falling-item {
  z-index: 10;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.55));
}

.falling-item__image {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(253, 230, 138, 0.85);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
}

.falling-item--trap {
  filter: drop-shadow(0 0 8px rgb(239 68 68 / 0.8));
}

.falling-item__image--trap {
  border-color: rgba(248, 113, 113, 0.95);
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.45);
}

.player {
  z-index: 15;
  aspect-ratio: 100 / 130;
  height: auto;
  min-width: 2.75rem;
  max-height: min(7.5rem, 22vh);
}

.control-btn {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  max-width: 45%;
  min-height: 2.75rem;
  border-radius: 0.75rem;
  background: linear-gradient(180deg, #3b1f08, #2a1404);
  color: #fde68a;
  border: 1px solid #d97706;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 200, 80, 0.15);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
}

.control-btn:active:not(:disabled) {
  background: linear-gradient(180deg, #6b2d07, #4a1c04);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  transform: translateY(1px);
}

.control-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
