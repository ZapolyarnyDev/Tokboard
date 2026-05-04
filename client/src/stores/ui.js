import { defineStore } from "pinia"

export const useUiStore = defineStore("ui", {
  state: () => ({
    activeBoard: "Board A"
  }),
  actions: {
    setBoard(name) {
      this.activeBoard = name
    }
  }
})