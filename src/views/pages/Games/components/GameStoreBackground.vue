<template>
  <div
    class="store-bg"
    :class="[
      `store-bg--${intensity}`,
      { 'store-bg--game': variant === 'game' },
    ]"
    aria-hidden="true"
  >
    <img
      class="store-bg__image"
      :src="src"
      :style="{ objectPosition }"
      alt=""
    >
    <div class="store-bg__overlay store-bg__overlay--top" />
    <div class="store-bg__overlay store-bg__overlay--vignette" />
    <div class="store-bg__overlay store-bg__overlay--bottom" />
    <div class="store-bg__overlay store-bg__overlay--warm" />
    <div
      v-if="variant === 'game'"
      class="store-bg__overlay store-bg__overlay--frost"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    src: string
    objectPosition?: string
    /** light：主頁等需多露出店面細節時使用 */
    intensity?: 'default' | 'light'
    /** game：背景霧化，遊戲頁使用 */
    variant?: 'default' | 'game'
  }>(),
  {
    objectPosition: 'center 42%',
    intensity: 'default',
    variant: 'default',
  },
)
</script>

<style scoped>
.store-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.store-bg__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.06);
}

.store-bg__overlay {
  position: absolute;
  inset: 0;
}

.store-bg__overlay--top {
  background: linear-gradient(
    to bottom,
    rgb(15 23 42 / 0.82) 0%,
    rgb(15 23 42 / 0.35) 18%,
    transparent 42%
  );
}

.store-bg__overlay--vignette {
  background: radial-gradient(
    ellipse 90% 75% at 50% 45%,
    transparent 35%,
    rgb(15 23 42 / 0.45) 100%
  );
}

.store-bg__overlay--bottom {
  background: linear-gradient(
    to top,
    rgb(15 23 42 / 0.72) 0%,
    rgb(15 23 42 / 0.25) 28%,
    transparent 55%
  );
}

.store-bg__overlay--warm {
  background: linear-gradient(
    to bottom,
    rgb(180 83 9 / 0.08) 0%,
    transparent 40%,
    rgb(120 53 15 / 0.12) 100%
  );
  mix-blend-mode: soft-light;
}

.store-bg--game .store-bg__image {
  filter: blur(3px);
  transform: scale(1.07);
}

.store-bg--game .store-bg__overlay--top {
  background: linear-gradient(
    to bottom,
    rgb(15 23 42 / 0.65) 0%,
    rgb(15 23 42 / 0.22) 18%,
    transparent 42%
  );
}

.store-bg--game .store-bg__overlay--vignette {
  background: radial-gradient(
    ellipse 90% 75% at 50% 45%,
    transparent 45%,
    rgb(15 23 42 / 0.28) 100%
  );
}

.store-bg--game .store-bg__overlay--bottom {
  background: linear-gradient(
    to top,
    rgb(15 23 42 / 0.55) 0%,
    rgb(15 23 42 / 0.15) 28%,
    transparent 55%
  );
}

.store-bg__overlay--frost {
  background: linear-gradient(
    to bottom,
    rgb(15 23 42 / 0.1) 0%,
    rgb(15 23 42 / 0.05) 50%,
    rgb(15 23 42 / 0.12) 100%
  );
  backdrop-filter: blur(1px);
}

.store-bg--light .store-bg__overlay--top {
  background: linear-gradient(
    to bottom,
    rgb(15 23 42 / 0.72) 0%,
    rgb(15 23 42 / 0.28) 22%,
    transparent 48%
  );
}

.store-bg--light .store-bg__overlay--vignette {
  background: radial-gradient(
    ellipse 95% 80% at 50% 48%,
    transparent 40%,
    rgb(15 23 42 / 0.35) 100%
  );
}

.store-bg--light .store-bg__overlay--bottom {
  background: linear-gradient(
    to top,
    rgb(15 23 42 / 0.62) 0%,
    rgb(15 23 42 / 0.18) 30%,
    transparent 58%
  );
}
</style>
