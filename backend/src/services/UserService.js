const { UserRepository } = require('../repositories');
const { Helpers, PasswordUtils } = require('../utils');
const { ActivityLog } = require('../models');

/**
 * Servicio de Usuarios
 * Contiene toda la lógica de negocio relacionada con gestión de usuarios
 */
class UserService {

  /**
   * Obtiene una lista paginada de usuarios con filtros
   * @param {Object} options - Opciones de consulta
   * @param {Object} requestUser - Usuario que hace la petición
   * @returns {Promise<Object>} Lista de usuarios
   */
  async getUsers(options = {}, requestUser = null) {
    try {
      const result = await UserRepository.findAll(options);

      return Helpers.successResponse(
        'Usuarios obtenidos exitosamente',
        result,
        200
      );

    } catch (error) {
      console.error('Error en UserService.getUsers:', error);
      return Helpers.errorResponse(
        'Error al obtener usuarios',
        'GET_USERS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene un usuario por ID
   * @param {number} id - ID del usuario
   * @param {Object} requestUser - Usuario que hace la petición
   * @returns {Promise<Object>} Usuario encontrado
   */
  async getUserById(id, requestUser = null) {
    try {
      const user = await UserRepository.findById(id);

      if (!user) {
        return Helpers.errorResponse(
          'Usuario no encontrado',
          'USER_NOT_FOUND',
          null,
          404
        );
      }

      // Verificar permisos (los usuarios solo pueden ver su propia información completa)
      if (requestUser && requestUser.role !== 'admin' && requestUser.id !== user.id) {
        // Retornar información limitada para otros usuarios
        const limitedInfo = {
          id: user.id,
          code: user.code,
          name: user.name,
          role: user.role,
          branch_office: user.branch_office
        };

        return Helpers.successResponse(
          'Información básica del usuario',
          limitedInfo,
          200
        );
      }

      return Helpers.successResponse(
        'Usuario obtenido exitosamente',
        user,
        200
      );

    } catch (error) {
      console.error('Error en UserService.getUserById:', error);
      return Helpers.errorResponse(
        'Error al obtener usuario',
        'GET_USER_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Usuario creado
   */
  async createUser(userData, requestUser, ipAddress) {
    try {
      // Validar fortaleza de contraseña
      const passwordValidation = PasswordUtils.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        return Helpers.errorResponse(
          'La contraseña no cumple con los requisitos mínimos',
          'WEAK_PASSWORD',
          {
            errors: passwordValidation.errors,
            suggestions: passwordValidation.suggestions
          },
          400
        );
      }

      // Verificar disponibilidad de código
      const isCodeAvailable = await UserRepository.isCodeAvailable(userData.code);
      if (!isCodeAvailable) {
        return Helpers.errorResponse(
          'El código de usuario ya existe',
          'CODE_EXISTS',
          null,
          409
        );
      }

      // Verificar disponibilidad de email si se proporciona
      if (userData.email) {
        const isEmailAvailable = await UserRepository.isEmailAvailable(userData.email);
        if (!isEmailAvailable) {
          return Helpers.errorResponse(
            'El email ya está registrado',
            'EMAIL_EXISTS',
            null,
            409
          );
        }
      }

      // Crear usuario
      const newUser = await UserRepository.create(userData);

      // Registrar actividad
      await ActivityLog.logCreate(
        requestUser.id,
        'user',
        newUser.id,
        newUser,
        ipAddress
      );

      return Helpers.successResponse(
        'Usuario creado exitosamente',
        newUser,
        201
      );

    } catch (error) {
      console.error('Error en UserService.createUser:', error);
      
      if (error.message.includes('ya existe')) {
        return Helpers.errorResponse(
          error.message,
          'DUPLICATE_ENTRY',
          null,
          409
        );
      }

      return Helpers.errorResponse(
        'Error al crear usuario',
        'CREATE_USER_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Actualiza un usuario existente
   * @param {number} id - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUser(id, updateData, requestUser, ipAddress) {
    try {
      // Obtener usuario actual para registro de cambios
      const currentUser = await UserRepository.findById(id);
      if (!currentUser) {
        return Helpers.errorResponse(
          'Usuario no encontrado',
          'USER_NOT_FOUND',
          null,
          404
        );
      }

      // Validar permisos de actualización
      if (requestUser.role !== 'admin' && requestUser.id !== id) {
        // Los usuarios solo pueden actualizar ciertos campos de su propio perfil
        const allowedFields = ['name', 'email', 'phone'];
        const hasRestrictedFields = Object.keys(updateData).some(
          field => !allowedFields.includes(field)
        );

        if (hasRestrictedFields) {
          return Helpers.errorResponse(
            'No tienes permisos para modificar estos campos',
            'INSUFFICIENT_PERMISSIONS',
            null,
            403
          );
        }
      }

      // Verificar disponibilidad de código si se actualiza
      if (updateData.code) {
        const isCodeAvailable = await UserRepository.isCodeAvailable(updateData.code, id);
        if (!isCodeAvailable) {
          return Helpers.errorResponse(
            'El código de usuario ya existe',
            'CODE_EXISTS',
            null,
            409
          );
        }
      }

      // Verificar disponibilidad de email si se actualiza
      if (updateData.email) {
        const isEmailAvailable = await UserRepository.isEmailAvailable(updateData.email, id);
        if (!isEmailAvailable) {
          return Helpers.errorResponse(
            'El email ya está registrado',
            'EMAIL_EXISTS',
            null,
            409
          );
        }
      }

      // Validar nueva contraseña si se proporciona
      if (updateData.password) {
        const passwordValidation = PasswordUtils.validatePasswordStrength(updateData.password);
        if (!passwordValidation.isValid) {
          return Helpers.errorResponse(
            'La nueva contraseña no cumple con los requisitos mínimos',
            'WEAK_PASSWORD',
            {
              errors: passwordValidation.errors,
              suggestions: passwordValidation.suggestions
            },
            400
          );
        }
      }

      // Actualizar usuario
      const updatedUser = await UserRepository.update(id, updateData);

      if (!updatedUser) {
        return Helpers.errorResponse(
          'Usuario no encontrado',
          'USER_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar cambios
      await ActivityLog.logUpdate(
        requestUser.id,
        'user',
        id,
        currentUser,
        updatedUser,
        ipAddress
      );

      return Helpers.successResponse(
        'Usuario actualizado exitosamente',
        updatedUser,
        200
      );

    } catch (error) {
      console.error('Error en UserService.updateUser:', error);
      
      if (error.message.includes('ya existe')) {
        return Helpers.errorResponse(
          error.message,
          'DUPLICATE_ENTRY',
          null,
          409
        );
      }

      return Helpers.errorResponse(
        'Error al actualizar usuario',
        'UPDATE_USER_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Elimina un usuario (soft delete)
   * @param {number} id - ID del usuario
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteUser(id, requestUser, ipAddress) {
    try {
      // Verificar que no se esté eliminando a sí mismo
      if (requestUser.id === id) {
        return Helpers.errorResponse(
          'No puedes eliminar tu propia cuenta',
          'CANNOT_DELETE_SELF',
          null,
          400
        );
      }

      // Obtener usuario para el log
      const userToDelete = await UserRepository.findById(id);
      if (!userToDelete) {
        return Helpers.errorResponse(
          'Usuario no encontrado',
          'USER_NOT_FOUND',
          null,
          404
        );
      }

      // Eliminar usuario
      const success = await UserRepository.delete(id);

      if (!success) {
        return Helpers.errorResponse(
          'Usuario no encontrado',
          'USER_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar eliminación
      await ActivityLog.logDelete(
        requestUser.id,
        'user',
        id,
        userToDelete,
        ipAddress
      );

      return Helpers.successResponse(
        'Usuario eliminado exitosamente',
        null,
        200
      );

    } catch (error) {
      console.error('Error en UserService.deleteUser:', error);
      return Helpers.errorResponse(
        'Error al eliminar usuario',
        'DELETE_USER_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Cambia el estado de un usuario
   * @param {number} id - ID del usuario
   * @param {string} status - Nuevo estado
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Usuario con estado actualizado
   */
  async changeUserStatus(id, status, requestUser, ipAddress) {
    try {
      // Verificar que no se esté desactivando a sí mismo
      if (requestUser.id === id && status !== 'active') {
        return Helpers.errorResponse(
          'No puedes desactivar tu propia cuenta',
          'CANNOT_DEACTIVATE_SELF',
          null,
          400
        );
      }

      const updatedUser = await UserRepository.changeStatus(id, status);

      if (!updatedUser) {
        return Helpers.errorResponse(
          'Usuario no encontrado',
          'USER_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar cambio de estado
      await ActivityLog.logAction({
        userId: requestUser.id,
        action: 'STATUS_CHANGE',
        entityType: 'user',
        entityId: id,
        newValues: { status },
        ipAddress: ipAddress,
        notes: `Estado cambiado a: ${status}`
      });

      return Helpers.successResponse(
        `Estado del usuario cambiado a ${status}`,
        updatedUser,
        200
      );

    } catch (error) {
      console.error('Error en UserService.changeUserStatus:', error);
      return Helpers.errorResponse(
        'Error al cambiar estado del usuario',
        'CHANGE_STATUS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   * @returns {Promise<Object>} Estadísticas
   */
  async getUserStats() {
    try {
      const stats = await UserRepository.getStats();

      return Helpers.successResponse(
        'Estadísticas de usuarios obtenidas',
        stats,
        200
      );

    } catch (error) {
      console.error('Error en UserService.getUserStats:', error);
      return Helpers.errorResponse(
        'Error al obtener estadísticas',
        'GET_STATS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene usuarios por rol
   * @param {string} role - Rol a filtrar
   * @returns {Promise<Object>} Lista de usuarios por rol
   */
  async getUsersByRole(role) {
    try {
      const users = await UserRepository.findByRole(role);

      return Helpers.successResponse(
        `Usuarios con rol ${role} obtenidos`,
        users,
        200
      );

    } catch (error) {
      console.error('Error en UserService.getUsersByRole:', error);
      return Helpers.errorResponse(
        'Error al obtener usuarios por rol',
        'GET_USERS_BY_ROLE_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene asesores disponibles para asignación
   * @returns {Promise<Object>} Lista de asesores disponibles
   */
  async getAvailableAdvisors() {
    try {
      const advisors = await UserRepository.findAvailableAdvisors();

      return Helpers.successResponse(
        'Asesores disponibles obtenidos',
        advisors,
        200
      );

    } catch (error) {
      console.error('Error en UserService.getAvailableAdvisors:', error);
      return Helpers.errorResponse(
        'Error al obtener asesores disponibles',
        'GET_ADVISORS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene el dashboard de un asesor
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Datos del dashboard
   */
  async getAdvisorDashboard(userId) {
    try {
      const dashboardData = await UserRepository.getAdvisorDashboard(userId);

      return Helpers.successResponse(
        'Dashboard del asesor obtenido',
        dashboardData,
        200
      );

    } catch (error) {
      console.error('Error en UserService.getAdvisorDashboard:', error);
      return Helpers.errorResponse(
        'Error al obtener dashboard',
        'GET_DASHBOARD_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Verifica la disponibilidad de un código de usuario
   * @param {string} code - Código a verificar
   * @param {number} excludeId - ID a excluir
   * @returns {Promise<Object>} Disponibilidad del código
   */
  async checkCodeAvailability(code, excludeId = null) {
    try {
      const isAvailable = await UserRepository.isCodeAvailable(code, excludeId);

      return Helpers.successResponse(
        isAvailable ? 'Código disponible' : 'Código no disponible',
        { available: isAvailable, code },
        200
      );

    } catch (error) {
      console.error('Error en UserService.checkCodeAvailability:', error);
      return Helpers.errorResponse(
        'Error al verificar disponibilidad del código',
        'CHECK_CODE_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Verifica la disponibilidad de un email
   * @param {string} email - Email a verificar
   * @param {number} excludeId - ID a excluir
   * @returns {Promise<Object>} Disponibilidad del email
   */
  async checkEmailAvailability(email, excludeId = null) {
    try {
      const isAvailable = await UserRepository.isEmailAvailable(email, excludeId);

      return Helpers.successResponse(
        isAvailable ? 'Email disponible' : 'Email no disponible',
        { available: isAvailable, email },
        200
      );

    } catch (error) {
      console.error('Error en UserService.checkEmailAvailability:', error);
      return Helpers.errorResponse(
        'Error al verificar disponibilidad del email',
        'CHECK_EMAIL_ERROR',
        null,
        500
      );
    }
  }
}

module.exports = new UserService();