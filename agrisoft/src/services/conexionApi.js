import axios from 'axios'
import { useCompanyStore } from '@/stores/companyStore'

const conexionApi = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json'
    }
})

/* =====================
   REQUEST INTERCEPTOR
===================== */
conexionApi.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers['X-API-KEY'] = token
    }

    const companyID = localStorage.getItem('userIdCompany')
    if (companyID) {
        config.headers['X-COMPANY-ID'] = companyID
    }

    return config
})

/* =====================
   🔁 INTERCEPTOR RESPUESTA PARA 401
===================== */
conexionApi.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Token expirado: limpiar sesión y redirigir
            //localStorage.clear() 
            const sessionKeys = ['token', 'loggedIn', 'userId', 'rol', 'userIdCompany', 'userName', 'userLastname', 'userEmail', 'userWarehouses', 'userOriginWarehouses']
            Object.keys(localStorage).forEach(key => {
                if (sessionKeys.includes(key)) {
                    localStorage.removeItem(key)
                }
            })

            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

/* =====================
   🔁 ESCUCHAR CAMBIO EMPRESA
===================== */
const { onCompanyChange } = useCompanyStore()

onCompanyChange(() => {
    // 🔥 forzamos que axios "cambie"
    conexionApi.defaults.headers.common['X-REFRESH'] = Date.now()
})

export default conexionApi
