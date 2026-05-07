<script setup>
import { useUiStore } from "../../stores/ui"

const ui = useUiStore()

const btnClass = (type) =>
  ui.tool === type
    ? "px-3 py-1 border border-accent bg-accent-light text-accent"
    : "px-3 py-1 border border-border hover:bg-bg-secondary"
</script>

<template>
  <div class="flex gap-2 border-b border-border bg-white p-2 text-sm">

    <button
      @click="ui.setTool('select')"
      :class="btnClass('select')"
    >
      Выбор
    </button>

    <button
      @click="ui.setTool('rect')"
      :class="btnClass('rect')"
    >
      Прямоугольник
    </button>

    <button
  @click="ui.setTool('circle')"
  :class="btnClass('circle')"
>
  Круг
</button>

<button
  @click="ui.setTool('line')"
  :class="btnClass('line')"
>
  Линия
</button>
<button
  @click="ui.setTool('triangle')"
  :class="btnClass('triangle')"
>
  Треугольник
</button>
<button
  @click="ui.setTool('text')"
  :class="btnClass('text')"
>
  Текст
</button>
<button
  @click="ui.setTool('image')"
  :class="btnClass('image')"
>
  Изображение
</button>
  </div>
</template>