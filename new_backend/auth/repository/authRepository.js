const { Op } = require('sequelize');

// Función para obtener el modelo User desde múltiples ubicaciones
function getUserModel() {
  try {
    // Opción 1: Intentar desde shared/models (sistema principal)
    try {
      const { getModel } = require('../../shared/models/index');
      const User = getModel('User');
      if (User) {
        console.log('✅ Modelo User obtenido desde shared/models');
        return User;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener User desde shared/models:', error.message);
    }

    // Opción 2: Importar directamente desde auth/models
    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (!sequelize) {
        throw new Error('Sequelize no está inicializado');
      }

      // Importar y inicializar el modelo directamente
      const UserModel = require('../models/User'); // Tu modelo en auth/models
      const User = UserModel(sequelize);
      
      console.log('✅ Modelo User inicializado directamente desde auth/models');
      return User;
    } catch (error) {
      console.log('⚠️  No se pudo cargar User desde auth/models:', error.message);
    }

    // Opción 3: Intentar desde sequelize.models si ya está registrado
    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (sequelize && sequelize.models && sequelize.models.User) {
        console.log('✅ Modelo User obtenido desde sequelize.models');
        return sequelize.models.User;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener User desde sequelize.models:', error.message);
    }

    throw new Error('Modelo User no está disponible en ninguna ubicación');
  } catch (error) {
    console.error('❌ Error al obtener modelo User:', error.message);
    throw error;
  }
}

class UserRepository {
  
  // ===== OPERACIONES BÁSICAS CRUD =====
  
  /**
   * Crear un nuevo usuario
   */
  async create(userData) {
    try {
      const User = getUserModel();
      const newUser = await User.create(userData);
      return newUser;
    } catch (error) {
      console.error('❌ Error en UserRepository.create:', error.message);
      throw error;
    }
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id, options = {}) {
    try {
      const User = getUserModel();
      const user = await User.findByPk(id, {
        ...options
      });
      return user;
    } catch (error) {
      console.error('❌ Error en UserRepository.findById:', error.message);
      throw error;
    }
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email, options = {}) {
    try {
      const User = getUserModel();
      const user = await User.findOne({
        where: { email: email.toLowerCase() },
        ...options
      });
      return user;
    } catch (error) {
      console.error('❌ Error en UserRepository.findByEmail:', error.message);
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios con filtros opcionales
   */
  async findAll(filters = {}, options = {}) {
    try {
      const User = getUserModel();
      const queryOptions = {
        where: {},
        order: [['first_name', 'ASC'], ['last_name', 'ASC']],
        ...options
      };

      // Aplicar filtros
      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.role) {
        queryOptions.where.role = filters.role;
      }
      if (filters.branch_office) {
        queryOptions.where.branch_office = filters.branch_office;
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { first_name: { [Op.like]: `%${filters.search}%` } },
          { last_name: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const users = await User.findAll(queryOptions);
      return users;
    } catch (error) {
      console.error('❌ Error en UserRepository.findAll:', error.message);
      throw error;
    }
  }

  /**
   * Obtener usuarios con paginación
   */
  async findAndCountAll(filters = {}, pagination = {}) {
    try {
      const User = getUserModel();
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const queryOptions = {
        where: {},
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['first_name', 'ASC'], ['last_name', 'ASC']]
      };

      // Aplicar filtros (mismo código que findAll)
      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.role) {
        queryOptions.where.role = filters.role;
      }
      if (filters.branch_office) {
        queryOptions.where.branch_office = filters.branch_office;
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { first_name: { [Op.like]: `%${filters.search}%` } },
          { last_name: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const result = await User.findAndCountAll(queryOptions);
      
      return {
        users: result.rows,
        totalCount: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      };
    } catch (error) {
      console.error('❌ Error en UserRepository.findAndCountAll:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  async update(id, updateData) {
    try {
      const User = getUserModel();
      const [updatedRowsCount] = await User.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        return null;
      }

      const updatedUser = await this.findById(id);
      return updatedUser;
    } catch (error) {
      console.error('❌ Error en UserRepository.update:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async delete(id) {
    try {
      const User = getUserModel();
      const deletedRowsCount = await User.destroy({
        where: { id }
      });
      return deletedRowsCount > 0;
    } catch (error) {
      console.error('❌ Error en UserRepository.delete:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DEL DOMINIO =====

  /**
   * Buscar usuarios activos
   */
  async findActiveUsers(options = {}) {
    try {
      return await this.findAll({ status: 'active' }, options);
    } catch (error) {
      console.error('❌ Error en UserRepository.findActiveUsers:', error.message);
      throw error;
    }
  }

  /**
   * Buscar usuarios por rol
   */
  async findByRole(role, options = {}) {
    try {
      return await this.findAll({ role }, options);
    } catch (error) {
      console.error('❌ Error en UserRepository.findByRole:', error.message);
      throw error;
    }
  }

  /**
   * Buscar usuarios por sucursal
   */
  async findByBranchOffice(branchOffice, options = {}) {
    try {
      return await this.findAll({ branch_office: branchOffice }, options);
    } catch (error) {
      console.error('❌ Error en UserRepository.findByBranchOffice:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin(id) {
    try {
      return await this.update(id, { last_login: new Date() });
    } catch (error) {
      console.error('❌ Error en UserRepository.updateLastLogin:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar estado del usuario
   */
  async changeStatus(id, status) {
    try {
      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado inválido: ${status}. Estados válidos: ${validStatuses.join(', ')}`);
      }
      return await this.update(id, { status });
    } catch (error) {
      console.error('❌ Error en UserRepository.changeStatus:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar rol del usuario
   */
  async changeRole(id, role) {
    try {
      const validRoles = ['admin', 'supervisor', 'sales_rep'];
      if (!validRoles.includes(role)) {
        throw new Error(`Rol inválido: ${role}. Roles válidos: ${validRoles.join(', ')}`);
      }
      return await this.update(id, { role });
    } catch (error) {
      console.error('❌ Error en UserRepository.changeRole:', error.message);
      throw error;
    }
  }

  /**
   * Verificar si existe un usuario con el email
   */
  async existsByEmail(email) {
    try {
      const user = await this.findByEmail(email);
      return !!user;
    } catch (error) {
      console.error('❌ Error en UserRepository.existsByEmail:', error.message);
      throw error;
    }
  }

  /**
   * Contar usuarios por rol
   */
  async countByRole() {
    try {
      const User = getUserModel();
      const counts = await User.findAll({
        attributes: [
          'role',
          [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
        ],
        group: ['role']
      });
      
      return counts.reduce((acc, item) => {
        acc[item.role] = parseInt(item.dataValues.count);
        return acc;
      }, {});
    } catch (error) {
      console.error('❌ Error en UserRepository.countByRole:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats() {
    try {
      const User = getUserModel();
      
      const [totalUsers, activeUsers, inactiveUsers, roleStats] = await Promise.all([
        User.count(),
        User.count({ where: { status: 'active' } }),
        User.count({ where: { status: { [Op.in]: ['inactive', 'suspended'] } } }),
        this.countByRole()
      ]);

      return {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: roleStats
      };
    } catch (error) {
      console.error('❌ Error en UserRepository.getUserStats:', error.message);
      throw error;
    }
  }

  /**
   * Buscar usuarios con sus relaciones
   */
  async findWithRelations(id, relations = []) {
    try {
      const User = getUserModel();
      const include = [];

      // Mapear relaciones disponibles
      const availableRelations = {
        clients: 'clients',
        quotes: 'quotes',
        creditRequests: 'creditRequests',
        sessions: 'sessions',
        activityLogs: 'activityLogs',
        createdProducts: 'createdProducts',
        quoteTemplates: 'quoteTemplates'
      };

      relations.forEach(relation => {
        if (availableRelations[relation]) {
          try {
            include.push({ association: availableRelations[relation] });
          } catch (error) {
            console.warn(`⚠️  Relación ${relation} no disponible`);
          }
        }
      });

      const user = await User.findByPk(id, { include });
      return user;
    } catch (error) {
      console.error('❌ Error en UserRepository.findWithRelations:', error.message);
      throw error;
    }
  }
}

module.exports = new UserRepository();