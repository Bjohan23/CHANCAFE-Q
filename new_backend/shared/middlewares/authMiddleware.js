const jwt = require('jsonwebtoken');

// Importar userService para validar usuario en BD (opcional)
let userService;
try {
  userService = require('../services/userService');
} catch (error) {
  console.warn('⚠️  UserService no disponible en authMiddleware');
}

/**
 * Middleware de autenticación principal (tu versión mejorada)
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer TOKEN_HERE'

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No se proporcionó token' 
    });
  }

  try {
    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // MEJORA OPCIONAL: Verificar usuario en base de datos
    if (userService) {
      try {
        const user = await userService.getUserById(decoded.userId);
        
        // Verificar que el usuario exista y esté activo
        if (!user) {
          return res.status(401).json({ 
            success: false,
            message: 'Usuario no encontrado' 
          });
        }
        
        if (!user.isActive) {
          return res.status(403).json({ 
            success: false,
            message: 'Usuario inactivo' 
          });
        }
        
        // Agregar información completa del usuario
        req.user = {
          ...decoded,
          ...user,
          fullUserData: user // Info completa del usuario
        };
        
      } catch (dbError) {
        console.warn('⚠️  Error al verificar usuario en BD:', dbError.message);
        // Si hay error de BD, continuar solo con datos del token
        req.user = decoded;
      }
    } else {
      // Si no hay userService, usar solo datos del token
      req.user = decoded;
    }
    
    // Agregar token al request para uso posterior
    req.token = token;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirado' 
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ 
        success: false,
        message: 'Token inválido' 
      });
    } else {
      console.error('❌ Error en authMiddleware:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }
};

/**
 * Versión simplificada de tu middleware original (sin cambios de BD)
 */
const simpleAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer TOKEN_HERE'

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No se proporcionó token' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirado' 
      });
    } else {
      return res.status(403).json({ 
        success: false,
        message: 'Token inválido' 
      });
    }
  }
};

/**
 * Middleware para verificar roles específicos
 * Funciona con tu estructura de token actual
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Obtener rol del usuario (desde token o datos completos)
      const userRole = req.user.role || req.user.fullUserData?.role;
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Rol de usuario no definido'
        });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Roles requeridos: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('❌ Error en requireRole:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en verificación de roles'
      });
    }
  };
};

/**
 * Middleware para verificar que el usuario sea admin
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware para verificar que el usuario sea admin o supervisor
 */
const requireAdminOrSupervisor = requireRole(['admin', 'supervisor']);

/**
 * Middleware para verificar propiedad del recurso o admin
 */
const requireOwnershipOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const requestedUserId = parseInt(req.params[userIdParam]);
      const currentUserId = req.user.userId || req.user.id;
      const userRole = req.user.role || req.user.fullUserData?.role;
      const isAdmin = userRole === 'admin';

      if (currentUserId !== requestedUserId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes acceder a tus propios recursos'
        });
      }

      next();
    } catch (error) {
      console.error('❌ Error en requireOwnershipOrAdmin:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en verificación de propiedad'
      });
    }
  };
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Si hay userService, intentar obtener datos completos
      if (userService) {
        try {
          const user = await userService.getUserById(decoded.userId);
          if (user && user.isActive) {
            req.user = { ...decoded, fullUserData: user };
            req.token = token;
          }
        } catch (error) {
          // En auth opcional, ignorar errores
          req.user = decoded;
          req.token = token;
        }
      } else {
        req.user = decoded;
        req.token = token;
      }
    } catch (error) {
      // En auth opcional, ignorar errores de token
      console.warn('⚠️  Token inválido en autenticación opcional:', error.message);
    }
  }

  next();
};

// Exportar tu middleware original como función principal
module.exports = authMiddleware;

// Exportar todas las funciones como objeto para mayor flexibilidad
module.exports.authMiddleware = authMiddleware;
module.exports.simpleAuthMiddleware = simpleAuthMiddleware;
module.exports.requireRole = requireRole;
module.exports.requireAdmin = requireAdmin;
module.exports.requireAdminOrSupervisor = requireAdminOrSupervisor;
module.exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
module.exports.optionalAuth = optionalAuth;