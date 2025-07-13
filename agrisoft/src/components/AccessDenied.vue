<template>
  <div class="access-denied">
    <h1>🚫 Acceso Denegado</h1>
    <p>No tienes permisos para acceder a esta página.</p>
    <router-link to="/dashboard">Volver al Dashboard</router-link>
  </div>
</template>

<script>
export default {
  name: 'AccessDenied',
}
</script>

<style scoped>
.access-denied {
  text-align: center;
  padding: 2rem;
  color: #b00020;
}

.access-denied h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.access-denied a {
  display: inline-block;
  margin-top: 1.5rem;
  text-decoration: none;
  color: #1976d2;
  font-weight: bold;
}
</style>
