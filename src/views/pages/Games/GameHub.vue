<template>
  <main class="game-hub relative h-full max-h-full overflow-hidden">
    <GameStoreBackground
      :src="hubBg"
      :object-position="isMobile ? 'center center' : 'center 45%'"
      object-fit="cover"
      intensity="light"
    />
    <div class="game-hub__atmosphere" aria-hidden="true" />

    <div class="game-hub__inner relative z-10">
      <header class="game-hub__hero">
        <p class="game-hub__brand">ON</p>
        <p class="game-hub__brand-sub">溫 · 온 · GAME</p>
        <h1 class="game-hub__headline">
          一碗熱湯，重新開啟你的夜晚
        </h1>
        <p class="game-hub__subtitle">
          選擇一款遊戲，熬出屬於你的 ON 時刻
        </p>
      </header>

      <nav
        class="game-hub__menu"
        aria-label="遊戲選單"
      >
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="game-menu-card"
        >
          <span class="game-menu-card__icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="game-menu-card__title">{{ item.title }}</span>
          <span class="game-menu-card__desc">{{ item.description }}</span>
        </RouterLink>
      </nav>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import GameStoreBackground from '@/views/pages/Games/components/GameStoreBackground.vue'
import { PAGE_BG } from '@/views/pages/Games/gameStore.config'

const isMobile = useMediaQuery('(max-width: 767px)')
const hubBg = computed(() => (isMobile.value ? PAGE_BG.hubMobile : PAGE_BG.hub))

const menuItems = [
  {
    path: '/boilCatch',
    title: '熬煮時間與食材',
    description: '左右滑動鐵鍋，接住新鮮食材、閃避劣質調味粉',
    icon: '🍲',
  },
  {
    path: '/mbtiQuiz',
    title: 'MBTI 韓式吃貨人格',
    description: '八題測驗，找出你的湯飯靈魂型別',
    icon: '🌶️',
  },
] as const
</script>

<style scoped>
.game-hub {
  box-sizing: border-box;
  display: flex;
  height: 100%;
  width: 100%;
  max-width: 100vw;
  align-items: stretch;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
  color: var(--on-cream);
  padding:
    max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
}

.game-hub__atmosphere {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    radial-gradient(ellipse 70% 45% at 50% 8%, rgb(240 232 226 / 0.28), transparent 55%),
    linear-gradient(180deg, rgb(0 0 0 / 0.32) 0%, rgb(0 0 0 / 0.12) 42%, rgb(0 0 0 / 0.4) 100%);
  animation: atmosphere-pulse 8s ease-in-out infinite;
}

.game-hub__inner {
  box-sizing: border-box;
  position: relative;
  z-index: 10;
  display: flex;
  width: min(100%, 40rem);
  min-height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(1.75rem, 5vh, 3rem);
  margin: auto;
  padding: clamp(0.75rem, 3vh, 2rem) 0;
}

.game-hub__hero {
  width: 100%;
  max-width: 28rem;
  text-align: center;
}

.game-hub__brand {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 16vw, 5.5rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 0.95;
  color: var(--on-white);
  text-shadow: 0 4px 28px rgb(0 0 0 / 0.55);
  animation: brand-breathe 4.5s ease-in-out infinite;
}

.game-hub__brand-sub {
  margin-top: 0.35rem;
  font-size: clamp(0.75rem, 2.8vw, 0.9rem);
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--on-cream);
  font-weight: 600;
}

.game-hub__headline {
  margin-top: 1rem;
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 3.8vw, 1.35rem);
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: 0.04em;
  color: var(--on-cream);
  text-shadow: 0 2px 16px rgb(0 0 0 / 0.55);
}

.game-hub__subtitle {
  margin-top: 0.5rem;
  font-size: clamp(0.85rem, 2.8vw, 1rem);
  line-height: 1.55;
  color: rgb(240 232 226 / 0.82);
}

.game-hub__menu {
  box-sizing: border-box;
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: 1fr;
  gap: clamp(0.85rem, 2.5vw, 1.25rem);
  justify-items: center;
}

@media (min-width: 520px) {
  .game-hub__menu {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 36rem;
  }
}

.game-menu-card {
  position: relative;
  box-sizing: border-box;
  display: flex;
  width: 100%;
  max-width: 18rem;
  min-width: 0;
  min-height: clamp(7.5rem, 22vh, 9.5rem);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 1.1rem;
  border: 1px solid rgb(0 0 0 / 0.12);
  background: rgb(240 232 226 / 0.94);
  backdrop-filter: blur(10px);
  padding: clamp(1rem, 3vw, 1.5rem) clamp(0.875rem, 2.5vw, 1.25rem);
  text-align: center;
  text-decoration: none;
  color: var(--on-black);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  animation: card-rise 0.7s ease both;
}

.game-menu-card:nth-child(2) {
  animation-delay: 0.12s;
}

@media (min-width: 520px) {
  .game-menu-card {
    max-width: none;
  }
}

.game-menu-card:hover {
  transform: translateY(-4px);
  background: var(--on-white);
  border-color: var(--on-black);
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.28);
}

.game-menu-card:active {
  transform: translateY(-1px);
}

.game-menu-card__icon {
  font-size: clamp(1.85rem, 7vw, 2.75rem);
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.12));
}

.game-menu-card__title {
  font-family: var(--font-display);
  font-size: clamp(1rem, 3.5vw, 1.15rem);
  font-weight: 700;
  line-height: 1.3;
  color: var(--on-black);
}

.game-menu-card__desc {
  max-width: 100%;
  padding: 0 0.25rem;
  font-size: clamp(0.75rem, 2.5vw, 0.8125rem);
  line-height: 1.45;
  color: rgb(0 0 0 / 0.62);
  word-break: keep-all;
  overflow-wrap: anywhere;
}

@keyframes brand-breathe {
  0%,
  100% {
    text-shadow: 0 4px 24px rgb(0 0 0 / 0.4);
  }
  50% {
    text-shadow: 0 6px 36px rgb(0 0 0 / 0.65), 0 0 40px rgb(240 232 226 / 0.2);
  }
}

@keyframes atmosphere-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

@keyframes card-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
