import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Dashboard from '../components/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      roles: [1, 2], // Solo pueden entrar usuarios con rol 1 o 2 (por ejemplo)
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Middleware
router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true'
  const userRol = parseInt(localStorage.getItem('rol')) // ← importante: convertir a número

  if (to.meta.requiresAuth && !loggedIn) {
    next({ name: 'Login' })
  } else if (to.meta.roles && !to.meta.roles.includes(userRol)) {
    //alert('Acceso denegado: no tienes permisos')
     next({ name: 'Dashboard' })
  } else if (to.name === 'Login' && loggedIn) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
