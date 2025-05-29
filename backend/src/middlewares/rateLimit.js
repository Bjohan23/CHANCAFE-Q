const rateLimit = require('express-rate-limit');
const { config } = require('../config');
const { Helpers } = require('../utils');

/**
 * Configuraciones de Rate Limiting para diferentes endpoints
 * Protege la API contra abuso y ataques DoS
 */
class RateLimitMiddleware {

  /**
   * Rate limiter general para toda la API
   */
  static general = rateLimit({
    windowMs: config.rateLimit.windowMs, // 15 minutos
    max: config.rateLimit.maxRequests, // 100 requests por IP
    message: config.rateLimit.message,
    standardHeaders: true, // Retorna headers `RateLimit-*`
    legacyHeaders: false, // Desactiva headers `X-RateLimit-*`
    
    // Función personalizada para generar clave de identificación
    keyGenerator: (req) => {
      // Usar IP + User ID si está autenticado
      const ip = Helpers.getClientIP(req);
      const userId = req.user?.id || 'anonymous';
      return `${ip}:${userId}`;
    },

    // Mensaje personalizado basado en el tipo de limite
    handler: (req, res) => {
      const retryAfter = Math.ceil(config.rateLimit.windowMs / 1000 / 60); // minutos
      
      res.status(429).json(
        Helpers.errorResponse(
          'Demasiadas solicitudes desde esta IP. Intenta de nuevo más tarde.',
          'RATE_LIMIT_EXCEEDED',
          {
            retryAfter: `${retryAfter} minutos`,
            limit: config.rateLimit.maxRequests,
            windowMs: config.rateLimit.windowMs
          },
          429
        )
      );
    },

    // Omitir rate limiting para ciertas condiciones
    skip: (req) => {
      // Omitir para requests internos (opcional)
      if (req.ip === '127.0.0.1' && process.env.NODE_ENV === 'development') {
        return true;
      }
      
      // Omitir para admins (opcional)
      if (req.user?.role === 'admin') {
        return true;
      }

      return false;
    }
  });

  /**
   * Rate limiter estricto para login (protección contra ataques de fuerza bruta)
   */
  static login = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Solo 5 intentos de login por IP cada 15 minutos
    
    keyGenerator: (req) => {
      // Usar IP + código de usuario para login
      const ip = Helpers.getClientIP(req);
      const userCode = req.body?.code || 'unknown';
      return `login:${ip}:${userCode}`;
    },

    handler: (req, res) => {
      res.status(429).json(
        Helpers.errorResponse(
          'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
          'LOGIN_RATE_LIMIT_EXCEEDED',
          {
            retryAfter: '15 minutos',
            limit: 5,
            suggestion: 'Verifica tus credenciales o contacta al administrador'
          },
          429
        )
      );
    }
  });

  /**
   * Rate limiter para creación de recursos (prevenir spam)
   */
  static create = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // 10 creaciones por minuto por usuario
    
    keyGenerator: (req) => {
      const userId = req.user?.id || Helpers.getClientIP(req);
      return `create:${userId}`;
    },

    handler: (req, res) => {
      res.status(429).json(
        Helpers.errorResponse(
          'Estás creando recursos muy rápido. Espera un momento.',
          'CREATE_RATE_LIMIT_EXCEEDED',
          {
            retryAfter: '1 minuto',
            limit: 10
          },
          429
        )
      );
    }
  });

  /**
   * Rate limiter para búsquedas (prevenir abuso de queries)
   */
  static search = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // 30 búsquedas por minuto
    
    keyGenerator: (req) => {
      const userId = req.user?.id || Helpers.getClientIP(req);
      return `search:${userId}`;
    },

    handler: (req, res) => {
      res.status(429).json(
        Helpers.errorResponse(
          'Demasiadas búsquedas. Espera un momento antes de continuar.',
          'SEARCH_RATE_LIMIT_EXCEEDED',
          {
            retryAfter: '1 minuto',
            limit: 30
          },
          429
        )
      );
    }
  });

  /**
   * Rate limiter para subida de archivos
   */
  static upload = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // 10 uploads cada 5 minutos
    
    keyGenerator: (req) => {
      const userId = req.user?.id || Helpers.getClientIP(req);
      return `upload:${userId}`;
    },

    handler: (req, res) => {
      res.status(429).json(
        Helpers.errorResponse(
          'Demasiadas subidas de archivos. Espera unos minutos.',
          'UPLOAD_RATE_LIMIT_EXCEEDED',
          {
            retryAfter: '5 minutos',
            limit: 10
          },
          429
        )
      );
    }
  });

  /**
   * Rate limiter para reseteo de contraseñas
   */
  static passwordReset = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // Solo 3 intentos por hora
    
    keyGenerator: (req) => {
      const ip = Helpers.getClientIP(req);
      const email = req.body?.email || 'unknown';
      return `password-reset:${ip}:${email}`;
    },

    handler: (req, res) => {
      res.status(429).json(
        Helpers.errorResponse(
          'Demasiados intentos de reseteo de contraseña. Intenta en 1 hora.',
          'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
          {
            retryAfter: '1 hora',
            limit: 3
          },
          429
        )
      );
    }
  });

  /**
   * Rate limiter para endpoints públicos (como /status)
   */
  static public = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // 60 requests por minuto (más permisivo)
    
    keyGenerator: (req) => {
      return Helpers.getClientIP(req);
    },

    handler: (req, res) => {
      res.status(429).json(
        Helpers.errorResponse(
          'Demasiadas solicitudes al endpoint público',
          'PUBLIC_RATE_LIMIT_EXCEEDED',
          {
            retryAfter: '1 minuto',
            limit: 60
          },
          429
        )
      );
    }
  });

  /**
   * Rate limiter dinámico basado en el tipo de usuario
   * @param {Object} limits - Límites por rol: { asesor: 50, supervisor: 100, admin: 200 }
   */
  static dynamic(limits = { asesor: 50, supervisor: 100, admin: 200 }) {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      
      // Límite dinámico basado en rol
      max: (req) => {
        const userRole = req.user?.role || 'asesor';
        return limits[userRole] || limits.asesor;
      },

      keyGenerator: (req) => {
        const userId = req.user?.id || Helpers.getClientIP(req);
        const role = req.user?.role || 'anonymous';
        return `dynamic:${role}:${userId}`;
      },

      handler: (req, res) => {
        const userRole = req.user?.role || 'asesor';
        const limit = limits[userRole] || limits.asesor;
        
        res.status(429).json(
          Helpers.errorResponse(
            `Límite de ${limit} requests alcanzado para tu rol (${userRole})`,
            'DYNAMIC_RATE_LIMIT_EXCEEDED',
            {
              retryAfter: '15 minutos',
              limit: limit,
              role: userRole
            },
            429
          )
        );
      }
    });
  }

  /**
   * Middleware para limpiar rate limiters expirados (tarea de mantenimiento)
   */
  static cleanup() {
    // Express-rate-limit maneja la limpieza automáticamente
    // Este método existe para futuras extensiones
    console.log('🧹 Limpieza de rate limiters ejecutada');
  }

  /**
   * Obtiene información actual de rate limiting para un request
   * @param {Object} req - Request de Express
   * @returns {Object} Información de rate limiting
   */
  static getInfo(req) {
    return {
      ip: Helpers.getClientIP(req),
      user: req.user?.id || 'anonymous',
      role: req.user?.role || 'none',
      headers: {
        remaining: req.get('RateLimit-Remaining'),
        limit: req.get('RateLimit-Limit'),
        reset: req.get('RateLimit-Reset')
      }
    };
  }
}

module.exports = RateLimitMiddleware;