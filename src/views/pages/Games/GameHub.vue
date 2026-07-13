<template>
  <main class="game-hub relative h-full max-h-full">
    <GameStoreBackground
      :src="PAGE_BG.hub"
      object-position="center 55%"
      intensity="light"
    />
    <div class="game-hub__inner relative z-10">
      <header class="game-hub__header flex flex-col items-center justify-center">
        <img src="@/assets/logo.png" alt="TTAN GAME" class=" h-[100px] object-cover"></img>
        <h1 class="game-hub__title">
          TTAN GAME
        </h1>
        <p class="game-hub__subtitle">
          選擇一個遊戲開始遊玩
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
          :class="{ 'game-menu-card--soon': item.comingSoon }"
        >
          <span class="game-menu-card__icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="game-menu-card__title">{{ item.title }}</span>
          <span class="game-menu-card__desc">{{ item.description }}</span>
          <span
            v-if="item.comingSoon"
            class="game-menu-card__badge"
          >
            即將推出
          </span>
        </RouterLink>
      </nav>
    </div>
  </main>
</template>

<script setup lang="ts">
import GameStoreBackground from '@/views/pages/Games/components/GameStoreBackground.vue'
import { PAGE_BG } from '@/views/pages/Games/gameStore.config'

const menuItems = [
  {
    path: '/wineGlass',
    title: '酒杯遊戲',
    description: '5 秒交換後猜硬幣在哪個酒杯',
    icon: '🍶',
    comingSoon: false,
  },
  {
    path: '/coinCatch',
    title: '接菜品',
    description: '接住 TTAN 料理、避開非 TTAN 料理',
    icon: '🍱',
    comingSoon: false,
  },
  {
    path: '/pinball',
    title: '彈珠台',
    description: '打彈珠，獲得折價券',
    icon: '🎱',
    comingSoon: false,
  },
  {
    path: '/cardGuess',
    title: '猜菜品',
    description: '配對全部料理牌',
    icon: '🃏',
    comingSoon: false,
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
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
  color: white;
  padding:
    max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
}

.game-hub__inner {
  box-sizing: border-box;
  display: flex;
  width: min(100%, 40rem);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(1.5rem, 4vh, 2.5rem);
  margin: auto;
  padding: clamp(0.5rem, 2vh, 1.5rem) 0;
}

.game-hub__header {
  width: 100%;
  max-width: 28rem;
  text-align: center;
}

.game-hub__title {
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.5);
}

.game-hub__subtitle {
  margin-top: 0.5rem;
  font-size: clamp(0.875rem, 2.8vw, 1.0625rem);
  line-height: 1.5;
  color: rgb(203 213 225);
}

.game-hub__menu {
  box-sizing: border-box;
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: 1fr;
  gap: clamp(0.75rem, 2.5vw, 1.25rem);
  justify-items: center;
}

@media (min-width: 480px) {
  .game-hub__menu {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 36rem;
  }
}

@media (min-width: 1024px) {
  .game-hub__inner {
    width: min(100%, 44rem);
    gap: clamp(2rem, 5vh, 3rem);
  }

  .game-hub__menu {
    max-width: 40rem;
    gap: 1.25rem;
  }
}

.game-menu-card {
  position: relative;
  box-sizing: border-box;
  display: flex;
  width: 100%;
  max-width: 18rem;
  min-width: 0;
  min-height: clamp(6.75rem, 20vh, 8.5rem);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 1rem;
  border: 1px solid rgb(180 83 9 / 0.35);
  background: rgb(30 41 59 / 0.72);
  backdrop-filter: blur(8px);
  padding: clamp(1rem, 3vw, 1.5rem) clamp(0.875rem, 2.5vw, 1.25rem);
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 480px) {
  .game-menu-card {
    max-width: none;
  }
}

.game-menu-card:hover {
  transform: translateY(-2px);
  border-color: rgb(251 191 36 / 0.55);
  background: rgb(51 65 85 / 0.85);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.25);
}

.game-menu-card:active {
  transform: translateY(0);
}

.game-menu-card--soon {
  opacity: 0.92;
}

.game-menu-card__icon {
  font-size: clamp(1.75rem, 7vw, 2.75rem);
  line-height: 1;
}

.game-menu-card__title {
  font-size: clamp(1rem, 3.5vw, 1.125rem);
  font-weight: 700;
  line-height: 1.3;
}

.game-menu-card__desc {
  max-width: 100%;
  padding: 0 0.25rem;
  font-size: clamp(0.75rem, 2.5vw, 0.8125rem);
  line-height: 1.4;
  color: rgb(203 213 225);
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.game-menu-card__badge {
  position: absolute;
  top: clamp(0.5rem, 2vw, 0.75rem);
  right: clamp(0.5rem, 2vw, 0.75rem);
  max-width: calc(100% - 1rem);
  border-radius: 9999px;
  background: rgb(71 85 105 / 0.9);
  padding: 0.2rem 0.5rem;
  font-size: clamp(0.625rem, 2vw, 0.6875rem);
  line-height: 1.2;
  color: rgb(226 232 240);
  white-space: nowrap;
}

@media (max-width: 359px) {
  .game-menu-card__badge {
    position: static;
    margin-top: 0.25rem;
    white-space: normal;
  }
}
</style>
