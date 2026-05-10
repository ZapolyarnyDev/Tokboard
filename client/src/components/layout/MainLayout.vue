<script setup>
import Sidebar from "./Sidebar.vue"
import CanvasBoard from "../canvas/CanvasBoard.vue"
import Toolbar from "../canvas/Toolbar.vue"
import { useUiStore } from "../../stores/ui"

const ui = useUiStore()
</script>

<template>
  <div class="flex h-full w-full overflow-hidden bg-bg-primary">
    <Sidebar />
    
    <div class="flex-1 flex flex-col overflow-hidden">
      
      <Toolbar v-if="ui.activeBoardId" />

      <main class="flex-1 relative bg-bg-secondary p-4">
        <div v-if="ui.activeBoardId" class="w-full h-full border border-border bg-white rounded-none overflow-hidden">
          <CanvasBoard />
        </div>
        <div v-else class="grid h-full place-items-center border border-border bg-white">
          <div class="text-center">
            <h2 class="font-heading text-xl font-semibold text-text-primary">Create or join a board</h2>
            <p class="mt-2 text-sm text-text-secondary">Use the left menu to start working.</p>
          </div>
        </div>
      </main>

    </div>
  </div>
</template>
