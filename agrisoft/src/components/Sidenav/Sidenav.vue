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
      <label class="block text-xs text-gray-500 mb-1">
        Empresa activa
      </label>

      <select v-model="selectedCompany" @change="changeCompany" :disabled="loading"
        class="w-full text-[13px] border border-gray-200 rounded-[5px] px-2 py-1 h-[45px] bg-white dark:bg-navy-700 dark:text-gray-950  truncate overflow-hidden whitespace-nowrap">
        <option v-for="company in companies" :key="company.id" :value="company.id">
          {{ company.name_company }}
        </option>
      </select>

      <!-- OVERLAY LOADER -->
      <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center
               bg-white/80 dark:bg-navy-900/80 backdrop-blur-sm rounded">
        <img src="@/assets/img/agrisoft_logo.png" alt="Loading" class="w-14 h-14 mb-3 animate-pulse" />

        <div class="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

        <p class="mt-3 text-xs text-gray-600 dark:text-gray-300">
          Cambiando empresa…
        </p>
      </div>
    </div>

    <!-- MENÚ -->
    <nav>
      <ul>
        <MenuItem v-for="item in menu" :key="item.id" :item="item" />

        <!-- Cerrar sesión -->
        <li class="menu-item mt-6">
          <button @click="logout"
            :class="['flex items-center text-sm py-2 w-full', isCollapsed ? 'gap-0 justify-center' : 'gap-2']">
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

onMounted(async () => {
  // 🔹 MENÚ
  menu.value = await MenuService.getMenuByRol(rolId)

  // 🔹 EMPRESAS (solo admin)
  if (!isAdmin.value) return

  const data = await CompanyService.getCompanies()
  companies.value = data || []

  // Si no hay empresa activa aún
  if (!companyID.value && companies.value.length) {
    setCompany(companies.value[0].id)
    selectedCompany.value = companies.value[0].id
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
  const sessionKeys = ['token', 'loggedIn', 'userId', 'rol', 'userIdCompany', 'userName', 'userLastname', 'userEmail']
  Object.keys(localStorage).forEach(key => {
    if (sessionKeys.includes(key)) {
      localStorage.removeItem(key)
    }
  })
  router.push({ name: 'Login' })
}

</script>
