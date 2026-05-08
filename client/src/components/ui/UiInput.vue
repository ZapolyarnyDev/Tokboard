<script setup>
defineProps({
  modelValue: String,
  placeholder: String,
  disabled: Boolean
})

defineEmits(["update:modelValue"])
</script>

<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    :disabled="disabled"
    class="w-full px-3 py-2 text-sm border bg-white rounded-none
           border-border focus:border-accent focus:outline-none
           disabled:bg-bg-tertiary disabled:text-text-muted"
  />
</template>