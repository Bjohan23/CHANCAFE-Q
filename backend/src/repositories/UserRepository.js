const { User } = require('../models');
const { PasswordUtils, Helpers } = require('../utils');
const { Op } = require('sequelize');

/**
 * Repositorio de Usuarios
 * Maneja toda la lógica de acceso a datos relacionada con usuarios
 */
class UserRepository {

  /**
   * Obtiene todos los usuarios con paginación
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Usuarios paginados
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role = null,
        status = null,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const pagination = Helpers.calculatePagination(page, limit);
      const where = {};

      // Filtros
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (status) {
        where.status = status;
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        attributes: { exclude: ['password_hash'] }
      });

      return {
        users: rows,
        pagination: pagination.getMetadata(count)
      };

    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  /**
   * Busca un usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findById(id) {
    try {
      return await User.findByPk(id, {
        attributes: { exclude: ['password_hash'] },
        include: [
          {
            association: 'clients',
            limit: 5,
            order: [['created_at', 'DESC']]
          },
          {
            association: 'quotes',
            limit: 5,
            order: [['created_at', 'DESC']]
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  /**
   * Busca un usuario por código
   * @param {string} code - Código del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByCode(code) {
    try {
      return await User.findOne({
        where: { code },
        attributes: { exclude: ['password_hash'] }
      });
    } catch (error) {
      throw new Error(`Error al buscar usuario por código: ${error.message}`);
    }
  }

  /**
   * Busca un usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByEmail(email) {
    try {
      return await User.findOne({
        where: { email: email.toLowerCase() },
        attributes: { exclude: ['password_hash'] }
      });
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async create(userData) {
    try {
      // Hashear contraseña
      const hashedPassword = await PasswordUtils.hashPassword(userData.password);
      
      // Preparar datos
      const userToCreate = {
        ...userData,
        password_hash: hashedPassword,
        email: userData.email ? userData.email.toLowerCase() : null
      };

      // Remover contraseña plana
      delete userToCreate.password;

      const user = await User.create(userToCreate);
      
      // Retornar sin password_hash
      const userWithoutPassword = user.toJSON();
      delete userWithoutPassword.password_hash;
      
      return userWithoutPassword;

    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0].path;
        throw new Error(`El ${field} ya existe en el sistema`);
      }
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  /**
   * Actualiza un usuario
   * @param {number} id - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  async update(id, updateData) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        return null;
      }

      // Si se actualiza email, convertir a minúsculas
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      // Si se actualiza contraseña, hashearla
      if (updateData.password) {
        updateData.password_hash = await PasswordUtils.hashPassword(updateData.password);
        delete updateData.password;
      }

      await user.update(updateData);
      
      // Retornar sin password_hash
      const updatedUser = user.toJSON();
      delete updatedUser.password_hash;
      
      return updatedUser;

    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0].path;
        throw new Error(`El ${field} ya existe en el sistema`);
      }
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  /**
   * Elimina un usuario (soft delete)
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} True si se eliminó exitosamente
   */
  async delete(id) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        return false;
      }

      // Soft delete - cambiar estado a inactive
      await user.update({ status: 'inactive' });
      return true;

    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  /**
   * Cambia el estado de un usuario
   * @param {number} id - ID del usuario
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  async changeStatus(id, status) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        return null;
      }

      await user.update({ status });
      
      const updatedUser = user.toJSON();
      delete updatedUser.password_hash;
      
      return updatedUser;

    } catch (error) {
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param {number} id - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>} True si se cambió exitosamente
   */
  async changePassword(id, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await PasswordUtils.verifyPassword(
        currentPassword,
        user.password_hash
      );

      if (!isCurrentPasswordValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hashear nueva contraseña
      const hashedNewPassword = await PasswordUtils.hashPassword(newPassword);
      
      await user.update({ password_hash: hashedNewPassword });
      return true;

    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    try {
      const stats = await User.findAll({
        attributes: [
          'status',
          'role',
          [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
        ],
        group: ['status', 'role'],
        raw: true
      });

      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { status: 'active' } });
      const newUsersThisMonth = await User.count({
        where: {
          created_at: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      });

      return {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        byStatus: stats.reduce((acc, stat) => {
          if (!acc[stat.status]) acc[stat.status] = {};
          acc[stat.status][stat.role] = parseInt(stat.count);
          return acc;
        }, {})
      };

    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Obtiene usuarios por rol
   * @param {string} role - Rol a filtrar
   * @returns {Promise<Array>} Lista de usuarios
   */
  async findByRole(role) {
    try {
      return await User.findAll({
        where: { 
          role,
          status: 'active'
        },
        attributes: { exclude: ['password_hash'] },
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
    }
  }

  /**
   * Obtiene usuarios activos para asignación
   * @returns {Promise<Array>} Lista de usuarios disponibles
   */
  async findAvailableAdvisors() {
    try {
      return await User.findAll({
        where: {
          role: ['asesor', 'supervisor'],
          status: 'active'
        },
        attributes: ['id', 'code', 'name', 'email', 'role', 'branch_office'],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener asesores disponibles: ${error.message}`);
    }
  }

  /**
   * Verifica si un código de usuario está disponible
   * @param {string} code - Código a verificar
   * @param {number} excludeId - ID a excluir de la verificación
   * @returns {Promise<boolean>} True si está disponible
   */
  async isCodeAvailable(code, excludeId = null) {
    try {
      const where = { code };
      
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const existingUser = await User.findOne({ where });
      return !existingUser;

    } catch (error) {
      throw new Error(`Error al verificar disponibilidad de código: ${error.message}`);
    }
  }

  /**
   * Verifica si un email está disponible
   * @param {string} email - Email a verificar
   * @param {number} excludeId - ID a excluir de la verificación
   * @returns {Promise<boolean>} True si está disponible
   */
  async isEmailAvailable(email, excludeId = null) {
    try {
      if (!email) return true;

      const where = { email: email.toLowerCase() };
      
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const existingUser = await User.findOne({ where });
      return !existingUser;

    } catch (error) {
      throw new Error(`Error al verificar disponibilidad de email: ${error.message}`);
    }
  }

  /**
   * Obtiene el dashboard de un asesor
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Datos del dashboard
   */
  async getAdvisorDashboard(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            association: 'clients',
            where: { status: 'active' },
            required: false
          },
          {
            association: 'quotes',
            required: false
          },
          {
            association: 'creditRequests',
            required: false
          }
        ]
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Calcular estadísticas
      const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      const quotesThisMonth = user.quotes?.filter(quote => 
        new Date(quote.created_at) >= thisMonth
      ).length || 0;

      const approvedQuotesThisMonth = user.quotes?.filter(quote => 
        quote.status === 'approved' && new Date(quote.approved_at) >= thisMonth
      ).length || 0;

      const salesThisMonth = user.quotes?.filter(quote => 
        quote.status === 'approved' && new Date(quote.approved_at) >= thisMonth
      ).reduce((sum, quote) => sum + parseFloat(quote.total), 0) || 0;

      const pendingCreditRequests = user.creditRequests?.filter(request => 
        request.status === 'pending'
      ).length || 0;

      return {
        user: {
          id: user.id,
          code: user.code,
          name: user.name,
          role: user.role,
          branch_office: user.branch_office
        },
        stats: {
          totalClients: user.clients?.length || 0,
          quotesThisMonth,
          approvedQuotesThisMonth,
          salesThisMonth,
          pendingCreditRequests
        }
      };

    } catch (error) {
      throw new Error(`Error al obtener dashboard: ${error.message}`);
    }
  }
}

module.exports = new UserRepository();