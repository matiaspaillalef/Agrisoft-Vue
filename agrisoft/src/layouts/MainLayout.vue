<template>
  <div class="content-app flex bg-blue-50 dark:bg-gray-950 h-screen overflow-hidden">
    <Sidenav :isCollapsed="isCollapsed" v-if="[1, 2].includes(Number(rolId))" class="flex-shrink-0" />
    <main class="flex-1 overflow-y-auto custom-scrollbar h-full flex flex-col relative">
      <UserHeader :isCollapsed="isCollapsed" @toggle-sidenav="toggleSidenav" />
      <div class="p-4 md:p-10 pb-20 flex-grow">
        <router-view />
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import UserHeader from '@/components/UserHeader.vue'
import Sidenav from '@/components/Sidenav/Sidenav.vue'

const isCollapsed = ref(false)

const rolId = localStorage.getItem('rol')

function toggleSidenav() {
  isCollapsed.value = !isCollapsed.value
}
</script>
