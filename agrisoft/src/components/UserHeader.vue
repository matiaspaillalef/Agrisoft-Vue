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
          v-if="[7, 8, 10, 11].includes(Number(computedRolId))">
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
            :class="{ 'xl:hidden': ![7, 8, 10, 11].includes(Number(computedRolId)) }">
            <WeatherMini />
          </span>

          <span class="flex cursor-pointer text-xl text-gray-600 dark:text-white" v-if="!isLargeScreen">
            <!-- Ícono hamburguesa -->
            <button @click="$emit('toggle-mobile')" class="p-0 border-none bg-transparent cursor-pointer">
              <Bars4Icon class="h-6 w-6" />
            </button>
          </span>

          <div class="relative flex items-center" ref="notificationDropdown">
            <!-- Icono de alertas -->
            <button @click="toggleAlerts"
              class="relative flex items-center justify-center w-10 h-10 !bg-slate-50 !dark:bg-navy-900 !text-slate-600 !dark:text-white rounded-xl shadow-inner hover:bg-slate-100 dark:hover:bg-navy-700 transition-all duration-300">
              <BellIcon class="h-6 w-6" :class="{ 'animate-swing': unreadAlertsCount > 0 }" />
              <!-- Punto rojo si hay alertas nuevas -->
              <span v-if="unreadAlertsCount > 0"
                class="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-navy-800 animate-pulse"></span>
            </button>

            <!-- Dropdown de alertas (Premium) -->
            <transition enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0 -translate-y-2"
              enter-to-class="transform scale-100 opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform scale-100 opacity-100 translate-y-0"
              leave-to-class="transform scale-95 opacity-0 -translate-y-2">
              <div v-if="showAlerts"
                class="absolute right-0 top-[110%] w-[380px] bg-white dark:bg-navy-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-none dark:border dark:border-white/10 rounded-3xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">

                <!-- Header -->
                <div
                  class="px-6 py-5 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-navy-900/50">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                      <BellIcon class="w-5 h-5" />
                    </div>
                    <h3 class="font-black text-slate-800 dark:text-white tracking-tight">Notificaciones</h3>
                  </div>
                  <span v-if="unreadAlertsCount > 0"
                    class="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                    {{ unreadAlertsCount }} Nuevas
                  </span>
                </div>

                <!-- List Container -->
                <div class="max-h-[420px] overflow-y-auto scroll-smooth py-2">
                  <transition-group name="list" tag="ul">
                    <li v-for="alert in alerts" :key="alert.id"
                      class="px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 last:border-0 dark:border-white/5 relative group">

                      <div class="flex gap-4">
                        <div
                          class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <component :is="getAlertIcon(alert.type)" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <p
                            class="text-[14px] font-black !text-slate-950 dark:!text-white leading-tight mb-1 !opacity-100">
                            {{ alert.title }}
                          </p>
                          <p
                            class="text-[12px] font-bold !text-slate-700 dark:!text-slate-300 leading-snug !opacity-100">
                            {{ alert.description }}
                          </p>
                          <span
                            class="text-[10px] !text-slate-400 font-black uppercase tracking-widest mt-2 block !opacity-100">
                            Recibida hoy
                          </span>
                        </div>

                        <button @click="markAsRead(alert.id)"
                          class="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full !bg-emerald-50 !dark:bg-emerald-500/20 !text-emerald-600 flex items-center justify-center transition-all hover:scale-110 active:scale-90 w-fit!"
                          title="Marcar como leída">
                          <CheckIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  </transition-group>

                  <!-- Empty State -->
                  <div v-if="alerts.length === 0"
                    class="flex flex-col items-center justify-center py-12 px-10 text-center animate-in fade-in duration-500">
                    <div
                      class="w-20 h-20 bg-slate-50 dark:bg-navy-900 rounded-full flex items-center justify-center mb-4">
                      <BellAlertIcon class="w-10 h-10 text-slate-300 dark:text-white/20" />
                    </div>
                    <h4 class="text-sm font-black text-slate-800 dark:text-white mb-1 tracking-tight">Todo al día por
                      aquí</h4>
                    <p class="text-xs text-slate-400 font-medium">No tienes notificaciones pendientes de revisión.</p>
                  </div>
                </div>

                <!-- Footer -->
                <div @click="goToAlerts"
                  class="p-4 bg-slate-50/50 dark:bg-navy-900/50 border-t border-slate-50 dark:border-white/5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-navy-900 transition-colors group">
                  <span
                    class="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform inline-block">
                    Ver Centro de Alertas →
                  </span>
                </div>
              </div>
            </transition>
          </div>


          <!-- Botón de retorno de suplantación 
          <div v-if="isImpersonating" class="hidden md:flex">
            <button @click="revertImpersonation" 
              class="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold border border-red-200 transition-all text-xs group">
              <ArrowRightOnRectangleIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              Finalizar Suplantación
            </button>
          </div>-->

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
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumbs.vue'
//import TitlePage from './TitlePage.vue'
import WeatherMini from '@/components/Weather/WeatherMini.vue'
import { useDarkMode } from '@/plugins/darkMode.js'
import { MoonIcon, SunIcon, Bars4Icon, BellAlertIcon } from '@heroicons/vue/24/solid'
import { ChevronDoubleLeftIcon, XCircleIcon, BellIcon, ArrowRightOnRectangleIcon, CheckIcon, ClipboardDocumentListIcon, ShoppingCartIcon, TruckIcon, RectangleGroupIcon } from '@heroicons/vue/24/outline'
import { MenuService } from '@/api/menu.services'
import MenuItem from '@/components/Menu/MenuItem.vue'
import axios from 'axios'
import conexionApi from '@/services/conexionApi.js';
import { alertsUpdateTrigger, notifyAlertsChange } from '@/services/alertsState.js'

// -------------------------
// Menu y usuario
// -------------------------
const menu = ref([])
const error = ref(null)
const { isDarkMode, toggleDarkMode } = useDarkMode()
const props = defineProps({
  isCollapsed: Boolean,
  isLargeScreen: Boolean
})
const emit = defineEmits(['toggle-mobile'])
const nombre = ref('')
const apellido = ref('')
const router = useRouter()
const computedRolId = computed(() => localStorage.getItem('rol') || '')
const rolId = localStorage.getItem('rol') || ''

const isImpersonating = ref(!!localStorage.getItem('original_token'))
const revertImpersonation = () => {
  if (!localStorage.getItem('original_token')) return

  localStorage.setItem('token', localStorage.getItem('original_token'))
  localStorage.setItem('userId', localStorage.getItem('original_userId'))
  localStorage.setItem('rol', localStorage.getItem('original_rol'))
  localStorage.setItem('userName', localStorage.getItem('original_userName'))
  localStorage.setItem('userLastname', localStorage.getItem('original_userLastname'))
  localStorage.setItem('userIdCompany', localStorage.getItem('original_userIdCompany'))

  localStorage.removeItem('original_token')
  localStorage.removeItem('original_userId')
  localStorage.removeItem('original_rol')
  localStorage.removeItem('original_userName')
  localStorage.removeItem('original_userLastname')
  localStorage.removeItem('original_userIdCompany')

  window.location.href = '/dashboard/enviroment/user-creation'
}

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
const flattenMenu = (items) => {
  return items.reduce((acc, item) => {
    acc.push(item)
    if (item.children && item.children.length > 0) {
      acc.push(...flattenMenu(item.children))
    }
    return acc
  }, [])
}

const filteredChildren = computed(() => {
  const currentRolId = localStorage.getItem('rol')
  if (!menu.value.length) return []
  const allItems = flattenMenu(menu.value)

  const rid = Number(currentRolId)
  if (rid === 8) {
    return allItems.filter((item) => [19, 20, 21, 25, 26].includes(item.id))
  } else if (rid === 7) {
    return allItems.filter((item) => [19, 20].includes(item.id))
  } else if (rid === 10) {
    return allItems.filter((item) => [29, 30].includes(item.id) || ['Libro', 'Configuración'].includes(item.name))
  } else if (rid === 11) {
    return allItems.filter((item) => item.id === 19)
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
const notificationDropdown = ref<HTMLElement | null>(null)

const toggleAlerts = () => {
  showAlerts.value = !showAlerts.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (notificationDropdown.value && !notificationDropdown.value.contains(event.target as Node)) {
    showAlerts.value = false
  }
}

const goToAlerts = () => {
  showAlerts.value = false
  router.push('/dashboard/operations/alerts')
}

const getAlertIcon = (type: string) => {
  const icons: any = {
    'task_assigned': RectangleGroupIcon,
    'purchase_request': ClipboardDocumentListIcon,
    'purchase_order': ShoppingCartIcon,
    'nuevo_transito': TruckIcon
  }
  return icons[type] || BellIcon
}

// Escuchar cambios globales
watch(alertsUpdateTrigger, () => {
  fetchAlerts()
})

// Traer alertas del backend
const fetchAlerts = async () => {
  try {
    const userId = localStorage.getItem('userId') || ''
    const { data } = await conexionApi.get(`/alerts/user/${userId}?unread=true`)
    alerts.value = data.alerts || []
    unreadAlertsCount.value = alerts.value.length
  } catch (err) {
    console.error('Error cargando alertas:', err)
  }
}

// Marcar alerta como leída
const markAsRead = async (alertId: number) => {
  // Animar y eliminar localmente
  alerts.value = alerts.value.filter(a => a.id !== alertId)
  unreadAlertsCount.value = alerts.value.length

  try {
    const userId = localStorage.getItem('userId') || ''
    await conexionApi.put(`/alerts/${alertId}/read`, { user_id: userId })
    // Notificar al resto de componentes
    notifyAlertsChange()
  } catch (err) {
    console.error('Error marcando alerta como leída', err)
  }
}
// Inicializar alertas
onMounted(() => {
  fetchAlerts()
  // Refrescar cada minuto
  setInterval(fetchAlerts, 60000)

  // Click outside listener
  document.addEventListener('mousedown', handleClickOutside)
})

// Cleanup listener
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
@keyframes swing {
  0% {
    transform: rotate(0);
  }

  10% {
    transform: rotate(10deg);
  }

  20% {
    transform: rotate(-10deg);
  }

  30% {
    transform: rotate(10deg);
  }

  40% {
    transform: rotate(-10deg);
  }

  100% {
    transform: rotate(0);
  }
}

.animate-swing {
  animation: swing 2s ease-in-out infinite;
  transform-origin: top center;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
