<script setup>
import { useUiStore } from "../../stores/ui"

const ui = useUiStore()

const btnClass = (type) =>
  ui.tool === type
    ? "toolbar-button is-active"
    : "toolbar-button"
</script>

<template>
  <div class="toolbar">

    <button
      @click="ui.setTool('select')"
      :class="btnClass('select')"
      title="Выбор"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 3L17 17M3 17L17 3" />
      </svg>
    </button>

    <button
      @click="ui.setTool('rect')"
      :class="btnClass('rect')"
      title="Прямоугольник"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="14" height="14" />
      </svg>
    </button>

    <button
      @click="ui.setTool('circle')"
      :class="btnClass('circle')"
      title="Круг"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="10" cy="10" r="7" />
      </svg>
    </button>

    <button
      @click="ui.setTool('line')"
      :class="btnClass('line')"
      title="Линия"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <line x1="3" y1="17" x2="17" y2="3" />
      </svg>
    </button>

    <button
      @click="ui.setTool('triangle')"
      :class="btnClass('triangle')"
      title="Треугольник"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M10 3L17 17H3L10 3Z" />
      </svg>
    </button>

    <button
      @click="ui.setTool('text')"
      :class="btnClass('text')"
      title="Текст"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 4H16M10 4V16M7 16H13" />
      </svg>
    </button>

    <button
      @click="ui.setTool('image')"
      :class="btnClass('image')"
      title="Изображение"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="2" width="16" height="16" />
        <circle cx="7" cy="7" r="2" />
        <path d="M18 13L13 8L2 18" />
      </svg>
    </button>

  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-border-default);
  background: white;
  padding: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  overflow-y: hidden;
}

.toolbar-button {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid var(--color-border-default);
  background: white;
  color: var(--color-text-secondary);
  transition: all 150ms;
  border-radius: 4px;
}

.toolbar-button:hover {
  border-color: var(--color-border-active);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.toolbar-button.is-active {
  border-color: var(--color-accent-active);
  background: var(--color-accent-light);
  color: var(--color-accent-active);
  box-shadow: 0 2px 6px rgba(77, 163, 255, 0.25);
}

.toolbar-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .toolbar {
    padding: 0.5rem;
    gap: 0.375rem;
  }

  .toolbar-button {
    width: 2.25rem;
    height: 2.25rem;
  }
}

@media (max-width: 480px) {
  .toolbar {
    padding: 0.375rem;
    gap: 0.25rem;
  }

  .toolbar-button {
    width: 2rem;
    height: 2rem;
  }

  .toolbar-button svg {
    width: 18px;
    height: 18px;
  }
}
</style>
