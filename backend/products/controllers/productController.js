const productService = require('../services/productService');

class ProductController {

  // ===== ENDPOINTS CRUD BÁSICOS =====

  /**
   * POST /products
   * Crear nuevo producto
   */
  async createProduct(req, res) {
    try {
      const productData = req.body;
      
      // Agregar usuario creador desde el token
      if (req.user && req.user.userId) {
        productData.created_by = req.user.userId;
      }

      const result = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products
   * Obtener todos los productos con filtros y paginación
   */
  async getAllProducts(req, res) {
    try {
      const {
        status,
        category_id,
        supplier_id,
        featured,
        brand,
        search,
        priceMin,
        priceMax,
        stockMin,
        stockMax,
        page,
        limit
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (category_id) filters.category_id = parseInt(category_id);
      if (supplier_id) filters.supplier_id = parseInt(supplier_id);
      if (featured !== undefined) filters.featured = featured === 'true';
      if (brand) filters.brand = brand;
      if (search) filters.search = search;
      if (priceMin) filters.priceMin = parseFloat(priceMin);
      if (priceMax) filters.priceMax = parseFloat(priceMax);
      if (stockMin) filters.stockMin = parseInt(stockMin);
      if (stockMax) filters.stockMax = parseInt(stockMax);

      const pagination = {};
      if (page && limit) {
        pagination.page = parseInt(page);
        pagination.limit = parseInt(limit);
      }

      const result = await productService.getAllProducts(filters, pagination);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/:id
   * Obtener producto por ID
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const { include } = req.query;

      const includeRelations = include ? include.split(',') : [];
      const product = await productService.getProductById(id, includeRelations);

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /products/:id
   * Actualizar producto
   */
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const result = await productService.updateProduct(id, updateData);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /products/:id
   * Eliminar producto
   */
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      // Verificar permisos (solo admin puede eliminar productos)
      const userRole = req.user.role || req.user.fullUserData?.role;
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para eliminar productos"
        });
      }

      const result = await productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== ENDPOINTS ESPECÍFICOS =====

  /**
   * GET /products/active
   * Obtener productos activos
   */
  async getActiveProducts(req, res) {
    try {
      const { brand, category_id, supplier_id } = req.query;
      
      const filters = {};
      if (brand) filters.brand = brand;
      if (category_id) filters.category_id = parseInt(category_id);
      if (supplier_id) filters.supplier_id = parseInt(supplier_id);

      const products = await productService.getActiveProducts(filters);

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/featured
   * Obtener productos destacados
   */
  async getFeaturedProducts(req, res) {
    try {
      const products = await productService.getFeaturedProducts();

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/search
   * Buscar productos
   */
  async searchProducts(req, res) {
    try {
      const { q: searchTerm, category_id, supplier_id, status = 'active' } = req.query;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: "Término de búsqueda requerido"
        });
      }

      const filters = { status };
      if (category_id) filters.category_id = parseInt(category_id);
      if (supplier_id) filters.supplier_id = parseInt(supplier_id);

      const products = await productService.searchProducts(searchTerm, filters);

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/bySku/:sku
   * Obtener producto por SKU
   */
  async getProductBySku(req, res) {
    try {
      const { sku } = req.params;
      const product = await productService.getProductBySku(sku);

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/byBarcode/:barcode
   * Obtener producto por código de barras
   */
  async getProductByBarcode(req, res) {
    try {
      const { barcode } = req.params;
      const product = await productService.getProductByBarcode(barcode);

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/byCategory/:categoryId
   * Obtener productos por categoría
   */
  async getProductsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const products = await productService.getProductsByCategory(categoryId);

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/bySupplier/:supplierId
   * Obtener productos por proveedor
   */
  async getProductsBySupplier(req, res) {
    try {
      const { supplierId } = req.params;
      const products = await productService.getProductsBySupplier(supplierId);

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/byBrand/:brand
   * Obtener productos por marca
   */
  async getProductsByBrand(req, res) {
    try {
      const { brand } = req.params;
      const products = await productService.getProductsByBrand(brand);

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/lowStock
   * Obtener productos con stock bajo
   */
  async getLowStockProducts(req, res) {
    try {
      const products = await productService.getLowStockProducts();

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/outOfStock
   * Obtener productos sin stock
   */
  async getOutOfStockProducts(req, res) {
    try {
      const products = await productService.getOutOfStockProducts();

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/byPriceRange
   * Obtener productos por rango de precios
   */
  async getProductsByPriceRange(req, res) {
    try {
      const { minPrice, maxPrice } = req.query;

      if (!minPrice || !maxPrice) {
        return res.status(400).json({
          success: false,
          message: "Precio mínimo y máximo son requeridos"
        });
      }

      const products = await productService.getProductsByPriceRange(
        parseFloat(minPrice), 
        parseFloat(maxPrice)
      );

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PATCH /products/:id/status
   * Cambiar estado del producto
   */
  async changeProductStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Estado es obligatorio"
        });
      }

      // Verificar permisos (admin o supervisor)
      const userRole = req.user.role || req.user.fullUserData?.role;
      if (!['admin', 'supervisor'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para cambiar el estado de productos"
        });
      }

      const result = await productService.changeProductStatus(id, status);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PATCH /products/:id/stock
   * Actualizar stock del producto
   */
  async updateProductStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      if (stock === undefined || stock === null) {
        return res.status(400).json({
          success: false,
          message: "Stock es obligatorio"
        });
      }

      const result = await productService.updateProductStock(id, parseInt(stock));

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/stats
   * Obtener estadísticas de productos
   */
  async getProductStats(req, res) {
    try {
      // Verificar permisos (admin o supervisor)
      const userRole = req.user.role || req.user.fullUserData?.role;
      if (!['admin', 'supervisor'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para ver estadísticas"
        });
      }

      const stats = await productService.getProductStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/brands
   * Obtener marcas disponibles
   */
  async getAvailableBrands(req, res) {
    try {
      const brands = await productService.getAvailableBrands();

      res.status(200).json({
        success: true,
        data: brands
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/checkSku/:sku
   * Verificar disponibilidad de SKU
   */
  async checkSkuAvailability(req, res) {
    try {
      const { sku } = req.params;
      const { excludeId } = req.query;

      // Usar el repository directamente para esta verificación simple
      const productRepository = require('../repository/productRepository');
      const exists = await productRepository.existsBySku(sku, excludeId ? parseInt(excludeId) : null);

      res.status(200).json({
        success: true,
        data: {
          sku,
          available: !exists,
          exists
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/checkBarcode/:barcode
   * Verificar disponibilidad de código de barras
   */
  async checkBarcodeAvailability(req, res) {
    try {
      const { barcode } = req.params;
      const { excludeId } = req.query;

      const productRepository = require('../repository/productRepository');
      const exists = await productRepository.existsByBarcode(barcode, excludeId ? parseInt(excludeId) : null);

      res.status(200).json({
        success: true,
        data: {
          barcode,
          available: !exists,
          exists
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /products/:id/toggleFeatured
   * Alternar estado destacado del producto
   */
  async toggleFeaturedStatus(req, res) {
    try {
      const { id } = req.params;

      // Verificar permisos (admin o supervisor)
      const userRole = req.user.role || req.user.fullUserData?.role;
      if (!['admin', 'supervisor'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para cambiar productos destacados"
        });
      }

      // Obtener producto actual
      const currentProduct = await productService.getProductById(id);
      const newFeaturedStatus = !currentProduct.featured;
      
      const result = await productService.updateProduct(id, { featured: newFeaturedStatus });

      res.status(200).json({
        success: true,
        data: result,
        message: `Producto ${newFeaturedStatus ? 'marcado como destacado' : 'desmarcado como destacado'}`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /products/statusSummary
   * Obtener resumen por estado
   */
  async getStatusSummary(req, res) {
    try {
      // Verificar permisos (admin o supervisor)
      const userRole = req.user.role || req.user.fullUserData?.role;
      if (!['admin', 'supervisor'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para ver resúmenes"
        });
      }

      const productRepository = require('../repository/productRepository');
      const summary = await productRepository.getStatusSummary();

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ProductController();