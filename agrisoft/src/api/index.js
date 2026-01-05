import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    //'x-api-key': token || '',
  },
})

// Interceptor para agregar el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      //config.headers.Authorization = `Bearer ${token}` // agrega el token al header
      config.headers['x-api-key'] = token // agrega el token al header
    } else {
      console.warn('⚠️ Token no encontrado en localStorage')
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default api
