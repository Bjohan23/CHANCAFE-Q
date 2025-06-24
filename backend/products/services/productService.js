const productRepository = require('../repository/productRepository');

class ProductService {

  // ===== MÉTODOS CRUD BÁSICOS =====

  /**
   * Crear nuevo producto
   */
  async createProduct(productData) {
    try {
      // Validar datos obligatorios
      const validationErrors = this.validateProductData(productData);
      if (validationErrors.length > 0) {
        throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
      }

      // Verificar unicidad de SKU
      if (await productRepository.existsBySku(productData.sku)) {
        throw new Error("Ya existe un producto con este SKU");
      }

      // Verificar unicidad de código de barras si se proporciona
      if (productData.barcode && await productRepository.existsByBarcode(productData.barcode)) {
        throw new Error("Ya existe un producto con este código de barras");
      }

      // Generar SKU automático si no se proporciona
      if (!productData.sku) {
        productData.sku = await this.generateSku(productData);
      }

      // Formatear datos antes de crear
      const formattedData = this.formatProductData(productData);

      const newProduct = await productRepository.create(formattedData);
      
      return {
        product: newProduct,
        message: "Producto creado exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en ProductService.createProduct:', error.message);
      throw error;
    }
  }

  /**
   * Obtener producto por ID
   */
  async getProductById(id, includeRelations = []) {
    try {
      let product;
      
      if (includeRelations.length > 0) {
        product = await productRepository.findWithRelations(id, includeRelations);
      } else {
        product = await productRepository.findById(id);
      }

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      return this.formatProductResponse(product);
    } catch (error) {
      console.error('❌ Error en ProductService.getProductById:', error.message);
      throw error;
    }
  }

  /**
   * Obtener producto por SKU
   */
  async getProductBySku(sku) {
    try {
      const product = await productRepository.findBySku(sku);
      if (!product) {
        throw new Error("Producto no encontrado");
      }
      return this.formatProductResponse(product);
    } catch (error) {
      console.error('❌ Error en ProductService.getProductBySku:', error.message);
      throw error;
    }
  }

  /**
   * Obtener producto por código de barras
   */
  async getProductByBarcode(barcode) {
    try {
      const product = await productRepository.findByBarcode(barcode);
      if (!product) {
        throw new Error("Producto no encontrado");
      }
      return this.formatProductResponse(product);
    } catch (error) {
      console.error('❌ Error en ProductService.getProductByBarcode:', error.message);
      throw error;
    }
  }

  /**
   * Obtener todos los productos con filtros y paginación
   */
  async getAllProducts(filters = {}, pagination = {}) {
    try {
      if (pagination.page && pagination.limit) {
        const result = await productRepository.findAndCountAll(filters, pagination);
        return {
          products: result.products.map(product => this.formatProductResponse(product)),
          pagination: {
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            pageSize: result.pageSize
          }
        };
      } else {
        const products = await productRepository.findAll(filters);
        return products.map(product => this.formatProductResponse(product));
      }
    } catch (error) {
      console.error('❌ Error en ProductService.getAllProducts:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  async updateProduct(id, updateData) {
    try {
      // Verificar que el producto existe
      const existingProduct = await productRepository.findById(id);
      if (!existingProduct) {
        throw new Error("Producto no encontrado");
      }

      // Validar datos de actualización
      const validationErrors = this.validateProductData(updateData, true);
      if (validationErrors.length > 0) {
        throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
      }

      // Verificar unicidad de SKU si se está actualizando
      if (updateData.sku && updateData.sku !== existingProduct.sku) {
        if (await productRepository.existsBySku(updateData.sku, id)) {
          throw new Error("Ya existe un producto con este SKU");
        }
      }

      // Verificar unicidad de código de barras si se está actualizando
      if (updateData.barcode && updateData.barcode !== existingProduct.barcode) {
        if (await productRepository.existsByBarcode(updateData.barcode, id)) {
          throw new Error("Ya existe un producto con este código de barras");
        }
      }

      // Formatear datos antes de actualizar
      const formattedData = this.formatProductData(updateData, true);

      const updatedProduct = await productRepository.update(id, formattedData);
      
      return {
        product: this.formatProductResponse(updatedProduct),
        message: "Producto actualizado exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en ProductService.updateProduct:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar producto
   */
  async deleteProduct(id) {
    try {
      const product = await productRepository.findById(id);
      if (!product) {
        throw new Error("Producto no encontrado");
      }

      // Verificar si el producto tiene cotizaciones asociadas
      // En una implementación real, deberías verificar las relaciones
      // Por ahora, permitimos la eliminación

      const deleted = await productRepository.delete(id);
      if (!deleted) {
        throw new Error("Error al eliminar el producto");
      }

      return {
        message: "Producto eliminado exitosamente",
        deletedProduct: this.formatProductResponse(product)
      };
    } catch (error) {
      console.error('❌ Error en ProductService.deleteProduct:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS =====

  /**
   * Obtener productos activos
   */
  async getActiveProducts(filters = {}) {
    try {
      const products = await productRepository.findActiveProducts();
      return products.map(product => this.formatProductResponse(product));
    } catch (error) {
      console.error('❌ Error en ProductService.getActiveProducts:', error.message);
      throw error;
    }
  }

  /**
   * Obtener productos destacados
   */
  async getFeaturedProducts() {
    try {
      const products = await productRepository.findFeaturedProducts();
      return products.map(product => this.formatProductResponse(product));
    } catch (error) {
      console.error('❌ Error en ProductService.getFeaturedProducts:', error.message);
      throw error;
    }
  }

  /**
   * Obtener productos por categoría
   */
  async getProductsByCategory(categoryId) {
    try {
      const products = await productRepository.findByCategory(categoryId);
      return products.map(product => this.formatProductResponse(product));
    } catch (error) {
      console.error('❌ Error en ProductService.getProductsByCategory:', error.message);
      throw error;
    }
  }

  /**
   * Obtener productos por proveedor
   */
  async getProductsBySupplier(supplierId) {
    try {
      const products = await productRepository.findBySupplier(supplierId);
      return products.map(product => this.formatProductResponse(product));
    } catch (error) {
      console.error('❌ Error en ProductService.getProductsBySupplier:', error.message);
      throw error;
    }
  }

  /**
   * Obtener productos por marca
   */
  async getProductsByBrand(brand) {
    try {
      const products = await productRepository.findByBrand(brand);
      return products.map(product => this.formatProductResponse(product));
    } catch (error) {
      console.error('❌ Error en ProductService.getProductsByBrand:', error.message);
      throw error;
    }
  }

  /**
   * Buscar productos
   */
  async searchProducts(searchTerm, filters = {}) {
    try {
      const searchFilters = {
        ...filters,
        search: searchTerm
      };
      const products = await productRepository.findAll(searchFilters);
      return products.map(product => this.formatProductResponse(product));
    } catch (error) {
      console.error('❌ Error en ProductService.searchProducts:', error.message);
      throw error;
    }
  }

  /**
   * Obtener productos con stock bajo
   */
  async getLowStockProducts() {
    try {
      const products = await productRepository.findLowStockProducts();
      return products.map(product => this.formatProductResponse(product));
    } catch (error) {
      console.error('❌ Error en ProductService.getLowStockProducts:', error.message);
      throw error;
    }
  }

  /**
   * Obtener productos sin stock
   */
  async getOutOfStockProducts() {
    try {
      const products = await productRepository.findOutOfStockProducts();
      return products.map(product => this.formatProductResponse(product));
    } catch (error) {
      console.error('❌ Error en ProductService.getOutOfStockProducts:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar stock de producto
   */
  async updateProductStock(id, newStock) {
    try {
      if (newStock < 0) {
        throw new Error("El stock no puede ser negativo");
      }

      const updatedProduct = await productRepository.updateStock(id, newStock);
      if (!updatedProduct) {
        throw new Error("Producto no encontrado");
      }

      return {
        product: this.formatProductResponse(updatedProduct),
        message: "Stock actualizado exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en ProductService.updateProductStock:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar estado del producto
   */
  async changeProductStatus(id, status) {
    try {
      const updatedProduct = await productRepository.changeStatus(id, status);
      if (!updatedProduct) {
        throw new Error("Producto no encontrado");
      }

      return {
        product: this.formatProductResponse(updatedProduct),
        message: `Estado del producto actualizado a: ${status}`
      };
    } catch (error) {
      console.error('❌ Error en ProductService.changeProductStatus:', error.message);
      throw error;
    }
  }

  /**
   * Obtener productos por rango de precios
   */
  async getProductsByPriceRange(minPrice, maxPrice) {
    try {
      const products = await productRepository.findByPriceRange(minPrice, maxPrice);
      return products.map(product => this.formatProductResponse(product));
    } catch (error) {
      console.error('❌ Error en ProductService.getProductsByPriceRange:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de productos
   */
  async getProductStats() {
    try {
      return await productRepository.getProductStats();
    } catch (error) {
      console.error('❌ Error en ProductService.getProductStats:', error.message);
      throw error;
    }
  }

  /**
   * Obtener marcas disponibles
   */
  async getAvailableBrands() {
    try {
      return await productRepository.getBrands();
    } catch (error) {
      console.error('❌ Error en ProductService.getAvailableBrands:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Formatear respuesta del producto
   */
  formatProductResponse(product) {
    if (!product) return null;

    const formatted = {
      id: product.id,
      category_id: product.category_id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      short_description: product.short_description,
      brand: product.brand,
      model: product.model,
      unit_type: product.unit_type,
      price: parseFloat(product.price || 0),
      cost: parseFloat(product.cost || 0),
      stock_quantity: product.stock_quantity,
      min_stock: product.min_stock,
      max_discount: parseFloat(product.max_discount || 0),
      image_url: product.image_url,
      gallery_urls: product.gallery_urls,
      specifications: product.specifications,
      status: product.status,
      featured: product.featured,
      weight: parseFloat(product.weight || 0),
      dimensions: product.dimensions,
      warranty_months: product.warranty_months,
      is_digital: product.is_digital,
      tax_exempt: product.tax_exempt,
      created_by: product.created_by,
      barcode: product.barcode,
      supplier_sku: product.supplier_sku,
      supplier_id: product.supplier_id,
      created_at: product.created_at,
      updated_at: product.updated_at,
      
      // Información calculada
      margin_percentage: this.calculateMarginPercentage(product.price, product.cost),
      is_in_stock: product.stock_quantity > 0,
      needs_restock: product.stock_quantity <= product.min_stock,
      
      // Relaciones si están incluidas
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description
      } : null,
      
      supplier: product.supplier ? {
        id: product.supplier.id,
        name: product.supplier.name,
        business_name: product.supplier.business_name,
        contact_name: product.supplier.contact_name
      } : null,
      
      creator: product.creator ? {
        id: product.creator.id,
        full_name: `${product.creator.first_name} ${product.creator.last_name}`,
        email: product.creator.email
      } : null
    };

    return formatted;
  }

  /**
   * Validar datos del producto
   */
  validateProductData(productData, isUpdate = false) {
    const errors = [];

    // Validaciones para creación
    if (!isUpdate) {
      if (!productData.name) errors.push("El nombre es obligatorio");
      if (!productData.category_id) errors.push("La categoría es obligatoria");
      if (productData.price === undefined || productData.price === null) {
        errors.push("El precio es obligatorio");
      }
    }

    // Validaciones comunes
    if (productData.name && productData.name.length < 2) {
      errors.push("El nombre debe tener al menos 2 caracteres");
    }

    if (productData.price !== undefined && productData.price < 0) {
      errors.push("El precio no puede ser negativo");
    }

    if (productData.cost !== undefined && productData.cost < 0) {
      errors.push("El costo no puede ser negativo");
    }

    if (productData.stock_quantity !== undefined && productData.stock_quantity < 0) {
      errors.push("El stock no puede ser negativo");
    }

    if (productData.min_stock !== undefined && productData.min_stock < 0) {
      errors.push("El stock mínimo no puede ser negativo");
    }

    if (productData.max_discount !== undefined && (productData.max_discount < 0 || productData.max_discount > 100)) {
      errors.push("El descuento máximo debe estar entre 0 y 100");
    }

    if (productData.warranty_months !== undefined && productData.warranty_months < 0) {
      errors.push("Los meses de garantía no pueden ser negativos");
    }

    if (productData.unit_type && !['unit', 'kg', 'lt', 'mt', 'pack', 'box'].includes(productData.unit_type)) {
      errors.push("Tipo de unidad inválido");
    }

    if (productData.status && !['active', 'inactive', 'discontinued'].includes(productData.status)) {
      errors.push("Estado inválido");
    }

    return errors;
  }

  /**
   * Formatear datos del producto antes de guardar
   */
  formatProductData(productData, isUpdate = false) {
    const formatted = { ...productData };

    // Formatear strings
    if (formatted.name) {
      formatted.name = formatted.name.trim();
    }
    if (formatted.brand) {
      formatted.brand = formatted.brand.trim();
    }
    if (formatted.model) {
      formatted.model = formatted.model.trim();
    }
    if (formatted.sku) {
      formatted.sku = formatted.sku.trim().toUpperCase();
    }
    if (formatted.barcode) {
      formatted.barcode = formatted.barcode.trim();
    }

    // Formatear números
    if (formatted.price !== undefined) {
      formatted.price = parseFloat(formatted.price) || 0;
    }
    if (formatted.cost !== undefined) {
      formatted.cost = parseFloat(formatted.cost) || 0;
    }
    if (formatted.max_discount !== undefined) {
      formatted.max_discount = parseFloat(formatted.max_discount) || 0;
    }

    // Formatear enteros
    if (formatted.stock_quantity !== undefined) {
      formatted.stock_quantity = parseInt(formatted.stock_quantity) || 0;
    }
    if (formatted.min_stock !== undefined) {
      formatted.min_stock = parseInt(formatted.min_stock) || 0;
    }
    if (formatted.warranty_months !== undefined) {
      formatted.warranty_months = parseInt(formatted.warranty_months) || 0;
    }

    // Formatear booleanos
    if (formatted.featured !== undefined) {
      formatted.featured = Boolean(formatted.featured);
    }
    if (formatted.is_digital !== undefined) {
      formatted.is_digital = Boolean(formatted.is_digital);
    }
    if (formatted.tax_exempt !== undefined) {
      formatted.tax_exempt = Boolean(formatted.tax_exempt);
    }

    return formatted;
  }

  /**
   * Generar SKU automático
   */
  async generateSku(productData) {
    try {
      // Generar SKU basado en nombre y fecha
      const namePrefix = productData.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      
      let baseSku = `${namePrefix}${timestamp}${randomSuffix}`;
      let counter = 1;
      let finalSku = baseSku;

      // Verificar unicidad y generar variación si es necesario
      while (await productRepository.existsBySku(finalSku)) {
        finalSku = `${baseSku}${counter.toString().padStart(2, '0')}`;
        counter++;
        
        if (counter > 99) {
          // Si hay demasiadas colisiones, usar timestamp actual
          finalSku = `${namePrefix}${Date.now().toString().slice(-8)}`;
          break;
        }
      }

      return finalSku;
    } catch (error) {
      console.error('❌ Error en ProductService.generateSku:', error.message);
      throw error;
    }
  }

  /**
   * Calcular porcentaje de margen
   */
  calculateMarginPercentage(price, cost) {
    if (!cost || cost <= 0) return 0;
    return ((price - cost) / cost) * 100;
  }
}

module.exports = new ProductService();