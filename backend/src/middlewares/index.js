/**
 * Índice de middlewares
 * Exporta todos los middlewares del sistema para fácil importación
 */

const AuthMiddleware = require('./auth');
const ErrorHandler = require('./errorHandler');
const RateLimitMiddleware = require('./rateLimit');
const LoggingMiddleware = require('./logging');

module.exports = {
  AuthMiddleware,
  ErrorHandler,
  RateLimitMiddleware,
  LoggingMiddleware
};