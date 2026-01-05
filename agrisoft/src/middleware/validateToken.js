import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const validateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ code: 'ERROR', mensaje: 'Token no proporcionado' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ code: 'ERROR', mensaje: 'Token inválido' })
  }
}

export default validateToken
