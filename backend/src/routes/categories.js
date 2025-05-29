const express = require('express');
const { CategoryController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware);

// CRUD de categorías
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

// Rutas adicionales
router.get('/:id/products', CategoryController.getCategoryProducts);

module.exports = router;
