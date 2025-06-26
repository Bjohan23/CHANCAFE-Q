const express = require('express');
const clientController = require('../controllers/clientController');
const authMiddleware = require('../../shared/middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, clientController.createClient);

router.get('/', authMiddleware, clientController.getAllClients);

router.get('/active', authMiddleware, clientController.getActiveClients);

router.get('/stats', authMiddleware, clientController.getClientStats);

router.get('/type/:type', authMiddleware, clientController.getClientsByType);

router.get('/assigned/:userId', authMiddleware, clientController.getClientsByAssignedUser);

router.get('/high-credit', authMiddleware, clientController.getClientsWithHighCreditLimit);

router.get('/document/:documentNumber', authMiddleware, clientController.getClientByDocument);

router.get('/:id', authMiddleware, clientController.getClientById);

router.get('/:id/relations', authMiddleware, clientController.getClientWithRelations);

router.put('/:id', authMiddleware, clientController.updateClient);

router.patch('/:id/status', authMiddleware, clientController.changeClientStatus);

router.patch('/:id/credit-limit', authMiddleware, clientController.updateCreditLimit);

router.delete('/:id', authMiddleware, clientController.deleteClient);

module.exports = router;