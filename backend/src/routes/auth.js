const express = require('express');
const { AuthController } = require('../controllers');
const { AuthMiddleware } = require('../middlewares');
const Validators = require('../utils/validators');

const router = express.Router();

// Rutas públicas
router.post('/login', Validators.authValidators.login, Validators.handleValidationErrors, AuthController.login);
router.post('/register',  AuthController.register);
router.post('/refresh-token', Validators.authValidators.refreshToken, Validators.handleValidationErrors, AuthController.refreshToken);

// Rutas protegidas
router.post('/logout', AuthMiddleware.verifyToken, AuthController.logout);
router.post('/change-password', AuthMiddleware.verifyToken, Validators.authValidators.changePassword, Validators.handleValidationErrors, AuthController.changePassword);
router.get('/me', AuthMiddleware.verifyToken, AuthController.getCurrentUser);

module.exports = router;
