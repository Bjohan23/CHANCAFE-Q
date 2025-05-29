const { User, UserSession, ActivityLog } = require('../models');
const { PasswordUtils, JWTUtils, Helpers } = require('../utils');
const { Op } = require('sequelize');

/**
 * Repositorio de Autenticación
 * Maneja toda la lógica de acceso a datos relacionada con autenticación
 */
class AuthRepository {

  /**
   * Busca un usuario por código de usuario
   * @param {string} code - Código del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findUserByCode(code) {
    try {
      return await User.findOne({
        where: { 
          code: code.trim(),
          status: 'active'
        }
      });
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  /**
   * Busca un usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findUserByEmail(email) {
    try {
      return await User.findOne({
        where: { 
          email: email.toLowerCase().trim(),
          status: 'active'
        }
      });
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  /**
   * Verifica las credenciales del usuario por email
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verifyCredentialsByEmail(email, password) {
    try {
      // Buscar usuario por email
      const user = await this.findUserByEmail(email);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        };
      }

      // Verificar si el usuario está activo
      if (user.status !== 'active') {
        return {
          success: false,
          message: 'Usuario inactivo o suspendido',
          code: 'USER_INACTIVE'
        };
      }

      // Verificar contraseña
      const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Contraseña incorrecta',
          code: 'INVALID_PASSWORD'
        };
      }

      return {
        success: true,
        user: user,
        message: 'Credenciales válidas'
      };

    } catch (error) {
      throw new Error(`Error al verificar credenciales: ${error.message}`);
    }
  }

  /**
   * Verifica las credenciales del usuario por código
   * @param {string} code - Código del usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verifyCredentials(code, password) {
    try {
      // Buscar usuario
      const user = await this.findUserByCode(code);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        };
      }

      // Verificar si el usuario está activo
      if (user.status !== 'active') {
        return {
          success: false,
          message: 'Usuario inactivo o suspendido',
          code: 'USER_INACTIVE'
        };
      }

      // Verificar contraseña
      const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Contraseña incorrecta',
          code: 'INVALID_PASSWORD'
        };
      }

      return {
        success: true,
        user: user,
        message: 'Credenciales válidas'
      };

    } catch (error) {
      throw new Error(`Error al verificar credenciales: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Resultado de la creación
   */
  async createUser(userData) {
    try {
      // Verificar si el email ya existe
      const existingUser = await User.findOne({
        where: { email: userData.email.toLowerCase().trim() }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Ya existe un usuario con ese email',
          code: 'EMAIL_ALREADY_EXISTS'
        };
      }

      // Encriptar contraseña
      const hashedPassword = await PasswordUtils.hashPassword(userData.password);

      // Crear usuario
      const user = await User.create({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email.toLowerCase().trim(),
        password: hashedPassword,
        phone: userData.phone,
        role: userData.role || 'sales_rep',
        status: userData.status || 'active'
      });

      return {
        success: true,
        user: user,
        message: 'Usuario creado exitosamente'
      };

    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  /**
   * Crea una nueva sesión de usuario
   * @param {Object} user - Usuario
   * @param {string} ipAddress - Dirección IP
   * @param {string} userAgent - User agent
   * @returns {Promise<Object>} Datos de la sesión creada
   */
  async createUserSession(user, ipAddress, userAgent) {
    try {
      // Generar tokens
      const sessionId = JWTUtils.generateSessionToken();
      const tokenPair = JWTUtils.generateTokenPair(user, sessionId);
      
      // Parsear información del dispositivo
      const deviceInfo = Helpers.parseUserAgent(userAgent);
      
      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

      // Crear sesión en base de datos
      const session = await UserSession.create({
        user_id: user.id,
        session_token: sessionId,
        refresh_token: tokenPair.refreshToken,
        device_info: deviceInfo,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'active',
        expires_at: expiresAt
      });

      // Actualizar último login del usuario
      await user.updateLastLogin();

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        tokenType: 'Bearer',
        session: session,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.getFullName(),
          email: user.email,
          role: user.role,
          status: user.status
        }
      };

    } catch (error) {
      throw new Error(`Error al crear sesión: ${error.message}`);
    }
  }

  /**
   * Renueva tokens usando refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Nuevos tokens
   */
  async refreshTokens(refreshToken) {
    try {
      // Verificar refresh token
      const decoded = JWTUtils.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Token de tipo incorrecto');
      }

      // Buscar sesión
      const session = await UserSession.findOne({
        where: {
          refresh_token: refreshToken,
          status: 'active'
        },
        include: [{
          model: User,
          as: 'user',
          where: { status: 'active' }
        }]
      });

      if (!session) {
        throw new Error('Sesión no válida o expirada');
      }

      // Verificar que la sesión no haya expirado
      if (session.isExpired()) {
        await session.update({ status: 'expired' });
        throw new Error('Sesión expirada');
      }

      // Generar nuevos tokens
      const newTokenPair = JWTUtils.generateTokenPair(session.user, session.session_token);
      
      // Actualizar refresh token en la sesión
      await session.update({
        refresh_token: newTokenPair.refreshToken,
        last_activity: new Date()
      });

      return {
        accessToken: newTokenPair.accessToken,
        refreshToken: newTokenPair.refreshToken,
        expiresIn: newTokenPair.expiresIn,
        tokenType: 'Bearer'
      };

    } catch (error) {
      throw new Error(`Error al renovar tokens: ${error.message}`);
    }
  }

  /**
   * Cierra una sesión específica
   * @param {string} sessionToken - Token de sesión
   * @returns {Promise<boolean>} True si se cerró exitosamente
   */
  async logout(sessionToken) {
    try {
      const session = await UserSession.findOne({
        where: {
          session_token: sessionToken,
          status: 'active'
        }
      });

      if (session) {
        await session.update({ status: 'revoked' });
        return true;
      }

      return false;
    } catch (error) {
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  }

  /**
   * Cierra todas las sesiones de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Número de sesiones cerradas
   */
  async logoutAllSessions(userId) {
    try {
      const [affectedRows] = await UserSession.update(
        { status: 'revoked' },
        {
          where: {
            user_id: userId,
            status: 'active'
          }
        }
      );

      return affectedRows;
    } catch (error) {
      throw new Error(`Error al cerrar todas las sesiones: ${error.message}`);
    }
  }

  /**
   * Obtiene las sesiones activas de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de sesiones activas
   */
  async getActiveSessions(userId) {
    try {
      return await UserSession.findAll({
        where: {
          user_id: userId,
          status: 'active'
        },
        order: [['last_activity', 'DESC']],
        attributes: [
          'id',
          'device_info',
          'ip_address',
          'last_activity',
          'created_at',
          'expires_at'
        ]
      });
    } catch (error) {
      throw new Error(`Error al obtener sesiones activas: ${error.message}`);
    }
  }

  /**
   * Valida si una sesión es válida
   * @param {string} sessionToken - Token de sesión
   * @returns {Promise<Object|null>} Información de la sesión o null
   */
  async validateSession(sessionToken) {
    try {
      const session = await UserSession.findOne({
        where: {
          session_token: sessionToken,
          status: 'active'
        },
        include: [{
          model: User,
          as: 'user',
          where: { status: 'active' }
        }]
      });

      if (!session || session.isExpired()) {
        return null;
      }

      // Actualizar última actividad
      await session.updateActivity();

      return {
        session: session,
        user: session.user
      };

    } catch (error) {
      throw new Error(`Error al validar sesión: ${error.message}`);
    }
  }

  /**
   * Limpia sesiones expiradas
   * @returns {Promise<number>} Número de sesiones limpiadas
   */
  async cleanupExpiredSessions() {
    try {
      const [affectedRows] = await UserSession.update(
        { status: 'expired' },
        {
          where: {
            status: 'active',
            expires_at: {
              [Op.lt]: new Date()
            }
          }
        }
      );

      return affectedRows;
    } catch (error) {
      throw new Error(`Error al limpiar sesiones expiradas: ${error.message}`);
    }
  }

  /**
   * Registra un intento de login
   * @param {string} email - Email del usuario
   * @param {boolean} success - Si fue exitoso
   * @param {string} ipAddress - IP del intento
   * @param {string} userAgent - User agent
   * @param {string} reason - Razón del fallo si aplica
   */
  async logLoginAttempt(email, success, ipAddress, userAgent, reason = null) {
    try {
      await ActivityLog.logAction({
        userId: null, // Se llena después si es exitoso
        action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
        entityType: 'auth',
        newValues: {
          userEmail: email,
          success: success,
          reason: reason,
          timestamp: new Date().toISOString()
        },
        ipAddress: ipAddress,
        userAgent: userAgent,
        notes: success 
          ? `Login exitoso para usuario ${email}` 
          : `Login fallido para usuario ${email}: ${reason}`
      });
    } catch (error) {
      console.error('Error al registrar intento de login:', error);
    }
  }

  /**
   * Busca usuario por ID con validación de estado
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object|null>} Usuario o null
   */
  async findActiveUserById(userId) {
    try {
      return await User.findOne({
        where: {
          id: userId,
          status: 'active'
        }
      });
    } catch (error) {
      throw new Error(`Error al buscar usuario por ID: ${error.message}`);
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>} True si se cambió exitosamente
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Buscar usuario
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await PasswordUtils.verifyPassword(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Encriptar nueva contraseña
      const hashedPassword = await PasswordUtils.hashPassword(newPassword);
      
      // Actualizar contraseña
      const [affectedRows] = await User.update(
        { password: hashedPassword },
        { where: { id: userId } }
      );

      return affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  }
}

module.exports = new AuthRepository();