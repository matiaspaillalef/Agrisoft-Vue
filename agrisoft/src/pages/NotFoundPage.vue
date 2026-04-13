<template>
  <div class="min-h-screen bg-slate-50 dark:bg-navy-900 flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl"></div>

    <div class="relative z-10 w-full max-w-2xl text-center">
      <!-- 404 Number -->
      <div class="mb-8 relative inline-block">
        <h2
          class="text-[12rem] md:text-[16rem] font-black leading-none text-slate-200/50 dark:text-navy-800 animate-pulse">
          404</h2>
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-navy-700 transform rotate-6 hover:rotate-0 transition-transform duration-500 shadow-blue-100 dark:shadow-none">
            <MagnifyingGlassIcon class="w-16 h-16 text-blue-600 animate-bounce-subtle" />
          </div>
        </div>
      </div>

      <!-- Text Content -->
      <div class="space-y-6">
        <h1 class="text-4xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
          Página <span class="bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent">No
            Encontrada</span>
        </h1>

        <p class="text-lg md:text-xl font-medium text-slate-400 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Parece que la página que buscas se ha movido o no existe. No te preocupes, volvamos al camino principal.
        </p>

        <div class="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link to="/dashboard"
            class="flex items-center gap-3 !bg-blue-600 !text-white !px-10 !py-5 !rounded-2xl !font-black !text-lg transition-all shadow-xl shadow-blue-200 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 active:scale-95 group">
            <HomeIcon class="w-6 h-6" />
            Ir al Dashboard
          </router-link>

          <button @click="goBack"
            class="flex items-center gap-3 !bg-white !dark:bg-navy-800 !border-2 !border-slate-100 !dark:border-navy-700 !text-slate-600 !dark:text-slate-300 !px-10 !py-5 !rounded-2xl !font-black !text-lg transition-all !hover:bg-slate-50 !dark:hover:bg-navy-700 !active:scale-95 w-fit!">
            <ArrowLeftIcon class="w-6 h-6" />
            Regresar
          </button>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-16 pt-8 border-t border-slate-200/60 dark:border-navy-800 inline-block">
        <p class="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
          Agrisoft Systems &copy; {{ new Date().getFullYear() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
@keyframes bounce-subtle {

  0%,
  100% {
    transform: translateY(0) rotate(6deg);
  }

  50% {
    transform: translateY(-15px) rotate(0deg);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 3s ease-in-out infinite;
}
</style>
