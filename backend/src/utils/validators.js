const { body, param, query, validationResult } = require('express-validator');

/**
 * Validadores personalizados usando express-validator
 * Contiene reglas de validación para diferentes entidades del sistema
 */
class Validators {

  /**
   * Maneja los errores de validación y los formatea
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: formattedErrors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    next();
  }

  /**
   * Validadores para autenticación
   */
  static authValidators = {
    login: [
      body('code')
        .notEmpty()
        .withMessage('El código de usuario es requerido')
        .isLength({ min: 3, max: 20 })
        .withMessage('El código debe tener entre 3 y 20 caracteres')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('El código solo puede contener letras, números, guiones y guiones bajos'),
      
      body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
    ],

    refreshToken: [
      body('refreshToken')
        .notEmpty()
        .withMessage('El refresh token es requerido')
        .isJWT()
        .withMessage('El refresh token debe ser un JWT válido')
    ]
  };

  /**
   * Validadores para usuarios
   */
  static userValidators = {
    create: [
      body('code')
        .notEmpty()
        .withMessage('El código es requerido')
        .isLength({ min: 3, max: 20 })
        .withMessage('El código debe tener entre 3 y 20 caracteres')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('El código solo puede contener letras, números, guiones y guiones bajos'),
      
      body('name')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúñÑÁÉÍÓÚ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
      
      body('email')
        .optional({ nullable: true })
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
      
      body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
      
      body('phone')
        .optional({ nullable: true })
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('El teléfono debe contener solo números y símbolos válidos')
        .isLength({ min: 9, max: 15 })
        .withMessage('El teléfono debe tener entre 9 y 15 caracteres'),
      
      body('role')
        .optional()
        .isIn(['asesor', 'supervisor', 'admin'])
        .withMessage('El rol debe ser: asesor, supervisor o admin'),
      
      body('branch_office')
        .optional({ nullable: true })
        .isLength({ max: 50 })
        .withMessage('La sucursal no puede exceder 50 caracteres'),
      
      body('commission_rate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('La comisión debe ser un número entre 0 y 100')
    ],

    update: [
      param('id')
        .isInt({ min: 1 })
        .withMessage('ID de usuario inválido'),
      
      body('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
      
      body('email')
        .optional({ nullable: true })
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
      
      body('phone')
        .optional({ nullable: true })
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('El teléfono debe contener solo números y símbolos válidos'),
      
      body('status')
        .optional()
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('El estado debe ser: active, inactive o suspended')
    ]
  };

  /**
   * Validadores para clientes
   */
  static clientValidators = {
    create: [
      body('document_type')
        .notEmpty()
        .withMessage('El tipo de documento es requerido')
        .isIn(['dni', 'ruc', 'passport', 'ce'])
        .withMessage('El tipo de documento debe ser: dni, ruc, passport o ce'),
      
      body('document_number')
        .notEmpty()
        .withMessage('El número de documento es requerido')
        .matches(/^[0-9]+$/)
        .withMessage('El número de documento debe contener solo números')
        .isLength({ min: 8, max: 20 })
        .withMessage('El número de documento debe tener entre 8 y 20 dígitos'),
      
      body('contact_name')
        .notEmpty()
        .withMessage('El nombre de contacto es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
      
      body('business_name')
        .optional({ nullable: true })
        .isLength({ max: 150 })
        .withMessage('La razón social no puede exceder 150 caracteres'),
      
      body('email')
        .optional({ nullable: true })
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
      
      body('phone')
        .optional({ nullable: true })
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('El teléfono debe contener solo números y símbolos válidos'),
      
      body('client_type')
        .optional()
        .isIn(['individual', 'business'])
        .withMessage('El tipo de cliente debe ser: individual o business'),
      
      body('credit_limit')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El límite de crédito debe ser un número positivo')
    ],

    update: [
      param('id')
        .isInt({ min: 1 })
        .withMessage('ID de cliente inválido'),
      
      body('contact_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
      
      body('email')
        .optional({ nullable: true })
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
      
      body('status')
        .optional()
        .isIn(['active', 'inactive', 'blacklist'])
        .withMessage('El estado debe ser: active, inactive o blacklist')
    ]
  };

  /**
   * Validadores para productos
   */
  static productValidators = {
    create: [
      body('category_id')
        .notEmpty()
        .withMessage('La categoría es requerida')
        .isInt({ min: 1 })
        .withMessage('ID de categoría inválido'),
      
      body('sku')
        .notEmpty()
        .withMessage('El SKU es requerido')
        .isLength({ min: 3, max: 50 })
        .withMessage('El SKU debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('El SKU solo puede contener letras, números, guiones y guiones bajos'),
      
      body('name')
        .notEmpty()
        .withMessage('El nombre del producto es requerido')
        .isLength({ min: 2, max: 150 })
        .withMessage('El nombre debe tener entre 2 y 150 caracteres'),
      
      body('price')
        .notEmpty()
        .withMessage('El precio es requerido')
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser mayor a 0'),
      
      body('stock_quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La cantidad en stock debe ser un número entero positivo'),
      
      body('unit_type')
        .optional()
        .isIn(['unit', 'kg', 'lt', 'mt', 'pack', 'box'])
        .withMessage('Tipo de unidad inválido')
    ]
  };

  /**
   * Validadores para cotizaciones
   */
  static quoteValidators = {
    create: [
      body('client_id')
        .notEmpty()
        .withMessage('El cliente es requerido')
        .isInt({ min: 1 })
        .withMessage('ID de cliente inválido'),
      
      body('title')
        .optional({ nullable: true })
        .isLength({ max: 150 })
        .withMessage('El título no puede exceder 150 caracteres'),
      
      body('currency')
        .optional()
        .isIn(['PEN', 'USD'])
        .withMessage('La moneda debe ser PEN o USD'),
      
      body('valid_until')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La fecha debe tener formato válido')
        .custom((value) => {
          if (new Date(value) <= new Date()) {
            throw new Error('La fecha de validez debe ser futura');
          }
          return true;
        })
    ]
  };

  /**
   * Validadores para parámetros comunes
   */
  static commonValidators = {
    id: [
      param('id')
        .isInt({ min: 1 })
        .withMessage('ID inválido')
    ],

    pagination: [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe estar entre 1 y 100'),
      
      query('sort')
        .optional()
        .matches(/^[a-zA-Z_]+$/)
        .withMessage('Campo de ordenamiento inválido'),
      
      query('order')
        .optional()
        .isIn(['ASC', 'DESC', 'asc', 'desc'])
        .withMessage('El orden debe ser ASC o DESC')
    ],

    search: [
      query('q')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres')
        .escape()
    ]
  };

  /**
   * Validador personalizado para verificar si un valor existe en base de datos
   * @param {string} model - Nombre del modelo
   * @param {string} field - Campo a verificar
   * @param {string} errorMessage - Mensaje de error personalizado
   */
  static existsInDatabase(model, field = 'id', errorMessage = 'El registro no existe') {
    return async (value, { req }) => {
      const db = require('../models');
      const Model = db[model];
      
      if (!Model) {
        throw new Error(`Modelo ${model} no encontrado`);
      }

      const record = await Model.findOne({ where: { [field]: value } });
      
      if (!record) {
        throw new Error(errorMessage);
      }
      
      return true;
    };
  }

  /**
   * Validador personalizado para verificar unicidad en base de datos
   * @param {string} model - Nombre del modelo
   * @param {string} field - Campo a verificar
   * @param {string} errorMessage - Mensaje de error personalizado
   */
  static uniqueInDatabase(model, field, errorMessage = 'El valor ya existe') {
    return async (value, { req }) => {
      const db = require('../models');
      const Model = db[model];
      
      if (!Model) {
        throw new Error(`Modelo ${model} no encontrado`);
      }

      const where = { [field]: value };
      
      // Si es una actualización, excluir el registro actual
      if (req.params && req.params.id) {
        where.id = { [db.Sequelize.Op.ne]: req.params.id };
      }

      const record = await Model.findOne({ where });
      
      if (record) {
        throw new Error(errorMessage);
      }
      
      return true;
    };
  }
}

module.exports = Validators;