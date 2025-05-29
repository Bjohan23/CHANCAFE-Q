const express = require('express');
const { AuthController } = require('../controllers');
const { authMiddleware } = require('../middlewares');
const { validateLogin, validateRegister } = require('../utils/validators');

const router = express.Router();

// Rutas públicas
router.post('/login', validateLogin, AuthController.login);
router.post('/register', validateRegister, AuthController.register);
router.post('/refresh-token', AuthController.refreshToken);

// Rutas protegidas
router.post('/logout', authMiddleware, AuthController.logout);
router.post('/change-password', authMiddleware, AuthController.changePassword);
router.get('/me', authMiddleware, AuthController.getCurrentUser);

module.exports = router;
