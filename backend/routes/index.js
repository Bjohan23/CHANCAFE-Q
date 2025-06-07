const express = require('express')
const router = express.Router()

const authRoutes = require('../auth/routes/authRoutes')
const categoryRoutes = require('../categories/routes/categoryRoutes')

const authMiddleware = require('../shared/middlewares/authMiddleware')

// Rutas públicas (no requieren autenticación)
router.use('/auth', authRoutes)
// router.use('/auth', authRoutes)

// Middleware de autenticación para rutas protegidas
router.use(authMiddleware)
// Rutas protegidas (requieren autenticación)

// Gestión de categorías
router.use('/categories', categoryRoutes)

// router.use('/users', userRoutes)


module.exports = router
