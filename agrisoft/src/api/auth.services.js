import api from './index.js'

export async function login(usuario, password) {
  try {
    const response = await api.post('/api/v1/login', { usuario, password })
    const data = response.data

    if (data.code !== 'OK') {
      throw new Error(data.mensaje || 'Credenciales incorrectas')
    }

    // Guardar token
    localStorage.setItem('token', data.token)

    // Guardar usuario
    localStorage.setItem('loggedIn', 'true')
    localStorage.setItem('userId', data.userId)
    localStorage.setItem('userName', data.nombre)
    localStorage.setItem('userLastname', data.apellido)
    localStorage.setItem('userEmail', data.mail)
    localStorage.setItem('userIdCompany', data.idCompany)
    localStorage.setItem('rol', data.rol)

    return data
  } catch (err) {
    console.error('Login error:', err)
    throw err
  }
}
