<script setup>
import { ref } from "vue"
import { useUiStore } from "../stores/ui"

import UiButton from "../components/ui/UiButton.vue"
import UiInput from "../components/ui/UiInput.vue"
import UiTextarea from "../components/ui/UiTextarea.vue"
import UiCard from "../components/ui/UiCard.vue"

const text = ref("")
const store = useUiStore()
</script>

<template>
  <div class="max-w-5xl mx-auto p-8 space-y-12">

    <!-- Хедер -->
    <div>
      <h1 class="text-3xl font-heading font-bold">Design System Demo</h1>
      <p class="mt-2 text-sm text-text-secondary">
        Minimal UI components based on Bento Minimalism
      </p>
    </div>

    <!-- Типография -->
    <section class="space-y-4">
      <h2 class="text-2xl font-heading font-semibold">Typography</h2>
      <h1 class="text-3xl font-heading font-bold">Heading 1</h1>
      <h2 class="text-2xl font-heading font-semibold">Heading 2</h2>
      <h3 class="text-lg font-heading font-semibold">Heading 3</h3>
      <p class="text-base">Body Large text example</p>
      <p class="text-sm">Body text example</p>
      <p class="font-heading text-sm">Mono example 12345</p>
    </section>

    <!-- Кнопки -->
    <section class="space-y-4">
      <h2 class="text-2xl font-heading font-semibold">Buttons</h2>
      <div class="flex gap-4">
        <UiButton>Primary</UiButton>
        <UiButton variant="secondary">Secondary</UiButton>
        <UiButton variant="ghost">Ghost</UiButton>
        <UiButton disabled>Disabled</UiButton>
      </div>
    </section>

    <!-- Инпуты -->
    <section class="space-y-4">
      <h2 class="text-2xl font-heading font-semibold">Inputs</h2>
      <UiInput v-model="text" placeholder="Type something..." />
      <UiInput placeholder="Disabled input" disabled />
      <UiTextarea placeholder="Textarea example" />
    </section>

    <!-- Карточки -->
    <section class="space-y-4">
      <h2 class="text-2xl font-heading font-semibold">Cards</h2>
      <div class="grid grid-cols-2 gap-4">
        <UiCard>
          <p class="font-heading text-sm">Group Alpha</p>
          <p class="text-sm text-text-secondary">Project One</p>
        </UiCard>

        <UiCard class="border-accent bg-accent-light">
          <p class="font-heading text-sm">Active Board</p>
          <p class="text-sm">{{ store.activeBoard }}</p>
        </UiCard>
      </div>
    </section>

    <!-- Иерархия досок -->
    <section class="space-y-4">
      <h2 class="text-2xl font-heading font-semibold">Hierarchy</h2>
      <UiCard>
        <div class="space-y-2">
          <p class="font-heading">Group Alpha</p>
          <div class="ml-4 space-y-1">
            <p>Project One</p>
            <div class="ml-4 space-y-1">
              <p
                class="cursor-pointer"
                :class="store.activeBoard === 'Board A'
                  ? 'text-accent'
                  : ''"
                @click="store.setBoard('Board A')"
              >
                Board A
              </p>
              <p
                class="cursor-pointer"
                :class="store.activeBoard === 'Board B'
                  ? 'text-accent'
                  : ''"
                @click="store.setBoard('Board B')"
              >
                Board B
              </p>
            </div>
          </div>
        </div>
      </UiCard>
    </section>

  </div>
</template>