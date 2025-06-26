const express = require('express')
const router = express.Router()

const authRoutes = require('../auth/routes/authRoutes')
const categoryRoutes = require('../categories/routes/categoryRoutes')
const supplierRoutes = require('../suppliers/routes/supplierRoutes')
const productRoutes = require('../products/routes/productRoutes')
const clientRoutes = require('../clients/routes/clientRoutes')
const quoteRoutes = require('../quotes/routes/quoteRoutes')
const creditRequestRoutes = require('../credit-requests/routes/creditRequestRoutes')

const authMiddleware = require('../shared/middlewares/authMiddleware')

// Rutas públicas (no requieren autenticación)
router.use('/auth', authRoutes)
// router.use('/auth', authRoutes)

// Middleware de autenticación para rutas protegidas
router.use(authMiddleware)
// Rutas protegidas (requieren autenticación)

// Gestión de categorías
router.use('/categories', categoryRoutes)

// Gestión de proveedores
router.use('/suppliers', supplierRoutes)

// Gestión de productos
router.use('/products', productRoutes)

// Gestión de clientes
router.use('/clients', clientRoutes)

// Gestión de cotizaciones
router.use('/quotes', quoteRoutes)

// Gestión de solicitudes de crédito
router.use('/credit-requests', creditRequestRoutes)

// router.use('/users', userRoutes)


module.exports = router
