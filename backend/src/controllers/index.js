// Exportar todos los controladores
const AuthController = require('./AuthController');
const UserController = require('./UserController');
const ProductController = require('./ProductController');
const ClientController = require('./ClientController');
const CategoryController = require('./CategoryController');
const QuoteController = require('./QuoteController');
const CreditRequestController = require('./CreditRequestController');

module.exports = {
    AuthController,
    UserController,
    ProductController,
    ClientController,
    CategoryController,
    QuoteController,
    CreditRequestController
};
