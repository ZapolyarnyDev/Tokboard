<script setup>
import { useAuthStore } from "./stores/auth"
import LoginPage from "./pages/LoginPage.vue"
import MainLayout from "./components/layout/MainLayout.vue"

const auth = useAuthStore()
</script>

<template>
  <LoginPage v-if="!auth.isAuthenticated" />
  <MainLayout v-else />
</template>