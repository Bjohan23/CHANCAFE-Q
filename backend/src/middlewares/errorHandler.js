const { Helpers } = require('../utils');
const { ActivityLog } = require('../models');

/**
 * Middleware para manejo centralizado de errores
 * Captura errores de toda la aplicación y los formatea consistentemente
 */
class ErrorHandler {

  /**
   * Middleware principal de manejo de errores
   * Debe ir al final de la cadena de middlewares
   */
  static handleError(error, req, res, next) {
    // Log del error para debugging
    console.error('🚨 Error capturado:', {
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: Helpers.getClientIP(req),
      userId: req.user?.id || 'Anónimo',
      timestamp: new Date().toISOString()
    });

    // Registrar error en base de datos (sin bloquear la respuesta)
    ErrorHandler.logErrorToDatabase(error, req).catch(err => {
      console.error('Error al registrar en base de datos:', err);
    });

    // Determinar tipo de error y respuesta apropiada
    const errorResponse = ErrorHandler.categorizeError(error);
    
    // Evitar revelar información sensible en producción
    if (process.env.NODE_ENV === 'production') {
      delete errorResponse.details;
      delete errorResponse.stack;
    }

    res.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Categoriza el error y genera respuesta apropiada
   * @param {Error} error - Error a categorizar
   * @returns {Object} Respuesta formateada
   */
  static categorizeError(error) {
    // Error de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return Helpers.errorResponse(
        'Errores de validación en los datos',
        'VALIDATION_ERROR',
        {
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message,
            value: err.value
          }))
        },
        400
      );
    }

    // Error de unicidad de Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors?.[0]?.path || 'campo';
      return Helpers.errorResponse(
        `El ${field} ya existe en el sistema`,
        'DUPLICATE_ENTRY',
        { field: field },
        409
      );
    }

    // Error de clave foránea de Sequelize
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return Helpers.errorResponse(
        'No se puede completar la operación debido a dependencias de datos',
        'FOREIGN_KEY_CONSTRAINT',
        null,
        409
      );
    }

    // Error de conexión a base de datos
    if (error.name === 'SequelizeConnectionError') {
      return Helpers.errorResponse(
        'Error de conexión a la base de datos',
        'DATABASE_CONNECTION_ERROR',
        null,
        503
      );
    }

    // Error de JWT
    if (error.name === 'JsonWebTokenError') {
      return Helpers.errorResponse(
        'Token de acceso inválido',
        'INVALID_TOKEN',
        null,
        401
      );
    }

    if (error.name === 'TokenExpiredError') {
      return Helpers.errorResponse(
        'Token de acceso expirado',
        'TOKEN_EXPIRED',
        null,
        401
      );
    }

    // Error de cast (datos inválidos)
    if (error.name === 'CastError') {
      return Helpers.errorResponse(
        'Formato de datos inválido',
        'INVALID_DATA_FORMAT',
        { field: error.path, value: error.value },
        400
      );
    }

    // Error de sintaxis JSON
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return Helpers.errorResponse(
        'Formato JSON inválido en la solicitud',
        'INVALID_JSON',
        null,
        400
      );
    }

    // Error personalizado con statusCode
    if (error.statusCode) {
      return Helpers.errorResponse(
        error.message || 'Error en la solicitud',
        error.code || 'CUSTOM_ERROR',
        error.details || null,
        error.statusCode
      );
    }

    // Error de Multer (subida de archivos)
    if (error.code === 'LIMIT_FILE_SIZE') {
      return Helpers.errorResponse(
        'El archivo excede el tamaño máximo permitido',
        'FILE_TOO_LARGE',
        null,
        413
      );
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return Helpers.errorResponse(
        'Tipo de archivo no permitido',
        'INVALID_FILE_TYPE',
        null,
        400
      );
    }

    // Error de rate limiting
    if (error.statusCode === 429) {
      return Helpers.errorResponse(
        'Demasiadas solicitudes. Intenta de nuevo más tarde',
        'RATE_LIMIT_EXCEEDED',
        { retryAfter: error.retryAfter || 60 },
        429
      );
    }

    // Error 404 - No encontrado
    if (error.statusCode === 404) {
      return Helpers.errorResponse(
        'Recurso no encontrado',
        'NOT_FOUND',
        null,
        404
      );
    }

    // Error genérico del servidor
    return Helpers.errorResponse(
      process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : error.message,
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV !== 'production' ? {
        stack: error.stack,
        details: error
      } : null,
      500
    );
  }

  /**
   * Registra el error en la base de datos para auditoría
   * @param {Error} error - Error a registrar
   * @param {Object} req - Request de Express
   */
  static async logErrorToDatabase(error, req) {
    try {
      await ActivityLog.logAction({
        userId: req.user?.id || null,
        action: 'ERROR',
        entityType: 'system',
        newValues: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          url: req.originalUrl,
          method: req.method,
          body: req.body,
          params: req.params,
          query: req.query
        },
        ipAddress: Helpers.getClientIP(req),
        userAgent: req.headers['user-agent'],
        notes: `Error capturado en ${req.method} ${req.originalUrl}`
      });
    } catch (logError) {
      console.error('Error al registrar error en base de datos:', logError);
    }
  }

  /**
   * Middleware para capturar rutas no encontradas (404)
   */
  static handleNotFound(req, res, next) {
    const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    error.code = 'ROUTE_NOT_FOUND';
    next(error);
  }

  /**
   * Wrapper para funciones async que automatiza el manejo de errores
   * @param {Function} fn - Función async a envolver
   * @returns {Function} Función envuelta que maneja errores
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Crea un error personalizado con código de estado
   * @param {string} message - Mensaje del error
   * @param {number} statusCode - Código de estado HTTP
   * @param {string} code - Código de error personalizado
   * @param {*} details - Detalles adicionales
   * @returns {Error} Error personalizado
   */
  static createError(message, statusCode = 500, code = 'CUSTOM_ERROR', details = null) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.details = details;
    return error;
  }

  /**
   * Manejo de errores de proceso no capturados
   */
  static handleUncaughtExceptions() {
    process.on('uncaughtException', (error) => {
      console.error('🚨 Excepción no capturada:', error);
      
      // Log crítico
      console.error('La aplicación se cerrará debido a una excepción no capturada');
      
      // Cerrar servidor gracefully
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Promesa rechazada no manejada:', reason);
      console.error('En la promesa:', promise);
      
      // En este caso no cerramos el servidor, solo loggeamos
    });
  }

  /**
   * Middleware para validar Content-Type en rutas que lo requieren
   */
  static validateContentType(expectedType = 'application/json') {
    return (req, res, next) => {
      if (req.method === 'GET' || req.method === 'DELETE') {
        return next();
      }

      const contentType = req.headers['content-type'];
      
      if (!contentType || !contentType.includes(expectedType)) {
        const error = ErrorHandler.createError(
          `Content-Type debe ser ${expectedType}`,
          400,
          'INVALID_CONTENT_TYPE'
        );
        return next(error);
      }

      next();
    };
  }
}

module.exports = ErrorHandler;