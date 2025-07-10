<template>
  <div>
    <h1>Bienvenido, {{ nombre }}</h1>
    <p>Tu rol es: {{ rol }}</p>
    <button @click="logout">Cerrar sesión</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const nombre = ref('')
const rol = ref('')

onMounted(() => {
  nombre.value = localStorage.getItem('userName')
  rol.value = localStorage.getItem('rol')
})

function logout() {
  localStorage.clear()
  router.push({ name: 'Login' })
}
</script>
