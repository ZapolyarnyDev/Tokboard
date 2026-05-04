<script setup>
defineProps({
  variant: { type: String, default: "primary" },
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <button
    :disabled="disabled"
    class="px-4 py-2 text-sm font-medium transition-all duration-150 border rounded-none"
    :class="{
      'bg-accent text-white border-accent hover:bg-accent-hover active:bg-accent-active':
        variant === 'primary' && !disabled,
      'bg-white text-text-primary border-border hover:bg-bg-secondary':
        variant === 'secondary' && !disabled,
      'bg-transparent text-text-secondary border-transparent hover:bg-bg-secondary':
        variant === 'ghost' && !disabled,
      'opacity-50 cursor-not-allowed': disabled
    }"
  >
    <slot />
  </button>
</template>