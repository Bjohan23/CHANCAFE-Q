const express = require('express');
const productController = require('../controllers/productController');

// Importar middleware de autenticación
const authMiddleware = require('../../shared/middlewares/authMiddleware');

const router = express.Router();

// ===== RUTAS PÚBLICAS =====
// (Todas las rutas de productos requieren autenticación)

// ===== RUTAS PROTEGIDAS =====

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// ===== RUTAS ESPECÍFICAS (deben ir antes que las rutas con parámetros) =====

// Productos activos
router.get('/active', productController.getActiveProducts);

// Productos destacados
router.get('/featured', productController.getFeaturedProducts);

// Buscar productos
router.get('/search', productController.searchProducts);

// Productos con stock bajo
router.get('/lowStock', productController.getLowStockProducts);

// Productos sin stock
router.get('/outOfStock', productController.getOutOfStockProducts);

// Productos por rango de precios
router.get('/byPriceRange', productController.getProductsByPriceRange);

// Estadísticas de productos (admin/supervisor)
router.get('/stats', productController.getProductStats);

// Resumen por estado (admin/supervisor)
router.get('/statusSummary', productController.getStatusSummary);

// Marcas disponibles
router.get('/brands', productController.getAvailableBrands);

// Verificar disponibilidad de SKU
router.get('/checkSku/:sku', productController.checkSkuAvailability);

// Verificar disponibilidad de código de barras
router.get('/checkBarcode/:barcode', productController.checkBarcodeAvailability);

// Buscar por SKU
router.get('/bySku/:sku', productController.getProductBySku);

// Buscar por código de barras
router.get('/byBarcode/:barcode', productController.getProductByBarcode);

// Productos por categoría
router.get('/byCategory/:categoryId', productController.getProductsByCategory);

// Productos por proveedor
router.get('/bySupplier/:supplierId', productController.getProductsBySupplier);

// Productos por marca
router.get('/byBrand/:brand', productController.getProductsByBrand);

// ===== RUTAS CRUD BÁSICAS =====

// Crear producto
router.post('/', productController.createProduct);

// Obtener todos los productos con filtros y paginación
router.get('/', productController.getAllProducts);

// Obtener producto por ID
router.get('/:id', productController.getProductById);

// Actualizar producto
router.put('/:id', productController.updateProduct);

// Eliminar producto (solo admin)
router.delete('/:id', productController.deleteProduct);

// ===== RUTAS DE ACCIONES ESPECÍFICAS =====

// Cambiar estado del producto (admin/supervisor)
router.patch('/:id/status', productController.changeProductStatus);

// Actualizar stock del producto
router.patch('/:id/stock', productController.updateProductStock);

// Alternar estado destacado (admin/supervisor)
router.post('/:id/toggleFeatured', productController.toggleFeaturedStatus);

module.exports = router;