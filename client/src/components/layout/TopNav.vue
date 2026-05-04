<script setup>
import { useUiStore } from "../../stores/ui"
import { useAuthStore } from "../../stores/auth"
import UiButton from "../ui/UiButton.vue"

const ui = useUiStore()
const auth = useAuthStore()
</script>

<template>
  <header class="h-14 border-b border-border bg-white flex items-center justify-between px-6">
    <div class="flex items-center gap-4">
      <span class="text-text-muted text-sm">Доски /</span>
      <h1 class="font-heading font-semibold text-sm">
        {{ ui.activeBoard }}
      </h1>
    </div>

    <div class="flex items-center gap-4">
      <span class="text-xs text-text-secondary">
        {{ auth.user?.name }}
      </span>
      <UiButton variant="ghost" @click="auth.logout" class="text-xs">
        Выйти
      </UiButton>
    </div>
  </header>
</template>