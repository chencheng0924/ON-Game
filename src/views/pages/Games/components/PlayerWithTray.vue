<template>
  <svg
    class="player-with-tray"
    viewBox="0 0 100 130"
    preserveAspectRatio="xMidYMax meet"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- 托盤陰影 -->
    <ellipse
      cx="50"
      cy="126"
      rx="38"
      ry="4"
      fill="rgb(0 0 0 / 0.22)"
    />

    <!-- 托盤（接取區視覺） -->
    <ellipse
      cx="50"
      cy="110"
      rx="44"
      ry="10"
      fill="#d97706"
    />
    <ellipse
      cx="50"
      cy="107"
      rx="40"
      ry="7"
      fill="#fbbf24"
    />
    <ellipse
      cx="50"
      cy="104"
      rx="36"
      ry="5"
      fill="#fde68a"
    />

    <!-- 左臂托盤 -->
    <path
      d="M34 46 C26 62 20 88 18 102"
      fill="none"
      stroke="#e8b88a"
      stroke-width="5"
      stroke-linecap="round"
    />
    <!-- 右臂托盤 -->
    <path
      d="M66 46 C74 62 80 88 82 102"
      fill="none"
      stroke="#e8b88a"
      stroke-width="5"
      stroke-linecap="round"
    />

    <!-- 身體 -->
    <path
      d="M36 40 H64 L60 76 H40 Z"
      fill="#2563eb"
    />
    <!-- 圍裙 -->
    <path
      d="M40 50 H60 L58 82 H42 Z"
      fill="#f8fafc"
    />

    <!-- 腿 -->
    <rect
      x="41"
      y="76"
      width="8"
      height="24"
      rx="2"
      fill="#1e3a5f"
    />
    <rect
      x="51"
      y="76"
      width="8"
      height="24"
      rx="2"
      fill="#1e3a5f"
    />

    <!-- 頭 -->
    <circle
      cx="50"
      cy="26"
      r="14"
      fill="#fcd9b6"
      stroke="#e8b88a"
      stroke-width="1.5"
    />
    <!-- 廚師帽 -->
    <path
      d="M36 20 H64 L62 14 H38 Z"
      fill="#f8fafc"
      stroke="#cbd5e1"
      stroke-width="1"
    />
    <rect
      x="34"
      y="18"
      width="32"
      height="5"
      rx="1"
      fill="#f8fafc"
      stroke="#cbd5e1"
      stroke-width="1"
    />

    <!-- 臉部 -->
    <circle cx="44" cy="26" r="1.8" fill="#475569" />
    <circle cx="56" cy="26" r="1.8" fill="#475569" />
    <path
      d="M46 32 Q50 35 54 32"
      fill="none"
      stroke="#475569"
      stroke-width="1.2"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.player-with-tray {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
