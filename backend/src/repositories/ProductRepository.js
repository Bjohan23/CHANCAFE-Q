const { Product, Category } = require('../models');
const { Helpers } = require('../utils');
const { Op } = require('sequelize');

/**
 * Repositorio de Productos
 * Maneja toda la lógica de acceso a datos relacionada con productos
 */
class ProductRepository {

  /**
   * Obtiene todos los productos con paginación y filtros
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Productos paginados
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        categoryId = null,
        status = null,
        featured = null,
        lowStock = false,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const pagination = Helpers.calculatePagination(page, limit);
      const where = {};

      // Filtros
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { brand: { [Op.like]: `%${search}%` } },
          { model: { [Op.like]: `%${search}%` } },
          { sku: { [Op.like]: `%${search}%` } }
        ];
      }

      if (categoryId) {
        where.category_id = categoryId;
      }

      if (status) {
        where.status = status;
      }

      if (featured !== null) {
        where.featured = featured;
      }

      if (lowStock) {
        where.stock_quantity = { [Op.lte]: Product.sequelize.col('min_stock') };
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });

      return {
        products: rows,
        pagination: pagination.getMetadata(count)
      };

    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  /**
   * Busca un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object|null>} Producto encontrado o null
   */
  async findById(id) {
    try {
      return await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'description']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al buscar producto: ${error.message}`);
    }
  }

  /**
   * Busca un producto por SKU
   * @param {string} sku - SKU del producto
   * @returns {Promise<Object|null>} Producto encontrado o null
   */
  async findBySku(sku) {
    try {
      return await Product.findOne({
        where: { sku },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al buscar producto por SKU: ${error.message}`);
    }
  }

  /**
   * Obtiene productos por categoría
   * @param {number} categoryId - ID de la categoría
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Productos de la categoría
   */
  async findByCategory(categoryId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = 'active'
      } = options;

      const pagination = Helpers.calculatePagination(page, limit);
      const where = { 
        category_id: categoryId,
        status 
      };

      const { count, rows } = await Product.findAndCountAll({
        where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: [['name', 'ASC']],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });

      return {
        products: rows,
        pagination: pagination.getMetadata(count)
      };

    } catch (error) {
      throw new Error(`Error al obtener productos por categoría: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>} Producto creado
   */
  async create(productData) {
    try {
      const product = await Product.create(productData);
      
      // Incluir información de la categoría en la respuesta
      return await this.findById(product.id);

    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe un producto con este SKU');
      }
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  /**
   * Actualiza un producto
   * @param {number} id - ID del producto
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object|null>} Producto actualizado o null
   */
  async update(id, updateData) {
    try {
      const product = await Product.findByPk(id);
      
      if (!product) {
        return null;
      }

      await product.update(updateData);
      
      // Retornar producto actualizado con relaciones
      return await this.findById(product.id);

    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe un producto con este SKU');
      }
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  /**
   * Elimina un producto (soft delete)
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>} True si se eliminó exitosamente
   */
  async delete(id) {
    try {
      const product = await Product.findByPk(id);
      
      if (!product) {
        return false;
      }

      // Soft delete - cambiar estado a discontinued
      await product.update({ status: 'discontinued' });
      return true;

    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  /**
   * Cambia el estado de un producto
   * @param {number} id - ID del producto
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object|null>} Producto actualizado o null
   */
  async changeStatus(id, status) {
    try {
      const product = await Product.findByPk(id);
      
      if (!product) {
        return null;
      }

      await product.update({ status });
      return await this.findById(product.id);

    } catch (error) {
      throw new Error(`Error al cambiar estado del producto: ${error.message}`);
    }
  }

  /**
   * Actualiza el stock de un producto
   * @param {number} id - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @returns {Promise<Object|null>} Producto actualizado o null
   */
  async updateStock(id, quantity) {
    try {
      const product = await Product.findByPk(id);
      
      if (!product) {
        return null;
      }

      await product.update({ stock_quantity: quantity });
      return await this.findById(product.id);

    } catch (error) {
      throw new Error(`Error al actualizar stock: ${error.message}`);
    }
  }

  /**
   * Ajusta el stock de un producto
   * @param {number} id - ID del producto
   * @param {number} adjustment - Ajuste (positivo o negativo)
   * @returns {Promise<Object|null>} Producto actualizado o null
   */
  async adjustStock(id, adjustment) {
    try {
      const product = await Product.findByPk(id);
      
      if (!product) {
        return null;
      }

      const newQuantity = Math.max(0, product.stock_quantity + adjustment);
      await product.update({ stock_quantity: newQuantity });
      
      return await this.findById(product.id);

    } catch (error) {
      throw new Error(`Error al ajustar stock: ${error.message}`);
    }
  }

  /**
   * Obtiene productos destacados
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de productos destacados
   */
  async findFeatured(limit = 10) {
    try {
      return await Product.findAll({
        where: {
          featured: true,
          status: 'active'
        },
        limit,
        order: [['name', 'ASC']],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al obtener productos destacados: ${error.message}`);
    }
  }

  /**
   * Obtiene productos con stock bajo
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de productos con stock bajo
   */
  async findLowStock(limit = 50) {
    try {
      return await Product.findAll({
        where: {
          status: 'active',
          stock_quantity: { [Op.lte]: Product.sequelize.col('min_stock') }
        },
        limit,
        order: [['stock_quantity', 'ASC']],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al obtener productos con stock bajo: ${error.message}`);
    }
  }

  /**
   * Busca productos por texto
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de productos encontrados
   */
  async search(searchTerm, limit = 20) {
    try {
      return await Product.findAll({
        where: {
          status: 'active',
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } },
            { brand: { [Op.like]: `%${searchTerm}%` } },
            { model: { [Op.like]: `%${searchTerm}%` } },
            { sku: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        limit,
        order: [['name', 'ASC']],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al buscar productos: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de productos
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    try {
      const totalProducts = await Product.count();
      const activeProducts = await Product.count({ 
        where: { status: 'active' } 
      });
      const featuredProducts = await Product.count({ 
        where: { featured: true, status: 'active' } 
      });
      const lowStockProducts = await Product.count({
        where: {
          status: 'active',
          stock_quantity: { [Op.lte]: Product.sequelize.col('min_stock') }
        }
      });

      const totalValue = await Product.sum('price', {
        where: { status: 'active' }
      });

      const totalStock = await Product.sum('stock_quantity', {
        where: { status: 'active' }
      });

      return {
        total: totalProducts,
        active: activeProducts,
        featured: featuredProducts,
        lowStock: lowStockProducts,
        totalValue: totalValue || 0,
        totalStock: totalStock || 0
      };

    } catch (error) {
      throw new Error(`Error al obtener estadísticas de productos: ${error.message}`);
    }
  }

  /**
   * Verifica si un SKU está disponible
   * @param {string} sku - SKU a verificar
   * @param {number} excludeId - ID a excluir de la verificación
   * @returns {Promise<boolean>} True si está disponible
   */
  async isSkuAvailable(sku, excludeId = null) {
    try {
      const where = { sku };
      
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const existingProduct = await Product.findOne({ where });
      return !existingProduct;

    } catch (error) {
      throw new Error(`Error al verificar disponibilidad de SKU: ${error.message}`);
    }
  }

  /**
   * Obtiene productos por rango de precios
   * @param {number} minPrice - Precio mínimo
   * @param {number} maxPrice - Precio máximo
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de productos
   */
  async findByPriceRange(minPrice, maxPrice, options = {}) {
    try {
      const { limit = 20, categoryId = null } = options;
      const where = {
        status: 'active',
        price: { [Op.between]: [minPrice, maxPrice] }
      };

      if (categoryId) {
        where.category_id = categoryId;
      }

      return await Product.findAll({
        where,
        limit,
        order: [['price', 'ASC']],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al buscar productos por precio: ${error.message}`);
    }
  }

  /**
   * Marca un producto como destacado
   * @param {number} id - ID del producto
   * @param {boolean} featured - Estado destacado
   * @returns {Promise<Object|null>} Producto actualizado o null
   */
  async setFeatured(id, featured = true) {
    try {
      const product = await Product.findByPk(id);
      
      if (!product) {
        return null;
      }

      await product.update({ featured });
      return await this.findById(product.id);

    } catch (error) {
      throw new Error(`Error al actualizar producto destacado: ${error.message}`);
    }
  }
}

module.exports = new ProductRepository();