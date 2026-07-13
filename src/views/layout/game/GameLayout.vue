<template>
  <div class="game-layout h-dvh max-h-dvh w-full overflow-hidden">
    <slot />
    <EmailGateDialog
      :visible="playerStore.emailPromptVisible"
      @confirmed="onEmailConfirmed"
    />
    <div
      v-if="playerStore.couponSending && !playerStore.emailPromptVisible"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="status"
      aria-live="polite"
    >
      <p class="rounded-xl border bg-background px-6 py-4 text-sm font-medium text-foreground shadow-xl sm:text-base">
        正在寄送優惠券…
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import EmailGateDialog from '@/views/pages/Games/components/EmailGateDialog.vue'
import { usePlayerStore } from '@/stores/playerStore'

const playerStore = usePlayerStore()

function onEmailConfirmed() {
  playerStore.confirmEmailPrompt()
}
</script>
