const morgan = require('morgan');
const { Helpers } = require('../utils');
const { ActivityLog } = require('../models');

/**
 * Middleware de logging para registrar peticiones HTTP
 * Utiliza Morgan para logging de requests y registro en base de datos
 */
class LoggingMiddleware {

  /**
   * Configuración de Morgan para desarrollo
   * Muestra información detallada en consola
   */
  static development = morgan('dev', {
    // Solo mostrar errores en desarrollo
    skip: (req, res) => {
      return process.env.NODE_ENV === 'test';
    }
  });

  /**
   * Configuración de Morgan para producción
   * Log más compacto y estructurado
   */
  static production = morgan('combined', {
    skip: (req, res) => {
      // No loggear health checks en producción
      return req.originalUrl === '/api/v1/status';
    }
  });

  /**
   * Logger personalizado con formato JSON estructurado
   */
  static structured = morgan((tokens, req, res) => {
    const log = {
      timestamp: new Date().toISOString(),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: parseInt(tokens.status(req, res)),
      responseTime: `${tokens['response-time'](req, res)}ms`,
      contentLength: tokens.res(req, res, 'content-length') || '0',
      userAgent: tokens['user-agent'](req, res),
      ip: Helpers.getClientIP(req),
      userId: req.user?.id || null,
      userRole: req.user?.role || null
    };

    // Solo loggear en formato JSON en producción
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(log);
    } else {
      // En desarrollo, formato más legible
      return `${log.timestamp} ${log.method} ${log.url} ${log.status} ${log.responseTime} - ${log.ip}`;
    }
  });

  /**
   * Middleware para registrar actividades importantes en base de datos
   * Se ejecuta después de que se procese la request
   */
  static databaseLogger = (req, res, next) => {
    // Interceptar el final de la respuesta
    const originalSend = res.send;
    
    res.send = function(data) {
      // Restaurar método original
      res.send = originalSend;
      
      // Registrar en base de datos si es necesario
      LoggingMiddleware.logToDatabase(req, res, data);
      
      // Enviar respuesta original
      return originalSend.call(this, data);
    };

    next();
  };

  /**
   * Registra actividades específicas en la base de datos
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {*} responseData - Datos de respuesta
   */
  static async logToDatabase(req, res, responseData) {
    try {
      // Solo loggear ciertas actividades importantes
      const shouldLog = LoggingMiddleware.shouldLogActivity(req, res);
      
      if (!shouldLog) return;

      const action = LoggingMiddleware.getActionFromRequest(req);
      const entityInfo = LoggingMiddleware.getEntityInfo(req, responseData);

      await ActivityLog.logAction({
        userId: req.user?.id || null,
        action: action,
        entityType: entityInfo.type,
        entityId: entityInfo.id,
        newValues: LoggingMiddleware.sanitizeData(req.body),
        ipAddress: Helpers.getClientIP(req),
        userAgent: req.headers['user-agent'],
        notes: `${req.method} ${req.originalUrl} - Status: ${res.statusCode}`
      });

    } catch (error) {
      console.error('Error al registrar actividad en base de datos:', error);
    }
  }

  /**
   * Determina si una actividad debe ser registrada en base de datos
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @returns {boolean} True si debe registrarse
   */
  static shouldLogActivity(req, res) {
    // No loggear requests GET (consultas)
    if (req.method === 'GET') return false;
    
    // No loggear endpoints de salud
    if (req.originalUrl.includes('/status') || req.originalUrl.includes('/health')) {
      return false;
    }
    
    // No loggear login failures (ya se loggean en AuthService)
    if (req.originalUrl.includes('/login') && res.statusCode >= 400) {
      return false;
    }
    
    // Loggear solo operaciones exitosas o errores del servidor
    return res.statusCode < 400 || res.statusCode >= 500;
  }

  /**
   * Obtiene el tipo de acción basado en la request
   * @param {Object} req - Request de Express
   * @returns {string} Tipo de acción
   */
  static getActionFromRequest(req) {
    const method = req.method.toUpperCase();
    
    switch (method) {
      case 'POST':
        if (req.originalUrl.includes('/login')) return 'LOGIN';
        if (req.originalUrl.includes('/logout')) return 'LOGOUT';
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'ACTION';
    }
  }

  /**
   * Extrae información de entidad de la request
   * @param {Object} req - Request de Express
   * @param {*} responseData - Datos de respuesta
   * @returns {Object} Información de entidad
   */
  static getEntityInfo(req, responseData) {
    const urlParts = req.originalUrl.split('/');
    
    // Intentar determinar el tipo de entidad desde la URL
    let entityType = null;
    let entityId = null;
    
    // Buscar en la URL patrones como /api/v1/users/123
    for (let i = 0; i < urlParts.length; i++) {
      const part = urlParts[i];
      if (['users', 'clients', 'products', 'quotes', 'categories'].includes(part)) {
        entityType = part.slice(0, -1); // Remover 's' final
        // El siguiente elemento podría ser el ID
        if (urlParts[i + 1] && /^\d+$/.test(urlParts[i + 1])) {
          entityId = parseInt(urlParts[i + 1]);
        }
        break;
      }
    }

    // Intentar obtener ID desde parámetros
    if (!entityId && req.params && req.params.id) {
      entityId = parseInt(req.params.id);
    }

    // Intentar obtener ID desde response data
    if (!entityId && responseData) {
      try {
        const parsed = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        if (parsed.data && parsed.data.id) {
          entityId = parsed.data.id;
        }
      } catch (e) {
        // Ignorar errores de parsing
      }
    }

    return {
      type: entityType,
      id: entityId
    };
  }

  /**
   * Sanitiza datos sensibles antes de registrar en logs
   * @param {Object} data - Datos a sanitizar
   * @returns {Object} Datos sanitizados
   */
  static sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    
    // Remover campos sensibles
    const sensitiveFields = [
      'password',
      'password_hash',
      'token',
      'refreshToken',
      'accessToken',
      'secret',
      'key',
      'authorization'
    ];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Middleware para loggear requests lentas
   * @param {number} threshold - Umbral en milisegundos (default: 1000ms)
   */
  static slowRequestLogger(threshold = 1000) {
    return (req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        if (duration > threshold) {
          console.warn(`🐌 Request lenta detectada: ${req.method} ${req.originalUrl} - ${duration}ms`, {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            ip: Helpers.getClientIP(req),
            userId: req.user?.id || 'anonymous',
            userAgent: req.headers['user-agent']
          });
        }
      });
      
      next();
    };
  }

  /**
   * Middleware para loggear errores de autenticación
   */
  static authErrorLogger = (req, res, next) => {
    const originalStatus = res.status;
    
    res.status = function(code) {
      if (code === 401 || code === 403) {
        console.warn(`🔐 Error de autenticación: ${code} en ${req.method} ${req.originalUrl}`, {
          ip: Helpers.getClientIP(req),
          userAgent: req.headers['user-agent'],
          authorization: req.headers.authorization ? '[PRESENT]' : '[ABSENT]',
          userId: req.user?.id || 'anonymous'
        });
      }
      
      return originalStatus.call(this, code);
    };
    
    next();
  };

  /**
   * Obtiene el logger apropiado según el entorno
   */
  static getLogger() {
    switch (process.env.NODE_ENV) {
      case 'production':
        return LoggingMiddleware.production;
      case 'development':
        return LoggingMiddleware.development;
      default:
        return LoggingMiddleware.structured;
    }
  }
}

module.exports = LoggingMiddleware;