/**
 * Índice de servicios
 * Exporta todos los servicios del sistema para fácil importación
 */

const AuthService = require('./AuthService');
const UserService = require('./UserService');
const ClientService = require('./ClientService');
const ProductService = require('./ProductService');

module.exports = {
  AuthService,
  UserService,
  ClientService,
  ProductService
};