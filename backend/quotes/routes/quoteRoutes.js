const express = require('express');
const quoteController = require('../controllers/quoteController');
const authMiddleware = require('../../shared/middlewares/authMiddleware');
const SentinelErrorHandler = require('../../external-apis/middleware/sentinelErrorHandler');

const router = express.Router();

router.post('/', authMiddleware, quoteController.createQuote);

// 🆕 NUEVAS RUTAS PARA INTEGRACIÓN CON SENTINEL API
router.post('/with-credit-check', 
  authMiddleware, 
  SentinelErrorHandler.logSentinelRequest,
  SentinelErrorHandler.logSentinelResponse,
  quoteController.createQuoteWithCreditCheck
);

router.get('/', authMiddleware, quoteController.getAllQuotes);

router.get('/stats', authMiddleware, quoteController.getQuoteStats);

router.get('/status/:status', authMiddleware, quoteController.getQuotesByStatus);

router.get('/client/:clientId', authMiddleware, quoteController.getQuotesByClient);

router.get('/user/:userId', authMiddleware, quoteController.getQuotesByUser);

router.get('/number/:quoteNumber', authMiddleware, quoteController.getQuoteByNumber);

router.get('/:id', authMiddleware, quoteController.getQuoteById);

router.get('/:id/items', authMiddleware, quoteController.getQuoteWithItems);

router.get('/:id/relations', authMiddleware, quoteController.getQuoteWithRelations);

router.get('/:id/credit-info', authMiddleware, quoteController.getQuoteWithCreditInfo);

// 🆕 RUTAS PARA CONSULTA CREDITICIA MANUAL
router.post('/client/:clientId/credit-check', 
  authMiddleware,
  SentinelErrorHandler.logSentinelRequest,
  SentinelErrorHandler.logSentinelResponse,
  quoteController.performClientCreditCheck
);

router.get('/client/:clientId/credit-assessment', 
  authMiddleware, 
  quoteController.getClientCreditAssessment
);

router.put('/:id', authMiddleware, quoteController.updateQuote);

router.patch('/:id/status', authMiddleware, quoteController.changeQuoteStatus);

router.patch('/:id/recalculate', authMiddleware, quoteController.recalculateQuoteTotals);

router.delete('/:id', authMiddleware, quoteController.deleteQuote);

router.post('/:id/items', authMiddleware, quoteController.addQuoteItem);

router.put('/items/:itemId', authMiddleware, quoteController.updateQuoteItem);

router.delete('/items/:itemId', authMiddleware, quoteController.deleteQuoteItem);

module.exports = router;