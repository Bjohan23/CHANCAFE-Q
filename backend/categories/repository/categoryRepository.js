const { Op } = require('sequelize');

// Función para obtener el modelo Category desde múltiples ubicaciones
function getCategoryModel() {
  try {
    // Opción 1: Intentar desde shared/models (sistema principal)
    try {
      const { getModel } = require('../../shared/models/index');
      const Category = getModel('Category');
      if (Category) {
        console.log('✅ Modelo Category obtenido desde shared/models');
        return Category;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener Category desde shared/models:', error.message);
    }

    // Opción 2: Intentar desde sequelize.models si ya está registrado
    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (sequelize && sequelize.models && sequelize.models.Category) {
        console.log('✅ Modelo Category obtenido desde sequelize.models');
        return sequelize.models.Category;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener Category desde sequelize.models:', error.message);
    }

    // Opción 3: Importar y inicializar el modelo directamente
    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (!sequelize) {
        throw new Error('Sequelize no está inicializado');
      }

      const CategoryModel = require('../../shared/models/Category');
      const Category = CategoryModel(sequelize);
      
      console.log('✅ Modelo Category inicializado directamente');
      return Category;
    } catch (error) {
      console.log('⚠️  No se pudo cargar Category directamente:', error.message);
    }

    throw new Error('Modelo Category no está disponible en ninguna ubicación');
  } catch (error) {
    console.error('❌ Error al obtener modelo Category:', error.message);
    throw error;
  }
}

class CategoryRepository {
  
  // ===== OPERACIONES BÁSICAS CRUD =====
  
  /**
   * Crear una nueva categoría
   */
  async create(categoryData) {
    try {
      const Category = getCategoryModel();
      const newCategory = await Category.create(categoryData);
      return newCategory;
    } catch (error) {
      console.error('❌ Error en CategoryRepository.create:', error.message);
      throw error;
    }
  }

  /**
   * Buscar categoría por ID
   */
  async findById(id, options = {}) {
    try {
      const Category = getCategoryModel();
      const category = await Category.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Category,
            as: 'subcategories',
            where: { status: 'active' },
            required: false,
            attributes: ['id', 'name', 'description', 'image_url', 'sort_order']
          }
        ],
        ...options
      });
      return category;
    } catch (error) {
      console.error('❌ Error en CategoryRepository.findById:', error.message);
      throw error;
    }
  }

  /**
   * Obtener todas las categorías con filtros opcionales
   */
  async findAll(filters = {}, options = {}) {
    try {
      const Category = getCategoryModel();
      const queryOptions = {
        where: {},
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: Category,
            as: 'subcategories',
            where: { status: 'active' },
            required: false,
            attributes: ['id', 'name', 'sort_order']
          }
        ],
        order: [['sort_order', 'ASC'], ['name', 'ASC']],
        ...options
      };

      // Aplicar filtros
      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.parentId !== undefined) {
        queryOptions.where.parent_id = filters.parentId;
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const categories = await Category.findAll(queryOptions);
      return categories;
    } catch (error) {
      console.error('❌ Error en CategoryRepository.findAll:', error.message);
      throw error;
    }
  }

  /**
   * Obtener categorías con paginación
   */
  async findAndCountAll(filters = {}, pagination = {}) {
    try {
      const Category = getCategoryModel();
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const queryOptions = {
        where: {},
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['sort_order', 'ASC'], ['name', 'ASC']]
      };

      // Aplicar filtros (mismo código que findAll)
      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.parentId !== undefined) {
        queryOptions.where.parent_id = filters.parentId;
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const result = await Category.findAndCountAll(queryOptions);
      
      return {
        categories: result.rows,
        totalCount: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      };
    } catch (error) {
      console.error('❌ Error en CategoryRepository.findAndCountAll:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar categoría
   */
  async update(id, updateData) {
    try {
      const Category = getCategoryModel();
      const [updatedRowsCount] = await Category.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        return null;
      }

      const updatedCategory = await this.findById(id);
      return updatedCategory;
    } catch (error) {
      console.error('❌ Error en CategoryRepository.update:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar categoría
   */
  async delete(id) {
    try {
      const Category = getCategoryModel();
      
      // Verificar si tiene subcategorías
      const subcategories = await Category.count({
        where: { parent_id: id }
      });
      
      if (subcategories > 0) {
        throw new Error('No se puede eliminar una categoría que tiene subcategorías');
      }

      const deletedRowsCount = await Category.destroy({
        where: { id }
      });
      return deletedRowsCount > 0;
    } catch (error) {
      console.error('❌ Error en CategoryRepository.delete:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DEL DOMINIO =====

  /**
   * Buscar categorías activas
   */
  async findActiveCategories(options = {}) {
    try {
      return await this.findAll({ status: 'active' }, options);
    } catch (error) {
      console.error('❌ Error en CategoryRepository.findActiveCategories:', error.message);
      throw error;
    }
  }

  /**
   * Buscar categorías padre (sin parent_id)
   */
  async findParentCategories(options = {}) {
    try {
      return await this.findAll({ status: 'active', parentId: null }, options);
    } catch (error) {
      console.error('❌ Error en CategoryRepository.findParentCategories:', error.message);
      throw error;
    }
  }

  /**
   * Buscar subcategorías de una categoría padre
   */
  async findSubcategories(parentId, options = {}) {
    try {
      return await this.findAll({ status: 'active', parentId }, options);
    } catch (error) {
      console.error('❌ Error en CategoryRepository.findSubcategories:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar estado de la categoría
   */
  async changeStatus(id, status) {
    try {
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado inválido: ${status}. Estados válidos: ${validStatuses.join(', ')}`);
      }
      return await this.update(id, { status });
    } catch (error) {
      console.error('❌ Error en CategoryRepository.changeStatus:', error.message);
      throw error;
    }
  }

  /**
   * Verificar si existe una categoría con el nombre
   */
  async existsByName(name, excludeId = null) {
    try {
      const Category = getCategoryModel();
      const where = { 
        name: { [Op.like]: name }
      };
      
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }
      
      const category = await Category.findOne({ where });
      return !!category;
    } catch (error) {
      console.error('❌ Error en CategoryRepository.existsByName:', error.message);
      throw error;
    }
  }

  /**
   * Obtener categorías con conteo de productos
   */
  async findWithProductCount() {
    try {
      const Category = getCategoryModel();
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      const categories = await Category.findAll({
        attributes: [
          'id',
          'name',
          'description',
          'status',
          'parent_id',
          'sort_order',
          [sequelize.fn('COUNT', sequelize.col('products.id')), 'productCount']
        ],
        include: [{
          model: sequelize.models.Product,
          as: 'products',
          attributes: [],
          required: false,
          where: { status: 'active' }
        }],
        group: ['Category.id'],
        order: [['sort_order', 'ASC'], ['name', 'ASC']]
      });
      
      return categories;
    } catch (error) {
      console.error('❌ Error en CategoryRepository.findWithProductCount:', error.message);
      throw error;
    }
  }

  /**
   * Reordenar categorías
   */
  async reorderCategories(categoryOrders) {
    try {
      const Category = getCategoryModel();
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      const transaction = await sequelize.transaction();
      
      try {
        for (const { id, sortOrder } of categoryOrders) {
          await Category.update(
            { sort_order: sortOrder },
            { where: { id }, transaction }
          );
        }
        
        await transaction.commit();
        return true;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('❌ Error en CategoryRepository.reorderCategories:', error.message);
      throw error;
    }
  }

  /**
   * Buscar categorías con sus relaciones completas
   */
  async findWithRelations(id, relations = []) {
    try {
      const Category = getCategoryModel();
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      const include = [];

      // Relaciones base siempre incluidas
      include.push(
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'description'],
          required: false
        },
        {
          model: Category,
          as: 'subcategories',
          where: { status: 'active' },
          required: false
        }
      );

      // Mapear relaciones disponibles
      const availableRelations = {
        products: 'products',
        assignedProducts: 'assignedProducts',
        productCategories: 'productCategories'
      };

      relations.forEach(relation => {
        if (availableRelations[relation]) {
          try {
            if (relation === 'products') {
              include.push({
                model: sequelize.models.Product,
                as: 'products',
                where: { status: 'active' },
                required: false
              });
            } else if (relation === 'assignedProducts') {
              include.push({
                model: sequelize.models.Product,
                as: 'assignedProducts',
                through: { attributes: ['is_primary'] },
                where: { status: 'active' },
                required: false
              });
            }
          } catch (error) {
            console.warn(`⚠️  Relación ${relation} no disponible`);
          }
        }
      });

      const category = await Category.findByPk(id, { include });
      return category;
    } catch (error) {
      console.error('❌ Error en CategoryRepository.findWithRelations:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de categorías
   */
  async getCategoryStats() {
    try {
      const Category = getCategoryModel();
      
      const [totalCategories, activeCategories, parentCategories, subcategories] = await Promise.all([
        Category.count(),
        Category.count({ where: { status: 'active' } }),
        Category.count({ where: { parent_id: null } }),
        Category.count({ where: { parent_id: { [Op.ne]: null } } })
      ]);

      return {
        total: totalCategories,
        active: activeCategories,
        inactive: totalCategories - activeCategories,
        parentCategories,
        subcategories
      };
    } catch (error) {
      console.error('❌ Error en CategoryRepository.getCategoryStats:', error.message);
      throw error;
    }
  }
}

module.exports = new CategoryRepository();