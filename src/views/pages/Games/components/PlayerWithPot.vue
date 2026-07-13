<template>
  <svg
    class="player-with-pot"
    viewBox="0 0 120 100"
    preserveAspectRatio="xMidYMax meet"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <ellipse cx="60" cy="94" rx="42" ry="5" fill="rgb(0 0 0 / 0.28)" />

    <!-- 蒸汽 -->
    <path
      d="M42 22 C40 14 46 10 48 16"
      fill="none"
      stroke="rgb(240 232 226 / 0.7)"
      stroke-width="3"
      stroke-linecap="round"
      class="steam steam--1"
    />
    <path
      d="M60 18 C58 8 66 6 68 14"
      fill="none"
      stroke="rgb(255 255 255 / 0.75)"
      stroke-width="3.5"
      stroke-linecap="round"
      class="steam steam--2"
    />
    <path
      d="M78 22 C76 12 84 10 86 18"
      fill="none"
      stroke="rgb(240 232 226 / 0.65)"
      stroke-width="3"
      stroke-linecap="round"
      class="steam steam--3"
    />

    <!-- 鍋耳 -->
    <path
      d="M18 48 C8 48 8 62 18 62"
      fill="none"
      stroke="#000000"
      stroke-width="7"
      stroke-linecap="round"
    />
    <path
      d="M102 48 C112 48 112 62 102 62"
      fill="none"
      stroke="#000000"
      stroke-width="7"
      stroke-linecap="round"
    />

    <!-- 鐵鍋身 -->
    <ellipse cx="60" cy="52" rx="44" ry="14" fill="#111111" />
    <path
      d="M16 52 L22 78 Q60 96 98 78 L104 52"
      fill="#1a1a1a"
      stroke="#000000"
      stroke-width="2"
    />
    <ellipse cx="60" cy="52" rx="40" ry="11" fill="#f0e8e2" opacity="0.95" />
    <ellipse cx="60" cy="50" rx="34" ry="8" fill="#ffffff" opacity="0.85" />
    <ellipse cx="52" cy="48" rx="10" ry="3" fill="rgb(255 255 255 / 0.45)" />
  </svg>
</template>

<style scoped>
.player-with-pot {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.steam {
  animation: steam-rise 2.2s ease-in-out infinite;
}

.steam--2 {
  animation-delay: 0.4s;
}

.steam--3 {
  animation-delay: 0.8s;
}

@keyframes steam-rise {
  0%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  50% {
    opacity: 0.85;
    transform: translateY(-4px);
  }
}
</style>
