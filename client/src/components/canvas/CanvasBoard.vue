<script setup>
import { ref, reactive, onMounted } from "vue"
import { useUiStore } from "../../stores/ui"

const ui = useUiStore()
const canvasRef = ref(null)
const fileInputRef = ref(null)
let idCounter = 1

const state = reactive({
  shapes: [],

  isDrawing: false,
  drawStart: { x: 0, y: 0 },
  currentShape: null,

  draggingId: null,
  offsetX: 0,
  offsetY: 0,

  isSelecting: false,
selectionStart: { x: 0, y: 0 },
selectionCurrent: { x: 0, y: 0 },
selectedIds: []
})

const handleMouseDown = (e) => {

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (ui.tool === "select" && e.target === canvasRef.value) {
    state.isSelecting = true
    state.selectionStart = { x, y }
    state.selectionCurrent = { x, y }
    state.selectedIds = []
    return
  }

  if (ui.tool === "line") {
    state.isDrawing = true

    const shape = {
      id: idCounter++,
      type: "line",
      x1: x,
      y1: y,
      x2: x,
      y2: y,
      stroke: "#4DA3FF"
    }

    state.currentShape = shape
    state.shapes.push(shape)
    return
  }

  if (
    ui.tool === "rect" ||
    ui.tool === "circle" ||
    ui.tool === "triangle"
  ) {
    state.isDrawing = true
    state.drawStart = { x, y }

    const shape = {
      id: idCounter++,
      type: ui.tool,
      x,
      y,
      width: 0,
      height: 0,
      fill: "#EAF4FF",
      stroke: "#4DA3FF"
    }

    state.currentShape = shape
    state.shapes.push(shape)
  }
}

const handleMouseMove = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (state.isSelecting) {
    state.selectionCurrent = { x, y }
    return
  }

  if (state.isDrawing && state.currentShape?.type === "line") {
    state.currentShape.x2 = x
    state.currentShape.y2 = y
    return
  }

  if (state.isDrawing && state.currentShape) {
    const dx = x - state.drawStart.x
    const dy = y - state.drawStart.y

    state.currentShape.width = dx
    state.currentShape.height = dy

    if (dx < 0) state.currentShape.x = x
    else state.currentShape.x = state.drawStart.x

    if (dy < 0) state.currentShape.y = y
    else state.currentShape.y = state.drawStart.y
  }

  if (state.draggingId) {
    const shape = state.shapes.find(s => s.id === state.draggingId)
    shape.x = x - state.offsetX
    shape.y = y - state.offsetY
  }
}
const handleMouseUp = () => {
    if (state.isSelecting) {
  state.isSelecting = false

  const minX = Math.min(state.selectionStart.x, state.selectionCurrent.x)
  const minY = Math.min(state.selectionStart.y, state.selectionCurrent.y)
  const maxX = Math.max(state.selectionStart.x, state.selectionCurrent.x)
  const maxY = Math.max(state.selectionStart.y, state.selectionCurrent.y)

  state.selectedIds = state.shapes
  .filter(s => {

    if (s.type === "line") {
      const minLineX = Math.min(s.x1, s.x2)
      const minLineY = Math.min(s.y1, s.y2)
      const maxLineX = Math.max(s.x1, s.x2)
      const maxLineY = Math.max(s.y1, s.y2)

      return (
        minLineX >= minX &&
        minLineY >= minY &&
        maxLineX <= maxX &&
        maxLineY <= maxY
      )
    }

    return (
      s.x >= minX &&
      s.y >= minY &&
      s.x + s.width <= maxX &&
      s.y + s.height <= maxY
    )
  })
  .map(s => s.id)

  return
}
  state.isDrawing = false
  state.currentShape = null
  state.draggingId = null
}

const startDrag = (e, shape) => {
  if (ui.tool !== "select") return

  state.draggingId = shape.id
  state.offsetX = e.offsetX
  state.offsetY = e.offsetY
 state.selectedIds = [shape.id]
}

const selectShape = (shape) => {
  state.selectedIds = [shape.id]
}

const handleKey = (e) => {
  if (e.key === "Delete" && state.selectedIds.length > 0) {
    state.shapes = state.shapes.filter(
      shape => !state.selectedIds.includes(shape.id)
    )

    state.selectedIds = []
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKey)
})
const handleCanvasClick = (e) => {
  if (e.target !== canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (ui.tool === "text") {
    state.shapes.push({
      id: idCounter++,
      type: "text",
      x,
      y,
      width: 120,
      height: 30,
      text: "Введите текст"
    })
  }

  if (ui.tool === "image") {
  fileInputRef.value.click()


    if (!url) return

    state.shapes.push({
      id: idCounter++,
      type: "image",
      x,
      y,
      width: 150,
      height: 100,
      src: url,
      stroke: "#4DA3FF"
    })
  }
}
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = (event) => {
    state.shapes.push({
      id: idCounter++,
      type: "image",
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      src: event.target.result,
      stroke: "#4DA3FF"
    })
  }

  reader.readAsDataURL(file)

  e.target.value = ""
}
</script>

<template>
  <div
  ref="canvasRef"
  class="relative w-full h-full"
  @mousedown="handleMouseDown"
  @mousemove="handleMouseMove"
  @mouseup="handleMouseUp"
  @mouseleave="handleMouseUp"
  @click="handleCanvasClick"
>

    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background-size: 20px 20px;
        background-image:
          linear-gradient(to right, #EEF2F6 1px, transparent 1px),
          linear-gradient(to bottom, #EEF2F6 1px, transparent 1px);
      "
    />
    <div
  v-if="state.isSelecting"
  class="absolute border border-accent bg-accent-light opacity-40 pointer-events-none"
  :style="{
    left: Math.min(state.selectionStart.x, state.selectionCurrent.x) + 'px',
    top: Math.min(state.selectionStart.y, state.selectionCurrent.y) + 'px',
    width: Math.abs(state.selectionCurrent.x - state.selectionStart.x) + 'px',
    height: Math.abs(state.selectionCurrent.y - state.selectionStart.y) + 'px'
  }"
/>  

    <div
      v-for="shape in state.shapes"
  :key="shape.id"
  class="absolute cursor-move"
  :style="{ left: shape.x + 'px', top: shape.y + 'px' }"
  @mousedown.stop="(e) => startDrag(e, shape)"
  @click.stop="selectShape(shape)"
>

  <div v-if="shape.type === 'rect'"
    :style="{
      width: shape.width + 'px',
      height: shape.height + 'px',
      background: shape.fill,
      border: '2px solid ' + shape.stroke
    }"
    :class="state.selectedIds.includes(shape.id) ? 'ring-2 ring-accent' : ''"
  />

  <div v-if="shape.type === 'circle'"
    :style="{
      width: Math.abs(shape.width) + 'px',
      height: Math.abs(shape.width) + 'px',
      borderRadius: '50%',
      background: shape.fill,
      border: '2px solid ' + shape.stroke
    }"
    :class="state.selectedIds.includes(shape.id) ? 'ring-2 ring-accent' : ''"
  />
    <div v-if="shape.type === 'triangle'"
  :style="{
    width: 0,
    height: 0,
    borderLeft: Math.abs(shape.width) / 2 + 'px solid transparent',
    borderRight: Math.abs(shape.width) / 2 + 'px solid transparent',
    borderBottom: Math.abs(shape.height) + 'px solid ' + shape.fill
  }"
  :class="state.selectedIds.includes(shape.id) ? 'ring-2 ring-accent' : ''"
/>
  <div v-if="shape.type === 'line'"
  :style="{
    position: 'absolute',
    left: Math.min(shape.x1, shape.x2) + 'px',
    top: Math.min(shape.y1, shape.y2) + 'px',
    width: Math.abs(shape.x2 - shape.x1) + 'px',
    height: Math.abs(shape.y2 - shape.y1) + 'px'
  }"
  :class="state.selectedIds.includes(shape.id) ? 'ring-2 ring-accent' : ''"
>
  <svg
    :width="Math.abs(shape.x2 - shape.x1)"
    :height="Math.abs(shape.y2 - shape.y1)"
  >
    <line
      :x1="shape.x1 < shape.x2 ? 0 : Math.abs(shape.x2 - shape.x1)"
      :y1="shape.y1 < shape.y2 ? 0 : Math.abs(shape.y2 - shape.y1)"
      :x2="shape.x1 < shape.x2 ? Math.abs(shape.x2 - shape.x1) : 0"
      :y2="shape.y1 < shape.y2 ? Math.abs(shape.y2 - shape.y1) : 0"
      :stroke="shape.stroke"
      stroke-width="2"
      style="pointer-events: none"
    />
  </svg>
</div>

<div v-if="shape.type === 'text'"
  contenteditable
  class="min-w-[80px] min-h-[30px] px-2 py-1 border border-border bg-white text-sm"
  :class="state.selectedIds.includes(shape.id) ? 'ring-2 ring-accent' : ''"
>
  {{ shape.text }}
</div>

<img v-if="shape.type === 'image'"
  :src="shape.src"
  :style="{
    width: shape.width + 'px',
    height: shape.height + 'px',
    border: '2px solid ' + shape.stroke,
    objectFit: 'cover'
  }"
  :class="state.selectedIds.includes(shape.id) ? 'ring-2 ring-accent' : ''" 
/>
    </div>

  </div>
  <input
  ref="fileInputRef"
  type="file"
  accept="image/*"
  class="hidden"
  @change="handleFileChange"
/>
</template>