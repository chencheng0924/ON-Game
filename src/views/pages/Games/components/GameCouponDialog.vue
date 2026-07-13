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
          class="win-dialog-panel mx-auto box-border w-[min(100%,20rem)] shrink-0 rounded-xl border bg-background p-5 text-foreground shadow-xl sm:w-[min(100%,22rem)] sm:p-6 md:w-[min(100%,24rem)] md:p-8"
        >
          <h2
            :id="titleId"
            class="text-center text-lg font-bold sm:text-xl md:text-2xl"
          >
            {{ title }}
          </h2>
          <p class="mt-2 text-center text-sm text-muted-foreground sm:mt-3 sm:text-base">
            {{ message }}
          </p>
          <div class="win-dialog-actions mt-5 grid w-full gap-2 sm:mt-6 sm:gap-3">
            <button
              type="button"
              class="win-dialog-btn win-dialog-btn--primary inline-flex h-8 w-full items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              @click="emit('playAgain')"
            >
              再玩一次
            </button>
            <button
              type="button"
              class="win-dialog-btn inline-flex h-8 w-full items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
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
  }>(),
  { titleId: 'game-coupon-dialog-title' },
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
