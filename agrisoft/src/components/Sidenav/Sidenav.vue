<template>
  <aside
    :class="['sidenav relative pt-6 px-6 transition-all duration-300', isCollapsed ? 'collapsed w-[80px]' : 'no-collapsed w-[260px] max-w-[260px]']">
    <button type="button" @click="onToggle"
      :class="`inline-flex items-center gap-0 text-blue-950 cursor-pointer transition-all duration-300 absolute w-auto! right-0 top-[20px] rounded-tr-none! rounded-br-none!`"
      v-if="![8, 9].includes(Number(rolId))">
      <ChevronDoubleLeftIcon class="h-4 w-4" :class="{ 'rotate-180': isCollapsed }" />
      <!--<span :class="`text-[12px] ${isCollapsed ? 'hidden' : ''}`">Contraer Menú</span>-->
    </button>

    <!-- SELECTOR EMPRESA (solo admin) -->
    <div v-if="isAdmin" class="mb-6 mt-10">
      <div v-if="loadingCompanies" class="mb-4">
        <div class="h-[10px] w-1/4 rounded bg-gray-200 dark:bg-navy-700 animate-pulse basis-[25px] mb-2"></div>
        <div class="relative w-full max-w-[211px]">
          <div class="h-[45px] w-full rounded bg-gray-200 dark:bg-navy-700 animate-pulse basis-[25px]"></div>
        </div>
      </div>
      <div v-else class="mb-4">
        <label class="block text-xs text-gray-500 mb-1">
          Empresa activa
        </label>

        <div class="relative w-full max-w-[211px]">
          <select v-model="selectedCompany" @change="changeCompany" :disabled="loading"
            class="appearance-none w-full text-[13px] border border-gray-200 rounded-[5px] px-3 py-1 h-[45px] bg-white dark:bg-navy-700 dark:text-gray-950 truncate overflow-hidden whitespace-nowrap">
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name_company }}
            </option>
          </select>
          <svg
            class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500 dark:text-gray-300"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- MENÚ -->
    <nav>
      <ul v-if="menuLoading">
        <!-- Skeleton items -->
        <li v-for="n in 7" :key="n" class="mb-4 flex items-center gap-2">
          <!-- icon skeleton -->
          <div class="h-[22px] w-[22px] rounded bg-gray-200 dark:bg-navy-700 animate-pulse basis-[25px]"></div>

          <!-- text skeleton -->
          <div v-if="!isCollapsed" class="flex flex-col gap-1 w-full">
            <div v-if="!isCollapsed" class="h-2 w-full rounded bg-gray-200 dark:bg-navy-700 animate-pulse"></div>
            <div v-if="!isCollapsed" class="h-2 w-full rounded bg-gray-200 dark:bg-navy-700 animate-pulse"></div>
          </div>
        </li>
      </ul>

      <ul v-else>
        <MenuItem v-for="item in menu" :key="item.id" :item="item" />

        <!-- Cerrar sesión -->
        <li class="menu-item mt-3">
          <button @click="logout" :class="[
            'flex items-center text-sm py-2 w-full',
            isCollapsed ? 'gap-0 justify-center' : 'gap-2'
          ]">
            <XCircleIcon class="h-5 w-5" />
            <span v-if="!isCollapsed">Cerrar sesión</span>
          </button>
        </li>
      </ul>

    </nav>

  </aside>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, defineEmits, } from 'vue'
import { useRouter } from 'vue-router'
import MenuItem from '../Menu/MenuItem.vue'
import { XCircleIcon, ChevronDoubleLeftIcon } from '@heroicons/vue/24/outline'
import { MenuService } from '@/api/menu.services'
import { CompanyService } from '@/api/company.services'
import { useCompanyStore } from '@/stores/companyStore'

const router = useRouter()

const emit = defineEmits(['toggle-sidenav'])
const isCollapsed = ref(false)
const loadingCompanies = ref(true)


function onToggle() {
  isCollapsed.value = !isCollapsed.value
  emit('toggle-sidenav', isCollapsed.value)
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
var loading = ref(false)

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
     EMPRESAS (solo admin)
  ===================== */
  if (!isAdmin.value) return

  try {
    loadingCompanies.value = true

    const data = await CompanyService.getCompanies()
    companies.value = data || []

    // Si no hay empresa activa aún
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


/* 🔁 Mantener sincronizado el select */
watch(companyID, (newID) => {
  selectedCompany.value = newID
})

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
  const sessionKeys = ['token', 'loggedIn', 'userId', 'rol', 'userIdCompany', 'userName', 'userLastname', 'userEmail', 'userWarehouses']
  Object.keys(localStorage).forEach(key => {
    if (sessionKeys.includes(key)) {
      localStorage.removeItem(key)
    }
  })
  router.push({ name: 'Login' })
}

</script>
