<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue"
import { uploadBoardImage, resolveAssetUrl, WS_URL } from "../../api/board"
import { useAuthStore } from "../../stores/auth"
import { useUiStore } from "../../stores/ui"
import StylePanel from "./StylePanel.vue"

const ui = useUiStore()
const auth = useAuthStore()
const canvasRef = ref(null)
const fileInputRef = ref(null)
let ws = null
let idCounter = 1
let lastMoveSyncAt = 0

const MOVE_SYNC_INTERVAL_MS = 120

const state = reactive({
  shapes: [],
  isDrawing: false,
  drawStart: { x: 0, y: 0 },
  currentShape: null,
  isDragging: false,
  draggingIds: [],
  dragStart: { x: 0, y: 0 },
  dragOriginals: [],
  dragMoved: false,
  isSelecting: false,
  selectionStart: { x: 0, y: 0 },
  selectionCurrent: { x: 0, y: 0 },
  selectedIds: [],
  pendingImagePoint: null,
  isResizing: false,
  resizeHandle: null,
  resizeOriginals: [],
  snapGuides: [],
  shiftPressed: false
})

const upsertShape = (shape) => {
  const index = state.shapes.findIndex(item => item.id === shape.id)
  if (index === -1) state.shapes.push(shape)
  else state.shapes[index] = { ...state.shapes[index], ...shape }
}

const removeShape = (id) => {
  state.shapes = state.shapes.filter(shape => shape.id !== id)
  state.selectedIds = state.selectedIds.filter(selectedId => selectedId !== id)
}

const sendBoardEvent = (type, payload) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false
  ws.send(JSON.stringify({ type, payload }))
  return true
}

const isLocalEditing = (id) => {
  if (!id) return false
  return (
    state.draggingIds.includes(id) ||
    state.currentShape?.id === id ||
    (state.isResizing && state.selectedIds.includes(id))
  )
}

const syncEditedShapes = (force = false) => {
  const now = Date.now()
  if (!force && now - lastMoveSyncAt < MOVE_SYNC_INTERVAL_MS) return

  lastMoveSyncAt = now
  const ids = state.isResizing ? state.selectedIds : state.draggingIds
  ids.forEach(id => {
    const shape = state.shapes.find(item => item.id === id)
    if (!shape) return
    sendBoardEvent(shape.type === "line" || state.isResizing ? "update-object" : "move-object", shape)
  })
}

const createRemoteShape = (shape) => {
  if (sendBoardEvent("create-object", shape)) removeShape(shape.id)
}

const connectBoardSocket = () => {
  if (!auth.accessToken || !ui.activeBoardId || ws) return

  ws = new WebSocket(WS_URL)

  ws.addEventListener("open", () => {
    ws.send(JSON.stringify({ type: "auth", accessToken: auth.accessToken }))
    ws.send(JSON.stringify({ type: "join-board", boardId: ui.activeBoardId }))
  })

  ws.addEventListener("message", (event) => {
    let data
    try {
      data = JSON.parse(event.data)
    } catch {
      return
    }

    if (data.type === "board-state") {
      state.shapes = data.payload?.objects || []
      return
    }

    if (["create-object", "update-object", "move-object"].includes(data.type)) {
      if (isLocalEditing(data.payload?.id)) return
      upsertShape(data.payload)
      return
    }

    if (data.type === "delete-object") {
      removeShape(data.payload?.id)
    }
  })

  ws.addEventListener("close", () => {
    ws = null
  })
}

const GRID_SIZE = 20
const MIN_DRAG_SIZE = 4
const SNAP_THRESHOLD = 8

const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE

const getPoint = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

const findSnapGuides = (movingBounds) => {
  const guides = []
  const otherShapes = state.shapes.filter(s => !state.selectedIds.includes(s.id))

  otherShapes.forEach(shape => {
    const bounds = getShapeBounds(shape)

    if (Math.abs(movingBounds.x - bounds.x) < SNAP_THRESHOLD) {
      guides.push({ type: 'vertical', pos: bounds.x })
    }
    if (Math.abs(movingBounds.x + movingBounds.width - (bounds.x + bounds.width)) < SNAP_THRESHOLD) {
      guides.push({ type: 'vertical', pos: bounds.x + bounds.width })
    }
    if (Math.abs(movingBounds.y - bounds.y) < SNAP_THRESHOLD) {
      guides.push({ type: 'horizontal', pos: bounds.y })
    }
    if (Math.abs(movingBounds.y + movingBounds.height - (bounds.y + bounds.height)) < SNAP_THRESHOLD) {
      guides.push({ type: 'horizontal', pos: bounds.y + bounds.height })
    }
  })

  return guides
}

const selectionBounds = computed(() => {
  if (state.selectedIds.length === 0) return null

  const selectedShapes = state.shapes.filter(s => state.selectedIds.includes(s.id))
  if (selectedShapes.length === 0) return null

  const bounds = selectedShapes.map(getShapeBounds)
  const minX = Math.min(...bounds.map(b => b.x))
  const minY = Math.min(...bounds.map(b => b.y))
  const maxX = Math.max(...bounds.map(b => b.x + b.width))
  const maxY = Math.max(...bounds.map(b => b.y + b.height))

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
})

const getShapeBounds = (shape) => {
  if (shape.type === "line") {
    const x = Math.min(shape.x1, shape.x2)
    const y = Math.min(shape.y1, shape.y2)

    return {
      x,
      y,
      width: Math.max(Math.abs(shape.x2 - shape.x1), 1),
      height: Math.max(Math.abs(shape.y2 - shape.y1), 1)
    }
  }

  if (shape.type === "text") {
    return {
      x: shape.x,
      y: shape.y,
      width: shape.width || 120,
      height: shape.height || 30
    }
  }

  return {
    x: shape.x,
    y: shape.y,
    width: shape.width || shape.size || 0,
    height: shape.height || shape.size || 0
  }
}

const getShapeWrapperStyle = (shape) => {
  const bounds = getShapeBounds(shape)

  return {
    left: `${bounds.x}px`,
    top: `${bounds.y}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`
  }
}

const intersects = (a, b) =>
  a.x <= b.x + b.width &&
  a.x + a.width >= b.x &&
  a.y <= b.y + b.height &&
  a.y + a.height >= b.y

const beginSelecting = (point) => {
  state.isSelecting = true
  state.selectionStart = point
  state.selectionCurrent = point
  state.selectedIds = []
}

const beginDrawing = (point) => {
  const snappedX = snapToGrid(point.x)
  const snappedY = snapToGrid(point.y)

  state.isDrawing = true

  if (ui.tool === "line") {
    const shape = {
      id: `local-${idCounter++}`,
      type: "line",
      x1: snappedX,
      y1: snappedY,
      x2: snappedX,
      y2: snappedY,
      stroke: "#4DA3FF"
    }

    state.currentShape = shape
    state.shapes.push(shape)
    return
  }

  state.drawStart = { x: snappedX, y: snappedY }

  const shape = {
    id: `local-${idCounter++}`,
    type: ui.tool,
    x: snappedX,
    y: snappedY,
    width: 0,
    height: 0,
    fill: "#EAF4FF",
    stroke: "#4DA3FF"
  }

  state.currentShape = shape
  state.shapes.push(shape)
}

const finishDrawing = () => {
  if (!state.currentShape) return

  const shape = state.currentShape
  const bounds = getShapeBounds(shape)

  if (bounds.width < MIN_DRAG_SIZE && bounds.height < MIN_DRAG_SIZE) {
    state.shapes = state.shapes.filter(item => item.id !== shape.id)
    state.selectedIds = []
  } else {
    state.selectedIds = [shape.id]
    ui.setTool("select")
    createRemoteShape(shape)
  }

  state.isDrawing = false
  state.currentShape = null
}

const finishSelecting = () => {
  state.isSelecting = false

  const selection = {
    x: Math.min(state.selectionStart.x, state.selectionCurrent.x),
    y: Math.min(state.selectionStart.y, state.selectionCurrent.y),
    width: Math.abs(state.selectionCurrent.x - state.selectionStart.x),
    height: Math.abs(state.selectionCurrent.y - state.selectionStart.y)
  }

  if (selection.width < MIN_DRAG_SIZE && selection.height < MIN_DRAG_SIZE) {
    state.selectedIds = []
    return
  }

  state.selectedIds = state.shapes
    .filter(shape => intersects(selection, getShapeBounds(shape)))
    .map(shape => shape.id)
}

const handleMouseDown = (e) => {
  if (e.button !== 0) return

  const point = getPoint(e)

  if (ui.tool === "select" && e.target === canvasRef.value) {
    beginSelecting(point)
    return
  }

  if (["line", "rect", "circle", "triangle"].includes(ui.tool)) {
    beginDrawing(point)
  }
}

const handleMouseMove = (e) => {
  if (
    (state.isSelecting || state.isDrawing || state.isDragging || state.isResizing) &&
    e.buttons === 0
  ) {
    handleMouseUp()
    return
  }

  const point = getPoint(e)

  if (state.isSelecting) {
    state.selectionCurrent = point
    return
  }

  if (state.isDrawing && state.currentShape?.type === "line") {
    state.currentShape.x2 = snapToGrid(point.x)
    state.currentShape.y2 = snapToGrid(point.y)
    return
  }

  if (state.isDrawing && state.currentShape) {
    const snappedX = snapToGrid(point.x)
    const snappedY = snapToGrid(point.y)
    const dx = snappedX - state.drawStart.x
    const dy = snappedY - state.drawStart.y

    state.currentShape.width = Math.abs(dx)
    state.currentShape.height = Math.abs(dy)
    state.currentShape.x = Math.min(state.drawStart.x, snappedX)
    state.currentShape.y = Math.min(state.drawStart.y, snappedY)
    return
  }

  if (state.isResizing) {
    const dx = point.x - state.dragStart.x
    const dy = point.y - state.dragStart.y

    state.dragMoved = true

    const bounds = {
      x: Math.min(...state.resizeOriginals.map(o => o.bounds.x)),
      y: Math.min(...state.resizeOriginals.map(o => o.bounds.y)),
      width: Math.max(...state.resizeOriginals.map(o => o.bounds.x + o.bounds.width)) - Math.min(...state.resizeOriginals.map(o => o.bounds.x)),
      height: Math.max(...state.resizeOriginals.map(o => o.bounds.y + o.bounds.height)) - Math.min(...state.resizeOriginals.map(o => o.bounds.y))
    }

    let newBounds = { ...bounds }

    if (state.resizeHandle.includes('e')) {
      newBounds.width = Math.max(20, bounds.width + dx)
    }
    if (state.resizeHandle.includes('w')) {
      const newWidth = Math.max(20, bounds.width - dx)
      newBounds.x = bounds.x + bounds.width - newWidth
      newBounds.width = newWidth
    }
    if (state.resizeHandle.includes('s')) {
      newBounds.height = Math.max(20, bounds.height + dy)
    }
    if (state.resizeHandle.includes('n')) {
      const newHeight = Math.max(20, bounds.height - dy)
      newBounds.y = bounds.y + bounds.height - newHeight
      newBounds.height = newHeight
    }

    const scaleX = newBounds.width / bounds.width
    const scaleY = newBounds.height / bounds.height

    state.resizeOriginals.forEach(original => {
      const shape = state.shapes.find(item => item.id === original.id)
      if (!shape) return

      const relX = (original.bounds.x - bounds.x) / bounds.width
      const relY = (original.bounds.y - bounds.y) / bounds.height
      const relW = original.bounds.width / bounds.width
      const relH = original.bounds.height / bounds.height

      if (shape.type === "line") {
        const relX1 = (original.x1 - bounds.x) / bounds.width
        const relY1 = (original.y1 - bounds.y) / bounds.height
        const relX2 = (original.x2 - bounds.x) / bounds.width
        const relY2 = (original.y2 - bounds.y) / bounds.height

        shape.x1 = newBounds.x + relX1 * newBounds.width
        shape.y1 = newBounds.y + relY1 * newBounds.height
        shape.x2 = newBounds.x + relX2 * newBounds.width
        shape.y2 = newBounds.y + relY2 * newBounds.height
      } else {
        shape.x = newBounds.x + relX * newBounds.width
        shape.y = newBounds.y + relY * newBounds.height
        shape.width = relW * newBounds.width
        shape.height = relH * newBounds.height
      }
    })

    syncEditedShapes()
    return
  }

  if (state.isDragging) {
    const dx = snapToGrid(point.x - state.dragStart.x)
    const dy = snapToGrid(point.y - state.dragStart.y)

    state.dragMoved = dx !== 0 || dy !== 0

    state.dragOriginals.forEach(original => {
      const shape = state.shapes.find(item => item.id === original.id)
      if (!shape) return

      if (shape.type === "line") {
        shape.x1 = original.x1 + dx
        shape.y1 = original.y1 + dy
        shape.x2 = original.x2 + dx
        shape.y2 = original.y2 + dy
      } else {
        shape.x = original.x + dx
        shape.y = original.y + dy
      }
    })

    if (state.selectedIds.length > 0) {
      const firstShape = state.shapes.find(s => s.id === state.selectedIds[0])
      if (firstShape) {
        const bounds = getShapeBounds(firstShape)
        state.snapGuides = findSnapGuides(bounds)
      }
    }

    if (state.dragMoved) {
      syncEditedShapes()
    }
  }
}

const handleMouseUp = () => {
  if (state.isSelecting) {
    finishSelecting()
    return
  }

  if (state.isDrawing) {
    finishDrawing()
    return
  }

  if (state.dragMoved) syncEditedShapes(true)
  state.isDragging = false
  state.draggingIds = []
  state.dragOriginals = []
  state.isResizing = false
  state.resizeHandle = null
  state.resizeOriginals = []
  state.snapGuides = []
}

const startDrag = (e, shape) => {
  if (e.button !== 0) return

  const point = getPoint(e)

  if (!state.selectedIds.includes(shape.id)) {
    state.selectedIds = [shape.id]
  }

  state.isDragging = true
  state.dragStart = point
  state.dragMoved = false
  state.draggingIds = [...state.selectedIds]
  state.dragOriginals = state.shapes
    .filter(item => state.draggingIds.includes(item.id))
    .map(item => ({ ...item }))
}

const selectShape = (shape) => {
  if (state.dragMoved) {
    state.dragMoved = false
    return
  }

  if (!state.isDragging && !state.isResizing) {
    state.selectedIds = [shape.id]
  }
}

const startResize = (e, handle) => {
  e.stopPropagation()
  if (e.button !== 0) return

  const point = getPoint(e)

  state.isResizing = true
  state.resizeHandle = handle
  state.dragStart = point
  state.dragMoved = false

  state.resizeOriginals = state.shapes
    .filter(item => state.selectedIds.includes(item.id))
    .map(item => ({
      id: item.id,
      x1: item.x1,
      y1: item.y1,
      x2: item.x2,
      y2: item.y2,
      bounds: getShapeBounds(item)
    }))
}

const handleKey = (e) => {
  if (e.key === "Shift") {
    state.shiftPressed = true
  }

  if (e.key === "Delete" && state.selectedIds.length > 0) {
    state.selectedIds.forEach(id => sendBoardEvent("delete-object", { id }))
    state.shapes = state.shapes.filter(
      shape => !state.selectedIds.includes(shape.id)
    )
    state.selectedIds = []
  }

  if (e.key === "Shift" && state.selectedIds.length > 1) {
    distributeShapes()
  }
}

const handleKeyUp = (e) => {
  if (e.key === "Shift") {
    state.shiftPressed = false
  }
}

const distributeShapes = () => {
  if (state.selectedIds.length < 3) return

  const selectedShapes = state.shapes
    .filter(s => state.selectedIds.includes(s.id))
    .map(s => ({ shape: s, bounds: getShapeBounds(s) }))
    .sort((a, b) => a.bounds.x - b.bounds.x)

  const first = selectedShapes[0].bounds
  const last = selectedShapes[selectedShapes.length - 1].bounds
  const totalWidth = (last.x + last.width) - first.x
  const totalShapeWidth = selectedShapes.reduce((sum, s) => sum + s.bounds.width, 0)
  const gap = (totalWidth - totalShapeWidth) / (selectedShapes.length - 1)

  let currentX = first.x

  selectedShapes.forEach((item, index) => {
    if (index === 0 || index === selectedShapes.length - 1) {
      currentX += item.bounds.width + gap
      return
    }

    const dx = currentX - item.bounds.x

    if (item.shape.type === "line") {
      item.shape.x1 += dx
      item.shape.x2 += dx
    } else {
      item.shape.x = currentX
    }

    currentX += item.bounds.width + gap
  })

  const sortedByY = [...selectedShapes].sort((a, b) => a.bounds.y - b.bounds.y)
  const firstY = sortedByY[0].bounds
  const lastY = sortedByY[sortedByY.length - 1].bounds
  const totalHeight = (lastY.y + lastY.height) - firstY.y
  const totalShapeHeight = sortedByY.reduce((sum, s) => sum + s.bounds.height, 0)
  const gapY = (totalHeight - totalShapeHeight) / (sortedByY.length - 1)

  let currentY = firstY.y

  sortedByY.forEach((item, index) => {
    if (index === 0 || index === sortedByY.length - 1) {
      currentY += item.bounds.height + gapY
      return
    }

    const dy = currentY - item.bounds.y

    if (item.shape.type === "line") {
      item.shape.y1 += dy
      item.shape.y2 += dy
    } else {
      item.shape.y = currentY
    }

    currentY += item.bounds.height + gapY
  })
}

const handleCanvasClick = (e) => {
  if (e.target !== canvasRef.value) return

  const point = getPoint(e)

  if (ui.tool === "text") {
    const shape = {
      id: `local-${idCounter++}`,
      type: "text",
      x: snapToGrid(point.x),
      y: snapToGrid(point.y),
      width: 120,
      height: 30,
      text: "Введите текст",
      fontSize: 14,
      color: "#000000"
    }

    state.shapes.push(shape)
    state.selectedIds = [shape.id]
    ui.setTool("select")
    createRemoteShape(shape)
    return
  }

  if (ui.tool === "image") {
    state.pendingImagePoint = {
      x: snapToGrid(point.x),
      y: snapToGrid(point.y)
    }
    fileInputRef.value.click()
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = async (event) => {
    const point = state.pendingImagePoint || { x: 100, y: 100 }
    let src = event.target.result

    if (auth.accessToken) {
      const uploaded = await uploadBoardImage(src, auth.accessToken)
      src = uploaded.imageUrl
    }

    const shape = {
      id: `local-${idCounter++}`,
      type: "image",
      x: point.x,
      y: point.y,
      width: 150,
      height: 100,
      src,
      stroke: "#4DA3FF"
    }

    state.shapes.push(shape)
    state.selectedIds = [shape.id]
    state.pendingImagePoint = null
    ui.setTool("select")
    createRemoteShape(shape)
  }

  reader.readAsDataURL(file)
  e.target.value = ""
}

const selectedShapes = computed(() => {
  return state.shapes.filter(s => state.selectedIds.includes(s.id))
})

const handleStyleUpdate = ({ property, value }) => {
  state.selectedIds.forEach(id => {
    const shape = state.shapes.find(s => s.id === id)
    if (!shape) return

    if (property === 'x') {
      if (shape.type === 'line') {
        const dx = value - shape.x1
        shape.x1 = value
        shape.x2 += dx
      } else {
        shape.x = value
      }
    } else if (property === 'y') {
      if (shape.type === 'line') {
        const dy = value - shape.y1
        shape.y1 = value
        shape.y2 += dy
      } else {
        shape.y = value
      }
    } else {
      shape[property] = value
    }

    sendBoardEvent("update-object", shape)
  })
}

onMounted(() => {
  connectBoardSocket()
  window.addEventListener("keydown", handleKey)
  window.addEventListener("keyup", handleKeyUp)
  window.addEventListener("mouseup", handleMouseUp)
  window.addEventListener("blur", handleMouseUp)
})

watch(
  () => ui.activeBoardId,
  () => {
    state.shapes = []
    state.selectedIds = []
    ws?.close()
    ws = null
    connectBoardSocket()
  }
)

onBeforeUnmount(() => {
  ws?.close()
  window.removeEventListener("keydown", handleKey)
  window.removeEventListener("keyup", handleKeyUp)
  window.removeEventListener("mouseup", handleMouseUp)
  window.removeEventListener("blur", handleMouseUp)
})
</script>

<template>
  <div class="flex h-full">
    <div
      ref="canvasRef"
      class="relative flex-1 overflow-hidden"
      :style="{ cursor: ui.tool === 'select' ? 'default' : 'crosshair' }"
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
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 0.5px, transparent 0.5px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 0.5px, transparent 0.5px);
        "
      />

    <div
      v-for="guide in state.snapGuides"
      :key="`${guide.type}-${guide.pos}`"
      class="absolute pointer-events-none"
      :style="guide.type === 'vertical'
        ? { left: guide.pos + 'px', top: 0, width: '1px', height: '100%', background: '#FF6B9D' }
        : { top: guide.pos + 'px', left: 0, height: '1px', width: '100%', background: '#FF6B9D' }
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
      :style="getShapeWrapperStyle(shape)"
      @mousedown.stop="(e) => startDrag(e, shape)"
      @click.stop="selectShape(shape)"
    >
      <div
        v-if="shape.type === 'rect'"
        :style="{
          width: shape.width + 'px',
          height: shape.height + 'px',
          background: shape.fill,
          border: '2px solid ' + shape.stroke
        }"
        :class="state.selectedIds.includes(shape.id) ? 'ring-1 ring-accent ring-offset-0' : ''"
      />

      <div
        v-if="shape.type === 'circle'"
        :style="{
          width: shape.width + 'px',
          height: shape.height + 'px',
          borderRadius: '50%',
          background: shape.fill,
          border: '2px solid ' + shape.stroke
        }"
        :class="state.selectedIds.includes(shape.id) ? 'ring-1 ring-accent ring-offset-0' : ''"
      />

      <div
        v-if="shape.type === 'triangle'"
        :style="{
          width: 0,
          height: 0,
          borderLeft: shape.width / 2 + 'px solid transparent',
          borderRight: shape.width / 2 + 'px solid transparent',
          borderBottom: shape.height + 'px solid ' + shape.fill
        }"
        :class="state.selectedIds.includes(shape.id) ? 'ring-1 ring-accent ring-offset-0' : ''"
      />

      <svg
        v-if="shape.type === 'line'"
        :width="getShapeBounds(shape).width"
        :height="getShapeBounds(shape).height"
        :class="state.selectedIds.includes(shape.id) ? 'ring-1 ring-accent ring-offset-0' : ''"
      >
        <line
          :x1="shape.x1 <= shape.x2 ? 0 : getShapeBounds(shape).width"
          :y1="shape.y1 <= shape.y2 ? 0 : getShapeBounds(shape).height"
          :x2="shape.x1 <= shape.x2 ? getShapeBounds(shape).width : 0"
          :y2="shape.y1 <= shape.y2 ? getShapeBounds(shape).height : 0"
          :stroke="shape.stroke"
          stroke-width="2"
        />
      </svg>

      <div
        v-if="shape.type === 'text'"
        contenteditable
        class="min-w-[80px] min-h-[30px] px-2 py-1 border border-border bg-white"
        :style="{
          fontSize: (shape.fontSize || 14) + 'px',
          color: shape.color || '#000000'
        }"
        :class="state.selectedIds.includes(shape.id) ? 'ring-1 ring-accent ring-offset-0' : ''"
        @input="(e) => shape.text = e.target.innerText"
        @blur="sendBoardEvent('update-object', shape)"
      >
        {{ shape.text }}
      </div>

      <img
        v-if="shape.type === 'image'"
        :src="resolveAssetUrl(shape.src)"
        :style="{
          width: shape.width + 'px',
          height: shape.height + 'px',
          border: '2px solid ' + shape.stroke,
          objectFit: 'cover'
        }"
        :class="state.selectedIds.includes(shape.id) ? 'ring-1 ring-accent ring-offset-0' : ''"
      />
    </div>

    <div
      v-if="selectionBounds && state.selectedIds.length > 0 && !state.isDrawing"
      class="absolute pointer-events-none border border-accent"
      :style="{
        left: selectionBounds.x - 2 + 'px',
        top: selectionBounds.y - 2 + 'px',
        width: selectionBounds.width + 4 + 'px',
        height: selectionBounds.height + 4 + 'px'
      }"
    >
      <div
        v-for="handle in ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']"
        :key="handle"
        class="absolute w-2 h-2 bg-white border border-accent pointer-events-auto"
        :class="{
          'cursor-nw-resize': handle === 'nw' || handle === 'se',
          'cursor-ne-resize': handle === 'ne' || handle === 'sw',
          'cursor-n-resize': handle === 'n' || handle === 's',
          'cursor-e-resize': handle === 'e' || handle === 'w'
        }"
        :style="{
          left: handle.includes('w') ? '-4px' : handle.includes('e') ? 'calc(100% - 4px)' : 'calc(50% - 4px)',
          top: handle.includes('n') ? '-4px' : handle.includes('s') ? 'calc(100% - 4px)' : 'calc(50% - 4px)'
        }"
        @mousedown="(e) => startResize(e, handle)"
      />
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />
  </div>

  <StylePanel
    :selectedShapes="selectedShapes"
    @update="handleStyleUpdate"
  />
</div>
</template>
