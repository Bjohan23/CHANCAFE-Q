const express = require('express')
const router = express.Router()

const authRoutes = require('../auth/routes/authRoutes')

const authMiddleware = require('../shared/middlewares/authMiddleware')

// Rutas públicas (no requieren autenticación)
router.use('/auth', authRoutes)
// router.use('/auth', authRoutes)

// Middleware de autenticación para rutas protegidas
router.use(authMiddleware)
// Rutas protegidas (requieren autenticación)

// router.use('/users', userRoutes)


module.exports = router
