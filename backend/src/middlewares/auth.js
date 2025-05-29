const { JWTUtils, Helpers } = require('../utils');
const { User, UserSession } = require('../models');

/**
 * Middleware de autenticación JWT
 * Verifica tokens JWT y maneja la autenticación de usuarios
 */
class AuthMiddleware {
  
  /**
   * Middleware principal para verificar JWT
   * Extrae y verifica el token JWT del header Authorization
   */
  static async verifyToken(req, res, next) {
    try {
      // Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      const token = JWTUtils.extractTokenFromHeader(authHeader);
      
      if (!token) {
        return res.status(401).json(
          Helpers.errorResponse(
            'Token de acceso requerido',
            'MISSING_TOKEN',
            null,
            401
          )
        );
      }

      // Verificar estructura básica del JWT
      if (!JWTUtils.hasValidJWTStructure(token)) {
        return res.status(401).json(
          Helpers.errorResponse(
            'Formato de token inválido',
            'INVALID_TOKEN_FORMAT',
            null,
            401
          )
        );
      }

      // Verificar y decodificar token
      let decoded;
      try {
        decoded = JWTUtils.verifyToken(token);
      } catch (tokenError) {
        return res.status(401).json(
          Helpers.errorResponse(
            tokenError.message,
            'TOKEN_VERIFICATION_FAILED',
            null,
            401
          )
        );
      }

      // Buscar usuario en base de datos
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json(
          Helpers.errorResponse(
            'Usuario no encontrado',
            'USER_NOT_FOUND',
            null,
            401
          )
        );
      }

      // Verificar estado del usuario
      if (!user.isActive()) {
        return res.status(401).json(
          Helpers.errorResponse(
            'Usuario inactivo o suspendido',
            'USER_INACTIVE',
            null,
            401
          )
        );
      }

      // Verificar sesión si existe sessionId en el token
      if (decoded.sessionId) {
        const session = await UserSession.findOne({
          where: {
            user_id: user.id,
            session_token: decoded.sessionId,
            status: 'active'
          }
        });

        if (!session) {
          return res.status(401).json(
            Helpers.errorResponse(
              'Sesión inválida o expirada',
              'INVALID_SESSION',
              null,
              401
            )
          );
        }

        // Actualizar última actividad de la sesión
        await session.updateActivity();
      }

      // Agregar información del usuario al request
      req.user = {
        id: user.id,
        code: user.code,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        sessionId: decoded.sessionId
      };

      req.token = token;
      req.tokenDecoded = decoded;

      next();
    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      return res.status(500).json(
        Helpers.errorResponse(
          'Error interno del servidor',
          'INTERNAL_SERVER_ERROR',
          null,
          500
        )
      );
    }
  }

  /**
   * Middleware opcional para verificar JWT
   * Similar a verifyToken pero no falla si no hay token
   */
  static async optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTUtils.extractTokenFromHeader(authHeader);
      
      if (!token) {
        // No hay token, continuar sin autenticación
        req.user = null;
        return next();
      }

      // Si hay token, verificarlo
      await AuthMiddleware.verifyToken(req, res, next);
    } catch (error) {
      // En caso de error, continuar sin autenticación
      req.user = null;
      next();
    }
  }

  /**
   * Middleware para verificar roles específicos
   * @param {string|Array} allowedRoles - Rol o array de roles permitidos
   */
  static requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json(
          Helpers.errorResponse(
            'Autenticación requerida',
            'AUTHENTICATION_REQUIRED',
            null,
            401
          )
        );
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json(
          Helpers.errorResponse(
            'Permisos insuficientes para acceder a este recurso',
            'INSUFFICIENT_PERMISSIONS',
            { requiredRoles: roles, userRole: req.user.role },
            403
          )
        );
      }

      next();
    };
  }

  /**
   * Middleware para verificar si el usuario es administrador
   */
  static requireAdmin(req, res, next) {
    return AuthMiddleware.requireRole('admin')(req, res, next);
  }

  /**
   * Middleware para verificar si el usuario es supervisor o admin
   */
  static requireSupervisor(req, res, next) {
    return AuthMiddleware.requireRole(['supervisor', 'admin'])(req, res, next);
  }

  /**
   * Middleware para verificar si el usuario puede acceder a sus propios recursos
   * @param {string} userIdParam - Nombre del parámetro que contiene el user ID
   */
  static requireSelfOrAdmin(userIdParam = 'userId') {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json(
          Helpers.errorResponse(
            'Autenticación requerida',
            'AUTHENTICATION_REQUIRED',
            null,
            401
          )
        );
      }

      const targetUserId = parseInt(req.params[userIdParam]);
      const isOwnResource = req.user.id === targetUserId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwnResource && !isAdmin) {
        return res.status(403).json(
          Helpers.errorResponse(
            'Solo puedes acceder a tus propios recursos',
            'ACCESS_DENIED',
            null,
            403
          )
        );
      }

      next();
    };
  }

  /**
   * Middleware para refresh token
   * Verifica que el token sea específicamente un refresh token
   */
  static async verifyRefreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json(
          Helpers.errorResponse(
            'Refresh token requerido',
            'MISSING_REFRESH_TOKEN',
            null,
            400
          )
        );
      }

      let decoded;
      try {
        decoded = JWTUtils.verifyToken(refreshToken);
      } catch (tokenError) {
        return res.status(401).json(
          Helpers.errorResponse(
            'Refresh token inválido o expirado',
            'INVALID_REFRESH_TOKEN',
            null,
            401
          )
        );
      }

      // Verificar que sea un refresh token
      if (decoded.type !== 'refresh') {
        return res.status(400).json(
          Helpers.errorResponse(
            'Token de tipo incorrecto',
            'WRONG_TOKEN_TYPE',
            null,
            400
          )
        );
      }

      // Buscar usuario
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive()) {
        return res.status(401).json(
          Helpers.errorResponse(
            'Usuario no válido',
            'INVALID_USER',
            null,
            401
          )
        );
      }

      req.user = user;
      req.refreshToken = refreshToken;
      req.sessionId = decoded.sessionId;

      next();
    } catch (error) {
      console.error('Error en verificación de refresh token:', error);
      return res.status(500).json(
        Helpers.errorResponse(
          'Error interno del servidor',
          'INTERNAL_SERVER_ERROR',
          null,
          500
        )
      );
    }
  }
}

module.exports = AuthMiddleware;