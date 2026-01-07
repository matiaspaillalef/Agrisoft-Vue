<script setup lang="ts">
import { ref, onMounted, defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumbs.vue'
//import TitlePage from './TitlePage.vue'
import WeatherMini from '@/components/Weather/WeatherMini.vue'
import { useDarkMode } from '@/plugins/darkMode.js'
import { MoonIcon, SunIcon, Bars4Icon } from '@heroicons/vue/24/solid'
import { ChevronDoubleLeftIcon, XCircleIcon } from '@heroicons/vue/24/outline'

import { MenuService } from '@/api/menu.services'
import MenuItem from '@/components/Menu/MenuItem.vue'

const menu = ref([])
const error = ref(null)

const { isDarkMode, toggleDarkMode } = useDarkMode()

const props = defineProps({
  isCollapsed: Boolean,
})
/*
const emit = defineEmits(['toggle-sidenav'])

function onToggle() {
  emit('toggle-sidenav')
}*/

const nombre = ref('')
const apellido = ref('')
const router = useRouter()

const rolId = localStorage.getItem('rol') || ''

//console.log(rolId)
onMounted(() => {
  nombre.value = localStorage.getItem('userName') || ''
  apellido.value = localStorage.getItem('userLastname') || ''
})

//Montamos el menú (si es necesario)
onMounted(async () => {
  try {
    const rolId = localStorage.getItem('rol') || '1'
    const res = await MenuService.getMenuByRol(Number(rolId))
    menu.value = res || []
  } catch (err) {
     console.error('❌ ERROR MENU:', err)
    error.value = err.response?.data?.message || 'No se pudo cargar el menú'
  }
})

//Filtro para children según rolID // Dato computado
const filteredChildren = computed(() => {
  if (!menu.value[0]?.children) return []

  // rol 8 product manager, rol 7 bodegero
  if (Number(rolId) === 8) {
    return menu.value[0].children.filter((item) => [19, 20, 21].includes(item.id))
  } else if (Number(rolId) === 7) {
    return menu.value[0].children.filter((item) => [19, 20].includes(item.id))
  }

  return []
})

const logout = () => {
  //localStorage.clear()
  const sessionKeys = ['token', 'loggedIn', 'userId', 'rol', 'userIdCompany', 'userName', 'userLastname', 'userEmail', 'userWarehouses']
  Object.keys(localStorage).forEach(key => {
    if (sessionKeys.includes(key)) {
      localStorage.removeItem(key)
    }
  })
  router.push({ name: 'Login' })
}

//Initials nombre y apellido
const initials = ref('')
onMounted(() => {
  const firstName = nombre.value ? nombre.value.charAt(0).toUpperCase() : ''
  const lastName = apellido.value ? apellido.value.charAt(0).toUpperCase() : ''
  initials.value = firstName + lastName
})
</script>

<template>
  <div class="header flex items-center justify-between mb-[25px] md:mb-[45px] flex-col-reverse md:flex-row gap-2 max-w-11/12 mx-auto">
    <div class="ml-[0px] w-full md:w-auto">
      <div class="pt-1">
        <!--
        <button type="button" @click="onToggle"
          :class="`inline-flex items-center gap-2 text-blue-950 cursor-pointer transition-all duration-300 absolute w-auto! ${isCollapsed ? 'left-[67px]' : 'left-[135px]'} top-[20px] rounded-tr-none! rounded-br-none!`"
          v-if="![8, 9].includes(Number(rolId))">
          <ChevronDoubleLeftIcon class="h-3 w-3" :class="{ 'rotate-180': isCollapsed }" />
          <span :class="`text-[12px] ${isCollapsed ? 'hidden' : ''}`">Contraer Menú</span>
        </button>
        -->
        <div
          class="nevmenu-top relative mt-[3px] flex h-[61px] w-full flex-grow items-center justify-around gap-2 rounded-full bg-white py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:flex-grow-0 md:gap-1 xl:gap-2 dark:bg-blue-950 px-5 md:px-10"
          v-if="[8, 9].includes(Number(rolId))">
          <ul class="flex items-center gap-2 dark:text-white md:gap-4">
            <MenuItem v-for="item in filteredChildren" :key="item.id" :item="item" />
            <li>
              <button @click="logout"
                class="relative !p-0 text-sm !bg-transparent !text-inherit flex items-center group">
                <XCircleIcon class="h-5 w-5 inline-block mr-1" />
                <span class="relative">
                  Cerrar sesión
                  <span
                    class="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <nav
      class="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl  backdrop-blur-xl w-full md:w-auto">
      <div class="flex w-full items-center gap-2 flex-col md:flex-row justify-end">
        <div
          class="relative mt-[3px] flex h-[61px] w-full flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:w-[395px] md:flex-grow-0 md:gap-1 xl:w-[395px] xl:gap-2 dark:bg-blue-500 pr-4">
          <div
            class="flex h-full items-center justify-start rounded-full bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white xl:w-[225px] leading-3 px-5 gap-3">
            👋
            <div class="flex flex-col">
              <p class="font-dm text-xs font-medium text-gray-600 dark:text-white">Bienvenido</p>
              <h4 class="text-l font-bold text-navy-700 dark:text-white">
                {{ nombre }} {{ apellido }}
              </h4>
            </div>
          </div>

          <span class="flex cursor-pointer text-xl text-gray-600 dark:text-white"
            :class="{ 'xl:hidden': ![7, 8].includes(Number(rolId)) }">
            <WeatherMini />
          </span>

          <span class="flex cursor-pointer text-xl text-gray-600 dark:text-white"
            :class="{ 'xl:hidden hidden': [7, 8].includes(Number(rolId)) }">
            <!-- Ícono hamburguesa -->
            <Bars4Icon class="h-6 w-6" />
          </span>

          <div
            class="flex items-center justify-center w-8 h-8 p-[7px] text-navy-700 rounded-full shadow-xl shadow-shadow-500 dark:bg-white cursor-pointer"
            @click="toggleDarkMode">
            <component :is="isDarkMode ? MoonIcon : SunIcon" />
          </div>

          <div class="relative flex">
            <div class="flex">
              <div
                class="flex items-center justify-center w-8 h-8 bg-lightPrimary rounded-full shadow-xl shadow-shadow-500 dark:bg-navy-900 dark:bg-white">
                <span class="font-bold">{{ initials }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>
