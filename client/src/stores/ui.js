import { defineStore } from "pinia"

export const useUiStore = defineStore("ui", {
  state: () => ({
    activeBoard: "Доска 1",
    isSidebarCollapsed: false,
    collapsedProjects: {}
  }),
  actions: {
    setBoard(name) {
      this.activeBoard = name
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed
    },
    toggleProject(name) {
      this.collapsedProjects[name] = !this.collapsedProjects[name]
    }
  }
})
