<template>
  <aside :class="['sidenav-container bg-white/95 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 flex-shrink-0 m-4 rounded-[2.5rem] border border-white/20 flex flex-col overflow-hidden h-[calc(100vh-2rem)]',
    isCollapsed ? 'collapsed w-[100px]' : 'no-collapsed w-[320px]',
    'lg:translate-x-0 transition-transform duration-500',
    isMobileVisible ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0']">

    <!-- Botón Toggle "Floating Green" -->
    <button type="button" @click="onToggle"
      class="absolute -right-1 bottom-40 bg-[#52c41a]! text-white rounded-full p-2.5 shadow-lg shadow-green-200 transition-all duration-300 z-50 hover:scale-110 active:scale-95 flex items-center justify-center w-fit!">
      <ChevronLeftIcon class="h-4 w-4" :class="{ 'rotate-180': isCollapsed }" />
    </button>

    <!-- TOP FIXED HEADER -->
    <div class="pt-10 px-6 flex-shrink-0">
      <!-- ROLE & LOGO SECTION -->
      <div class="flex items-center gap-4 mb-8 px-1 group/user relative" :class="{ 'flex-col': isCollapsed }">
        <div class="relative flex-shrink-0">
          <div
            class="w-18 h-18 rounded-[2rem] ring-8 ring-blue-50/50 p-1.5 bg-white shadow-xl relative overflow-hidden transition-all duration-500 group-hover/user:scale-105">
            <img :src="currentCompany?.logo || '/logos/logo_16.png'" alt="Logo"
              class="w-full h-full object-contain rounded-[1.5rem]"
              @error="(e) => (e.target.src = '/logos/logo_16.png')" />

            <label v-if="isAdmin"
              class="absolute inset-0 bg-black/40 opacity-0 group-hover/user:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <input type="file" @change="onLogoChange" class="hidden" accept="image/*" />
              <CameraIcon class="w-6 h-6 text-white" />
            </label>
          </div>
          <div
            class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-[4px] border-white rounded-full shadow-md z-10">
          </div>
        </div>

        <div v-if="!isCollapsed" class="flex flex-col min-w-0">
          <h3 class="text-md font-black text-slate-800 uppercase leading-tight">
            {{ currentCompany?.name_company }}
          </h3>
        </div>
      </div>

      <!-- COMPANY SELECTOR (Pill Style) -->
      <div v-if="isAdmin" class="mb-10 px-1" :class="{ 'flex justify-center': isCollapsed }">
        <div class="relative group" :class="isCollapsed ? 'w-14' : 'w-full'">
          <select v-model="selectedCompany" @change="changeCompany" :disabled="loading" :class="[
            'appearance-none text-white focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer shadow-2xl shadow-blue-200 hover:bg-blue-700 truncate',
            isCollapsed
              ? 'w-14 h-14 rounded-2xl bg-blue-600 px-0 flex items-center justify-center text-[0px] ring-4 ring-blue-50'
              : 'w-full text-[14px] font-extrabold border-none rounded-2xl px-6 py-4.5 bg-blue-600'
          ]">
            <option v-for="company in companies" :key="company.id" :value="company.id" class="text-slate-800 text-sm">
              {{ company.name_company }}
            </option>
          </select>

          <BuildingOfficeIcon v-if="isCollapsed"
            class="absolute inset-0 m-auto h-6 w-6 text-white pointer-events-none group-hover:scale-110 transition-transform" />

          <ChevronDownIcon v-else
            class="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
        </div>
      </div>
    </div>

    <!-- SCROLLABLE NAVIGATION -->
    <nav class="flex-grow overflow-y-auto custom-scrollbar px-6 pb-10">
      <div v-if="menuLoading" class="space-y-4 px-1">
        <div v-for="i in 6" :key="i" class="h-14 w-full bg-slate-50 animate-pulse rounded-2xl"></div>
      </div>
      <ul v-else class="space-y-1 px-1">
        <MenuItem v-for="item in menu" :key="item.id" :item="item" :isCollapsed="isCollapsed" />

        <!-- Soporte (Acceso Rápido) -->
        <li v-if="rolId === 1 || rolId === 2" class="mt-4 px-1">
          <router-link to="/dashboard/support/tickets"
            class="flex items-center gap-4 px-6 py-4 w-full rounded-2xl transition-all duration-300 group relative overflow-hidden bg-blue-600! text-white! font-normal!"
            :class="[
              isCollapsed ? 'justify-center !px-0' : '',
              $route.path === '/dashboard/support/tickets' ?
                ' text-white shadow-lg shadow-blue-200' :
                'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
            ]">
            <div class="relative z-10 flex items-center gap-4">
              <div class="relative">
                <LifebuoyIcon class="h-6 w-6 flex-shrink-0" />
                <div v-if="unreadSupport > 0"
                  class="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-lg animate-pulse z-[100] flex items-center justify-center min-w-[18px] w-6! h-6!">
                  {{ unreadSupport }}
                </div>
              </div>
              <span v-if="!isCollapsed" class="text-[15px] font-semibold tracking-tight">Soporte & Ayuda</span>
            </div>
          </router-link>
        </li>

        <!-- CERRAR SESIÓN (REDISEÑADO) -->
        <li class="pt-8 mt-4 border-t border-slate-50 px-1">
          <button @click="logout"
            class="flex items-center gap-4 px-6 py-4 w-full rounded-2xl transition-all duration-500 group relative overflow-hidden"
            :class="[
              isCollapsed ? 'justify-center !px-0' : '',
              'bg-red-50/50! text-red-600! border border-red-100! hover:bg-red-600! hover:text-white! hover:shadow-lg! hover:shadow-red-200!'
            ]">
            <div class="relative z-10 flex items-center gap-4">
              <XCircleIcon class="h-6 w-6 flex-shrink-0 group-hover:rotate-90 transition-transform duration-500" />
              <span v-if="!isCollapsed" class="text-[15px] font-black tracking-tight">Finalizar Sesión</span>
            </div>
            <!-- Bloque de brillo en hover -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer">
            </div>
          </button>
        </li>
      </ul>
    </nav>

    <!-- FOOTER / CLIMA -->
    <div class="mt-auto p-6 border-t border-slate-50">
      <div class="bg-blue-50/50 rounded-2xl p-4 flex items-center justify-between transition-all duration-300"
        :class="{ 'flex-col gap-4 !p-2': isCollapsed }">
        <WeatherMini />
        <div v-if="!isCollapsed" class="text-right">
          <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest">En Tiempo Real</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import MenuItem from '../Menu/MenuItem.vue'
import { XCircleIcon, ChevronLeftIcon, BuildingOfficeIcon, CameraIcon, ChevronDownIcon, LifebuoyIcon } from '@heroicons/vue/24/outline'
import { MenuService } from '@/api/menu.services'
import { CompanyService } from '@/api/company.services'
import { useCompanyStore } from '@/stores/companyStore'
import WeatherMini from '@/components/Weather/WeatherMini.vue'

const router = useRouter()

// USER DATA
const userName = localStorage.getItem('userName') || 'Usuario'
const userLastname = localStorage.getItem('userLastname') || ''
const roleIdRaw = Number(localStorage.getItem('rol') || 0)
const userRoleName = computed(() => {
  if (roleIdRaw === 1) return 'Administrador'
  if (roleIdRaw === 2) return 'Operaciones'
  if (roleIdRaw === 7) return 'Bodeguero'
  if (roleIdRaw === 8) return 'Prod. Manager'
  return 'Usuario'
})

const props = defineProps({
  isCollapsed: Boolean,
  isMobileVisible: Boolean
})

const emit = defineEmits(['toggle-sidenav'])
const loadingCompanies = ref(true)

function onToggle() {
  emit('toggle-sidenav')
}

/* =====================
   AUTH / ROLE
===================== */
const rolId = Number(localStorage.getItem('rol') || 0)
const isAdmin = computed(() => rolId === 1)

/* =====================
   COMPANY STORE
===================== */
const { companyID, setCompany } = useCompanyStore()

const companies = ref([])
const selectedCompany = ref(companyID.value)
const currentCompany = ref(null)
var loading = ref(false)

const fetchActiveCompany = async (id) => {
  if (!id) return
  try {
    const data = await CompanyService.getCompany(id)
    currentCompany.value = data
  } catch (error) {
    console.error('Error fetching active company:', error)
  }
}

const onLogoChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64 = e.target.result
    try {
      loading.value = true
      const res = await CompanyService.updateLogo(companyID.value, base64)
      if (res.code === 'OK') {
        // Forzar recarga del logo (añadiendo timestamp para evitar cache)
        if (currentCompany.value) {
          currentCompany.value.logo = res.logoUrl + '?t=' + Date.now()
        }
      }
    } catch (error) {
      console.error('Error updating logo:', error)
    } finally {
      loading.value = false
    }
  }
  reader.readAsDataURL(file)
}

/* =====================
   MENU
===================== */
const menu = ref([])
const menuLoading = ref(true)

onMounted(async () => {
  /* =====================
     MENÚ
  ===================== */
  try {
    menuLoading.value = true
    menu.value = await MenuService.getMenuByRol(rolId)
  } catch (error) {
    console.error('Error cargando menú:', error)
    menu.value = []
  } finally {
    menuLoading.value = false
  }

  /* =====================
     UNREAD SUPPORT
  ===================== */
  if (rolId === 1 || rolId === 2) {
    loadUnreadSupport()
    setInterval(loadUnreadSupport, 30000)
    window.addEventListener('update-unread-support', loadUnreadSupport)
  }

  /* =====================
     EMPRESAS (solo admin)
  ===================== */
  if (!isAdmin.value) return

  try {
    loadingCompanies.value = true
    const data = await CompanyService.getCompanies()
    companies.value = data || []
    if (!companyID.value && companies.value.length) {
      setCompany(companies.value[0].id)
      selectedCompany.value = companies.value[0].id
    }
  } catch (error) {
    console.error('Error cargando empresas:', error)
    companies.value = []
  } finally {
    loadingCompanies.value = false
  }
})

const unreadSupport = ref(0)
async function loadUnreadSupport() {
  try {
    const { data } = await MenuService.getUnreadSupport()
    unreadSupport.value = data.unread
  } catch (e) { }
}


/* 🔁 Mantener sincronizado el select */
watch(companyID, (newID) => {
  selectedCompany.value = newID
  fetchActiveCompany(newID)
}, { immediate: true })

/* =====================
   CHANGE COMPANY
===================== */
const changeCompany = async () => {
  if (!selectedCompany.value) return
  loading.value = true
  await nextTick()

  // 3️⃣ cambiar empresa en el store
  setCompany(selectedCompany.value)
  loading.value = true
  // 4️⃣ mínimo 0.5s para que se vea bonito
  await new Promise(resolve => setTimeout(resolve, 500))

  // 5️⃣ desactivar loader
  loading.value = false
}

/* =====================
   LOGOUT
===================== */
const logout = () => {
  //localStorage.clear()
  const sessionKeys = ['token', 'loggedIn', 'userId', 'rol', 'userIdCompany', 'userName', 'userLastname', 'userEmail', 'userWarehouses', 'userOriginWarehouses']
  Object.keys(localStorage).forEach(key => {
    if (sessionKeys.includes(key)) {
      localStorage.removeItem(key)
    }
  })
  router.push({ name: 'Login' })
}

</script>

<style scoped>
.sidenav {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.sidenav-container::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari and Opera */
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
</style>
