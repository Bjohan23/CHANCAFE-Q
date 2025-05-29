const express = require('express');
const { ProductController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware);

// CRUD de productos
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

// Rutas adicionales
router.patch('/:id/status', ProductController.toggleProductStatus);

module.exports = router;
