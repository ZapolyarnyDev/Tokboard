<script setup>
import { ref } from "vue"
import { useAuthStore } from "../stores/auth"
import UiButton from "../components/ui/UiButton.vue"
import UiInput from "../components/ui/UiInput.vue"

const auth = useAuthStore()
const email = ref("")
const password = ref("")

const handleLogin = () => {
  auth.login({ name: "Пользователь", email: email.value })
}
</script>

<template>
  <div class="h-screen w-full flex items-center justify-center bg-bg-secondary">
    <div class="w-full max-w-sm p-8 bg-white border border-border rounded-none">
      <h1 class="text-2xl font-heading font-bold mb-6">
        PROJECT / ВХОД
      </h1>
      
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-xs font-heading uppercase text-text-secondary">
            Электронная почта
          </label>
          <UiInput v-model="email" placeholder="example@mail.ru" />
        </div>
        
        <div class="space-y-2">
          <label class="text-xs font-heading uppercase text-text-secondary">
            Пароль
          </label>
          <UiInput v-model="password" type="password" placeholder="••••••••" />
        </div>

        <UiButton @click="handleLogin" class="w-full mt-4">
          Войти
        </UiButton>
      </div>

      <p class="mt-6 text-center text-xs text-text-muted">
        Совместная работа в реальном времени
      </p>
    </div>
  </div>
</template>