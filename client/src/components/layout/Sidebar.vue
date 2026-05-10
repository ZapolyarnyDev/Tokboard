<script setup>
import { onMounted, ref } from "vue"
import { LogOut, PanelLeftClose, PanelLeftOpen, Plus, SquareKanban, Users } from "lucide-vue-next"
import { createBoard, getBoard, listBoards } from "../../api/board"
import { useAuthStore } from "../../stores/auth"
import { useUiStore } from "../../stores/ui"
import UiButton from "../ui/UiButton.vue"
import UiInput from "../ui/UiInput.vue"
import UiTypography from "../ui/UiTypography.vue"

const auth = useAuthStore()
const ui = useUiStore()
const title = ref("")
const joinId = ref("")
const error = ref("")
const isLoading = ref(false)

const loadBoards = async () => {
  if (!auth.accessToken) return
  const result = await listBoards(auth.accessToken)
  ui.setBoards(result.boards)
}

const handleCreate = async () => {
  error.value = ""
  isLoading.value = true
  try {
    const result = await createBoard(title.value || "Новая доска", auth.accessToken)
    ui.addBoard(result.board)
    title.value = ""
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

const handleJoin = async () => {
  error.value = ""
  if (!joinId.value.trim()) return
  isLoading.value = true
  try {
    const result = await getBoard(joinId.value.trim(), auth.accessToken)
    ui.setBoard(result.board)
    joinId.value = ""
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

onMounted(loadBoards)
</script>

<template>
  <aside
    id="workspace-menu"
    tabindex="-1"
    class="sidebar"
    :class="{ 'is-collapsed': ui.isSidebarCollapsed }"
  >
    <div class="flex h-16 items-center justify-between border-b border-border px-4">
      <div class="sidebar-content min-w-0">
        <UiTypography.Title as="h2" size="h4" truncate>
          Доски
        </UiTypography.Title>
        <UiTypography.Muted class="mt-1" size="md" truncate>
          Создайте доску или подключитесь по ID
        </UiTypography.Muted>
      </div>

      <button
        type="button"
        class="sidebar-icon-button"
        @click="ui.toggleSidebar"
      >
        <PanelLeftOpen v-if="ui.isSidebarCollapsed" :size="18" :stroke-width="2" />
        <PanelLeftClose v-else :size="18" :stroke-width="2" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-3">
      <div class="sidebar-content space-y-3">
        <form class="space-y-2 border border-border bg-bg-secondary p-3" @submit.prevent="handleCreate">
          <UiTypography.Title as="h3" size="h4" class="text-sm">Создать доску</UiTypography.Title>
          <UiInput v-model="title" placeholder="Название доски" />
          <UiButton type="submit" class="w-full" :disabled="isLoading">
            <span class="flex items-center justify-center gap-2">
              <Plus :size="16" />
              Создать
            </span>
          </UiButton>
        </form>

        <form class="space-y-2 border border-border bg-bg-secondary p-3" @submit.prevent="handleJoin">
          <UiTypography.Title as="h3" size="h4" class="text-sm">Присоединиться к доске</UiTypography.Title>
          <UiInput v-model="joinId" placeholder="ID доски" />
          <UiButton type="submit" variant="secondary" class="w-full" :disabled="isLoading">
            <span class="flex items-center justify-center gap-2">
              <Users :size="16" />
              Войти
            </span>
          </UiButton>
        </form>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </div>

      <nav class="mt-3 space-y-2" aria-label="Доски">
        <button
          v-for="board in ui.boards"
          :key="board.id"
          type="button"
          class="board-button group"
          :class="ui.activeBoardId === board.id ? 'is-active' : ''"
          @click="ui.setBoard(board)"
        >
          <span class="board-icon">
            <SquareKanban :size="17" :stroke-width="2" />
          </span>
          <span class="min-w-0">
            <UiTypography.Title
              as="span"
              size="h4"
              class="block text-sm"
              :tone="ui.activeBoardId === board.id ? 'accent' : 'primary'"
              truncate
            >
              {{ board.title }}
            </UiTypography.Title>
            <UiTypography.Muted as="span" class="mt-0.5 block" size="sm" truncate>
              ID: {{ board.id }}
            </UiTypography.Muted>
          </span>
        </button>
      </nav>
    </div>

    <div class="border-t border-border p-3">
      <button type="button" class="sidebar-action group w-full justify-between px-3" @click="ui.leaveBoard">
        <span class="flex items-center gap-2">
          <LogOut :size="16" :stroke-width="2" />
          <span class="sidebar-content">Выйти из доски</span>
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  width: 20rem;
  height: 100%;
  flex-shrink: 0;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--color-border-default);
  background: var(--color-bg-primary);
  transition: width var(--transition);
}

.sidebar.is-collapsed {
  width: 76px;
}

.sidebar-content {
  display: block;
  max-width: 240px;
  overflow: hidden;
  opacity: 1;
  transition: opacity var(--transition), max-width var(--transition);
  white-space: nowrap;
}

.sidebar.is-collapsed .sidebar-content {
  max-width: 0;
  opacity: 0;
  pointer-events: none;
}

.sidebar-icon-button,
.sidebar-action {
  display: flex;
  min-height: 38px;
  align-items: center;
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
}

.sidebar-icon-button {
  display: grid;
  width: 38px;
  place-items: center;
}

.sidebar-icon-button:hover,
.sidebar-action:hover {
  border-color: var(--color-border-active);
  background: var(--color-accent-light);
  color: var(--color-accent-active);
}

.board-button {
  display: grid;
  width: 100%;
  min-height: 58px;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  border: 1px solid transparent;
  background: transparent;
  padding: 8px 10px;
  color: var(--color-text-secondary);
  text-align: left;
}

.board-button:hover,
.board-button.is-active {
  border-color: var(--color-border-active);
  background: var(--color-accent-light);
}

.board-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-primary);
}
</style>
