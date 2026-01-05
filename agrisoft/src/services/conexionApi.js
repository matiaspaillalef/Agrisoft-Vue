import axios from 'axios'

const warehousesApi = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json'
    }
})

// token automático
warehousesApi.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers['X-API-KEY'] = token
    }
    return config
})

export default warehousesApi
