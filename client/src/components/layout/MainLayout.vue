<script setup>
import Sidebar from "./Sidebar.vue"
import CanvasBoard from "../canvas/CanvasBoard.vue"
import Toolbar from "../canvas/Toolbar.vue"
</script>

<template>
  <div class="flex h-full w-full overflow-hidden bg-bg-primary">
    <Sidebar />
    
    <div class="flex-1 flex flex-col overflow-hidden">
      <Toolbar />

      <main class="flex-1 relative bg-bg-secondary p-4">
        <div class="w-full h-full border border-border bg-white rounded-none overflow-hidden">
          <CanvasBoard />
        </div>
      </main>
    </div>
  </div>
</template>