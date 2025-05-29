const express = require('express');
const { UserController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware);

// CRUD de usuarios
router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Rutas adicionales
router.patch('/:id/status', UserController.changeStatus);

module.exports = router;
