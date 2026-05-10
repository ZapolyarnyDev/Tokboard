import { defineStore } from "pinia"

export const useUiStore = defineStore("ui", {
  state: () => ({
    boards: [],
    activeBoardId: null,
    activeBoard: "Доска не выбрана",
    tool: "select",
    isSidebarCollapsed: false,
    collapsedProjects: {}
  }),

  actions: {
    setBoards(boards) {
      this.boards = boards
      if (!this.activeBoardId && boards.length > 0) {
        this.setBoard(boards[0])
      }
    },

    setBoard(board) {
      this.activeBoardId = board.id
      this.activeBoard = board.title || `Доска ${board.id}`
      if (!this.boards.some((item) => item.id === board.id)) {
        this.boards = [board, ...this.boards]
      }
    },

    addBoard(board) {
      this.boards = [board, ...this.boards.filter((item) => item.id !== board.id)]
      this.setBoard(board)
    },

    leaveBoard() {
      this.activeBoardId = null
      this.activeBoard = "Доска не выбрана"
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
