const express = require('express');
const { CreditRequestController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD de solicitudes de crédito
router.get('/', CreditRequestController.getAllCreditRequests);
router.get('/stats', CreditRequestController.getCreditRequestStats);
router.get('/:id', CreditRequestController.getCreditRequestById);
router.post('/', CreditRequestController.createCreditRequest);
router.put('/:id', CreditRequestController.updateCreditRequest);

// Rutas para aprobación/rechazo
router.patch('/:id/approve', CreditRequestController.approveCreditRequest);
router.patch('/:id/reject', CreditRequestController.rejectCreditRequest);

module.exports = router;
