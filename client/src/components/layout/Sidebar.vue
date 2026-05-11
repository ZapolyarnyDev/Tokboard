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
      <div class="sidebar-forms space-y-3">
        <form class="sidebar-form" @submit.prevent="handleCreate">
          <UiTypography.Title as="h3" size="h4" class="text-sm">
            Создать доску
          </UiTypography.Title>

          <UiInput
            v-model="title"
            class="sidebar-input"
            placeholder="Название доски"
          />

          <UiButton
            type="submit"
            class="sidebar-submit"
            :disabled="isLoading"
          >
            <span class="flex items-center justify-center gap-2">
              <Plus :size="16" />
              Создать
            </span>
          </UiButton>
        </form>

        <form class="sidebar-form" @submit.prevent="handleJoin">
          <UiTypography.Title as="h3" size="h4" class="text-sm">
            Присоединиться к доске
          </UiTypography.Title>

          <UiInput
            v-model="joinId"
            class="sidebar-input"
            placeholder="ID доски"
          />

          <UiButton
            type="submit"
            variant="secondary"
            class="sidebar-submit"
            :disabled="isLoading"
          >
            <span class="flex items-center justify-center gap-2">
              <Users :size="16" />
              Войти
            </span>
          </UiButton>
        </form>

        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>
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
  background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
  transition: width var(--transition);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
}

.sidebar-content {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  opacity: 1;
  transition: opacity var(--transition), width var(--transition);
  white-space: nowrap;
}

.sidebar-forms {
  width: 100%;
  min-width: 0;
}

.sidebar-form {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 0.75rem;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-secondary, #f8f8f8);
  padding: 0.75rem;
  border-radius: 6px;
}

.sidebar-input,
.sidebar-submit {
  width: 100%;
  min-width: 0;
}

.sidebar-form :deep(input),
.sidebar-form :deep(button) {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.sidebar.is-collapsed .sidebar-forms {
  display: none;
}

@media (max-width: 1024px) {
  .sidebar-form {
    padding: 0.65rem;
  }
}

@media (max-width: 480px) {
  .sidebar-form {
    padding: 0.75rem;
  }
}
.sidebar-icon-button,
.sidebar-action {
  display: flex;
  min-height: 40px;
  align-items: center;
  border: 1px solid var(--color-border-default);
  background: white;
  color: var(--color-text-secondary);
  transition: all 150ms;
  border-radius: 4px;
}

.sidebar-icon-button {
  display: grid;
  width: 40px;
  place-items: center;
}

.sidebar-icon-button:hover,
.sidebar-action:hover {
  border-color: var(--color-accent-active);
  background: var(--color-accent-light);
  color: var(--color-accent-active);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(77, 163, 255, 0.15);
}

.board-button {
  display: grid;
  width: 100%;
  min-height: 62px;
  grid-template-columns: 40px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  border: 1px solid transparent;
  background: transparent;
  padding: 10px 12px;
  color: var(--color-text-secondary);
  text-align: left;
  transition: all 150ms;
  border-radius: 4px;
}

.board-button:hover {
  border-color: var(--color-border-active);
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
  transform: translateX(2px);
}

.board-button.is-active {
  border-color: var(--color-accent-active);
  background: linear-gradient(135deg, var(--color-accent-light) 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(77, 163, 255, 0.2);
}

.board-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--color-border-default);
  background: white;
  transition: all 150ms;
  border-radius: 4px;
}

.board-button:hover .board-icon {
  border-color: var(--color-accent-active);
  background: var(--color-accent-light);
  color: var(--color-accent-active);
}

.board-button.is-active .board-icon {
  border-color: var(--color-accent-active);
  background: var(--color-accent-active);
  color: white;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 16rem;
  }

  .sidebar.is-collapsed {
    width: 64px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 40;
    width: 18rem;
    height: 100%;
    transform: translateX(0);
    transition: transform 0.3s ease-in-out;
  }

  .sidebar.is-collapsed {
    transform: translateX(-100%);
    width: 18rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    max-width: 20rem;
  }

  .sidebar.is-collapsed {
    width: 100%;
  }
}
</style>
