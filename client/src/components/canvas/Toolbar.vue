<script setup>
import { useUiStore } from "../../stores/ui"

const ui = useUiStore()

const btnClass = (type) =>
  ui.tool === type
    ? "p-2 border border-accent bg-accent-light text-accent transition-all"
    : "p-2 border border-border hover:bg-bg-secondary hover:border-border-hover transition-all"
</script>

<template>
  <div class="flex gap-2 border-b border-border bg-white p-2">

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
