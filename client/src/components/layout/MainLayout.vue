<script setup>
import Sidebar from "./Sidebar.vue"
import TopNav from "./TopNav.vue"
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-bg-primary">
    <Sidebar />
    
    <div class="flex-1 flex flex-col overflow-hidden">
      <TopNav />
      
      <main class="flex-1 relative bg-bg-secondary p-4">
        <div class="w-full h-full border border-border bg-white rounded-none flex items-center justify-center">
          <p class="text-text-muted font-heading text-sm">
            РАБОЧАЯ ОБЛАСТЬ (Canvas будет здесь)
          </p>
        </div>
      </main>
    </div>
  </div>
</template>