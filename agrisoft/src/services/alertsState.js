import { ref } from 'vue'

// Estado reactivo simple compartido entre componentes
export const alertsUpdateTrigger = ref(0)

// Función para notificar que las alertas han cambiado
export const notifyAlertsChange = () => {
  alertsUpdateTrigger.value++
}
