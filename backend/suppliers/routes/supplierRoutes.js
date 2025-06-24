const express = require('express');
const supplierController = require('../controllers/supplierController');

// Usar el middleware de autenticación existente
const authMiddleware = require('../../shared/middlewares/authMiddleware');

const router = express.Router();

// ===== RUTAS PROTEGIDAS - REQUIEREN AUTENTICACIÓN =====

// CRUD básico
router.post('/', authMiddleware, supplierController.createSupplier);
router.get('/', authMiddleware, supplierController.getAllSuppliers);
router.get('/:id', authMiddleware, supplierController.getSupplierById);
router.put('/:id', authMiddleware, supplierController.updateSupplier);
router.delete('/:id', authMiddleware, supplierController.deleteSupplier);

// Endpoints específicos de consulta
router.get('/active', authMiddleware, supplierController.getActiveSuppliers);
router.get('/withProductCount', authMiddleware, supplierController.getSuppliersWithProductCount);
router.get('/search', authMiddleware, supplierController.searchSuppliers);
router.get('/stats', authMiddleware, supplierController.getSupplierStats);
router.get('/byPaymentTerms', authMiddleware, supplierController.getSuppliersByPaymentTerms);
router.get('/byDeliveryTime', authMiddleware, supplierController.getSuppliersByDeliveryTime);
router.get('/statusSummary', authMiddleware, supplierController.getSupplierStatusSummary);

// Búsqueda por RUC (debe ir después de las rutas específicas para evitar conflictos)
router.get('/byTaxId/:taxId', authMiddleware, supplierController.getSupplierByTaxId);

// Información de contacto (debe ir después de las rutas específicas)
router.get('/:id/contactInfo', authMiddleware, supplierController.getSupplierContactInfo);

// Acciones específicas
router.patch('/:id/status', authMiddleware, supplierController.changeSupplierStatus);

module.exports = router;