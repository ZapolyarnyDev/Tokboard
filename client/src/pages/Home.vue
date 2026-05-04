<script setup>
import { ref } from "vue"
import { useUiStore } from "../stores/ui"

import UiButton from "../components/ui/UiButton.vue"
import UiInput from "../components/ui/UiInput.vue"
import UiTextarea from "../components/ui/UiTextarea.vue"
import UiCard from "../components/ui/UiCard.vue"
import UiTypography from "../components/ui/UiTypography.vue"

const text = ref("")
const store = useUiStore()
</script>

<template>
  <div class="max-w-5xl mx-auto p-8 space-y-12">

    <!-- Хедер -->
    <div>
      <UiTypography.H1>Демо дизайн-системы</UiTypography.H1>
      <UiTypography.Muted class="mt-2">
        Минимальные UI-компоненты в стиле Bento Minimalism
      </UiTypography.Muted>
    </div>

    <!-- Типография -->
    <section class="space-y-4">
      <UiTypography.H2>Типографика</UiTypography.H2>
      <UiTypography.H1>Заголовок 1</UiTypography.H1>
      <UiTypography.H2>Заголовок 2</UiTypography.H2>
      <UiTypography.H3>Заголовок 3</UiTypography.H3>
      <UiTypography.Text size="lg">Крупный основной текст</UiTypography.Text>
      <UiTypography.Text>Основной текст интерфейса</UiTypography.Text>
      <UiTypography.Code>Моноширинный пример 12345</UiTypography.Code>
    </section>

    <!-- Кнопки -->
    <section class="space-y-4">
      <h2 class="text-2xl font-heading font-semibold">Кнопки</h2>
      <div class="flex gap-4">
        <UiButton>Основная</UiButton>
        <UiButton variant="secondary">Вторичная</UiButton>
        <UiButton variant="ghost">Призрачная</UiButton>
        <UiButton disabled>Недоступная</UiButton>
      </div>
    </section>

    <!-- Инпуты -->
    <section class="space-y-4">
      <h2 class="text-2xl font-heading font-semibold">Поля ввода</h2>
      <UiInput v-model="text" placeholder="Введите текст..." />
      <UiInput placeholder="Недоступное поле" disabled />
      <UiTextarea placeholder="Пример многострочного поля" />
    </section>

    <!-- Карточки -->
    <section class="space-y-4">
      <h2 class="text-2xl font-heading font-semibold">Карточки</h2>
      <div class="grid grid-cols-2 gap-4">
        <UiCard>
          <p class="font-heading text-sm">Группа Альфа</p>
          <p class="text-sm text-text-secondary">Проект Один</p>
        </UiCard>

        <UiCard class="border-accent bg-accent-light">
          <p class="font-heading text-sm">Активная доска</p>
          <p class="text-sm">{{ store.activeBoard }}</p>
        </UiCard>
      </div>
    </section>

    <!-- Иерархия досок -->
    <section class="space-y-4">
      <h2 class="text-2xl font-heading font-semibold">Иерархия</h2>
      <UiCard>
        <div class="space-y-2">
          <p class="font-heading">Группа Альфа</p>
          <div class="ml-4 space-y-1">
            <p>Проект Один</p>
            <div class="ml-4 space-y-1">
              <p
                class="cursor-pointer"
                :class="store.activeBoard === 'Доска A'
                  ? 'text-accent'
                  : ''"
                @click="store.setBoard('Доска A')"
              >
                Доска A
              </p>
              <p
                class="cursor-pointer"
                :class="store.activeBoard === 'Доска B'
                  ? 'text-accent'
                  : ''"
                @click="store.setBoard('Доска B')"
              >
                Доска B
              </p>
            </div>
          </div>
        </div>
      </UiCard>
    </section>

  </div>
</template>
