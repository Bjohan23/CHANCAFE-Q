const express = require('express');
const quoteController = require('../controllers/quoteController');
const authMiddleware = require('../../shared/middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, quoteController.createQuote);

router.get('/', authMiddleware, quoteController.getAllQuotes);

router.get('/stats', authMiddleware, quoteController.getQuoteStats);

router.get('/status/:status', authMiddleware, quoteController.getQuotesByStatus);

router.get('/client/:clientId', authMiddleware, quoteController.getQuotesByClient);

router.get('/user/:userId', authMiddleware, quoteController.getQuotesByUser);

router.get('/number/:quoteNumber', authMiddleware, quoteController.getQuoteByNumber);

router.get('/:id', authMiddleware, quoteController.getQuoteById);

router.get('/:id/items', authMiddleware, quoteController.getQuoteWithItems);

router.get('/:id/relations', authMiddleware, quoteController.getQuoteWithRelations);

router.put('/:id', authMiddleware, quoteController.updateQuote);

router.patch('/:id/status', authMiddleware, quoteController.changeQuoteStatus);

router.patch('/:id/recalculate', authMiddleware, quoteController.recalculateQuoteTotals);

router.delete('/:id', authMiddleware, quoteController.deleteQuote);

router.post('/:id/items', authMiddleware, quoteController.addQuoteItem);

router.put('/items/:itemId', authMiddleware, quoteController.updateQuoteItem);

router.delete('/items/:itemId', authMiddleware, quoteController.deleteQuoteItem);

module.exports = router;