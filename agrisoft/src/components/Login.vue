<template>
  <div class="relative float-right h-full min-h-screen w-full bg-white dark:bg-blue-950">
    <div
      class="mx-auto flex min-h-full w-full flex-col justify-start pt-12 md:max-w-[75%] lg:h-screen lg:max-w-[1013px] lg:px-8 lg:pt-0 xl:h-[100vh] xl:max-w-[1383px] xl:px-0 xl:pl-[70px]"
    >
      <div
        class="mb-auto h-full flex flex-col pl-5 pr-5 md:pr-0 md:pl-12 lg:max-w-[48%] lg:pl-0 xl:max-w-full"
      >
        <div
          class="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start"
        >
          <div
            class="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]"
          >
            <h4 class="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">Iniciar Sesión</h4>
            <p class="mb-9 ml-1 text-base text-gray-600 dark:text-white">
              Ingresa tu email y contraseña para ingresar.
            </p>

            <form @submit.prevent="handleLogin" class="w-full">
              <!-- Campo Usuario -->
              <div class="mb-3">
                <label class="text-sm text-navy-700 dark:text-white font-medium"
                  >Usuario o Email:</label
                >
                <input
                  type="text"
                  v-model="usuario"
                  class="mt-2 flex h-12 w-full items-center justify-center rounded-md border bg-white/0 p-3 text-sm outline-none border-gray-200 dark:!border-white/10 dark:bg-white dark:text-blue-950"
                  placeholder="username"
                  required
                />
              </div>

              <!-- Campo Contraseña -->
              <div class="mb-3">
                <label class="text-sm text-navy-700 dark:text-white font-medium">Contraseña:</label>
                <input
                  type="password"
                  v-model="password"
                  class="mt-2 flex h-12 w-full items-center justify-center rounded-md border bg-white/0 p-3 text-sm outline-none border-gray-200 dark:!border-white/10 dark:bg-white dark:text-blue-950"
                  placeholder="******"
                  required
                />
              </div>

              <p v-if="errorMessage" class="text-red-500 text-xs my-2 rounded mb-2">
                {{ errorMessage }}
              </p>

              <!-- Botón -->
              <button
                type="submit"
                class="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>

        <div
          class="z-[5] mx-auto flex w-full max-w-screen-sm flex-col items-center justify-between px-[20px] pb-4 lg:mb-6 lg:max-w-[100%] lg:flex-row xl:mb-2 xl:w-[1310px] xl:pb-6"
        >
          <p class="mb-6 text-center text-[12px] text-gray-600 lg:mb-0 dark:text-white">
            ©{{ new Date().getFullYear() }} Agrisoft. Todos los derechos Reservados.
          </p>
        </div>
      </div>
      <!-- Slider lateral -->
      <SliderLateral />
    </div>

    <!--dark mode button -->
    <div class="absolute top-4 right-4 z-10">
      <button @click="toggleDarkMode" class="p-2 rounded-md bg-gray-200 dark:bg-gray-800">
        <span v-if="isDarkMode"><MoonIcon class="h-6 w-6 text-white" /></span>
        <span v-else><SunIcon class="h-6 w-6 text-white" /></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/authService.js'
import SliderLateral from './SliderLateral/SliderLateral.vue'
import { useDarkMode } from '@/plugins/darkMode.js'

// Icons
import { MoonIcon, SunIcon } from '@heroicons/vue/24/solid'

const usuario = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

const { isDarkMode, toggleDarkMode } = useDarkMode()

async function handleLogin() {
  errorMessage.value = ''
  try {
    await login(usuario.value, password.value)
    router.push({ name: 'Dashboard' })
  } catch (err) {
    errorMessage.value = err.message || 'Error al iniciar sesión'
  }
}
</script>
