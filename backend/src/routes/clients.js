const express = require('express');
const { ClientController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD de clientes
router.get('/', ClientController.getAllClients);
router.get('/:id', ClientController.getClientById);
router.post('/', ClientController.createClient);
router.put('/:id', ClientController.updateClient);
router.delete('/:id', ClientController.deleteClient);

// Rutas adicionales
router.patch('/:id/status', ClientController.toggleClientStatus);
router.get('/:id/quotes', ClientController.getClientQuotes);

module.exports = router;
