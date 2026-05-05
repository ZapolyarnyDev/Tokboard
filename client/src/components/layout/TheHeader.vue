<script setup>
import { computed, ref } from "vue"
import { ChevronDown, Columns3, LayoutDashboard, LogIn, PanelLeft, Workflow } from "lucide-vue-next"
import { useAuthStore } from "../../stores/auth"
import { useUiStore } from "../../stores/ui"

const auth = useAuthStore()
const ui = useUiStore()
const isMenuOpen = ref(false)

const userName = computed(() => auth.user?.name || "Пользователь")
const userEmail = computed(() => auth.user?.email || "workspace@tokboard")
const pageTitle = computed(() => (auth.isAuthenticated ? ui.activeBoard : "Обзор проекта"))
const pageType = computed(() => (auth.isAuthenticated ? "Доска" : "Главная"))
const PageIcon = computed(() => (auth.isAuthenticated ? Columns3 : LayoutDashboard))

const userInitials = computed(() => {
  return userName.value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
})

const goToMenu = () => {
  isMenuOpen.value = false
  const menu = document.getElementById("workspace-menu")
  menu?.focus({ preventScroll: true })
  menu?.scrollIntoView({ behavior: "smooth", block: "nearest" })
}

const logout = () => {
  isMenuOpen.value = false
  auth.logout()
}
</script>

<template>
  <header class="h-16 shrink-0 border-b border-border bg-white">
    <div class="grid h-full grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[16rem_1fr_auto] md:px-6">
      <div class="flex h-full items-center border-r border-border pr-4">
        <div class="grid h-9 w-9 place-items-center border border-text-primary bg-text-primary font-heading text-sm font-semibold text-white">
          <Workflow :size="18" :stroke-width="2" />
        </div>
        <div class="ml-3 min-w-0">
          <p class="font-heading text-sm font-semibold leading-none text-text-primary">
            Tokboard
          </p>
          <p class="mt-1 truncate text-xs text-text-muted">
            Collaborative Canvas
          </p>
        </div>
      </div>

      <div class="hidden min-w-0 items-center gap-3 md:flex">
        <span class="grid h-8 w-8 place-items-center border border-border bg-accent-light text-accent">
          <component :is="PageIcon" :size="16" :stroke-width="2" />
        </span>
        <span class="text-xs uppercase text-text-muted">{{ pageType }}</span>
        <span class="truncate font-heading text-sm font-semibold text-text-primary">
          {{ pageTitle }}
        </span>
      </div>

      <div class="relative flex items-center justify-end">
        <button
          v-if="auth.isAuthenticated"
          type="button"
          class="flex h-10 min-w-0 items-stretch overflow-hidden border bg-white text-left transition-all duration-150 hover:bg-bg-secondary focus:outline-none"
          :class="isMenuOpen ? 'border-accent shadow-[0_0_0_1px_var(--color-accent-light)]' : 'border-border hover:border-border-hover'"
          :aria-expanded="isMenuOpen"
          aria-haspopup="menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span
            class="grid w-10 place-items-center border-r bg-accent-light font-heading text-xs font-semibold text-accent transition-colors duration-150"
            :class="isMenuOpen ? 'border-accent' : 'border-border'"
          >
            {{ userInitials }}
          </span>
          <span class="hidden min-w-0 px-3 sm:block">
            <span class="block truncate text-sm font-medium text-text-primary">
              {{ userName }}
            </span>
            <span class="block truncate text-xs text-text-muted">
              {{ userEmail }}
            </span>
          </span>
          <span
            class="grid w-8 place-items-center border-l text-text-muted transition-all duration-150"
            :class="isMenuOpen ? 'border-accent text-accent' : 'border-border'"
          >
            <ChevronDown
              :size="16"
              :stroke-width="2"
              class="transition-transform duration-150"
              :class="isMenuOpen ? 'rotate-180' : ''"
            />
          </span>
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="-translate-y-1 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-120 ease-out"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-1 opacity-0"
        >
          <div
            v-if="auth.isAuthenticated && isMenuOpen"
            class="absolute right-0 top-12 z-30 w-72 border border-accent bg-white shadow-[0_18px_44px_rgba(30,30,30,0.12)]"
            role="menu"
          >
            <div class="border-b border-border bg-bg-secondary p-4">
              <p class="truncate font-heading text-sm font-semibold text-text-primary">
                {{ userName }}
              </p>
              <p class="mt-1 truncate text-xs text-text-secondary">
                {{ userEmail }}
              </p>
            </div>

            <div class="p-1.5">
              <button
                type="button"
                class="group flex w-full items-center justify-between border border-transparent px-3 py-2.5 text-left text-sm text-text-primary transition-all duration-150 hover:border-border-hover hover:bg-bg-secondary focus:border-accent focus:bg-accent-light focus:outline-none active:bg-accent-light"
                role="menuitem"
                @click="goToMenu"
              >
                <span class="flex items-center gap-2">
                  <PanelLeft :size="16" :stroke-width="2" class="text-text-muted transition-colors duration-150 group-hover:text-accent group-focus:text-accent" />
                  Меню
                </span>
                <span class="font-heading text-xs text-text-muted transition-colors duration-150 group-hover:text-text-primary">
                  WORKSPACE
                </span>
              </button>
              <button
                type="button"
                class="group mt-1 flex w-full items-center justify-between border border-transparent px-3 py-2.5 text-left text-sm text-text-primary transition-all duration-150 hover:border-border-hover hover:bg-bg-secondary focus:border-accent focus:bg-accent-light focus:outline-none active:bg-accent-light"
                role="menuitem"
                @click="logout"
              >
                <span class="flex items-center gap-2">
                  <LogIn :size="16" :stroke-width="2" class="rotate-180 text-text-muted transition-colors duration-150 group-hover:text-accent group-focus:text-accent" />
                  Выйти
                </span>
                <span class="font-heading text-xs text-text-muted transition-colors duration-150 group-hover:text-text-primary">
                  EXIT
                </span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
