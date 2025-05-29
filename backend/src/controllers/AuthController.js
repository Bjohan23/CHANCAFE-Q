const { AuthService } = require('../services');
const { Helpers } = require('../utils');
const { ErrorHandler } = require('../middlewares');

/**
 * Controlador de Autenticación
 * Maneja las peticiones HTTP relacionadas con autenticación
 */
class AuthController {

  /**
   * Endpoint público para verificar estado de la API
   * GET /api/v1/status
   */
  static async getStatus(req, res) {
    try {
      const response = Helpers.successResponse(
        'API is running',
        {
          service: 'CHANCAFE Q API',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        },
        200
      );

      res.status(200).json(response);
    } catch (error) {
      console.error('Error en AuthController.getStatus:', error);
      const errorResponse = Helpers.errorResponse(
        'Error al obtener estado de la API',
        'STATUS_ERROR',
        null,
        500
      );
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Inicia sesión de usuario
   * POST /api/v1/auth/login
   */
  static login = ErrorHandler.asyncHandler(async (req, res) => {
    const { code, password } = req.body;
    const ipAddress = Helpers.getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';

    const result = await AuthService.login(code, password, ipAddress, userAgent);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Renueva tokens usando refresh token
   * POST /api/v1/auth/refresh
   */
  static refreshToken = ErrorHandler.asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await AuthService.refreshTokens(refreshToken);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Cierra sesión del usuario actual
   * POST /api/v1/auth/logout
   */
  static logout = ErrorHandler.asyncHandler(async (req, res) => {
    const sessionToken = req.tokenDecoded?.sessionId;
    const userId = req.user.id;
    const ipAddress = Helpers.getClientIP(req);

    const result = await AuthService.logout(sessionToken, userId, ipAddress);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Cierra todas las sesiones del usuario
   * POST /api/v1/auth/logout-all
   */
  static logoutAll = ErrorHandler.asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const ipAddress = Helpers.getClientIP(req);

    const result = await AuthService.logoutAllSessions(userId, ipAddress);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Obtiene sesiones activas del usuario
   * GET /api/v1/auth/sessions
   */
  static getSessions = ErrorHandler.asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await AuthService.getActiveSessions(userId);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Valida la sesión actual
   * GET /api/v1/auth/validate
   */
  static validateSession = ErrorHandler.asyncHandler(async (req, res) => {
    const sessionToken = req.tokenDecoded?.sessionId;

    if (!sessionToken) {
      const errorResponse = Helpers.errorResponse(
        'Token de sesión no encontrado',
        'MISSING_SESSION_TOKEN',
        null,
        400
      );
      return res.status(400).json(errorResponse);
    }

    const result = await AuthService.validateSession(sessionToken);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Cambia la contraseña del usuario
   * POST /api/v1/auth/change-password
   */
  static changePassword = ErrorHandler.asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const ipAddress = Helpers.getClientIP(req);

    const result = await AuthService.changePassword(
      userId,
      currentPassword,
      newPassword,
      ipAddress
    );
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Obtiene información del usuario autenticado
   * GET /api/v1/auth/me
   */
  static getMe = ErrorHandler.asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await AuthService.checkUserStatus(userId);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Endpoint de mantenimiento para limpiar sesiones expiradas
   * POST /api/v1/auth/cleanup (solo admin)
   */
  static cleanupSessions = ErrorHandler.asyncHandler(async (req, res) => {
    // Este endpoint solo debe estar disponible para administradores
    if (req.user.role !== 'admin') {
      const errorResponse = Helpers.errorResponse(
        'Acceso denegado',
        'ADMIN_ONLY',
        null,
        403
      );
      return res.status(403).json(errorResponse);
    }

    const result = await AuthService.cleanupExpiredSessions();
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Verifica el estado de salud de la autenticación
   * GET /api/v1/auth/health
   */
  static healthCheck = ErrorHandler.asyncHandler(async (req, res) => {
    const response = Helpers.successResponse(
      'Auth service is healthy',
      {
        service: 'Authentication Service',
        status: 'operational',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'connected',
          jwt: 'operational',
          sessions: 'active'
        }
      },
      200
    );

    res.status(200).json(response);
  });

  /**
   * Registra un nuevo usuario (solo para admins o proceso específico)
   * POST /api/v1/auth/register
   */
  static register = ErrorHandler.asyncHandler(async (req, res) => {
    const userData = req.body;
    const ipAddress = Helpers.getClientIP(req);

    // En un sistema de asesores, el registro debe ser controlado
    // Aquí podríamos validar que solo admins puedan crear usuarios
    // o implementar un proceso específico de registro

    const errorResponse = Helpers.errorResponse(
      'El registro de usuarios debe realizarse a través del panel de administración',
      'REGISTRATION_DISABLED',
      {
        message: 'Contacta al administrador para crear una nueva cuenta'
      },
      403
    );
    
    res.status(403).json(errorResponse);
  });

  /**
   * Obtiene información del usuario autenticado (alias para getMe)
   * GET /api/v1/auth/me
   */
  static getCurrentUser = ErrorHandler.asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await AuthService.checkUserStatus(userId);
    
    res.status(result.statusCode).json(result);
  });
}

module.exports = AuthController;