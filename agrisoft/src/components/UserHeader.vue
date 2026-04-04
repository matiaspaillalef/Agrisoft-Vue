<template>
  <div
    class="header sticky top-0 z-50 flex items-center justify-between py-4 mb-2 flex-col-reverse md:flex-row gap-2 w-full backdrop-blur-sm bg-blue-50/10 dark:bg-gray-950/80 px-4 md:px-8 transition-all duration-300 border-b border-transparent hover:border-gray-200 dark:hover:border-white/10">
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

          <span class="flex cursor-pointer text-xl text-gray-600 dark:text-white" mr-3
            :class="{ 'xl:hidden': ![7, 8].includes(Number(rolId)) }">
            <WeatherMini />
          </span>

          <span class="flex cursor-pointer text-xl text-gray-600 dark:text-white"
            :class="{ 'xl:hidden hidden': [7, 8].includes(Number(rolId)) }">
            <!-- Ícono hamburguesa -->
            <Bars4Icon class="h-6 w-6" />
          </span>

          <div class="relative flex items-center">
            <!-- Icono de alertas -->
            <button @click="toggleAlerts"
              class="flex items-center justify-center w-8! h-8! bg-transparent! text-navy-700 rounded-full! shadow-xl shadow-shadow-500 dark:bg-white cursor-pointer p-0!">
              <BellIcon class="h-4 w-4 text-gray-950 dark:text-white" />
              <!-- Punto rojo si hay alertas nuevas -->
              <span v-if="unreadAlertsCount > 0"
                class="absolute top-[7px] right-[7px] w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <!-- Dropdown de alertas -->
            <div v-if="showAlerts"
              class="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-800 shadow-lg rounded-lg overflow-hidden z-50 top-[50px]">
              <transition-group name="fade" tag="ul" class="max-h-64 overflow-y-auto">
                <li v-for="alert in alerts" :key="alert.id"
                  class="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-navy-700 flex justify-between items-center">
                  <div class="flex flex-col">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ alert.title }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-300">{{ alert.description }}</p>
                  </div>
                  <button @click="markAsRead(alert.id)"
                    class="ml-2 text-green-500! hover:text-green-700 focus:outline-none p-0! bg-transparent! w-auto!">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="size-4">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </button>
                </li>
                <li v-if="alerts.length === 0" key="empty" class="p-3 text-center text-gray-500 dark:text-gray-300">
                  No hay alertas
                </li>
              </transition-group>
            </div>

          </div>


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

<script setup lang="ts">
import { ref, onMounted, defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumbs.vue'
//import TitlePage from './TitlePage.vue'
import WeatherMini from '@/components/Weather/WeatherMini.vue'
import { useDarkMode } from '@/plugins/darkMode.js'
import { MoonIcon, SunIcon, Bars4Icon } from '@heroicons/vue/24/solid'
import { ChevronDoubleLeftIcon, XCircleIcon, BellIcon } from '@heroicons/vue/24/outline'
import { MenuService } from '@/api/menu.services'
import MenuItem from '@/components/Menu/MenuItem.vue'
import axios from 'axios'
import conexionApi from '@/services/conexionApi.js';

// -------------------------
// Menu y usuario
// -------------------------
const menu = ref([])
const error = ref(null)
const { isDarkMode, toggleDarkMode } = useDarkMode()
const props = defineProps({ isCollapsed: Boolean })
const nombre = ref('')
const apellido = ref('')
const router = useRouter()
const rolId = localStorage.getItem('rol') || ''

// Iniciales
const initials = ref('')
onMounted(() => {
  nombre.value = localStorage.getItem('userName') || ''
  apellido.value = localStorage.getItem('userLastname') || ''
  const firstName = nombre.value ? nombre.value.charAt(0).toUpperCase() : ''
  const lastName = apellido.value ? apellido.value.charAt(0).toUpperCase() : ''
  initials.value = firstName + lastName
})

// Montar menú según rol
onMounted(async () => {
  try {
    const rolIdLocal = localStorage.getItem('rol') || '1'
    const res = await MenuService.getMenuByRol(Number(rolIdLocal))
    menu.value = res || []
  } catch (err) {
    console.error('❌ ERROR MENU:', err)
    error.value = err.response?.data?.message || 'No se pudo cargar el menú'
  }
})

// Filtrado de children según rol
const filteredChildren = computed(() => {
  if (!menu.value[0]?.children) return []
  if (Number(rolId) === 8) {
    return menu.value[0].children.filter((item) => [19, 20, 21].includes(item.id))
  } else if (Number(rolId) === 7) {
    return menu.value[0].children.filter((item) => [19, 20].includes(item.id))
  }
  return []
})

// Logout
const logout = () => {
  const sessionKeys = ['token', 'loggedIn', 'userId', 'rol', 'userIdCompany', 'userName', 'userLastname', 'userEmail', 'userWarehouses', 'userOriginWarehouses']
  Object.keys(localStorage).forEach(key => {
    if (sessionKeys.includes(key)) localStorage.removeItem(key)
  })
  router.push({ name: 'Login' })
}

// -------------------------
// Alertas
// -------------------------
const alerts = ref<any[]>([])
const showAlerts = ref(false)
const unreadAlertsCount = ref(0)

const toggleAlerts = () => {
  showAlerts.value = !showAlerts.value
}

// Traer alertas del backend
const fetchAlerts = async () => {
  try {
    const userId = localStorage.getItem('userId') || ''
    const { data } = await conexionApi.get(`/alerts/user/${userId}`)
    alerts.value = data.alerts || []
    unreadAlertsCount.value = alerts.value.filter(a => a.is_read === 0).length
  } catch (err) {
    console.error('Error cargando alertas:', err)
  }
}

// Marcar alerta como leída
const markAsRead = async (alertId: number) => {
  // Animar y eliminar localmente
  alerts.value = alerts.value.filter(a => a.id !== alertId)
  unreadAlertsCount.value = alerts.value.filter(a => a.is_read === 0).length

  try {
    const userId = localStorage.getItem('userId') || ''
    await conexionApi.put(`/alerts/${alertId}/read`, { user_id: userId })
  } catch (err) {
    console.error('Error marcando alerta como leída', err)
  }
}
// Inicializar alertas
onMounted(() => {
  fetchAlerts()
  // Refrescar cada minuto
  setInterval(fetchAlerts, 60000)
})
</script>
