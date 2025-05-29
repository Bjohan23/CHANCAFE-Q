const { AuthRepository } = require('../repositories');
const { Helpers } = require('../utils');
const { ActivityLog } = require('../models');

/**
 * Servicio de Autenticación
 * Contiene toda la lógica de negocio relacionada con autenticación
 */
class AuthService {

  /**
   * Procesa el login de un usuario
   * @param {string} code - Código del usuario
   * @param {string} password - Contraseña
   * @param {string} ipAddress - IP del cliente
   * @param {string} userAgent - User agent
   * @returns {Promise<Object>} Resultado del login
   */
  async login(code, password, ipAddress, userAgent) {
    try {
      // Validar credenciales
      const credentialCheck = await AuthRepository.verifyCredentials(code, password);
      
      if (!credentialCheck.success) {
        // Registrar intento fallido
        await AuthRepository.logLoginAttempt(
          code, 
          false, 
          ipAddress, 
          userAgent, 
          credentialCheck.message
        );

        return Helpers.errorResponse(
          credentialCheck.message,
          credentialCheck.code,
          null,
          401
        );
      }

      // Crear sesión de usuario
      const sessionData = await AuthRepository.createUserSession(
        credentialCheck.user,
        ipAddress,
        userAgent
      );

      // Registrar login exitoso
      await AuthRepository.logLoginAttempt(
        code,
        true,
        ipAddress,
        userAgent
      );

      // Registrar actividad
      await ActivityLog.logLogin(
        credentialCheck.user.id,
        ipAddress,
        userAgent
      );

      return Helpers.successResponse(
        'Login exitoso',
        {
          user: sessionData.user,
          tokens: {
            accessToken: sessionData.accessToken,
            refreshToken: sessionData.refreshToken,
            expiresIn: sessionData.expiresIn,
            tokenType: sessionData.tokenType
          }
        },
        200
      );

    } catch (error) {
      console.error('Error en AuthService.login:', error);
      return Helpers.errorResponse(
        'Error interno del servidor',
        'INTERNAL_SERVER_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Renueva tokens usando refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Nuevos tokens
   */
  async refreshTokens(refreshToken) {
    try {
      const newTokens = await AuthRepository.refreshTokens(refreshToken);

      return Helpers.successResponse(
        'Tokens renovados exitosamente',
        newTokens,
        200
      );

    } catch (error) {
      console.error('Error en AuthService.refreshTokens:', error);
      
      if (error.message.includes('expirada') || error.message.includes('válida')) {
        return Helpers.errorResponse(
          error.message,
          'INVALID_REFRESH_TOKEN',
          null,
          401
        );
      }

      return Helpers.errorResponse(
        'Error al renovar tokens',
        'TOKEN_REFRESH_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Cierra la sesión de un usuario
   * @param {string} sessionToken - Token de sesión
   * @param {number} userId - ID del usuario
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Resultado del logout
   */
  async logout(sessionToken, userId, ipAddress) {
    try {
      const logoutSuccess = await AuthRepository.logout(sessionToken);

      if (logoutSuccess) {
        // Registrar logout
        await ActivityLog.logLogout(userId, ipAddress);

        return Helpers.successResponse(
          'Sesión cerrada exitosamente',
          null,
          200
        );
      } else {
        return Helpers.errorResponse(
          'Sesión no encontrada o ya cerrada',
          'SESSION_NOT_FOUND',
          null,
          404
        );
      }

    } catch (error) {
      console.error('Error en AuthService.logout:', error);
      return Helpers.errorResponse(
        'Error al cerrar sesión',
        'LOGOUT_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Cierra todas las sesiones de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Resultado del logout global
   */
  async logoutAllSessions(userId, ipAddress) {
    try {
      const closedSessions = await AuthRepository.logoutAllSessions(userId);

      // Registrar logout global
      await ActivityLog.logAction({
        userId: userId,
        action: 'LOGOUT_ALL',
        ipAddress: ipAddress,
        notes: `Cerradas ${closedSessions} sesiones`
      });

      return Helpers.successResponse(
        `Se cerraron ${closedSessions} sesiones activas`,
        { closedSessions },
        200
      );

    } catch (error) {
      console.error('Error en AuthService.logoutAllSessions:', error);
      return Helpers.errorResponse(
        'Error al cerrar todas las sesiones',
        'LOGOUT_ALL_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene las sesiones activas de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Sesiones activas
   */
  async getActiveSessions(userId) {
    try {
      const sessions = await AuthRepository.getActiveSessions(userId);

      // Formatear sessions para la respuesta
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        device: session.device_info?.device || 'Desconocido',
        browser: session.device_info?.browser || 'Desconocido',
        os: session.device_info?.os || 'Desconocido',
        ipAddress: session.ip_address,
        lastActivity: Helpers.formatDateTime(session.last_activity),
        createdAt: Helpers.formatDateTime(session.created_at),
        expiresAt: Helpers.formatDateTime(session.expires_at)
      }));

      return Helpers.successResponse(
        'Sesiones activas obtenidas exitosamente',
        formattedSessions,
        200
      );

    } catch (error) {
      console.error('Error en AuthService.getActiveSessions:', error);
      return Helpers.errorResponse(
        'Error al obtener sesiones activas',
        'GET_SESSIONS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Valida una sesión específica
   * @param {string} sessionToken - Token de sesión
   * @returns {Promise<Object>} Estado de la sesión
   */
  async validateSession(sessionToken) {
    try {
      const sessionInfo = await AuthRepository.validateSession(sessionToken);

      if (!sessionInfo) {
        return Helpers.errorResponse(
          'Sesión inválida o expirada',
          'INVALID_SESSION',
          null,
          401
        );
      }

      return Helpers.successResponse(
        'Sesión válida',
        {
          user: {
            id: sessionInfo.user.id,
            code: sessionInfo.user.code,
            name: sessionInfo.user.name,
            role: sessionInfo.user.role,
            status: sessionInfo.user.status
          },
          session: {
            lastActivity: sessionInfo.session.last_activity,
            expiresAt: sessionInfo.session.expires_at
          }
        },
        200
      );

    } catch (error) {
      console.error('Error en AuthService.validateSession:', error);
      return Helpers.errorResponse(
        'Error al validar sesión',
        'VALIDATE_SESSION_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Resultado del cambio
   */
  async changePassword(userId, currentPassword, newPassword, ipAddress) {
    try {
      const success = await AuthRepository.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      if (success) {
        // Registrar cambio de contraseña
        await ActivityLog.logAction({
          userId: userId,
          action: 'PASSWORD_CHANGE',
          ipAddress: ipAddress,
          notes: 'Contraseña cambiada por el usuario'
        });

        // Cerrar todas las otras sesiones por seguridad
        await AuthRepository.logoutAllSessions(userId);

        return Helpers.successResponse(
          'Contraseña cambiada exitosamente. Se cerraron todas las sesiones por seguridad.',
          null,
          200
        );
      } else {
        return Helpers.errorResponse(
          'No se pudo cambiar la contraseña',
          'PASSWORD_CHANGE_FAILED',
          null,
          400
        );
      }

    } catch (error) {
      console.error('Error en AuthService.changePassword:', error);
      
      if (error.message.includes('actual incorrecta')) {
        return Helpers.errorResponse(
          error.message,
          'INVALID_CURRENT_PASSWORD',
          null,
          400
        );
      }

      return Helpers.errorResponse(
        'Error al cambiar contraseña',
        'PASSWORD_CHANGE_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Verifica el estado de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Estado del usuario
   */
  async checkUserStatus(userId) {
    try {
      const user = await AuthRepository.findActiveUserById(userId);

      if (!user) {
        return Helpers.errorResponse(
          'Usuario no encontrado o inactivo',
          'USER_NOT_FOUND',
          null,
          404
        );
      }

      return Helpers.successResponse(
        'Estado del usuario obtenido',
        {
          id: user.id,
          code: user.code,
          name: user.name,
          status: user.status,
          role: user.role,
          lastLogin: user.last_login
        },
        200
      );

    } catch (error) {
      console.error('Error en AuthService.checkUserStatus:', error);
      return Helpers.errorResponse(
        'Error al verificar estado del usuario',
        'CHECK_USER_STATUS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Limpia sesiones expiradas (tarea de mantenimiento)
   * @returns {Promise<Object>} Resultado de la limpieza
   */
  async cleanupExpiredSessions() {
    try {
      const cleanedSessions = await AuthRepository.cleanupExpiredSessions();

      console.log(`🧹 Limpieza de sesiones: ${cleanedSessions} sesiones expiradas marcadas`);

      return Helpers.successResponse(
        'Limpieza de sesiones completada',
        { cleanedSessions },
        200
      );

    } catch (error) {
      console.error('Error en AuthService.cleanupExpiredSessions:', error);
      return Helpers.errorResponse(
        'Error en limpieza de sesiones',
        'CLEANUP_ERROR',
        null,
        500
      );
    }
  }
}

module.exports = new AuthService();