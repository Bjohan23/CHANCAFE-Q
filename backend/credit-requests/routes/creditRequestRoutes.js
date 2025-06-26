const express = require('express');
const creditRequestController = require('../controllers/creditRequestController');
const authMiddleware = require('../../shared/middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, creditRequestController.createCreditRequest);

router.get('/', authMiddleware, creditRequestController.getAllCreditRequests);

router.get('/stats', authMiddleware, creditRequestController.getCreditRequestStats);

router.get('/expiring', authMiddleware, creditRequestController.getExpiringCreditRequests);

router.get('/expired', authMiddleware, creditRequestController.getExpiredCreditRequests);

router.patch('/mark-expired', authMiddleware, creditRequestController.markExpiredCreditRequests);

router.get('/status/:status', authMiddleware, creditRequestController.getCreditRequestsByStatus);

router.get('/client/:clientId', authMiddleware, creditRequestController.getCreditRequestsByClient);

router.get('/user/:userId', authMiddleware, creditRequestController.getCreditRequestsByUser);

router.get('/priority/:priority', authMiddleware, creditRequestController.getCreditRequestsByPriority);

router.get('/number/:requestNumber', authMiddleware, creditRequestController.getCreditRequestByNumber);

router.get('/:id', authMiddleware, creditRequestController.getCreditRequestById);

router.get('/:id/relations', authMiddleware, creditRequestController.getCreditRequestWithRelations);

router.put('/:id', authMiddleware, creditRequestController.updateCreditRequest);

router.patch('/:id/status', authMiddleware, creditRequestController.changeCreditRequestStatus);

router.patch('/:id/approve', authMiddleware, creditRequestController.approveCreditRequest);

router.patch('/:id/reject', authMiddleware, creditRequestController.rejectCreditRequest);

router.patch('/:id/risk-assessment', authMiddleware, creditRequestController.updateRiskAssessment);

router.delete('/:id', authMiddleware, creditRequestController.deleteCreditRequest);

module.exports = router;