<template>
  <div class="relative float-right h-full min-h-screen w-full bg-white dark:bg-blue-950">
    <div class="mx-auto flex min-h-full w-full flex-col justify-center pt-12 md:max-w-[75%] lg:h-screen lg:max-w-[1013px] lg:px-8 lg:pt-0 xl:h-[100vh] xl:max-w-[1383px] xl:px-0 xl:pl-[70px]">
      <div class="mb-auto h-full flex flex-col pl-5 pr-5 md:pr-0 md:pl-12 lg:max-w-[48%] lg:pl-0 xl:max-w-full">
        <div class="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
          <div class="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
            <h4 class="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">Establecer Nueva Contraseña</h4>
            <p class="mb-9 ml-1 text-base text-gray-600 dark:text-white">
              Crea una contraseña segura para tu cuenta.
            </p>

            <form @submit.prevent="handleReset" class="w-full">
              <div class="mb-3">
                <label class="text-sm text-navy-700 dark:text-white font-medium">Contraseña:</label>
                <input type="password" v-model="password"
                  class="mt-2 flex h-12 w-full items-center justify-center rounded-md border bg-white/0 p-3 text-sm outline-none border-gray-200 dark:!border-white/10 dark:bg-white dark:text-blue-950"
                  placeholder="******" required />
              </div>

               <div class="mb-3">
                <label class="text-sm text-navy-700 dark:text-white font-medium">Confirmar Contraseña:</label>
                <input type="password" v-model="confirm"
                  class="mt-2 flex h-12 w-full items-center justify-center rounded-md border bg-white/0 p-3 text-sm outline-none border-gray-200 dark:!border-white/10 dark:bg-white dark:text-blue-950"
                  placeholder="******" required />
              </div>

              <p v-if="message" :class="[isError ? 'text-red-500' : 'text-emerald-500', 'text-xs my-2 font-bold uppercase tracking-wider']">
                {{ message }}
              </p>

              <button type="submit" :disabled="loading"
                class="linear mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200 disabled:opacity-50">
                <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                {{ loading ? 'Actualizando...' : 'Cambiar Contraseña' }}
              </button>

              <div class="mt-4 flex items-center justify-center">
                <router-link to="/" class="text-sm font-medium text-gray-400 hover:text-brand-500 transition-colors">
                  Volver al inicio de sesión
                </router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import conexionApi from '@/services/conexionApi.js'

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirm = ref('')
const message = ref('')
const isError = ref(false)
const loading = ref(false)

async function handleReset() {
  if (loading.value) return
  if (password.value !== confirm.value) {
    isError.value = true
    message.value = 'Las contraseñas no coinciden'
    return
  }

  loading.value = true
  message.value = ''
  isError.value = false

  const token = route.query.token

  try {
    const res = await conexionApi.post('/auth/reset-password', { token, password: password.value })
    if (res.data.code === 'OK') {
      message.value = 'Contraseña actualizada correctamente.'
      setTimeout(() => {
        router.push({ name: 'Login' })
      }, 2000)
    } else {
      isError.value = true
      message.value = res.data.message || 'Error al restablecer contraseña'
    }
  } catch (err) {
    isError.value = true
    message.value = 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
