const { Op } = require('sequelize');

// Función para obtener el modelo Product desde múltiples ubicaciones
function getProductModel() {
  try {
    // Opción 1: Intentar desde shared/models (sistema principal)
    try {
      const { getModel } = require('../../shared/models/index');
      const Product = getModel('Product');
      if (Product) {
        console.log('✅ Modelo Product obtenido desde shared/models');
        return Product;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener Product desde shared/models:', error.message);
    }

    // Opción 2: Intentar desde sequelize.models si ya está registrado
    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (sequelize && sequelize.models && sequelize.models.Product) {
        console.log('✅ Modelo Product obtenido desde sequelize.models');
        return sequelize.models.Product;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener Product desde sequelize.models:', error.message);
    }

    throw new Error('Modelo Product no está disponible en ninguna ubicación');
  } catch (error) {
    console.error('❌ Error al obtener modelo Product:', error.message);
    throw error;
  }
}

class ProductRepository {
  
  // ===== OPERACIONES BÁSICAS CRUD =====
  
  /**
   * Crear un nuevo producto
   */
  async create(productData) {
    try {
      const Product = getProductModel();
      const newProduct = await Product.create(productData);
      return newProduct;
    } catch (error) {
      console.error('❌ Error en ProductRepository.create:', error.message);
      throw error;
    }
  }

  /**
   * Buscar producto por ID
   */
  async findById(id, options = {}) {
    try {
      const Product = getProductModel();
      const product = await Product.findByPk(id, {
        include: ['category', 'creator', 'supplier', 'categories'],
        ...options
      });
      return product;
    } catch (error) {
      console.error('❌ Error en ProductRepository.findById:', error.message);
      throw error;
    }
  }

  /**
   * Buscar producto por SKU
   */
  async findBySku(sku, options = {}) {
    try {
      const Product = getProductModel();
      const product = await Product.findOne({
        where: { sku },
        include: ['category', 'creator', 'supplier'],
        ...options
      });
      return product;
    } catch (error) {
      console.error('❌ Error en ProductRepository.findBySku:', error.message);
      throw error;
    }
  }

  /**
   * Buscar producto por código de barras
   */
  async findByBarcode(barcode, options = {}) {
    try {
      const Product = getProductModel();
      const product = await Product.findOne({
        where: { barcode },
        include: ['category', 'creator', 'supplier'],
        ...options
      });
      return product;
    } catch (error) {
      console.error('❌ Error en ProductRepository.findByBarcode:', error.message);
      throw error;
    }
  }

  /**
   * Obtener todos los productos con filtros opcionales
   */
  async findAll(filters = {}, options = {}) {
    try {
      const Product = getProductModel();
      const queryOptions = {
        where: {},
        include: ['category', 'supplier'],
        order: [['name', 'ASC']],
        ...options
      };

      // Aplicar filtros
      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.category_id) {
        queryOptions.where.category_id = filters.category_id;
      }
      if (filters.supplier_id) {
        queryOptions.where.supplier_id = filters.supplier_id;
      }
      if (filters.featured !== undefined) {
        queryOptions.where.featured = filters.featured;
      }
      if (filters.brand) {
        queryOptions.where.brand = { [Op.like]: `%${filters.brand}%` };
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } },
          { brand: { [Op.like]: `%${filters.search}%` } },
          { model: { [Op.like]: `%${filters.search}%` } },
          { sku: { [Op.like]: `%${filters.search}%` } },
          { barcode: { [Op.like]: `%${filters.search}%` } },
          { supplier_sku: { [Op.like]: `%${filters.search}%` } }
        ];
      }
      if (filters.priceMin || filters.priceMax) {
        queryOptions.where.price = {};
        if (filters.priceMin) queryOptions.where.price[Op.gte] = filters.priceMin;
        if (filters.priceMax) queryOptions.where.price[Op.lte] = filters.priceMax;
      }
      if (filters.stockMin || filters.stockMax) {
        queryOptions.where.stock_quantity = {};
        if (filters.stockMin) queryOptions.where.stock_quantity[Op.gte] = filters.stockMin;
        if (filters.stockMax) queryOptions.where.stock_quantity[Op.lte] = filters.stockMax;
      }

      const products = await Product.findAll(queryOptions);
      return products;
    } catch (error) {
      console.error('❌ Error en ProductRepository.findAll:', error.message);
      throw error;
    }
  }

  /**
   * Obtener productos con paginación
   */
  async findAndCountAll(filters = {}, pagination = {}) {
    try {
      const Product = getProductModel();
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const queryOptions = {
        where: {},
        include: ['category', 'supplier'],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      };

      // Aplicar los mismos filtros que en findAll
      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.category_id) {
        queryOptions.where.category_id = filters.category_id;
      }
      if (filters.supplier_id) {
        queryOptions.where.supplier_id = filters.supplier_id;
      }
      if (filters.featured !== undefined) {
        queryOptions.where.featured = filters.featured;
      }
      if (filters.brand) {
        queryOptions.where.brand = { [Op.like]: `%${filters.brand}%` };
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } },
          { brand: { [Op.like]: `%${filters.search}%` } },
          { model: { [Op.like]: `%${filters.search}%` } },
          { sku: { [Op.like]: `%${filters.search}%` } },
          { barcode: { [Op.like]: `%${filters.search}%` } },
          { supplier_sku: { [Op.like]: `%${filters.search}%` } }
        ];
      }
      if (filters.priceMin || filters.priceMax) {
        queryOptions.where.price = {};
        if (filters.priceMin) queryOptions.where.price[Op.gte] = filters.priceMin;
        if (filters.priceMax) queryOptions.where.price[Op.lte] = filters.priceMax;
      }
      if (filters.stockMin || filters.stockMax) {
        queryOptions.where.stock_quantity = {};
        if (filters.stockMin) queryOptions.where.stock_quantity[Op.gte] = filters.stockMin;
        if (filters.stockMax) queryOptions.where.stock_quantity[Op.lte] = filters.stockMax;
      }

      const result = await Product.findAndCountAll(queryOptions);
      
      return {
        products: result.rows,
        totalCount: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      };
    } catch (error) {
      console.error('❌ Error en ProductRepository.findAndCountAll:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  async update(id, updateData) {
    try {
      const Product = getProductModel();
      const [updatedRowsCount] = await Product.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        return null;
      }

      const updatedProduct = await this.findById(id);
      return updatedProduct;
    } catch (error) {
      console.error('❌ Error en ProductRepository.update:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar producto
   */
  async delete(id) {
    try {
      const Product = getProductModel();
      const deletedRowsCount = await Product.destroy({
        where: { id }
      });
      return deletedRowsCount > 0;
    } catch (error) {
      console.error('❌ Error en ProductRepository.delete:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DEL DOMINIO =====

  /**
   * Buscar productos activos
   */
  async findActiveProducts(options = {}) {
    try {
      return await this.findAll({ status: 'active' }, options);
    } catch (error) {
      console.error('❌ Error en ProductRepository.findActiveProducts:', error.message);
      throw error;
    }
  }

  /**
   * Buscar productos destacados
   */
  async findFeaturedProducts(options = {}) {
    try {
      return await this.findAll({ 
        status: 'active', 
        featured: true 
      }, options);
    } catch (error) {
      console.error('❌ Error en ProductRepository.findFeaturedProducts:', error.message);
      throw error;
    }
  }

  /**
   * Buscar productos por categoría
   */
  async findByCategory(categoryId, options = {}) {
    try {
      return await this.findAll({ 
        category_id: categoryId,
        status: 'active' 
      }, options);
    } catch (error) {
      console.error('❌ Error en ProductRepository.findByCategory:', error.message);
      throw error;
    }
  }

  /**
   * Buscar productos por proveedor
   */
  async findBySupplier(supplierId, options = {}) {
    try {
      return await this.findAll({ 
        supplier_id: supplierId,
        status: 'active' 
      }, options);
    } catch (error) {
      console.error('❌ Error en ProductRepository.findBySupplier:', error.message);
      throw error;
    }
  }

  /**
   * Buscar productos por marca
   */
  async findByBrand(brand, options = {}) {
    try {
      return await this.findAll({ 
        brand,
        status: 'active' 
      }, options);
    } catch (error) {
      console.error('❌ Error en ProductRepository.findByBrand:', error.message);
      throw error;
    }
  }

  /**
   * Buscar productos con stock bajo
   */
  async findLowStockProducts(options = {}) {
    try {
      const Product = getProductModel();
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      const products = await Product.findAll({
        where: {
          status: 'active',
          stock_quantity: {
            [Op.lte]: sequelize.col('min_stock')
          }
        },
        include: ['category', 'supplier'],
        order: [['stock_quantity', 'ASC']],
        ...options
      });
      
      return products;
    } catch (error) {
      console.error('❌ Error en ProductRepository.findLowStockProducts:', error.message);
      throw error;
    }
  }

  /**
   * Buscar productos sin stock
   */
  async findOutOfStockProducts(options = {}) {
    try {
      return await this.findAll({ 
        status: 'active',
        stockMax: 0
      }, options);
    } catch (error) {
      console.error('❌ Error en ProductRepository.findOutOfStockProducts:', error.message);
      throw error;
    }
  }

  /**
   * Verificar si existe un producto con el SKU
   */
  async existsBySku(sku, excludeId = null) {
    try {
      const Product = getProductModel();
      const whereClause = { sku };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }
      
      const product = await Product.findOne({ where: whereClause });
      return !!product;
    } catch (error) {
      console.error('❌ Error en ProductRepository.existsBySku:', error.message);
      throw error;
    }
  }

  /**
   * Verificar si existe un producto con el código de barras
   */
  async existsByBarcode(barcode, excludeId = null) {
    try {
      const Product = getProductModel();
      const whereClause = { barcode };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }
      
      const product = await Product.findOne({ where: whereClause });
      return !!product;
    } catch (error) {
      console.error('❌ Error en ProductRepository.existsByBarcode:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar stock de producto
   */
  async updateStock(id, newStock) {
    try {
      return await this.update(id, { stock_quantity: newStock });
    } catch (error) {
      console.error('❌ Error en ProductRepository.updateStock:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar estado del producto
   */
  async changeStatus(id, status) {
    try {
      const validStatuses = ['active', 'inactive', 'discontinued'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado inválido: ${status}. Estados válidos: ${validStatuses.join(', ')}`);
      }
      return await this.update(id, { status });
    } catch (error) {
      console.error('❌ Error en ProductRepository.changeStatus:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de productos
   */
  async getProductStats() {
    try {
      const Product = getProductModel();
      
      const [
        totalProducts,
        activeProducts,
        featuredProducts,
        lowStockProducts,
        outOfStockProducts,
        discontinuedProducts
      ] = await Promise.all([
        Product.count(),
        Product.count({ where: { status: 'active' } }),
        Product.count({ where: { status: 'active', featured: true } }),
        Product.count({
          where: {
            status: 'active',
            stock_quantity: { [Op.lte]: Product.sequelize.col('min_stock') }
          }
        }),
        Product.count({ where: { status: 'active', stock_quantity: 0 } }),
        Product.count({ where: { status: 'discontinued' } })
      ]);

      return {
        total: totalProducts,
        active: activeProducts,
        featured: featuredProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        discontinued: discontinuedProducts,
        inactive: totalProducts - activeProducts - discontinuedProducts
      };
    } catch (error) {
      console.error('❌ Error en ProductRepository.getProductStats:', error.message);
      throw error;
    }
  }

  /**
   * Obtener resumen por estado
   */
  async getStatusSummary() {
    try {
      const Product = getProductModel();
      const summary = await Product.findAll({
        attributes: [
          'status',
          [Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'count']
        ],
        group: ['status']
      });
      
      return summary.reduce((acc, item) => {
        acc[item.status] = parseInt(item.dataValues.count);
        return acc;
      }, {});
    } catch (error) {
      console.error('❌ Error en ProductRepository.getStatusSummary:', error.message);
      throw error;
    }
  }

  /**
   * Obtener productos con sus relaciones
   */
  async findWithRelations(id, relations = []) {
    try {
      const Product = getProductModel();
      const include = ['category', 'creator', 'supplier']; // Relaciones básicas

      // Agregar relaciones adicionales según se solicite
      const availableRelations = {
        quoteItems: 'quoteItems',
        categories: 'categories', // Relación muchos a muchos
        productCategories: 'productCategories'
      };

      relations.forEach(relation => {
        if (availableRelations[relation] && !include.includes(availableRelations[relation])) {
          include.push(availableRelations[relation]);
        }
      });

      const product = await Product.findByPk(id, { include });
      return product;
    } catch (error) {
      console.error('❌ Error en ProductRepository.findWithRelations:', error.message);
      throw error;
    }
  }

  /**
   * Buscar productos por rango de precios
   */
  async findByPriceRange(minPrice, maxPrice, options = {}) {
    try {
      const filters = {
        status: 'active',
        priceMin: minPrice,
        priceMax: maxPrice
      };
      return await this.findAll(filters, options);
    } catch (error) {
      console.error('❌ Error en ProductRepository.findByPriceRange:', error.message);
      throw error;
    }
  }

  /**
   * Obtener marcas disponibles
   */
  async getBrands() {
    try {
      const Product = getProductModel();
      const brands = await Product.findAll({
        attributes: [
          'brand',
          [Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'product_count']
        ],
        where: { 
          status: 'active',
          brand: { [Op.ne]: null }
        },
        group: ['brand'],
        order: [['brand', 'ASC']]
      });
      
      return brands.map(item => ({
        brand: item.brand,
        productCount: parseInt(item.dataValues.product_count)
      }));
    } catch (error) {
      console.error('❌ Error en ProductRepository.getBrands:', error.message);
      throw error;
    }
  }
}

module.exports = new ProductRepository();