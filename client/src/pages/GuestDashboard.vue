<script setup>
import { ref } from "vue"
import { Image, MousePointer2, Move, Shapes, Trash2, Wifi } from "lucide-vue-next"
import { useAuthStore } from "../stores/auth"
import UiButton from "../components/ui/UiButton.vue"
import UiInput from "../components/ui/UiInput.vue"
import UiTypography from "../components/ui/UiTypography.vue"

const auth = useAuthStore()
const email = ref("")
const password = ref("")

const capabilities = [
  { icon: Shapes, title: "6 типов объектов", text: "текст, изображение, линия, прямоугольник, треугольник и круг" },
  { icon: Move, title: "Редактирование", text: "координаты, размеры, цвет, толщина линии и заливка" },
  { icon: Wifi, title: "Работа в реальном времени", text: "изменения на доске сразу видны всем участникам" }
]

const handleLogin = () => {
  auth.login({ name: "Пользователь", email: email.value || "student@tokboard.local" })
}
</script>

<template>
  <div class="h-full overflow-y-auto bg-bg-secondary">
    <main class="grid min-h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.86fr)]">
      <section class="flex items-center border-r border-border bg-white px-6 py-10 md:px-10 lg:px-14">
        <div class="w-full max-w-3xl">
          <UiTypography.H1 class="max-w-2xl text-[32px] font-bold md:text-[40px]">
            Интерактивная доска для совместной работы с объектами
          </UiTypography.H1>

          <UiTypography.Text class="mt-5 max-w-2xl leading-7" size="lg" tone="secondary">
            Tokboard помогает участникам группы создавать, перемещать и редактировать объекты на общей доске, а изменения синхронизируются у всех подключённых пользователей в реальном времени.
          </UiTypography.Text>

          <div class="mt-8 grid gap-3 md:grid-cols-3">
            <article
              v-for="item in capabilities"
              :key="item.title"
              class="border border-border bg-bg-primary p-4"
            >
              <component :is="item.icon" :size="20" :stroke-width="2" class="text-accent" />
              <UiTypography.Title as="h2" class="mt-4 text-sm" size="h4">
                {{ item.title }}
              </UiTypography.Title>
              <UiTypography.Text class="mt-2 leading-6" size="md" tone="secondary">
                {{ item.text }}
              </UiTypography.Text>
            </article>
          </div>

          <form id="login" class="mt-8 grid gap-3 border border-border bg-bg-secondary p-4 md:grid-cols-[1fr_1fr_auto]" @submit.prevent="handleLogin">
            <UiInput v-model="email" type="email" placeholder="student@mail.ru" />
            <UiInput v-model="password" type="password" placeholder="Пароль" />
            <UiButton type="submit" class="h-10 whitespace-nowrap">
              Войти в доску
            </UiButton>
          </form>
        </div>
      </section>

      <section class="relative min-h-[520px] overflow-hidden bg-bg-tertiary p-6 md:p-10">
        <div class="absolute inset-6 border border-border bg-white">
          <div class="flex h-12 items-center justify-between border-b border-border px-4">
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 border border-accent bg-accent-light" />
              <UiTypography.Code as="span" class="uppercase" size="sm" tone="muted">Live Canvas</UiTypography.Code>
            </div>
            <UiTypography.Muted as="div" class="flex items-center gap-2" size="sm">
              <MousePointer2 :size="14" />
              3 участника
            </UiTypography.Muted>
          </div>

          <div class="relative h-[calc(100%-3rem)] overflow-hidden bg-[linear-gradient(var(--color-border-default)_1px,transparent_1px),linear-gradient(90deg,var(--color-border-default)_1px,transparent_1px)] bg-[size:48px_48px]">
            <div class="canvas-object object-text">
              <UiTypography.Code as="span" size="sm" tone="muted">TEXT</UiTypography.Code>
              <UiTypography.Text class="mt-2" size="md">Согласовать макет</UiTypography.Text>
            </div>

            <div class="canvas-object object-image">
              <Image :size="24" :stroke-width="2" />
            </div>

            <div class="canvas-object object-rect" />
            <div class="canvas-object object-circle" />
            <div class="canvas-object object-triangle" />
            <div class="canvas-line" />

            <div class="object-toolbar">
              <Shapes :size="16" />
              <Move :size="16" />
              <Trash2 :size="16" />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.canvas-object {
  position: absolute;
  border: 1px solid var(--color-border-active);
  background: var(--color-accent-light);
  color: var(--color-accent-active);
  transition: 150ms ease-out;
}

.object-text {
  left: 12%;
  top: 16%;
  width: 190px;
  padding: 14px;
  animation: drift-text 6s ease-in-out infinite;
}

.object-image {
  right: 15%;
  top: 18%;
  display: grid;
  height: 96px;
  width: 120px;
  place-items: center;
  animation: morph-image 7s ease-in-out infinite;
}

.object-rect {
  left: 20%;
  bottom: 18%;
  height: 92px;
  width: 150px;
  animation: resize-rect 5.5s ease-in-out infinite;
}

.object-circle {
  right: 22%;
  bottom: 22%;
  height: 88px;
  width: 88px;
  border-radius: 50%;
  animation: orbit-circle 6.5s ease-in-out infinite;
}

.object-triangle {
  left: 52%;
  top: 45%;
  height: 0;
  width: 0;
  border: 0;
  border-left: 48px solid transparent;
  border-right: 48px solid transparent;
  border-bottom: 92px solid var(--color-accent-light);
  background: transparent;
  filter: drop-shadow(0 0 0 var(--color-border-active));
  animation: pivot-triangle 5s ease-in-out infinite;
}

.canvas-line {
  position: absolute;
  left: 30%;
  top: 42%;
  height: 2px;
  width: 220px;
  transform-origin: left center;
  background: var(--color-accent);
  animation: swing-line 5.5s ease-in-out infinite;
}

.object-toolbar {
  position: absolute;
  right: 18%;
  top: 52%;
  display: flex;
  gap: 10px;
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-primary);
  padding: 10px;
  color: var(--color-text-secondary);
  animation: toolbar-pulse 4.8s ease-in-out infinite;
}

@keyframes drift-text {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(22px, 18px); }
}

@keyframes morph-image {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-28px, 22px) scale(1.08); }
}

@keyframes resize-rect {
  0%, 100% { transform: translate(0, 0); width: 150px; }
  50% { transform: translate(34px, -12px); width: 104px; }
}

@keyframes orbit-circle {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-34px, -30px); }
}

@keyframes pivot-triangle {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(10deg) translateY(-18px); }
}

@keyframes swing-line {
  0%, 100% { transform: rotate(-10deg) scaleX(1); }
  50% { transform: rotate(12deg) scaleX(0.78); }
}

@keyframes toolbar-pulse {
  0%, 100% { transform: translateY(0); border-color: var(--color-border-default); }
  50% { transform: translateY(-14px); border-color: var(--color-border-active); }
}
</style>
