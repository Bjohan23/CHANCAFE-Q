const express = require('express');
const { QuoteController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD de cotizaciones
router.get('/', QuoteController.getAllQuotes);
router.get('/:id', QuoteController.getQuoteById);
router.post('/', QuoteController.createQuote);
router.put('/:id', QuoteController.updateQuote);

// Rutas adicionales para manejo de estados
router.patch('/:id/status', QuoteController.updateQuoteStatus);

module.exports = router;
