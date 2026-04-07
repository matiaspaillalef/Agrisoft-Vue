<template>
  <div class="relative float-right h-full min-h-screen w-full bg-white dark:bg-blue-950">
    <div class="mx-auto flex min-h-full w-full flex-col justify-center pt-12 md:max-w-[75%] lg:h-screen lg:max-w-[1013px] lg:px-8 lg:pt-0 xl:h-[100vh] xl:max-w-[1383px] xl:px-0 xl:pl-[70px]">
      <div class="mb-auto h-full flex flex-col pl-5 pr-5 md:pr-0 md:pl-12 lg:max-w-[48%] lg:pl-0 xl:max-w-full">
        <div class="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
          <div class="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
            <h4 class="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">Recuperar Contraseña</h4>
            <p class="mb-9 ml-1 text-base text-gray-600 dark:text-white">
              Ingresa tu correo electrónico para recibir un enlace de recuperación.
            </p>

            <form @submit.prevent="handleSubmit" class="w-full">
              <div class="mb-3">
                <label class="text-sm text-navy-700 dark:text-white font-medium">Email:</label>
                <input type="email" v-model="email"
                  class="mt-2 flex h-12 w-full items-center justify-center rounded-md border bg-white/0 p-3 text-sm outline-none border-gray-200 dark:!border-white/10 dark:bg-white dark:text-blue-950"
                  placeholder="ejemplo@correo.com" required />
              </div>

              <p v-if="message" :class="[isError ? 'text-red-500' : 'text-emerald-500', 'text-xs my-2 font-bold uppercase tracking-wider']">
                {{ message }}
              </p>

              <button type="submit" :disabled="loading"
                class="linear mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200 disabled:opacity-50">
                <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                {{ loading ? 'Enviando...' : 'Enviar Enlace' }}
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
import conexionApi from '@/services/conexionApi.js'

const email = ref('')
const message = ref('')
const isError = ref(false)
const loading = ref(false)

async function handleSubmit() {
  if (loading.value) return
  loading.value = true
  message.value = ''
  isError.value = false

  try {
    const res = await conexionApi.post('/auth/forgot-password', { userEmail: email.value })
    if (res.data.code === 'OK') {
      message.value = 'Revisa tu correo electrónico para las instrucciones.'
      email.value = ''
    } else {
      isError.value = true
      message.value = res.data.mensaje || 'Error al procesar la solicitud'
    }
  } catch (err) {
    isError.value = true
    message.value = 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
