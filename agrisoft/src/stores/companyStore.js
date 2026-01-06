import { ref } from 'vue'

const companyID = ref(
  Number(localStorage.getItem('userIdCompany')) || null
)

const listeners = []

export const useCompanyStore = () => {
  const setCompany = (id) => {
    companyID.value = id
    localStorage.setItem('userIdCompany', id)

    // 🔔 avisar a toda la app
    listeners.forEach(cb => cb(id))
  }

  const onCompanyChange = (callback) => {
    listeners.push(callback)
  }

  return {
    companyID,
    setCompany,
    onCompanyChange
  }
}
