<script setup>
import { useAuthStore } from "./stores/auth"
import LoginPage from "./pages/LoginPage.vue"
import MainLayout from "./components/layout/MainLayout.vue"
import TheHeader from "./components/layout/TheHeader.vue"

const auth = useAuthStore()
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-bg-primary">
    <TheHeader />
    <div class="min-h-0 flex-1">
      <LoginPage v-if="!auth.isAuthenticated" />
      <MainLayout v-else />
    </div>
  </div>
</template>
