/**
 * Índice de repositorios
 * Exporta todos los repositorios del sistema para fácil importación
 */

const AuthRepository = require('./AuthRepository');
const UserRepository = require('./UserRepository');
const ClientRepository = require('./ClientRepository');
const ProductRepository = require('./ProductRepository');

module.exports = {
  AuthRepository,
  UserRepository,
  ClientRepository,
  ProductRepository
};