<script setup>
import { computed } from "vue"

const props = defineProps({
  variant: { type: String, default: "primary" },
  type: { type: String, default: "button" },
  disabled: { type: Boolean, default: false }
})

const variantClasses = computed(() => {
  const classes = {
    primary: ["bg-accent text-white border-accent"],
    secondary: ["bg-white text-text-primary border-border"],
    ghost: ["bg-transparent text-text-secondary border-transparent"]
  }

  const interactiveClasses = {
    primary: ["hover:bg-accent-hover active:bg-accent-active"],
    secondary: ["hover:bg-bg-secondary"],
    ghost: ["hover:bg-bg-secondary"]
  }

  const variant = classes[props.variant] ? props.variant : "primary"

  return [
    classes[variant],
    props.disabled ? "opacity-50 cursor-not-allowed" : interactiveClasses[variant]
  ]
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="px-4 py-2 text-sm font-medium transition-all duration-150 border rounded-none"
    :class="variantClasses"
  >
    <slot />
  </button>
</template>
