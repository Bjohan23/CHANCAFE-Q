const express = require('express');
const categoryController = require('../controllers/categoryController');

// Usar el middleware de autenticación existente
const authMiddleware = require('../../shared/middlewares/authMiddleware');

const router = express.Router();

// ===== RUTAS PROTEGIDAS - REQUIEREN AUTENTICACIÓN =====

// CRUD básico
router.post('/', authMiddleware, categoryController.createCategory);
router.get('/', authMiddleware, categoryController.getAllCategories);
router.get('/:id', authMiddleware, categoryController.getCategoryById);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

// Endpoints específicos de consulta
router.get('/active', authMiddleware, categoryController.getActiveCategories);
router.get('/parentCategories', authMiddleware, categoryController.getParentCategories);
router.get('/tree', authMiddleware, categoryController.getCategoryTree);
router.get('/withProductCount', authMiddleware, categoryController.getCategoriesWithProductCount);
router.get('/search', authMiddleware, categoryController.searchCategories);
router.get('/stats', authMiddleware, categoryController.getCategoryStats);

// Subcategorías (debe ir después de las rutas específicas para evitar conflictos)
router.get('/:parentId/subcategories', authMiddleware, categoryController.getSubcategories);

// Acciones específicas
router.patch('/:id/status', authMiddleware, categoryController.changeCategoryStatus);
router.post('/reorder', authMiddleware, categoryController.reorderCategories);

module.exports = router;