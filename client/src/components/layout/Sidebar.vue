<script setup>
import { useUiStore } from "../../stores/ui"

const ui = useUiStore()

const data = [
  {
    group: "Рабочее пространство",
    projects: [
      {
        name: "Проект 1",
        boards: ["Доска 1", "Доска 2", "Доска 3"]
      },
      {
        name: "Проект 2",
        boards: ["Основная", "Дополнительная"]
      }
    ]
  },
  {
    group: "Личное пространство",
    projects: [
      {
        name: "Проект A",
        boards: ["Доска 1", "Доска 2"]
      }
    ]
  }
]
</script>

<template>
  <aside
    id="workspace-menu"
    tabindex="-1"
    class="w-64 h-full border-r border-border bg-bg-primary flex flex-col focus:outline-none focus:ring-1 focus:ring-inset focus:ring-accent"
  >
    <div class="p-4 border-b border-border">
      <h2 class="font-heading font-bold text-lg">PROJECT</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <div v-for="group in data" :key="group.group" class="space-y-3">

        <p class="text-[10px] font-heading uppercase text-text-muted tracking-widest">
          {{ group.group }}
        </p>

        <div v-for="project in group.projects" :key="project.name" class="space-y-1">

          <p class="text-sm font-heading font-semibold text-text-primary ml-1">
            {{ project.name }}
          </p>
          
          <div class="flex flex-col space-y-1 ml-3">
            <button 
              v-for="board in project.boards" 
              :key="board"
              @click="ui.setBoard(board)"
              class="text-left px-2 py-1 text-sm transition-all rounded-none"
              :class="ui.activeBoard === board 
                ? 'bg-accent-light text-accent border-l-2 border-accent font-medium' 
                : 'text-text-secondary hover:bg-bg-secondary'"
            >
              {{ board }}
            </button>
          </div>
        </div>

      </div>
    </div>

    <div class="p-4 border-t border-border">
      <button class="text-xs text-text-muted hover:text-text-primary transition-colors w-full text-left">
        ⚙ Настройки
      </button>
    </div>
  </aside>
</template>
