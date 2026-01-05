const url = import.meta.env.VITE_API_URL

export async function login(usuario, password) {
  const response = await fetch(`${url}/api/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password }),
  })

  if (!response.ok) {
    throw new Error('Credenciales inválidas')
  }

  const data = await response.json()

  if (data.code !== 'OK') {
    throw new Error('Credenciales incorrectas')
  }

  // Guardar token
  if (data.token) {
    localStorage.setItem('token', data.token)
  } else {
    throw new Error('Token no recibido desde el servidor')
  }

  // Guardar otros datos del usuario
  localStorage.setItem('loggedIn', 'true')
  localStorage.setItem('userId', data.userId)
  localStorage.setItem('userName', data.nombre)
  localStorage.setItem('userLastname', data.apellido)
  localStorage.setItem('userEmail', data.mail)
  localStorage.setItem('userIdCompany', data.idCompany)
  localStorage.setItem('rol', data.rol)

  return data
}
