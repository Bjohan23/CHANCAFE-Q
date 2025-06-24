const { Op } = require('sequelize');

// Función para obtener el modelo Supplier desde múltiples ubicaciones
function getSupplierModel() {
  try {
    // Opción 1: Intentar desde shared/models (sistema principal)
    try {
      const { getModel } = require('../../shared/models/index');
      const Supplier = getModel('Supplier');
      if (Supplier) {
        console.log('✅ Modelo Supplier obtenido desde shared/models');
        return Supplier;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener Supplier desde shared/models:', error.message);
    }

    // Opción 2: Intentar desde sequelize.models si ya está registrado
    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (sequelize && sequelize.models && sequelize.models.Supplier) {
        console.log('✅ Modelo Supplier obtenido desde sequelize.models');
        return sequelize.models.Supplier;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener Supplier desde sequelize.models:', error.message);
    }

    // Opción 3: Importar y inicializar el modelo directamente
    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (!sequelize) {
        throw new Error('Sequelize no está inicializado');
      }

      const SupplierModel = require('../../shared/models/Supplier');
      const Supplier = SupplierModel(sequelize);
      
      console.log('✅ Modelo Supplier inicializado directamente');
      return Supplier;
    } catch (error) {
      console.log('⚠️  No se pudo cargar Supplier directamente:', error.message);
    }

    throw new Error('Modelo Supplier no está disponible en ninguna ubicación');
  } catch (error) {
    console.error('❌ Error al obtener modelo Supplier:', error.message);
    throw error;
  }
}

class SupplierRepository {
  
  // ===== OPERACIONES BÁSICAS CRUD =====
  
  /**
   * Crear un nuevo proveedor
   */
  async create(supplierData) {
    try {
      const Supplier = getSupplierModel();
      const newSupplier = await Supplier.create(supplierData);
      return newSupplier;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.create:', error.message);
      throw error;
    }
  }

  /**
   * Buscar proveedor por ID
   */
  async findById(id, options = {}) {
    try {
      const Supplier = getSupplierModel();
      const supplier = await Supplier.findByPk(id, {
        include: [
          {
            model: Supplier.sequelize.models.Product,
            as: 'products',
            where: { status: 'active' },
            required: false,
            attributes: ['id', 'name', 'sku', 'price', 'status']
          }
        ],
        ...options
      });
      return supplier;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.findById:', error.message);
      throw error;
    }
  }

  /**
   * Obtener todos los proveedores con filtros opcionales
   */
  async findAll(filters = {}, options = {}) {
    try {
      const Supplier = getSupplierModel();
      const queryOptions = {
        where: {},
        order: [['name', 'ASC']],
        ...options
      };

      // Aplicar filtros
      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { business_name: { [Op.like]: `%${filters.search}%` } },
          { contact_name: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } },
          { tax_id: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const suppliers = await Supplier.findAll(queryOptions);
      return suppliers;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.findAll:', error.message);
      throw error;
    }
  }

  /**
   * Obtener proveedores con paginación
   */
  async findAndCountAll(filters = {}, pagination = {}) {
    try {
      const Supplier = getSupplierModel();
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const queryOptions = {
        where: {},
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      };

      // Aplicar filtros (mismo código que findAll)
      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { business_name: { [Op.like]: `%${filters.search}%` } },
          { contact_name: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } },
          { tax_id: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const result = await Supplier.findAndCountAll(queryOptions);
      
      return {
        suppliers: result.rows,
        totalCount: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      };
    } catch (error) {
      console.error('❌ Error en SupplierRepository.findAndCountAll:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar proveedor
   */
  async update(id, updateData) {
    try {
      const Supplier = getSupplierModel();
      const [updatedRowsCount] = await Supplier.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        return null;
      }

      const updatedSupplier = await this.findById(id);
      return updatedSupplier;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.update:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar proveedor
   */
  async delete(id) {
    try {
      const Supplier = getSupplierModel();
      
      // Verificar si tiene productos asociados
      const productCount = await Supplier.sequelize.models.Product.count({
        where: { supplier_id: id }
      });
      
      if (productCount > 0) {
        throw new Error('No se puede eliminar un proveedor que tiene productos asociados');
      }

      const deletedRowsCount = await Supplier.destroy({
        where: { id }
      });
      return deletedRowsCount > 0;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.delete:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DEL DOMINIO =====

  /**
   * Buscar proveedores activos
   */
  async findActiveSuppliers(options = {}) {
    try {
      return await this.findAll({ status: 'active' }, options);
    } catch (error) {
      console.error('❌ Error en SupplierRepository.findActiveSuppliers:', error.message);
      throw error;
    }
  }

  /**
   * Buscar proveedor por RUC/Tax ID
   */
  async findByTaxId(taxId, options = {}) {
    try {
      const Supplier = getSupplierModel();
      const supplier = await Supplier.findOne({
        where: { tax_id: taxId },
        ...options
      });
      return supplier;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.findByTaxId:', error.message);
      throw error;
    }
  }

  /**
   * Buscar proveedor por email
   */
  async findByEmail(email, options = {}) {
    try {
      const Supplier = getSupplierModel();
      const supplier = await Supplier.findOne({
        where: { email: email.toLowerCase() },
        ...options
      });
      return supplier;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.findByEmail:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar estado del proveedor
   */
  async changeStatus(id, status) {
    try {
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado inválido: ${status}. Estados válidos: ${validStatuses.join(', ')}`);
      }
      return await this.update(id, { status });
    } catch (error) {
      console.error('❌ Error en SupplierRepository.changeStatus:', error.message);
      throw error;
    }
  }

  /**
   * Verificar si existe un proveedor con el mismo nombre
   */
  async existsByName(name, excludeId = null) {
    try {
      const Supplier = getSupplierModel();
      const where = { 
        name: { [Op.like]: name }
      };
      
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }
      
      const supplier = await Supplier.findOne({ where });
      return !!supplier;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.existsByName:', error.message);
      throw error;
    }
  }

  /**
   * Verificar si existe un proveedor con el mismo RUC
   */
  async existsByTaxId(taxId, excludeId = null) {
    try {
      const Supplier = getSupplierModel();
      const where = { 
        tax_id: taxId
      };
      
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }
      
      const supplier = await Supplier.findOne({ where });
      return !!supplier;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.existsByTaxId:', error.message);
      throw error;
    }
  }

  /**
   * Verificar si existe un proveedor con el mismo email
   */
  async existsByEmail(email, excludeId = null) {
    try {
      const Supplier = getSupplierModel();
      const where = { 
        email: email.toLowerCase()
      };
      
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }
      
      const supplier = await Supplier.findOne({ where });
      return !!supplier;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.existsByEmail:', error.message);
      throw error;
    }
  }

  /**
   * Obtener proveedores con conteo de productos
   */
  async findWithProductCount() {
    try {
      const Supplier = getSupplierModel();
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      const suppliers = await Supplier.findAll({
        attributes: [
          'id',
          'name',
          'business_name',
          'contact_name',
          'email',
          'phone',
          'status',
          [sequelize.fn('COUNT', sequelize.col('products.id')), 'productCount']
        ],
        include: [{
          model: sequelize.models.Product,
          as: 'products',
          attributes: [],
          required: false,
          where: { status: 'active' }
        }],
        group: ['Supplier.id'],
        order: [['name', 'ASC']]
      });
      
      return suppliers;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.findWithProductCount:', error.message);
      throw error;
    }
  }

  /**
   * Buscar proveedores con sus relaciones completas
   */
  async findWithRelations(id, relations = []) {
    try {
      const Supplier = getSupplierModel();
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      const include = [];

      // Mapear relaciones disponibles
      const availableRelations = {
        products: 'products'
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
            }
          } catch (error) {
            console.warn(`⚠️  Relación ${relation} no disponible`);
          }
        }
      });

      const supplier = await Supplier.findByPk(id, { include });
      return supplier;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.findWithRelations:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de proveedores
   */
  async getSupplierStats() {
    try {
      const Supplier = getSupplierModel();
      
      const [totalSuppliers, activeSuppliers, inactiveSuppliers] = await Promise.all([
        Supplier.count(),
        Supplier.count({ where: { status: 'active' } }),
        Supplier.count({ where: { status: 'inactive' } })
      ]);

      // Estadísticas adicionales
      const suppliersWithEmail = await Supplier.count({
        where: { 
          email: { [Op.ne]: null },
          status: 'active'
        }
      });

      const suppliersWithTaxId = await Supplier.count({
        where: { 
          tax_id: { [Op.ne]: null },
          status: 'active'
        }
      });

      return {
        total: totalSuppliers,
        active: activeSuppliers,
        inactive: inactiveSuppliers,
        withEmail: suppliersWithEmail,
        withTaxId: suppliersWithTaxId
      };
    } catch (error) {
      console.error('❌ Error en SupplierRepository.getSupplierStats:', error.message);
      throw error;
    }
  }

  /**
   * Buscar proveedores por términos de pago
   */
  async findByPaymentTerms(paymentTerms) {
    try {
      const Supplier = getSupplierModel();
      const suppliers = await Supplier.findAll({
        where: {
          payment_terms: { [Op.like]: `%${paymentTerms}%` },
          status: 'active'
        },
        order: [['name', 'ASC']]
      });
      return suppliers;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.findByPaymentTerms:', error.message);
      throw error;
    }
  }

  /**
   * Buscar proveedores por tiempo de entrega
   */
  async findByDeliveryTime(deliveryTime) {
    try {
      const Supplier = getSupplierModel();
      const suppliers = await Supplier.findAll({
        where: {
          delivery_time: { [Op.like]: `%${deliveryTime}%` },
          status: 'active'
        },
        order: [['name', 'ASC']]
      });
      return suppliers;
    } catch (error) {
      console.error('❌ Error en SupplierRepository.findByDeliveryTime:', error.message);
      throw error;
    }
  }

  /**
   * Obtener proveedores agrupados por estado
   */
  async getSuppliersByStatus() {
    try {
      const Supplier = getSupplierModel();
      const stats = await Supplier.findAll({
        attributes: [
          'status',
          [Supplier.sequelize.fn('COUNT', Supplier.sequelize.col('id')), 'count']
        ],
        group: ['status']
      });
      
      return stats.reduce((acc, item) => {
        acc[item.status] = parseInt(item.dataValues.count);
        return acc;
      }, {});
    } catch (error) {
      console.error('❌ Error en SupplierRepository.getSuppliersByStatus:', error.message);
      throw error;
    }
  }
}

module.exports = new SupplierRepository();