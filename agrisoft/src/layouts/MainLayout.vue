<template>
  <div class="content-app flex bg-blue-50 dark:bg-gray-950 h-screen overflow-hidden relative">
    <!-- Backdrop para móvil (< 1200px) -->
    <div v-if="!isLargeScreen && isMobileMenuVisible" @click="closeMobileMenu"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] transition-all duration-500">
    </div>

    <!-- Sidenav: < 1200px es absoluto y se oculta. >= 1200px es relativo y normal (con su propio toggle de expansión) -->
    <Sidenav :isCollapsed="isCollapsed" :isMobileVisible="isMobileMenuVisible" @toggle-sidenav="toggleSidenav"
      v-if="[1, 2].includes(Number(rolId))" class="flex-shrink-0 z-[60]"
      :class="isLargeScreen ? 'relative translate-x-0' : 'absolute'" />

    <main class="flex-1 overflow-y-auto custom-scrollbar h-full flex flex-col relative transition-all duration-500">
      <UserHeader :isCollapsed="isCollapsed" :isLargeScreen="isLargeScreen" @toggle-sidenav="toggleSidenav"
        @toggle-mobile="toggleMobileMenu" />
      <div class="p-4 md:p-10 pb-20 flex-grow">
        <router-view />
      </div>
    </main>

    <!-- Botón flotante universal para volver de suplantación -->
    <div v-if="isImpersonating" class="fixed bottom-10 left-10 z-[100] group">
      <button @click="revertImpersonation"
        class="flex items-center gap-3 bg-red-600! hover:bg-red-700! text-white text-sm! px-8 py-5 rounded-full! shadow-[0_20px_50px_rgba(220,38,38,0.3)] transition-all hover:scale-105 active:scale-95 font-normal! border-4 border-white/20 backdrop-blur-sm">
        <ArrowRightOnRectangleIcon class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        Regresar a mi Administrador
      </button>
    </div>

    <!-- ChatBox de Soporte e IA -->
    <SupportChatBox />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import UserHeader from '@/components/UserHeader.vue'
import Sidenav from '@/components/Sidenav/Sidenav.vue'
import SupportChatBox from '@/components/SupportChatBox.vue'
import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'

const isCollapsed = ref(false)
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
const isMobileMenuVisible = ref(false)
const rolId = localStorage.getItem('rol')
const lastWidth = ref(window.innerWidth)

// Propiedad computada para determinar el estado de "Pantalla Grande"
const isLargeScreen = computed(() => lastWidth.value >= 1200)

function toggleSidenav() {
  isCollapsed.value = !isCollapsed.value
}

function toggleMobileMenu() {
  isMobileMenuVisible.value = !isMobileMenuVisible.value
  // Al abrir el menú móvil, forzamos que aparezca expandido
  if (isMobileMenuVisible.value) {
    isCollapsed.value = false
  }
}

function closeMobileMenu() {
  isMobileMenuVisible.value = false
}

// Lógica responsiva corregida: colapsar automáticamente al bajar de 1200px 
// pero sin forzarlo constantemente para permitir expansión manual.
const handleResize = () => {
  const currentWidth = window.innerWidth

  // Si cruzamos el umbral hacia abajo, colapsamos
  if (currentWidth < 1200 && lastWidth.value >= 1200) {
    isCollapsed.value = true
  }
  // Si cruzamos el umbral hacia arriba, expandimos (opcional, pero suele ser lo esperado)
  else if (currentWidth >= 1200 && lastWidth.value < 1200) {
    isCollapsed.value = false
  }

  lastWidth.value = currentWidth
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
