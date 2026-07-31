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
        class="email-gate-panel mx-auto w-[min(100%,22rem)] rounded-xl border bg-background p-6 text-foreground shadow-xl sm:w-[min(100%,26rem)] sm:p-8"
      >
        <h2 id="email-gate-title" class="text-center text-lg font-bold sm:text-xl">
          {{ t('games.coupon.emailTitle') }}
        </h2>
        <p class="mt-2 text-center text-sm text-muted-foreground sm:text-base">
          {{ t('games.coupon.emailLead') }}
        </p>

        <form class="mt-5 space-y-3" @submit.prevent="onSubmit">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="player-first-name" class="mb-1.5 block text-sm font-medium">
                {{ t('games.coupon.fields.firstName') }}
              </label>
              <input
                id="player-first-name"
                v-model="firstNameInput"
                type="text"
                autocomplete="given-name"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                :disabled="playerStore.couponSending"
                :aria-invalid="!!errors.firstName"
              />
              <p v-if="errors.firstName" class="mt-1 text-xs text-destructive">
                {{ errors.firstName }}
              </p>
            </div>
            <div>
              <label for="player-last-name" class="mb-1.5 block text-sm font-medium">
                {{ t('games.coupon.fields.lastName') }}
              </label>
              <input
                id="player-last-name"
                v-model="lastNameInput"
                type="text"
                autocomplete="family-name"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                :disabled="playerStore.couponSending"
                :aria-invalid="!!errors.lastName"
              />
              <p v-if="errors.lastName" class="mt-1 text-xs text-destructive">
                {{ errors.lastName }}
              </p>
            </div>
          </div>

          <div>
            <label for="player-phone" class="mb-1.5 block text-sm font-medium">
              {{ t('games.coupon.fields.phone') }}
            </label>
            <input
              id="player-phone"
              v-model="phoneInput"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              placeholder="(555) 123-4567"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              :disabled="playerStore.couponSending"
              :aria-invalid="!!errors.phone"
            />
            <p v-if="errors.phone" class="mt-1 text-xs text-destructive">
              {{ errors.phone }}
            </p>
          </div>

          <div>
            <label for="player-email" class="mb-1.5 block text-sm font-medium">
              {{ t('games.coupon.fields.email') }}
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
              :aria-invalid="!!errors.email"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-destructive">
              {{ errors.email }}
            </p>
          </div>

          <button
            type="submit"
            class="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            :disabled="playerStore.couponSending"
          >
            {{ playerStore.couponSending ? t('games.coupon.emailSending') : t('games.coupon.emailSubmit') }}
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { usePlayerStore } from '@/stores/playerStore'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  confirmed: []
}>()

const { t } = useI18n()
const playerStore = usePlayerStore()

const firstNameInput = ref('')
const lastNameInput = ref('')
const phoneInput = ref('')
const emailInput = ref('')

const errors = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
})

function resetErrors() {
  errors.firstName = ''
  errors.lastName = ''
  errors.phone = ''
  errors.email = ''
}

function syncFromStore() {
  firstNameInput.value = playerStore.firstName
  lastNameInput.value = playerStore.lastName
  phoneInput.value = playerStore.phone
  emailInput.value = playerStore.email
  resetErrors()
}

watch(
  () => props.visible,
  (open) => {
    if (!open) return
    syncFromStore()
  },
)

function validate(): boolean {
  resetErrors()
  let ok = true

  if (!firstNameInput.value.trim()) {
    errors.firstName = t('games.coupon.errors.required')
    ok = false
  }
  if (!lastNameInput.value.trim()) {
    errors.lastName = t('games.coupon.errors.required')
    ok = false
  }

  const digits = phoneInput.value.replace(/\D/g, '')
  if (!phoneInput.value.trim()) {
    errors.phone = t('games.coupon.errors.required')
    ok = false
  } else if (digits.length < 7) {
    errors.phone = t('games.coupon.errors.phoneInvalid')
    ok = false
  }

  const emailResult = z.string().email().safeParse(emailInput.value.trim())
  if (!emailInput.value.trim()) {
    errors.email = t('games.coupon.errors.required')
    ok = false
  } else if (!emailResult.success) {
    errors.email = t('games.coupon.errors.emailInvalid')
    ok = false
  }

  return ok
}

function onSubmit() {
  if (playerStore.couponSending) return
  if (!validate()) return

  playerStore.setContactInfo({
    firstName: firstNameInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    phone: phoneInput.value.trim(),
    email: emailInput.value.trim(),
  })
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
