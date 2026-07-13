<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="email-gate-overlay fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-gate-title"
    >
      <div
        class="email-gate-panel mx-auto w-[min(100%,22rem)] rounded-xl border bg-background p-6 text-foreground shadow-xl sm:w-[min(100%,24rem)] sm:p-8"
      >
        <h2 id="email-gate-title" class="text-center text-lg font-bold sm:text-xl">
          恭喜通關！
        </h2>
        <p class="mt-2 text-center text-sm text-muted-foreground sm:text-base">
          請填寫 Email，我們將寄送優惠券至您的信箱。
        </p>

        <form class="mt-5 space-y-4" @submit.prevent="onSubmit">
          <div>
            <label for="player-email" class="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="player-email"
              v-model="emailInput"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="your@email.com"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              :disabled="playerStore.couponSending"
              :aria-invalid="!!errorText"
            />
            <p v-if="errorText" class="mt-1.5 text-sm text-destructive">
              {{ errorText }}
            </p>
          </div>

          <button
            type="submit"
            class="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            :disabled="playerStore.couponSending"
          >
            {{ playerStore.couponSending ? '正在寄送優惠券…' : '發送優惠券' }}
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VerificationExtension } from '@/utils/VerificationExtension'
import { usePlayerStore } from '@/stores/playerStore'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  confirmed: []
}>()

const playerStore = usePlayerStore()
const emailInput = ref(playerStore.email)
const errorText = ref('')

watch(
  () => props.visible,
  (open) => {
    if (!open) return
    emailInput.value = playerStore.email
    errorText.value = ''
  },
)

function onSubmit() {
  if (playerStore.couponSending) return

  errorText.value = VerificationExtension.email(emailInput.value)
  if (errorText.value) return

  playerStore.setEmail(emailInput.value.trim())
  emit('confirmed')
}
</script>

<style scoped>
.email-gate-overlay {
  padding: max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
}
</style>
