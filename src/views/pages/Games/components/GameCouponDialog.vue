<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="win-dialog-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div
          class="win-dialog-panel mx-auto box-border w-[min(100%,20rem)] shrink-0 rounded-xl border border-black/10 bg-[var(--on-cream)] p-5 text-[var(--on-black)] shadow-xl sm:w-[min(100%,22rem)] sm:p-6 md:w-[min(100%,24rem)] md:p-8"
        >
          <h2
            :id="titleId"
            class="text-center text-lg font-bold sm:text-xl md:text-2xl"
          >
            {{ title }}
          </h2>
          <p class="mt-2 whitespace-pre-line text-center text-sm text-black/65 sm:mt-3 sm:text-base">
            {{ message }}
          </p>
          <div class="win-dialog-actions mt-5 grid w-full gap-2 sm:mt-6 sm:gap-3">
            <button
              type="button"
              class="win-dialog-btn win-dialog-btn--primary inline-flex min-h-8 w-full items-center justify-center rounded-md bg-[var(--on-black)] px-3 py-2 text-sm font-medium text-[var(--on-cream)] transition-colors hover:bg-black/85"
              @click="emit('playAgain')"
            >
              {{ playAgainLabel }}
            </button>
            <button
              type="button"
              class="win-dialog-btn inline-flex h-8 w-full items-center justify-center rounded-md border border-black/20 bg-[var(--on-white)] px-3 text-sm font-medium text-[var(--on-black)] transition-colors hover:bg-black hover:text-[var(--on-cream)]"
              @click="emit('goHub')"
            >
              返回遊戲中心
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    title: string
    message: string
    titleId?: string
    playAgainLabel?: string
  }>(),
  {
    titleId: 'game-coupon-dialog-title',
    playAgainLabel: '再玩一次',
  },
)

const emit = defineEmits<{
  playAgain: []
  goHub: []
}>()
</script>

<style scoped>
.win-dialog-overlay {
  padding: max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
}

.win-dialog-panel {
  overflow: hidden;
  max-height: min(90dvh, 100%);
}

.win-dialog-btn {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  flex-shrink: 1;
  white-space: normal;
}
</style>
