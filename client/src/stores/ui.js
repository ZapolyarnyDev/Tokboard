import { defineStore } from "pinia"

export const useUiStore = defineStore("ui", {
  state: () => ({
    activeBoard: "Доска A"
  }),
  actions: {
    setBoard(name) {
      this.activeBoard = name
    }
  }
})
