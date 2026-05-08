import { defineStore } from "pinia"

export const useUiStore = defineStore("ui", {
  state: () => ({
    activeBoard: "Доска 1",

    tool: "select",

    isSidebarCollapsed: false,
    collapsedProjects: {}
  }),

  actions: {
    setBoard(name) {
      this.activeBoard = name
    },

    setTool(tool) {
      this.tool = tool
    },

    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed
    },

    toggleProject(name) {
      this.collapsedProjects[name] = !this.collapsedProjects[name]
    }
  }
})