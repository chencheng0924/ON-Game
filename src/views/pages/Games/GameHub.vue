<template>
  <main class="game-hub relative h-full max-h-full overflow-hidden">
    <div
      class="game-hub__bg"
      :style="hubBgStyle"
      aria-hidden="true"
    />
    <div class="game-hub__atmosphere" aria-hidden="true" />

    <div class="game-hub__inner relative z-10">
      <header class="game-hub__hero">
        <img
          class="game-hub__logo"
          :src="onLogo"
          alt="ON"
        >
        <p class="game-hub__brand-sub">{{ t('games.hub.brandSub') }}</p>
        <h1 class="game-hub__headline">
          {{ t('games.hub.headline') }}
        </h1>
      </header>

      <nav
        class="game-hub__menu"
        :aria-label="t('games.hub.menuAria')"
      >
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="game-menu-card"
        >
          <img
            class="game-menu-card__image"
            :src="item.image"
            :alt="item.title"
          >
          <span class="game-menu-card__title">{{ item.title }}</span>
          <span class="game-menu-card__desc">{{ item.description }}</span>
        </RouterLink>
      </nav>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMediaQuery } from '@vueuse/core'
import koreanTofuPot from '@/assets/food/korean-tofu-pot.jpg'
import { PAGE_BG, STORE_IMAGES } from '@/views/pages/Games/gameStore.config'

const onLogo = STORE_IMAGES.logo

const { t } = useI18n()
const isMobile = useMediaQuery('(max-width: 767px)')
const hubBg = computed(() => (isMobile.value ? PAGE_BG.hubMobile : PAGE_BG.hub))
const hubBgStyle = computed(() => ({
  backgroundImage: `url(${hubBg.value})`,
  backgroundPosition: isMobile.value ? 'center center' : 'center 45%',
}))

const menuItems = computed(() => [
  {
    path: '/boilCatch',
    title: t('games.hub.boil.title'),
    description: t('games.hub.boil.description'),
    image: koreanTofuPot,
  },
  {
    path: '/mbtiQuiz',
    title: t('games.hub.mbti.title'),
    description: t('games.hub.mbti.description'),
    image: STORE_IMAGES.exterior,
  },
])
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

.game-hub__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center 55%;
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

.game-hub__logo {
  display: block;
  width: min(9.5rem, 42vw);
  height: auto;
  margin: 0 auto;
  filter: drop-shadow(0 4px 28px rgb(0 0 0 / 0.55));
  animation: brand-breathe 4.5s ease-in-out infinite;
}

.game-hub__brand-sub {
  margin-top: 0.55rem;
  font-size: clamp(0.75rem, 2.8vw, 0.9rem);
  letter-spacing: 0.28em;
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
  letter-spacing: 0.02em;
  color: var(--on-cream);
  text-shadow: 0 2px 16px rgb(0 0 0 / 0.55);
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
  min-height: clamp(10.5rem, 28vh, 12.5rem);
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.45rem;
  border-radius: 1.1rem;
  border: 1px solid rgb(0 0 0 / 0.12);
  background: rgb(240 232 226 / 0.94);
  backdrop-filter: blur(10px);
  padding: clamp(0.75rem, 2.5vw, 1rem) clamp(0.75rem, 2.5vw, 1rem) clamp(1rem, 3vw, 1.25rem);
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

.game-menu-card__image {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 0.65rem;
  background: rgb(0 0 0 / 0.06);
}

.game-menu-card__title {
  font-family: var(--font-display);
  font-size: clamp(0.95rem, 3.2vw, 1.1rem);
  font-weight: 700;
  line-height: 1.3;
  color: var(--on-black);
}

.game-menu-card__desc {
  max-width: 100%;
  padding: 0 0.15rem;
  font-size: clamp(0.72rem, 2.4vw, 0.8rem);
  line-height: 1.45;
  color: rgb(0 0 0 / 0.62);
  word-break: keep-all;
  overflow-wrap: anywhere;
}

@keyframes brand-breathe {
  0%,
  100% {
    filter: drop-shadow(0 4px 24px rgb(0 0 0 / 0.4));
  }
  50% {
    filter: drop-shadow(0 6px 36px rgb(0 0 0 / 0.65));
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
