<script setup>
import {
  ChevronDown,
  Clock3,
  Folder,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  SquareKanban
} from "lucide-vue-next"
import { useUiStore } from "../../stores/ui"
import UiTypography from "../ui/UiTypography.vue"

const ui = useUiStore()

const projects = [
  {
    name: "Tokboard",
    description: "Групповой проект",
    boards: [
      { name: "Доска 1", meta: "Командная работа", status: "активна", icon: SquareKanban },
      { name: "Доска 2", meta: "Черновик интерфейса", status: "обновлена", icon: SquareKanban },
      { name: "Доска 3", meta: "Демо объектов", status: "проверка", icon: SquareKanban }
    ]
  }
]
</script>

<template>
  <aside
    id="workspace-menu"
    tabindex="-1"
    class="sidebar"
    :class="{ 'is-collapsed': ui.isSidebarCollapsed }"
  >
    <div class="flex h-16 items-center justify-between border-b border-border px-4">
      <Transition name="sidebar-content">
        <div class="sidebar-content min-w-0">
          <UiTypography.Title as="h2" size="h4" truncate>
            Меню
          </UiTypography.Title>
          <UiTypography.Muted class="mt-1" size="md" truncate>
            Проекты и доски
          </UiTypography.Muted>
        </div>
      </Transition>

      <button
        type="button"
        class="sidebar-icon-button"
        :aria-label="ui.isSidebarCollapsed ? 'Открыть меню' : 'Закрыть меню'"
        @click="ui.toggleSidebar"
      >
        <PanelLeftOpen v-if="ui.isSidebarCollapsed" :size="18" :stroke-width="2" />
        <PanelLeftClose v-else :size="18" :stroke-width="2" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-3">
      <Transition name="sidebar-content">
        <div class="sidebar-search mb-3 grid grid-cols-[1fr_auto] gap-2">
          <button type="button" class="sidebar-action group justify-start px-3">
            <Search :size="16" :stroke-width="2" />
            <UiTypography.Text
              as="span"
              class="sidebar-content transition-colors duration-[180ms] group-hover:text-accent-active group-focus:text-accent-active"
              size="md"
              tone="secondary"
              truncate
            >
              Поиск доски
            </UiTypography.Text>
          </button>
          <button type="button" class="sidebar-icon-button">
            <Plus :size="18" :stroke-width="2" />
          </button>
        </div>
      </Transition>

      <nav class="space-y-3" aria-label="Проекты">
        <section
          v-for="project in projects"
          :key="project.name"
          class="project-card"
        >
          <button
            type="button"
            class="project-button group"
            :class="ui.isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'"
            :aria-expanded="!ui.collapsedProjects[project.name]"
            @click="ui.toggleProject(project.name)"
          >
            <span class="flex min-w-0 items-center gap-3">
              <span class="project-icon">
                <Folder :size="17" :stroke-width="2" />
              </span>
              <Transition name="sidebar-content">
                <span class="sidebar-content min-w-0">
                  <UiTypography.Title as="span" size="h4" class="block text-sm" truncate>
                    {{ project.name }}
                  </UiTypography.Title>
                  <UiTypography.Muted as="span" class="mt-0.5 block" size="md" truncate>
                    {{ project.description }}
                  </UiTypography.Muted>
                </span>
              </Transition>
            </span>

            <ChevronDown
              :size="17"
              :stroke-width="2"
              class="project-chevron shrink-0 text-text-muted"
              :class="{ 'is-rotated': ui.collapsedProjects[project.name] }"
            />
          </button>

          <div
            class="boards-reveal"
            :class="ui.collapsedProjects[project.name] || ui.isSidebarCollapsed ? 'is-collapsed' : 'is-open'"
          >
            <div class="space-y-2 p-2 pt-0">
              <button
                v-for="board in project.boards"
                :key="board.name"
                type="button"
                class="board-button group"
                :class="ui.activeBoard === board.name ? 'is-active' : ''"
                :aria-current="ui.activeBoard === board.name ? 'page' : undefined"
                @click="ui.setBoard(board.name)"
              >
                <span class="board-icon">
                  <component :is="board.icon" :size="17" :stroke-width="2" />
                </span>

                <span class="min-w-0">
                  <UiTypography.Title
                    as="span"
                    size="h4"
                    class="block text-sm"
                    :tone="ui.activeBoard === board.name ? 'accent' : 'primary'"
                    truncate
                  >
                    {{ board.name }}
                  </UiTypography.Title>
                  <UiTypography.Muted as="span" class="mt-0.5 flex items-center gap-1.5" size="sm" truncate>
                    <Clock3 :size="12" :stroke-width="2" />
                    {{ board.meta }}
                  </UiTypography.Muted>
                </span>

                <UiTypography.Code as="span" class="board-status" size="sm" tone="muted">
                  {{ board.status }}
                </UiTypography.Code>
              </button>
            </div>
          </div>
        </section>
      </nav>
    </div>

    <div class="border-t border-border p-3">
      <button type="button" class="sidebar-action group w-full" :class="ui.isSidebarCollapsed ? 'justify-center' : 'justify-between px-3'">
        <span class="flex items-center gap-2">
          <Settings :size="16" :stroke-width="2" />
          <Transition name="sidebar-content">
            <UiTypography.Text
              as="span"
              class="sidebar-content transition-colors duration-[180ms] group-hover:text-accent-active group-focus:text-accent-active"
              size="md"
              tone="secondary"
              truncate
            >
              Настройки
            </UiTypography.Text>
          </Transition>
        </span>
        <MoreHorizontal class="sidebar-content" :size="16" :stroke-width="2" />
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
  will-change: width;
  contain: layout paint style;
}

.sidebar:focus {
  outline: none;
}

.sidebar.is-collapsed {
  width: 76px;
}

.sidebar-content {
  display: block;
  max-width: 240px;
  overflow: hidden;
  opacity: 1;
  transform: translateX(0);
  transition: opacity var(--transition), transform var(--transition), max-width var(--transition);
  white-space: nowrap;
}

.sidebar.is-collapsed .sidebar-content {
  max-width: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-4px);
}

.sidebar-search {
  max-height: 40px;
  overflow: hidden;
  opacity: 1;
  transition: max-height var(--transition), opacity var(--transition), margin-bottom var(--transition);
}

.sidebar.is-collapsed .sidebar-search {
  max-height: 0;
  margin-bottom: 0;
  opacity: 0;
  pointer-events: none;
}

.sidebar.is-collapsed .project-button > span {
  gap: 0;
}

.sidebar-icon-button {
  display: grid;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  transition: background var(--transition), border-color var(--transition), color var(--transition);
}

.sidebar-icon-button:hover,
.sidebar-icon-button:focus {
  border-color: var(--color-border-active);
  background: var(--color-accent-light);
  color: var(--color-accent-active);
  outline: none;
}

.sidebar-action {
  display: flex;
  height: 40px;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  font-size: 14px;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
}

.sidebar-action:hover,
.sidebar-action:focus {
  border-color: var(--color-border-active);
  background: var(--color-accent-light);
  color: var(--color-accent-active);
  outline: none;
}

.project-card {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius);
  background: var(--color-bg-secondary);
  transition: border-color var(--transition), background var(--transition);
}

.project-card:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-primary);
}

.project-button {
  display: flex;
  width: 100%;
  min-height: 58px;
  align-items: center;
  border: 0;
  border-radius: var(--radius);
  background: transparent;
  text-align: left;
  transition: background var(--transition);
}

.project-button:hover,
.project-button:focus {
  background: var(--color-bg-secondary);
  outline: none;
}

.project-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  transition: background var(--transition), border-color var(--transition), color var(--transition);
}

.project-button:hover .project-icon,
.project-button:focus .project-icon {
  border-color: var(--color-border-active);
  background: var(--color-accent-light);
  color: var(--color-accent-active);
}

.project-chevron {
  opacity: 1;
  transform: rotate(0deg);
  transition: transform var(--transition), color var(--transition), opacity var(--transition);
}

.project-chevron.is-rotated {
  transform: rotate(-90deg);
}

.sidebar.is-collapsed .project-chevron {
  opacity: 0;
  pointer-events: none;
}

.project-button:hover .project-chevron,
.project-button:focus .project-chevron {
  color: var(--color-accent-active);
}

.boards-reveal {
  display: grid;
  overflow: hidden;
  transition: grid-template-rows var(--transition), opacity var(--transition);
}

.boards-reveal.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
}

.boards-reveal.is-collapsed {
  grid-template-rows: 0fr;
  opacity: 0;
}

.boards-reveal > div {
  min-height: 0;
}

.board-button {
  display: grid;
  width: 100%;
  min-height: 58px;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: transparent;
  padding: 8px 10px;
  color: var(--color-text-secondary);
  text-align: left;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
}

.board-button:hover,
.board-button:focus {
  border-color: var(--color-border-hover);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  outline: none;
}

.board-button.is-active {
  border-color: var(--color-border-active);
  background: var(--color-accent-light);
  color: var(--color-accent-active);
}

.board-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius);
  background: var(--color-bg-primary);
  color: var(--color-text-muted);
  transition: border-color var(--transition), color var(--transition), background var(--transition);
}

.board-button:hover .board-icon,
.board-button:focus .board-icon,
.board-button.is-active .board-icon {
  border-color: var(--color-border-active);
  color: var(--color-accent-active);
  background: var(--color-bg-primary);
}

.board-status {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius);
  background: var(--color-bg-primary);
  padding: 3px 6px;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1;
  transition: border-color var(--transition), color var(--transition), background var(--transition);
}

.board-button:hover .board-status,
.board-button:focus .board-status,
.board-button.is-active .board-status {
  border-color: var(--color-border-active);
  background: var(--color-bg-primary);
  color: var(--color-accent-active);
}

.sidebar-content-enter-active,
.sidebar-content-leave-active {
  transition: opacity 140ms ease-out;
}

.sidebar-content-enter-from,
.sidebar-content-leave-to {
  opacity: 0;
}
</style>
