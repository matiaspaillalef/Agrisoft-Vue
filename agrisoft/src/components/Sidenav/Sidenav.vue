<template>
  <aside
    class="sidenav pt-20 pl-8 pr-8 min-w-[260px] transition-all duration-300 ease-in-out"
    :class="{ collapsed: isCollapsed }"
  >
    <nav class="nav">
      <ul>
        <MenuItem v-for="item in menu" :key="item.id" :item="item" />
        <!-- close sesión -->
       <li class="menu-item first-level" @click="logout"><button class="flex items-center gap-2 text-sm py-2 cursor-pointer w-full !bg-transparent !text-blue-950 !pl-0 !pr-0 group"><span class="inline-flex items-center gap-2 w-full"><XCircleIcon class="h-5 w-5"/><span class="relative">Cerrar Sesión</span></span></button></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
//Consumir Endpoint
import { MenuService } from '@/api/menu.services'
import MenuItem from '../Menu/MenuItem.vue'

import { ref, defineProps, onMounted } from 'vue'
import { useRouter } from 'vue-router';

import {XCircleIcon} from '@heroicons/vue/24/outline';

const router = useRouter();
const menu = ref([])
const error = ref(null)

onMounted(async () => {
  try {
    const rolId = localStorage.getItem('rol') || '1'
    const res = await MenuService.getMenuByRol(Number(rolId))
    menu.value = res || []
  } catch (err) {
    error.value = err.response?.data?.message || 'No se pudo cargar el menú'
  }
})

const props = defineProps({
  isCollapsed: Boolean,
})

const logout = () => {
   localStorage.clear();
  router.push({ name: 'Login' });
}

const showMenu = ref(false)
</script>
