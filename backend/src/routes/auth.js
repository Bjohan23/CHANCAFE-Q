const express = require('express');
const { AuthController } = require('../controllers');
const { AuthMiddleware, RateLimitMiddleware } = require('../middlewares');
const Validators = require('../utils/validators');

const router = express.Router();

// Rutas públicas
router.post('/login', RateLimitMiddleware.login, Validators.authValidators.login, Validators.handleValidationErrors, AuthController.login);
router.post('/register', Validators.userValidators.create, Validators.handleValidationErrors, AuthController.register);
router.post('/refresh-token', Validators.authValidators.refreshToken, Validators.handleValidationErrors, AuthController.refreshToken);

// Rutas protegidas
router.post('/logout', AuthMiddleware, AuthController.logout);
router.post('/change-password', AuthMiddleware, AuthController.changePassword);
router.get('/me', AuthMiddleware, AuthController.getCurrentUser);

module.exports = router;
