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
      :style="{ objectPosition, objectFit }"
      alt=""
    >
    <div class="store-bg__overlay store-bg__overlay--top" />
    <div class="store-bg__overlay store-bg__overlay--vignette" />
    <div class="store-bg__overlay store-bg__overlay--bottom" />
    <div class="store-bg__overlay store-bg__overlay--cream" />
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
    objectFit?: 'cover' | 'contain'
    /** light：主頁等需多露出店面細節時使用 */
    intensity?: 'default' | 'light'
    /** game：背景霧化，遊戲頁使用 */
    variant?: 'default' | 'game'
  }>(),
  {
    objectPosition: 'center 42%',
    objectFit: 'cover',
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
  transform: scale(1.02);
}

.store-bg__overlay {
  position: absolute;
  inset: 0;
}

.store-bg__overlay--top {
  background: linear-gradient(
    to bottom,
    rgb(0 0 0 / 0.38) 0%,
    rgb(0 0 0 / 0.12) 22%,
    transparent 48%
  );
}

.store-bg__overlay--vignette {
  background: radial-gradient(
    ellipse 95% 80% at 50% 45%,
    transparent 45%,
    rgb(0 0 0 / 0.22) 100%
  );
}

.store-bg__overlay--bottom {
  background: linear-gradient(
    to top,
    rgb(0 0 0 / 0.4) 0%,
    rgb(0 0 0 / 0.12) 32%,
    transparent 58%
  );
}

.store-bg__overlay--cream {
  background: linear-gradient(
    to bottom,
    rgb(240 232 226 / 0.12) 0%,
    transparent 40%,
    rgb(240 232 226 / 0.14) 100%
  );
  mix-blend-mode: soft-light;
}

.store-bg--game .store-bg__image {
  filter: none;
  transform: scale(1.02);
}

.store-bg--game .store-bg__overlay--top {
  background: linear-gradient(
    to bottom,
    rgb(0 0 0 / 0.28) 0%,
    rgb(0 0 0 / 0.08) 20%,
    transparent 45%
  );
}

.store-bg--game .store-bg__overlay--vignette {
  background: radial-gradient(
    ellipse 95% 80% at 50% 45%,
    transparent 50%,
    rgb(0 0 0 / 0.16) 100%
  );
}

.store-bg--game .store-bg__overlay--bottom {
  background: linear-gradient(
    to top,
    rgb(0 0 0 / 0.28) 0%,
    rgb(0 0 0 / 0.08) 30%,
    transparent 58%
  );
}

.store-bg__overlay--frost {
  background: linear-gradient(
    to bottom,
    rgb(240 232 226 / 0.06) 0%,
    transparent 50%,
    rgb(240 232 226 / 0.08) 100%
  );
}

.store-bg--light .store-bg__overlay--top {
  background: linear-gradient(
    to bottom,
    rgb(0 0 0 / 0.28) 0%,
    rgb(0 0 0 / 0.08) 26%,
    transparent 52%
  );
}

.store-bg--light .store-bg__overlay--vignette {
  background: radial-gradient(
    ellipse 98% 85% at 50% 48%,
    transparent 50%,
    rgb(0 0 0 / 0.16) 100%
  );
}

.store-bg--light .store-bg__overlay--bottom {
  background: linear-gradient(
    to top,
    rgb(0 0 0 / 0.28) 0%,
    rgb(0 0 0 / 0.08) 34%,
    transparent 62%
  );
}
</style>
