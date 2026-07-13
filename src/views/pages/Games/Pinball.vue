<template>
  <main
    class="pinball-page relative flex h-full max-h-full w-full flex-col items-center overflow-hidden touch-none select-none"
  >
    <GameStoreBackground
      :src="PAGE_BG.pinball"
      object-position="center 40%"
      variant="game"
    />

    <!-- 暖色半透明遮罩，與酒杯遊戲相同風格 -->
    <div class="absolute inset-0 bg-gradient-to-b from-amber-950/60 via-stone-950/50 to-stone-950/70 pointer-events-none" />

    <!-- 整體外框 -->
    <div class="pinball-shell relative z-10 flex h-full w-full max-w-[100vw] flex-col">

      <!-- 頂部得分列：左=得分，右=剩餘球數 -->
      <div class="hud w-full px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 flex items-center justify-between">
        <div class="flex flex-col items-start gap-0.5">
          <span class="hud-label">得分</span>
          <span class="hud-value">{{ score.toLocaleString() }}</span>
        </div>
        <div class="flex flex-col items-end gap-0.5">
          <span class="hud-label">剩餘球數</span>
          <span class="hud-value">{{ ballsLeft }}</span>
        </div>
      </div>

      <!-- 狀態訊息 -->
      <div class="msg-bar w-full text-center py-1 text-xs tracking-widest">
        {{ statusMsg }}
      </div>

      <!-- Canvas 遊戲區：撐滿剩餘高度，遊戲板依可用空間等比放大 -->
      <div
        ref="canvasFrameRef"
        class="canvas-frame flex min-h-0 flex-1 items-center justify-center px-1.5 py-1"
      >
        <div
          ref="canvasBoardRef"
          class="canvas-playfield relative shrink-0"
          :style="canvasPlayfieldStyle"
        >
          <div class="billboard-sign">
            <div class="billboard-inner">
              <img :src="logoImg" alt="餐廳Logo" class="billboard-logo" draggable="false" />
            </div>
          </div>
          <canvas
            ref="canvasRef"
            class="block w-full h-full rounded-lg"
            :width="CW * DPR"
            :height="CH * DPR"
          />
          <button
            class="flipper-btn flipper-btn--left"
            @touchstart.prevent="leftDown=true"
            @touchend.prevent="leftDown=false"
            @mousedown.prevent="leftDown=true"
            @mouseup.prevent="leftDown=false"
          >◀</button>
          <button
            class="flipper-btn flipper-btn--right"
            @touchstart.prevent="rightDown=true"
            @touchend.prevent="rightDown=false"
            @mousedown.prevent="rightDown=true"
            @mouseup.prevent="rightDown=false"
          >▶</button>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="pinball-controls w-full shrink-0 px-3 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div v-if="phase === 'idle'" class="flex w-full flex-col items-center gap-2">
          <p class="text-xs text-center text-amber-200/70">
            1 顆球機會，按住發射鍵蓄力後放開｜左右按鈕控制彈板
          </p>
          <button class="restaurant-btn w-full" @click="startGame">
            開始遊戲
          </button>
          <RouterLink
            to="/"
            class="text-sm text-amber-200/50 underline-offset-2 hover:text-amber-200/80 hover:underline"
          >
            返回遊戲中心
          </RouterLink>
        </div>
        <div v-else-if="phase === 'ready'" class="flex w-full flex-col items-center gap-2">
          <p class="text-xs text-center text-amber-200/70">
            按住發射鍵蓄力（球左側蓄力條），放開水平射出｜左右按鈕控制彈板
          </p>
          <button
            class="restaurant-btn w-full"
            @touchstart.prevent="plungerDown = true"
            @touchend.prevent="doLaunch"
            @mousedown.prevent="plungerDown = true"
            @mouseup.prevent="doLaunch"
          >
            {{ plungerDown ? '蓄力中…' : '發射' }}
          </button>
        </div>
        <div v-else-if="phase === 'playing'" class="w-full text-center text-xs text-amber-200/50 tracking-widest">
          ◀ 左彈板　右彈板 ▶
        </div>
      </div>
    </div>

    <GameCouponDialog
      :visible="showEndDialog"
      :title="endDialogTitle"
      :message="endDialogMessage"
      title-id="pinball-win-dialog-title"
      @play-again="onPlayAgain"
      @go-hub="goHub"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import GameCouponDialog from '@/views/pages/Games/components/GameCouponDialog.vue'
import GameStoreBackground from '@/views/pages/Games/components/GameStoreBackground.vue'
import { useGameCouponReward } from '@/composables/useGameCouponReward'
import { PAGE_BG } from '@/views/pages/Games/gameStore.config'
import { PINBALL_COUPONS } from '@/views/pages/Games/pinballCoupons.config'
import logoImg from '@/assets/logo.png'

// ─── 食物圖片 ───────────────────────────────────────────
import food1 from '@/assets/food/food1.png'
import food2 from '@/assets/food/food2.png'
import food3 from '@/assets/food/food3.png'
import food4 from '@/assets/food/food4.png'
import food5 from '@/assets/food/food5.png'
import food6 from '@/assets/food/food6.png'
import food7 from '@/assets/food/food7.png'
import food8 from '@/assets/food/food8.png'
const FOOD_IMGS = [food1, food2, food3, food4, food5, food6, food7, food8]

// ─── 畫布尺寸 ───────────────────────────────────────────
const CW = 220   // 邏輯寬
const CH = 380   // 邏輯高
const SLOT_H = 18
const DPR = 2    // 像素密度（像素風：放大後再縮回）

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasFrameRef = ref<HTMLElement | null>(null)
const canvasBoardRef = ref<HTMLElement | null>(null)
const displayW = ref(220)
const displayH = ref(380)

// ─── 遊戲狀態 ───────────────────────────────────────────
const BALLS_PER_GAME = 1
type Phase = 'idle' | 'ready' | 'playing' | 'over'
const phase = ref<Phase>('idle')
const score = ref(0)
const ballsLeft = ref(BALLS_PER_GAME)
const multiplier = ref(1)
const showEndDialog = ref(false)
const wonSlot = ref(0)
const plungerDown = ref(false)
const leftDown = ref(false)
const rightDown = ref(false)
const { handleGameWin } = useGameCouponReward()
const endDialogTitle = ref('獲得優惠券！')
const endDialogMessage = ref('')
let plungerStart = 0

const statusMsg = computed(() => {
  if (phase.value === 'idle') return '彈珠台'
  if (phase.value === 'ready') return `剩餘 ${ballsLeft.value} 顆球`
  if (phase.value === 'playing') return '遊戲中'
  return `遊戲結束　得分 ${score.value.toLocaleString()}`
})

async function showCouponWinDialog() {
  const c = PINBALL_COUPONS[wonSlot.value % PINBALL_COUPONS.length]!
  const detail = `得分 ${score.value.toLocaleString()}，獲得「${c.title}」— ${c.subtitle}`
  const content = await handleGameWin({
    couponTitle: c.title,
    couponSubtitle: c.subtitle,
    detail,
  })
  endDialogTitle.value = content.title
  endDialogMessage.value = content.message
  showEndDialog.value = true
}

// ─── 物理常數 ─────────────────────────────────────────
const BOUNCE_BOOST_SCALE = 0.35  // 僅縮減碰撞後的額外加速（不影響發射／重力）
const GRAVITY = 0.10
const FRICTION = 0.992
const BALL_R = 7
const WALL_L = 14
const WALL_R = CW - 14
const CEIL = 20

// 最右上方發射（球貼右上角，蓄力條在球左側，水平往左射出）
const LAUNCH_X = WALL_R - BALL_R
const LAUNCH_Y = CEIL + BALL_R + 2
const PLUNGER_BAR_W = 4
const PLUNGER_GAP = 8
const PLUNGER_BAR_X = LAUNCH_X - BALL_R - PLUNGER_GAP - PLUNGER_BAR_W / 2
const PLUNGER_BAR_TOP = LAUNCH_Y - BALL_R
const PLUNGER_BAR_BOTTOM = LAUNCH_Y + BALL_R + 2

const canvasPlayfieldStyle = computed(() => {
  const sw = (WALL_R - WALL_L) / PINBALL_COUPONS.length
  return {
    width: `${displayW.value}px`,
    height: `${displayH.value}px`,
    '--slot-bottom-pct': `${(SLOT_H / CH) * 100}%`,
    '--flipper-btn-left': `${((WALL_L + sw / 2) / CW) * 100}%`,
    '--flipper-btn-right': `${((WALL_R - sw / 2) / CW) * 100}%`,
  }
})

// ─── 彈板 ─────────────────────────────────────────────
const FL_PX = WALL_L + 8   // 左彈板軸心 x
const FR_PX = WALL_R - 8   // 右彈板軸心 x
const F_PY  = CH - 52       // 彈板軸心 y
const F_LEN = 36            // 彈板長度
const F_REST_L =  28        // 左彈板靜止角度 (degrees, from positive x)
const F_ACT_L  = -28
const F_REST_R = 152
const F_ACT_R  = 208
const F_SPEED  = 18         // 角速度 deg/frame

// ─── 彈珠台佈局 ──────────────────────────────────────
interface Bumper { x: number; y: number; r: number; foodIdx: number; flash: number; pts: number }
interface Peg    { x: number; y: number }
interface Sling  { x1: number; y1: number; x2: number; y2: number; flash: number }
interface Slot   { x: number; w: number; label: string; color: string }

const BUMPERS: Bumper[] = [
  { x: 55,  y: 75,  r: 13, foodIdx: 0, flash: 0, pts: 500 },
  { x: 165, y: 75,  r: 13, foodIdx: 1, flash: 0, pts: 500 },
  { x: 110, y: 115, r: 13, foodIdx: 2, flash: 0, pts: 750 },
  { x: 55,  y: 170, r: 11, foodIdx: 3, flash: 0, pts: 300 },
  { x: 165, y: 170, r: 11, foodIdx: 4, flash: 0, pts: 300 },
  { x: 110, y: 215, r: 11, foodIdx: 5, flash: 0, pts: 300 },
]

const PEGS: Peg[] = [
  { x: 50,  y: 260 }, { x: 80,  y: 248 }, { x: 110, y: 256 },
  { x: 140, y: 248 }, { x: 170, y: 260 },
  { x: 65,  y: 285 }, { x: 95,  y: 278 }, { x: 125, y: 278 }, { x: 155, y: 285 },
]

// 彈弓（slingshot）— 夾角收窄、更貼牆，避免球卡在牆角縫隙
const SLINGS: Sling[] = [
  { x1: WALL_L + 2, y1: 295, x2: WALL_L + 18, y2: 250, flash: 0 },
  { x1: WALL_R - 2, y1: 295, x2: WALL_R - 18, y2: 250, flash: 0 },
]

// 底部獎槽
const slotCount = PINBALL_COUPONS.length
const slotW = (WALL_R - WALL_L) / slotCount
const SLOTS: Slot[] = PINBALL_COUPONS.map((c, i) => ({
  x: WALL_L + i * slotW,
  w: slotW,
  label: c.shortLabel,
  color: '#c8a050',
}))

// ─── 球狀態 ─────────────────────────────────────────
let bx = LAUNCH_X
let by = LAUNCH_Y
let vx = 0
let vy = 0
let ballInPlay = false
let ballDead = false

// 彈板角度
let flAngle = F_REST_L
let frAngle = F_REST_R

// 食物圖片快取
const foodImages: HTMLImageElement[] = []
let imagesLoaded = false
const logoImage = new Image()
let logoLoaded = false

function loadImages() {
  let loaded = 0
  FOOD_IMGS.forEach((src, i) => {
    const img = new Image()
    img.src = src
    img.onload = () => { loaded++; if (loaded === FOOD_IMGS.length) imagesLoaded = true }
    foodImages[i] = img
  })
  logoImage.src = logoImg
  logoImage.onload = () => { logoLoaded = true }
}

// ─── 輔助函式 ─────────────────────────────────────────
function toRad(d: number) { return d * Math.PI / 180 }

function flipperEndPoint(px: number, py: number, angle: number) {
  return {
    ex: px + Math.cos(toRad(angle)) * F_LEN,
    ey: py + Math.sin(toRad(angle)) * F_LEN,
  }
}

function closestPointOnSegment(ax: number, ay: number, bx: number, by: number, px: number, py: number) {
  const abx = bx - ax, aby = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby)))
  return { x: ax + t * abx, y: ay + t * aby }
}

/** 將 boost 的「超出 1 的加速量」依比例縮減，純反射（boost=1）不變 */
function scaledBoost(boost: number): number {
  return 1 + (boost - 1) * BOUNCE_BOOST_SCALE
}

function reflectVelocity(nx: number, ny: number, boost = 1.25) {
  const dot = vx * nx + vy * ny
  const b = scaledBoost(boost)
  vx = (vx - 2 * dot * nx) * b
  vy = (vy - 2 * dot * ny) * b
}

// ─── 物理更新 ─────────────────────────────────────────
function updateFlipper(isLeft: boolean) {
  const rest = isLeft ? F_REST_L : F_REST_R
  const act  = isLeft ? F_ACT_L  : F_ACT_R
  const pressed = isLeft ? leftDown.value : rightDown.value
  if (isLeft) {
    flAngle = pressed
      ? Math.max(act, flAngle - F_SPEED)
      : Math.min(rest, flAngle + F_SPEED)
  } else {
    frAngle = pressed
      ? Math.min(act, frAngle + F_SPEED)
      : Math.max(rest, frAngle - F_SPEED)
  }
}

function collideFlipper(px: number, py: number, angle: number, boost: number) {
  const { ex, ey } = flipperEndPoint(px, py, angle)
  const cp = closestPointOnSegment(px, py, ex, ey, bx, by)
  const dx = bx - cp.x, dy = by - cp.y
  const dist = Math.hypot(dx, dy)
  if (dist < BALL_R + 3 && dist > 0.01) {
    const nx = dx / dist, ny = dy / dist
    bx = cp.x + nx * (BALL_R + 3.5)
    by = cp.y + ny * (BALL_R + 3.5)
    reflectVelocity(nx, ny, boost)
  }
}

function updatePhysics() {
  if (!ballInPlay || ballDead) return

  // 彈板
  updateFlipper(true)
  updateFlipper(false)

  // 重力
  vy += GRAVITY
  vx *= FRICTION
  vy *= FRICTION

  bx += vx
  by += vy

  // 天花板
  if (by - BALL_R < CEIL) { by = CEIL + BALL_R; vy = Math.abs(vy) * 0.7 }

  // 側牆
  if (bx - BALL_R < WALL_L) { bx = WALL_L + BALL_R; vx = Math.abs(vx) * 0.72 }
  if (bx + BALL_R > WALL_R) { bx = WALL_R - BALL_R; vx = -Math.abs(vx) * 0.72 }

  // 彈板碰撞
  const leftBoost  = leftDown.value  ? 1.6 : 1.1
  const rightBoost = rightDown.value ? 1.6 : 1.1
  collideFlipper(FL_PX, F_PY, flAngle, leftBoost)
  collideFlipper(FR_PX, F_PY, frAngle, rightBoost)

  // 彈板下方洞口 → 球進洞，每球結束顯示對應獎品券
  if (by > CH - 10) {
    if (showEndDialog.value) return
    ballDead = true
    ballInPlay = false
    const slot = Math.floor((bx - WALL_L) / slotW)
    wonSlot.value = Math.max(0, Math.min(slotCount - 1, slot))
    ballsLeft.value--
    if (ballsLeft.value <= 0) phase.value = 'over'
    void showCouponWinDialog()
    return
  }

  // 圓形彈珠靶碰撞
  for (const b of BUMPERS) {
    const dx = bx - b.x, dy = by - b.y
    const dist = Math.hypot(dx, dy)
    const minD = BALL_R + b.r + 1
    if (dist < minD && dist > 0.01) {
      const nx = dx / dist, ny = dy / dist
      bx = b.x + nx * (minD + 1)
      by = b.y + ny * (minD + 1)
      const speed = Math.hypot(vx, vy)
      const bumperBoost = scaledBoost(1.3)
      vx = nx * Math.max(speed, 3) * bumperBoost
      vy = ny * Math.max(speed, 3) * bumperBoost
      b.flash = 8
      score.value += b.pts * multiplier.value
      if (score.value % 3000 < b.pts) multiplier.value = Math.min(5, multiplier.value + 1)
    }
    if (b.flash > 0) b.flash--
  }

  // 釘子碰撞
  for (const p of PEGS) {
    const dx = bx - p.x, dy = by - p.y
    const dist = Math.hypot(dx, dy)
    if (dist < BALL_R + 5 && dist > 0.01) {
      const nx = dx / dist, ny = dy / dist
      bx = p.x + nx * (BALL_R + 5.5)
      by = p.y + ny * (BALL_R + 5.5)
      reflectVelocity(nx, ny, 1.05)
      score.value += 50 * multiplier.value
    }
  }

  // 彈弓
  for (const s of SLINGS) {
    const cp = closestPointOnSegment(s.x1, s.y1, s.x2, s.y2, bx, by)
    const dx = bx - cp.x, dy = by - cp.y
    const dist = Math.hypot(dx, dy)
    if (dist < BALL_R + 3 && dist > 0.01) {
      const nx = dx / dist, ny = dy / dist
      bx = cp.x + nx * (BALL_R + 3.5)
      by = cp.y + ny * (BALL_R + 3.5)
      reflectVelocity(nx, ny, 1.4)
      s.flash = 6
      score.value += 150 * multiplier.value
    }
    if (s.flash > 0) s.flash--
  }
}

// ─── 繪製 ──────────────────────────────────────────────
function drawPixelCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x * DPR, y * DPR, r * DPR, 0, Math.PI * 2)
  ctx.fill()
}

function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x * DPR, y * DPR, w * DPR, h * DPR)
}

function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, lw = 1) {
  ctx.strokeStyle = color
  ctx.lineWidth = lw * DPR
  ctx.beginPath()
  ctx.moveTo(x1 * DPR, y1 * DPR)
  ctx.lineTo(x2 * DPR, y2 * DPR)
  ctx.stroke()
}

function drawFlipper(ctx: CanvasRenderingContext2D, px: number, py: number, angle: number, active: boolean) {
  const { ex, ey } = flipperEndPoint(px, py, angle)
  ctx.save()
  // 漆器紅彈板
  ctx.strokeStyle = active ? '#e8c060' : '#8b1a1a'
  ctx.lineWidth = 8 * DPR
  ctx.lineCap = 'round'
  ctx.shadowColor = active ? '#e8c060' : 'transparent'
  ctx.shadowBlur = active ? 10 * DPR : 0
  ctx.beginPath()
  ctx.moveTo(px * DPR, py * DPR)
  ctx.lineTo(ex * DPR, ey * DPR)
  ctx.stroke()
  // 高光線
  ctx.strokeStyle = active ? '#fff8e0' : 'rgba(255,200,150,0.3)'
  ctx.lineWidth = 2 * DPR
  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.moveTo(px * DPR, py * DPR)
  ctx.lineTo(ex * DPR, ey * DPR)
  ctx.stroke()
  ctx.restore()
}

function drawBumper(ctx: CanvasRenderingContext2D, b: Bumper) {
  const lit = b.flash > 0
  const x = b.x * DPR, y = b.y * DPR, r = b.r * DPR

  // 外環（金色漆器感）
  ctx.save()
  ctx.shadowColor = lit ? '#ffe080' : 'transparent'
  ctx.shadowBlur = lit ? 14 * DPR : 0
  ctx.strokeStyle = lit ? '#ffe080' : '#c8a050'
  ctx.lineWidth = (lit ? 3 : 2) * DPR
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke()
  // 內圈裝飾
  ctx.strokeStyle = lit ? 'rgba(255,240,180,0.5)' : 'rgba(180,130,60,0.3)'
  ctx.lineWidth = 1 * DPR
  ctx.beginPath(); ctx.arc(x, y, (r - 3) * DPR, 0, Math.PI * 2); ctx.stroke()
  ctx.restore()

  // 食物圖片（圓形裁切）
  if (imagesLoaded && foodImages[b.foodIdx]) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, (r - 2) * DPR, 0, Math.PI * 2)
    ctx.clip()
    const img = foodImages[b.foodIdx]!
    const d = (r - 2) * 2 * DPR
    ctx.globalAlpha = lit ? 1 : 0.85
    ctx.drawImage(img, x - (r - 2) * DPR, y - (r - 2) * DPR, d, d)
    ctx.restore()
  }

  // 點數文字
  if (lit) {
    ctx.save()
    ctx.fillStyle = '#ffe080'
    ctx.font = `bold ${8 * DPR}px "Courier New"`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = '#ffa030'
    ctx.shadowBlur = 8 * DPR
    ctx.fillText(`+${b.pts}`, x, y + r + 10 * DPR)
    ctx.restore()
  }
}

function drawBall(ctx: CanvasRenderingContext2D) {
  if (!ballInPlay && phase.value !== 'idle' && phase.value !== 'ready') return
  const drawX = ballInPlay ? bx : LAUNCH_X
  const drawY = ballInPlay ? by : LAUNCH_Y
  ctx.save()
  const x = drawX * DPR, y = drawY * DPR, r = BALL_R * DPR
  // 珍珠白球，帶金色暈
  const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.04, x, y, r)
  grad.addColorStop(0, '#fffdf0')
  grad.addColorStop(0.5, '#f0e8d0')
  grad.addColorStop(1, '#b89060')
  ctx.shadowColor = 'rgba(220,180,80,0.5)'
  ctx.shadowBlur = 8 * DPR
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  // 高光點
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  // 深漆黑底，帶暖紅調（日式漆器感）
  const bg = ctx.createLinearGradient(0, 0, 0, CH * DPR)
  bg.addColorStop(0,   '#1c0a08')
  bg.addColorStop(0.5, '#160806')
  bg.addColorStop(1,   '#0e0504')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CW * DPR, CH * DPR)

  // 細膩木紋橫紋
  ctx.save()
  ctx.strokeStyle = 'rgba(180,80,30,0.07)'
  ctx.lineWidth = 1 * DPR
  for (let y = 0; y <= CH; y += 14) {
    ctx.beginPath()
    ctx.moveTo(0, (y + Math.sin(y * 0.3) * 1.5) * DPR)
    ctx.lineTo(CW * DPR, (y + Math.sin(y * 0.3 + 1) * 1.5) * DPR)
    ctx.stroke()
  }
  ctx.restore()
}

function drawWalls(ctx: CanvasRenderingContext2D) {
  ctx.save()
  // 漆木邊框
  const wallColor = '#2a0e08'
  const wallEdge  = '#7a3010'
  const wallShine = '#c08040'
  // 左牆
  ctx.fillStyle = wallColor
  ctx.fillRect(0, 0, WALL_L * DPR, CH * DPR)
  ctx.fillStyle = wallEdge
  ctx.fillRect((WALL_L - 3) * DPR, 0, 3 * DPR, CH * DPR)
  ctx.fillStyle = wallShine
  ctx.fillRect((WALL_L - 1) * DPR, 0, 1 * DPR, CH * DPR)
  // 右牆
  ctx.fillStyle = wallColor
  ctx.fillRect(WALL_R * DPR, 0, (CW - WALL_R) * DPR, CH * DPR)
  ctx.fillStyle = wallEdge
  ctx.fillRect(WALL_R * DPR, 0, 3 * DPR, CH * DPR)
  ctx.fillStyle = wallShine
  ctx.fillRect(WALL_R * DPR, 0, 1 * DPR, CH * DPR)
  // 天花板
  ctx.fillStyle = wallColor
  ctx.fillRect(0, 0, CW * DPR, CEIL * DPR)
  ctx.fillStyle = wallEdge
  ctx.fillRect(0, (CEIL - 3) * DPR, CW * DPR, 3 * DPR)
  ctx.fillStyle = wallShine
  ctx.fillRect(0, (CEIL - 1) * DPR, CW * DPR, 1 * DPR)
  ctx.restore()
}

function drawLogoOnCeiling(ctx: CanvasRenderingContext2D) {
  if (!logoLoaded) return

  // 招牌凸出高度：讓 logo 從天花板往下凸出
  const signH = 64 * DPR        // 招牌總高（超出橫槓範圍）
  const ratio  = logoImage.naturalWidth / logoImage.naturalHeight
  const logoH  = signH * 0.72
  const logoW  = logoH * ratio
  const cx     = CW * DPR / 2
  const signY  = 2 * DPR        // 招牌頂部（貼齊 canvas 頂）
  const signW  = Math.min(logoW + 20 * DPR, (CW - 6) * DPR)

  ctx.save()

  // 招牌底板（深木漆）
  const bx = cx - signW / 2
  ctx.fillStyle = '#2a0e08'
  roundRect(ctx, bx, signY, signW, signH, 6 * DPR)
  ctx.fill()

  // 金邊框
  ctx.strokeStyle = '#c8a050'
  ctx.lineWidth = 2 * DPR
  roundRect(ctx, bx, signY, signW, signH, 6 * DPR)
  ctx.stroke()

  // 內層細邊
  ctx.strokeStyle = 'rgba(200,160,80,0.35)'
  ctx.lineWidth = 1 * DPR
  roundRect(ctx, bx + 4 * DPR, signY + 4 * DPR, signW - 8 * DPR, signH - 8 * DPR, 4 * DPR)
  ctx.stroke()

  // 四角裝飾釘
  const dotR = 3 * DPR
  const corners = [
    [bx + 8 * DPR, signY + 8 * DPR],
    [bx + signW - 8 * DPR, signY + 8 * DPR],
    [bx + 8 * DPR, signY + signH - 8 * DPR],
    [bx + signW - 8 * DPR, signY + signH - 8 * DPR],
  ] as const
  ctx.fillStyle = '#c8a050'
  for (const [dx, dy] of corners) {
    ctx.beginPath(); ctx.arc(dx, dy, dotR, 0, Math.PI * 2); ctx.fill()
  }

  // Logo 圖片（居中）
  const lx = cx - logoW / 2
  const ly = signY + (signH - logoH) / 2
  ctx.globalAlpha = 0.96
  ctx.drawImage(logoImage, lx, ly, logoW, logoH)

  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function drawSlings(ctx: CanvasRenderingContext2D) {
  for (const s of SLINGS) {
    ctx.save()
    ctx.strokeStyle = s.flash > 0 ? '#e8c060' : '#6b2010'
    ctx.lineWidth = (s.flash > 0 ? 4 : 3) * DPR
    ctx.shadowColor = s.flash > 0 ? '#e8c060' : 'transparent'
    ctx.shadowBlur = 8 * DPR
    ctx.beginPath()
    ctx.moveTo(s.x1 * DPR, s.y1 * DPR)
    ctx.lineTo(s.x2 * DPR, s.y2 * DPR)
    ctx.stroke()
    ctx.restore()
  }
}

function drawPegs(ctx: CanvasRenderingContext2D) {
  for (const p of PEGS) {
    ctx.save()
    ctx.fillStyle = '#c8a050'
    ctx.shadowColor = 'rgba(200,160,60,0.4)'
    ctx.shadowBlur = 4 * DPR
    ctx.beginPath()
    ctx.arc(p.x * DPR, p.y * DPR, 4 * DPR, 0, Math.PI * 2)
    ctx.fill()
    // 亮點
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc((p.x - 1) * DPR, (p.y - 1) * DPR, 1.5 * DPR, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function drawSlots(ctx: CanvasRenderingContext2D) {
  const slotY = CH - SLOT_H
  const slotH = SLOT_H
  for (let i = 0; i < SLOTS.length; i++) {
    const s = SLOTS[i]!
    const isWon = ballDead && i === wonSlot.value
    ctx.save()
    ctx.fillStyle = isWon ? s.color : 'rgba(0,0,0,0.7)'
    ctx.shadowColor = isWon ? s.color : 'transparent'
    ctx.shadowBlur = isWon ? 20 * DPR : 0
    ctx.fillRect(s.x * DPR + 1, slotY * DPR, (s.w - 1) * DPR, slotH * DPR)
    ctx.strokeStyle = s.color
    ctx.lineWidth = 1 * DPR
    ctx.strokeRect(s.x * DPR + 1, slotY * DPR, (s.w - 1) * DPR, slotH * DPR)
    // 文字
    ctx.fillStyle = isWon ? '#000' : s.color
    ctx.font = `bold ${6 * DPR}px "Courier New"`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(s.label, (s.x + s.w / 2) * DPR, (slotY + slotH / 2) * DPR)
    ctx.restore()
  }
}

function drawPlunger(ctx: CanvasRenderingContext2D) {
  if (phase.value !== 'idle' && phase.value !== 'ready') return
  const power = plungerDown.value ? Math.min((Date.now() - plungerStart) / 1000, 1) : 0
  const barTop = PLUNGER_BAR_TOP
  const barBot = PLUNGER_BAR_BOTTOM
  const barMaxH = barBot - barTop
  const barW = PLUNGER_BAR_W
  const px = PLUNGER_BAR_X
  const barRight = px + barW / 2
  const ballLeft = LAUNCH_X - BALL_R

  ctx.save()
  // 球左側垂直蓄力條（與球等高、留間距）
  ctx.fillStyle = '#3a3a3a'
  ctx.fillRect((px - barW / 2) * DPR, barTop * DPR, barW * DPR, barMaxH * DPR)

  if (power > 0) {
    const fillH = barMaxH * power
    ctx.fillStyle = `hsl(${120 - power * 120}, 100%, 50%)`
    ctx.shadowColor = ctx.fillStyle
    ctx.shadowBlur = 6 * DPR
    ctx.fillRect(
      (px - barW / 2) * DPR,
      (barBot - fillH) * DPR,
      barW * DPR,
      fillH * DPR,
    )

    // 蓄力時水平拉桿從蓄力條頂向球（不蓋住球心）
    const rodEnd = ballLeft - 1 + power * 6
    ctx.shadowBlur = 0
    ctx.fillStyle = '#aaa'
    ctx.fillRect(
      barRight * DPR,
      (LAUNCH_Y - 2) * DPR,
      Math.max(0, rodEnd - barRight) * DPR,
      4 * DPR,
    )
  }
  ctx.restore()
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  drawBackground(ctx)
  drawWalls(ctx)
  drawSlots(ctx)
  drawSlings(ctx)
  for (const b of BUMPERS) drawBumper(ctx, b)
  drawPegs(ctx)
  drawFlipper(ctx, FL_PX, F_PY, flAngle, leftDown.value)
  drawFlipper(ctx, FR_PX, F_PY, frAngle, rightDown.value)
  drawPlunger(ctx)
  drawBall(ctx)
}

// ─── 遊戲循環 ──────────────────────────────────────────
let rafId = 0
function loop() {
  updatePhysics()
  render()
  rafId = requestAnimationFrame(loop)
}

// ─── 動作 ─────────────────────────────────────────────
function resetBall() {
  bx = LAUNCH_X
  by = LAUNCH_Y
  vx = 0; vy = 0
  ballInPlay = false
  ballDead = false
}

function doLaunch() {
  if (phase.value !== 'ready') return
  const held = Date.now() - plungerStart
  const power = Math.min(held / 1000, 1)
  plungerDown.value = false
  ballInPlay = true
  ballDead = false
  bx = LAUNCH_X
  by = LAUNCH_Y
  vx = -(2.5 + power * 5)
  vy = 0.15
  phase.value = 'playing'
}

watch(plungerDown, (v) => { if (v) plungerStart = Date.now() })

function startGame() {
  score.value = 0
  ballsLeft.value = BALLS_PER_GAME
  multiplier.value = 1
  showEndDialog.value = false
  resetBall()
  phase.value = 'ready'
}

function onPlayAgain() {
  showEndDialog.value = false
  if (ballsLeft.value > 0) {
    resetBall()
    phase.value = 'ready'
    return
  }
  score.value = 0
  ballsLeft.value = BALLS_PER_GAME
  multiplier.value = 1
  resetBall()
  phase.value = 'idle'
}

function goHub() {
  showEndDialog.value = false
  router.push('/')
}

// 鍵盤
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowLeft')  leftDown.value  = true
  if (e.key === '/' || e.key === 'ArrowRight') rightDown.value = true
  if ((e.key === ' ' || e.key === 'x' || e.key === 'X') && phase.value === 'ready') {
    if (!plungerDown.value) { plungerDown.value = true }
  }
}
function onKeyUp(e: KeyboardEvent) {
  if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowLeft')  leftDown.value  = false
  if (e.key === '/' || e.key === 'ArrowRight') rightDown.value = false
  if ((e.key === ' ' || e.key === 'x' || e.key === 'X') && phase.value === 'ready') doLaunch()
}

// canvas 尺寸：依 canvas-frame 可用區等比放大至撐滿
function resizeCanvas() {
  const frame = canvasFrameRef.value
  if (!frame) return
  const styles = getComputedStyle(frame)
  const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
  const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
  const maxW = frame.clientWidth - padX
  const maxH = frame.clientHeight - padY
  if (maxW <= 0 || maxH <= 0) return
  const scale = Math.min(maxW / CW, maxH / CH)
  displayW.value = Math.floor(CW * scale)
  displayH.value = Math.floor(CH * scale)
}

const router = useRouter()

watch(phase, async () => {
  await nextTick()
  resizeCanvas()
})

onMounted(() => {
  loadImages()
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  if (canvasFrameRef.value) {
    const ro = new ResizeObserver(() => resizeCanvas())
    ro.observe(canvasFrameRef.value)
    onUnmounted(() => ro.disconnect())
  }
  rafId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<style scoped>
.pinball-page {
  background: #1c0a08;
}

/* HUD */
.hud {
  background: rgba(20, 8, 4, 0.75);
  border-bottom: 1px solid rgba(180, 100, 40, 0.35);
  backdrop-filter: blur(4px);
}
.hud-label {
  font-size: 0.5rem;
  color: rgba(200, 150, 80, 0.6);
  letter-spacing: 0.18em;
}
.hud-value {
  font-size: 1rem;
  font-weight: 700;
  color: #fde68a;
  text-shadow: 0 1px 6px rgba(180, 100, 20, 0.5);
}
.hud-logo {
  height: 2.4rem;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 1px 6px rgba(180, 100, 20, 0.5));
}

/* 訊息列 */
.msg-bar {
  background: rgba(16, 6, 2, 0.6);
  border-bottom: 1px solid rgba(140, 70, 20, 0.25);
  color: rgba(220, 170, 80, 0.8);
  letter-spacing: 0.25em;
  min-height: 1.6rem;
}

/* Canvas 遊戲區 */
.canvas-frame {
  width: 100%;
  min-height: 0;
}
.canvas-playfield {
  background: rgba(10, 4, 2, 0.5);
  border-radius: 0.75rem;
  border: 1px solid rgba(140, 70, 30, 0.5);
  box-shadow:
    0 0 0 3px rgba(80, 30, 10, 0.8),
    0 0 0 4px rgba(180, 100, 40, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(220, 160, 60, 0.1);
  overflow: visible;
}
.canvas-playfield canvas {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

/* 招牌：絕對定位，底部貼齊 canvas 頂端，往上凸出 */
.billboard-sign {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: -4px;
  z-index: 20;
  filter: drop-shadow(0 -4px 12px rgba(0,0,0,0.6));
}
.billboard-inner {
  background: linear-gradient(180deg, #3a1a08 0%, #2a0e04 100%);
  border: 2px solid #c8a050;
  border-radius: 10px;
  padding: 6px 14px;
  box-shadow:
    inset 0 1px 0 rgba(255,210,100,0.2),
    0 0 0 1px rgba(200,160,80,0.25);
  position: relative;
}
/* 內層金邊裝飾 */
.billboard-inner::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(200,160,80,0.3);
  border-radius: 6px;
  pointer-events: none;
}
.billboard-logo {
  display: block;
  width: clamp(2.5rem, 12vw, 3.5rem);
  height: clamp(2.5rem, 12vw, 3.5rem);
  object-fit: cover;
  object-position: center;
  border-radius: 6px;
}

/* 觸控彈板：緊貼底部獎項槽（9折／飲料…）正上方 */
.flipper-btn {
  position: absolute;
  bottom: calc(var(--slot-bottom-pct) - 10%);
  width: 2.5rem;
  height: 1.75rem;
  transform: translate(-50%, calc(-100% - 2.5rem));
  background: linear-gradient(180deg, rgba(100, 30, 10, 0.85), rgba(60, 15, 5, 0.9));
  border: 1px solid rgba(180, 100, 40, 0.6);
  color: #fde68a;
  font-size: 0.8125rem;
  border-radius: 0.375rem;
  cursor: pointer;
  z-index: 10;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.1s, box-shadow 0.1s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
.flipper-btn:active {
  background: linear-gradient(180deg, rgba(180, 80, 20, 0.85), rgba(100, 40, 10, 0.9));
  box-shadow: 0 0 12px rgba(220, 160, 60, 0.4);
}
.flipper-btn--left  { left: var(--flipper-btn-left); }
.flipper-btn--right { left: var(--flipper-btn-right); }

.pinball-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* 餐廳風格按鈕（與酒杯遊戲相同） */
.restaurant-btn {
  background: linear-gradient(180deg, #92400e, #6b2d07);
  border: 1px solid #d97706;
  color: #fde68a;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 200, 80, 0.2);
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  min-height: 2.5rem;
}
.restaurant-btn:active {
  background: linear-gradient(180deg, #6b2d07, #4a1c04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transform: translateY(1px);
}
</style>
