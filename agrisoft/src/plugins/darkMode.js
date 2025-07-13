import { ref, onMounted } from 'vue'

const isDarkMode = ref(false)

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

function initDarkMode() {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDarkMode.value = false
    document.documentElement.classList.remove('dark')
  }
}

// Composable para usar en los componentes
export function useDarkMode() {
  onMounted(() => {
    initDarkMode()
  })
  return {
    isDarkMode,
    toggleDarkMode,
  }
}

export default {
  install(app) {
    app.config.globalProperties.$darkMode = {
      isDarkMode,
      toggleDarkMode,
    }
  },
}
