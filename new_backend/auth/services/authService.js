// services/authService.js
const userService = require('./userService');

/**
 * AuthService - Servicio de autenticación que usa UserService
 * Este servicio se enfoca únicamente en la autenticación,
 * delegando la gestión de usuarios al UserService
 */
class AuthService {

  /**
   * Login de usuario
   */
  async loginUser(email, password) {
    try {
      return await userService.loginUser(email, password);
    } catch (error) {
      console.error('❌ Error en AuthService.loginUser:', error.message);
      throw error;
    }
  }

  /**
   * Registro de usuario
   */
  async registerUser(userData) {
    try {
      return await userService.registerUser(userData);
    } catch (error) {
      console.error('❌ Error en AuthService.registerUser:', error.message);
      throw error;
    }
  }

  /**
   * Verificar token JWT
   */
  verifyToken(token) {
    try {
      return userService.verifyToken(token);
    } catch (error) {
      console.error('❌ Error en AuthService.verifyToken:', error.message);
      throw error;
    }
  }

  /**
   * Obtener usuario autenticado por token
   */
  async getAuthenticatedUser(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await userService.getUserById(decoded.userId);
      return user;
    } catch (error) {
      console.error('❌ Error en AuthService.getAuthenticatedUser:', error.message);
      throw error;
    }
  }

  /**
   * Refrescar token
   */
  async refreshToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await userService.getUserById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error("Usuario no válido para refrescar token");
      }

      const newToken = userService.generateToken(user);
      
      return {
        token: newToken,
        user: user,
        message: "Token refrescado exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en AuthService.refreshToken:', error.message);
      throw error;
    }
  }

  /**
   * Logout (invalidar token)
   * Nota: En una implementación más robusta, podrías mantener una blacklist de tokens
   */
  async logout(token) {
    try {
      // Aquí podrías agregar lógica para invalidar el token
      // Por ejemplo, añadiéndolo a una blacklist en Redis
      
      console.log('🔓 Usuario deslogueado exitosamente');
      return {
        message: "Logout exitoso"
      };
    } catch (error) {
      console.error('❌ Error en AuthService.logout:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      return await userService.changePassword(userId, currentPassword, newPassword);
    } catch (error) {
      console.error('❌ Error en AuthService.changePassword:', error.message);
      throw error;
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   * Nota: Implementación básica - en producción incluirías envío de email
   */
  async requestPasswordReset(email) {
    try {
      const user = await userService.getUserByEmail(email);
      
      // Generar token de restablecimiento (válido por 1 hora)
      const resetToken = userService.generateToken({
        id: user.id,
        email: user.email,
        purpose: 'password_reset'
      });

      // En una implementación real, enviarías este token por email
      console.log('📧 Token de restablecimiento generado:', resetToken);
      
      return {
        message: "Se ha enviado un email con las instrucciones para restablecer la contraseña",
        // En desarrollo puedes retornar el token, en producción NO
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      };
    } catch (error) {
      console.error('❌ Error en AuthService.requestPasswordReset:', error.message);
      throw error;
    }
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(resetToken, newPassword) {
    try {
      const decoded = this.verifyToken(resetToken);
      
      if (decoded.purpose !== 'password_reset') {
        throw new Error("Token inválido para restablecimiento de contraseña");
      }

      // Cambiar contraseña directamente (sin verificar la actual)
      const user = await userService.getUserById(decoded.userId);
      const updatedUser = await userService.updateUser(decoded.userId, {
        password: newPassword
      });

      return {
        message: "Contraseña restablecida exitosamente",
        user: updatedUser
      };
    } catch (error) {
      console.error('❌ Error en AuthService.resetPassword:', error.message);
      throw error;
    }
  }
}

// Mantener compatibilidad con la exportación anterior
const authServiceInstance = new AuthService();

module.exports = {
  loginUser: authServiceInstance.loginUser.bind(authServiceInstance),
  registerUser: authServiceInstance.registerUser.bind(authServiceInstance),
  // Exportar también la instancia completa
  authService: authServiceInstance
};