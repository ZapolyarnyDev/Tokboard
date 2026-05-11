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
  <header class="header">
    <div class="header-container">
      <div class="header-brand">
        <div class="brand-icon">
          <Workflow :size="18" :stroke-width="2" />
        </div>
        <div class="brand-text">
          <p class="brand-title">
            Tokboard
          </p>
          <p class="brand-subtitle">
            Совместная доска
          </p>
        </div>
      </div>

      <div class="header-breadcrumb">
        <span class="breadcrumb-icon">
          <component :is="PageIcon" :size="16" :stroke-width="2" />
        </span>
        <span class="breadcrumb-type">{{ pageType }}</span>
        <span class="breadcrumb-title">
          {{ pageTitle }}
        </span>
      </div>

      <div class="header-actions">
        <button
          v-if="auth.isAuthenticated"
          type="button"
          class="user-menu-button"
          :class="{ 'is-open': isMenuOpen }"
          :aria-expanded="isMenuOpen"
          aria-haspopup="menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span class="user-avatar" :class="{ 'is-open': isMenuOpen }">
            {{ userInitials }}
          </span>
          <span class="user-info">
            <span class="user-name">
              {{ userName }}
            </span>
            <span class="user-email">
              {{ userEmail }}
            </span>
          </span>
          <span class="menu-chevron" :class="{ 'is-open': isMenuOpen }">
            <ChevronDown
              :size="16"
              :stroke-width="2"
              class="chevron-icon"
              :class="{ 'is-rotated': isMenuOpen }"
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
            class="user-dropdown"
            role="menu"
          >
            <div class="dropdown-header">
              <p class="dropdown-user-name">
                {{ userName }}
              </p>
              <p class="dropdown-user-email">
                {{ userEmail }}
              </p>
            </div>

            <div class="dropdown-actions">
              <button
                type="button"
                class="dropdown-item"
                role="menuitem"
                @click="goToMenu"
              >
                <span class="dropdown-item-content">
                  <PanelLeft :size="16" :stroke-width="2" class="dropdown-icon" />
                  Меню
                </span>
                <span class="dropdown-item-label">
                  РАБОЧАЯ ОБЛАСТЬ
                </span>
              </button>
              <button
                type="button"
                class="dropdown-item"
                role="menuitem"
                @click="logout"
              >
                <span class="dropdown-item-content">
                  <LogIn :size="16" :stroke-width="2" class="dropdown-icon rotate-180" />
                  Выйти
                </span>
                <span class="dropdown-item-label">
                  ВЫХОД
                </span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 4rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border-default);
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-container {
  display: grid;
  height: 100%;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0 1rem;
}

.header-brand {
  display: flex;
  height: 100%;
  align-items: center;
  border-right: 1px solid var(--color-border-default);
  padding-right: 1rem;
  gap: 0.75rem;
}

.brand-icon {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border: 1px solid var(--color-text-primary);
  background: var(--color-text-primary);
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  border-radius: 4px;
}

.brand-text {
  min-width: 0;
}

.brand-title {
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  color: var(--color-text-primary);
}

.brand-subtitle {
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.header-breadcrumb {
  display: none;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
}

.breadcrumb-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid var(--color-border-default);
  background: var(--color-accent-light);
  color: var(--color-accent-active);
  border-radius: 2px;
}

.breadcrumb-type {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.breadcrumb-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-actions {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.user-menu-button {
  display: flex;
  height: 2.75rem;
  min-width: 0;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  background: white;
  text-align: left;
  transition: all 150ms;
}

.user-menu-button:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-border-active);
}

.user-menu-button.is-open {
  border-color: var(--color-accent-active);
  box-shadow: 0 0 0 1px var(--color-accent-light);
}

.user-menu-button:focus {
  outline: none;
}

.user-avatar {
  display: grid;
  width: 2.75rem;
  place-items: center;
  border-right: 1px solid var(--color-border-default);
  background: var(--color-accent-light);
  font-family: var(--font-heading);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-accent-active);
  transition: all 150ms;
}

.user-avatar.is-open {
  border-color: var(--color-accent-active);
}

.user-info {
  display: none;
  min-width: 0;
  padding: 0 0.75rem;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.user-email {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.menu-chevron {
  display: grid;
  width: 2.25rem;
  place-items: center;
  border-left: 1px solid var(--color-border-default);
  color: var(--color-text-muted);
  transition: all 150ms;
}

.menu-chevron.is-open {
  border-color: var(--color-accent-active);
  color: var(--color-accent-active);
}

.chevron-icon {
  transition: transform 150ms;
}

.chevron-icon.is-rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  right: 0;
  top: 3rem;
  z-index: 30;
  width: 18rem;
  border: 1px solid var(--color-accent-active);
  background: white;
  box-shadow: 0 18px 44px rgba(30, 30, 30, 0.12);
}

.dropdown-header {
  border-bottom: 1px solid var(--color-border-default);
  background: var(--color-bg-secondary);
  padding: 1rem;
}

.dropdown-user-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.dropdown-user-email {
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.dropdown-actions {
  padding: 0.375rem;
}

.dropdown-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border: 1px solid transparent;
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  transition: all 150ms;
}

.dropdown-item:hover {
  border-color: var(--color-border-active);
  background: var(--color-bg-secondary);
}

.dropdown-item:focus {
  border-color: var(--color-accent-active);
  background: var(--color-accent-light);
  outline: none;
}

.dropdown-item:active {
  background: var(--color-accent-light);
}

.dropdown-item + .dropdown-item {
  margin-top: 0.25rem;
}

.dropdown-item-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-icon {
  color: var(--color-text-muted);
  transition: color 150ms;
}

.dropdown-item:hover .dropdown-icon,
.dropdown-item:focus .dropdown-icon {
  color: var(--color-accent-active);
}

.dropdown-item-label {
  font-family: var(--font-heading);
  font-size: 0.75rem;
  color: var(--color-text-muted);
  transition: color 150ms;
}

.dropdown-item:hover .dropdown-item-label {
  color: var(--color-text-primary);
}

@media (min-width: 640px) {
  .user-info {
    display: flex;
  }
}

@media (min-width: 768px) {
  .header-container {
    grid-template-columns: 16rem 1fr auto;
    padding: 0 1.5rem;
  }

  .header-breadcrumb {
    display: flex;
  }
}

@media (max-width: 480px) {
  .header {
    height: 3.5rem;
  }

  .header-container {
    padding: 0 0.75rem;
  }

  .brand-subtitle {
    display: none;
  }

  .user-dropdown {
    width: calc(100vw - 1.5rem);
    right: 0.75rem;
  }
}
</style>
