<script setup>
import { computed } from "vue"

const props = defineProps({
  selectedShapes: Array
})

const emit = defineEmits(['update'])

const selectedShape = computed(() => {
  if (!props.selectedShapes || props.selectedShapes.length !== 1) return null
  return props.selectedShapes[0]
})

const updateProperty = (property, value) => {
  emit('update', { property, value })
}
</script>

<template>
  <div class="w-64 border-l border-border bg-white p-4 overflow-y-auto">
    <div v-if="!selectedShape" class="text-sm text-gray-500">
      Выберите объект для редактирования
    </div>

    <div v-else class="space-y-4">
      <div class="text-sm font-medium mb-4">Свойства объекта</div>

      <div v-if="selectedShape.type !== 'text' && selectedShape.type !== 'image'">
        <label class="text-xs text-gray-600 block mb-1">Цвет обводки</label>
        <input
          type="color"
          :value="selectedShape.stroke"
          @input="updateProperty('stroke', $event.target.value)"
          class="w-full h-8 border border-border rounded cursor-pointer"
        />
      </div>

      <div v-if="['rect', 'circle', 'triangle'].includes(selectedShape.type)">
        <label class="text-xs text-gray-600 block mb-1">Цвет заливки</label>
        <input
          type="color"
          :value="selectedShape.fill"
          @input="updateProperty('fill', $event.target.value)"
          class="w-full h-8 border border-border rounded cursor-pointer"
        />
      </div>

      <div v-if="selectedShape.type === 'text'">
        <label class="text-xs text-gray-600 block mb-1">Текст</label>
        <textarea
          :value="selectedShape.text"
          @input="updateProperty('text', $event.target.value)"
          class="w-full px-2 py-1 border border-border rounded text-sm"
          rows="3"
        />
      </div>

      <div v-if="selectedShape.type === 'text'">
        <label class="text-xs text-gray-600 block mb-1">Размер шрифта</label>
        <input
          type="number"
          :value="selectedShape.fontSize || 14"
          @input="updateProperty('fontSize', parseInt($event.target.value))"
          class="w-full px-2 py-1 border border-border rounded text-sm"
          min="8"
          max="72"
        />
      </div>

      <div v-if="selectedShape.type === 'text'">
        <label class="text-xs text-gray-600 block mb-1">Цвет текста</label>
        <input
          type="color"
          :value="selectedShape.color || '#000000'"
          @input="updateProperty('color', $event.target.value)"
          class="w-full h-8 border border-border rounded cursor-pointer"
        />
      </div>

      <div v-if="selectedShape.type !== 'line'">
        <label class="text-xs text-gray-600 block mb-1">Ширина</label>
        <input
          type="number"
          :value="Math.round(selectedShape.width)"
          @input="updateProperty('width', parseInt($event.target.value))"
          class="w-full px-2 py-1 border border-border rounded text-sm"
          min="10"
        />
      </div>

      <div v-if="selectedShape.type !== 'line'">
        <label class="text-xs text-gray-600 block mb-1">Высота</label>
        <input
          type="number"
          :value="Math.round(selectedShape.height)"
          @input="updateProperty('height', parseInt($event.target.value))"
          class="w-full px-2 py-1 border border-border rounded text-sm"
          min="10"
        />
      </div>

      <div>
        <label class="text-xs text-gray-600 block mb-1">X</label>
        <input
          type="number"
          :value="Math.round(selectedShape.x || selectedShape.x1)"
          @input="updateProperty('x', parseInt($event.target.value))"
          class="w-full px-2 py-1 border border-border rounded text-sm"
        />
      </div>

      <div>
        <label class="text-xs text-gray-600 block mb-1">Y</label>
        <input
          type="number"
          :value="Math.round(selectedShape.y || selectedShape.y1)"
          @input="updateProperty('y', parseInt($event.target.value))"
          class="w-full px-2 py-1 border border-border rounded text-sm"
        />
      </div>
    </div>
  </div>
</template>
