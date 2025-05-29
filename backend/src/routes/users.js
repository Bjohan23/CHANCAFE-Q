const express = require('express');
const { UserController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD de usuarios
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Rutas adicionales
router.patch('/:id/status', UserController.toggleUserStatus);
router.get('/:id/sessions', UserController.getUserSessions);
router.delete('/:id/sessions', UserController.clearUserSessions);

module.exports = router;
