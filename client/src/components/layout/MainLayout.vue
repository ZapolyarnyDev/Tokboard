<script setup>
import Sidebar from "./Sidebar.vue"
import CanvasBoard from "../canvas/CanvasBoard.vue"
import Toolbar from "../canvas/Toolbar.vue"
import { useUiStore } from "../../stores/ui"

const ui = useUiStore()
</script>

<template>
  <div class="main-layout">
    <Sidebar />

    <div class="main-content">

      <Toolbar v-if="ui.activeBoardId" />

      <main class="main-canvas-area">
        <div v-if="ui.activeBoardId" class="canvas-container">
          <CanvasBoard />
        </div>
        <div v-else class="empty-state">
          <div class="text-center px-4">
            <h2 class="font-heading text-xl font-semibold text-text-primary">Создайте доску или подключитесь</h2>
            <p class="mt-2 text-sm text-text-secondary">Используйте меню слева, чтобы начать работу.</p>
          </div>
        </div>
      </main>

    </div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-primary);
}

.main-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.main-canvas-area {
  position: relative;
  flex: 1;
  background: var(--color-bg-secondary);
  padding: 1rem;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
  border: 1px solid var(--color-border-default);
  background: white;
  overflow: hidden;
}

.empty-state {
  display: grid;
  height: 100%;
  place-items: center;
  border: 1px solid var(--color-border-default);
  background: white;
}

@media (max-width: 768px) {
  .main-canvas-area {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .main-canvas-area {
    padding: 0.25rem;
  }
}
</style>
