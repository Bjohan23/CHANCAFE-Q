const express = require('express');

// Importar todas las rutas
const authRoutes = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./products');
const clientRoutes = require('./clients');
const categoryRoutes = require('./categories');
const quoteRoutes = require('./quotes');
const creditRequestRoutes = require('./credit-requests');

const router = express.Router();

// Ruta pública de estado - NO requiere autenticación
router.get('/status', (req, res) => {
    res.status(200).json({
        status: 'API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Agrupar todas las rutas bajo el prefijo /api
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/clients', clientRoutes);
router.use('/categories', categoryRoutes);
router.use('/quotes', quoteRoutes);
router.use('/credit-requests', creditRequestRoutes);

// Ruta por defecto para rutas no encontradas
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

module.exports = router;
