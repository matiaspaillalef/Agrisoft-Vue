<template>
  <div class="content-app flex bg-blue-50 dark:bg-gray-950">
    <Sidenav :isCollapsed="isCollapsed" v-if="[1, 2].includes(Number(rolId))" />
    <main class="p-0 md:p-6 flex-1">
      <UserHeader :isCollapsed="isCollapsed" @toggle-sidenav="toggleSidenav" />
      <router-view />
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
