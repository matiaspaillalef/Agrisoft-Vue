<template>
  <div class="min-h-screen bg-slate-50 dark:bg-navy-900 flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-400/10 rounded-full blur-3xl"></div>

    <div class="relative z-10 w-full max-w-2xl text-center">
      <!-- Icon Container -->
      <div class="mb-10 inline-flex items-center justify-center relative group">
        <div
          class="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl group-hover:bg-rose-500/30 transition-all duration-500">
        </div>
        <div
          class="relative p-10 bg-white dark:bg-navy-800 rounded-[3rem] shadow-2xl border border-rose-100 dark:border-rose-900/30 transform transition-transform group-hover:scale-105 duration-500">
          <ShieldExclamationIcon class="w-24 h-24 text-rose-500" />
        </div>
      </div>

      <!-- Text Content -->
      <div class="space-y-6">
        <h1 class="text-5xl md:text-7xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
          Acceso <span
            class="bg-gradient-to-br from-rose-500 to-rose-600 bg-clip-text text-transparent">Restringido</span>
        </h1>

        <p class="text-xl md:text-2xl font-medium text-slate-400 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Lo sentimos, pero no tienes los privilegios necesarios para visualizar esta sección del sistema.
        </p>

        <div class="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link to="/dashboard"
            class="flex items-center gap-3 bg-slate-800 dark:bg-white text-white dark:text-navy-900 px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 group">
            <HomeIcon class="w-6 h-6" />
            Volver al Inicio
          </router-link>

          <button @click="goBack"
            class="flex items-center gap-3 bg-white dark:bg-navy-800 border-2 border-slate-100 dark:border-navy-700 text-slate-600 dark:text-slate-300 px-10! py-5! rounded-2xl! font-black text-lg transition-all hover:bg-slate-50 dark:hover:bg-navy-700 active:scale-95 w-fit!">
            <ArrowLeftIcon class="w-6 h-6" />
            Página Anterior
          </button>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-16 pt-8 border-t border-slate-200/60 dark:border-navy-800 inline-block">
        <p class="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
          Agrisoft Security System &copy; {{ new Date().getFullYear() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShieldExclamationIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0px);
  }
}

.icon-float {
  animation: float 4s ease-in-out infinite;
}
</style>
