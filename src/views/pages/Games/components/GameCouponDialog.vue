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

          <div
            v-if="prizeTitle"
            class="prize-block"
            :aria-label="t('games.coupon.prizeLabel')"
          >
            <p class="prize-block__label">{{ t('games.coupon.prizeLabel') }}</p>
            <p class="prize-block__title">{{ prizeTitle }}</p>
            <p
              v-if="prizeSubtitle"
              class="prize-block__subtitle"
            >
              {{ prizeSubtitle }}
            </p>
          </div>

          <div class="win-dialog-actions mt-5 grid w-full gap-2 sm:mt-6 sm:gap-3">
            <button
              type="button"
              class="win-dialog-btn win-dialog-btn--primary inline-flex min-h-8 w-full items-center justify-center rounded-md bg-[var(--on-black)] px-3 py-2 text-sm font-medium text-[var(--on-cream)] transition-colors hover:bg-black/85"
              @click="emit('playAgain')"
            >
              {{ playAgainLabel || t('common.playAgain') }}
            </button>
            <button
              type="button"
              class="win-dialog-btn inline-flex h-8 w-full items-center justify-center rounded-md border border-black/20 bg-[var(--on-white)] px-3 text-sm font-medium text-[var(--on-black)] transition-colors hover:bg-black hover:text-[var(--on-cream)]"
              @click="emit('goHub')"
            >
              {{ t('common.backToHub') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    visible: boolean
    title: string
    message: string
    prizeTitle?: string
    prizeSubtitle?: string
    titleId?: string
    playAgainLabel?: string
  }>(),
  {
    prizeTitle: '',
    prizeSubtitle: '',
    titleId: 'game-coupon-dialog-title',
    playAgainLabel: '',
  },
)

const emit = defineEmits<{
  playAgain: []
  goHub: []
}>()

const { t } = useI18n()
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

.prize-block {
  margin-top: 1rem;
  border-radius: 0.75rem;
  border: 2px solid var(--on-black);
  background: var(--on-white);
  padding: 0.85rem 1rem;
  text-align: center;
}

.prize-block__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgb(0 0 0 / 0.45);
  text-transform: uppercase;
}

.prize-block__title {
  margin-top: 0.35rem;
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 3.8vw, 1.25rem);
  font-weight: 700;
  line-height: 1.35;
  color: var(--on-black);
}

.prize-block__subtitle {
  margin-top: 0.35rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgb(0 0 0 / 0.72);
}

.win-dialog-btn {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  flex-shrink: 1;
  white-space: normal;
}
</style>
