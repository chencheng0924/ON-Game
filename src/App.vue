<script setup lang="ts">
import { RouterView } from "vue-router"
import { Toaster } from "vue-sonner"
</script>

<template>
  <Toaster />
  <component :is="$route.meta.layout">
    <RouterView />
  </component>
</template>

