const { ProductRepository } = require('../repositories');
const { Helpers } = require('../utils');
const { ActivityLog } = require('../models');

/**
 * Servicio de Productos
 * Contiene toda la lógica de negocio relacionada con gestión de productos
 */
class ProductService {

  /**
   * Obtiene una lista paginada de productos con filtros
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Lista de productos
   */
  async getProducts(options = {}) {
    try {
      const result = await ProductRepository.findAll(options);

      return Helpers.successResponse(
        'Productos obtenidos exitosamente',
        result,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.getProducts:', error);
      return Helpers.errorResponse(
        'Error al obtener productos',
        'GET_PRODUCTS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Producto encontrado
   */
  async getProductById(id) {
    try {
      const product = await ProductRepository.findById(id);

      if (!product) {
        return Helpers.errorResponse(
          'Producto no encontrado',
          'PRODUCT_NOT_FOUND',
          null,
          404
        );
      }

      return Helpers.successResponse(
        'Producto obtenido exitosamente',
        product,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.getProductById:', error);
      return Helpers.errorResponse(
        'Error al obtener producto',
        'GET_PRODUCT_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene un producto por SKU
   * @param {string} sku - SKU del producto
   * @returns {Promise<Object>} Producto encontrado
   */
  async getProductBySku(sku) {
    try {
      const product = await ProductRepository.findBySku(sku);

      if (!product) {
        return Helpers.errorResponse(
          'Producto no encontrado',
          'PRODUCT_NOT_FOUND',
          null,
          404
        );
      }

      return Helpers.successResponse(
        'Producto obtenido exitosamente',
        product,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.getProductBySku:', error);
      return Helpers.errorResponse(
        'Error al obtener producto por SKU',
        'GET_PRODUCT_BY_SKU_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene productos por categoría
   * @param {number} categoryId - ID de la categoría
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Productos de la categoría
   */
  async getProductsByCategory(categoryId, options = {}) {
    try {
      const result = await ProductRepository.findByCategory(categoryId, options);

      return Helpers.successResponse(
        'Productos de la categoría obtenidos exitosamente',
        result,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.getProductsByCategory:', error);
      return Helpers.errorResponse(
        'Error al obtener productos por categoría',
        'GET_PRODUCTS_BY_CATEGORY_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Crea un nuevo producto
   * @param {Object} productData - Datos del producto
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Producto creado
   */
  async createProduct(productData, requestUser, ipAddress) {
    try {
      // Verificar permisos (solo admin y supervisor)
      if (requestUser.role === 'asesor') {
        return Helpers.errorResponse(
          'No tienes permisos para crear productos',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      // Verificar disponibilidad del SKU
      const isSkuAvailable = await ProductRepository.isSkuAvailable(productData.sku);
      if (!isSkuAvailable) {
        return Helpers.errorResponse(
          'Ya existe un producto con este SKU',
          'SKU_EXISTS',
          null,
          409
        );
      }

      // Crear producto
      const newProduct = await ProductRepository.create(productData);

      // Registrar actividad
      await ActivityLog.logCreate(
        requestUser.id,
        'product',
        newProduct.id,
        newProduct,
        ipAddress
      );

      return Helpers.successResponse(
        'Producto creado exitosamente',
        newProduct,
        201
      );

    } catch (error) {
      console.error('Error en ProductService.createProduct:', error);
      
      if (error.message.includes('SKU')) {
        return Helpers.errorResponse(
          error.message,
          'DUPLICATE_SKU',
          null,
          409
        );
      }

      return Helpers.errorResponse(
        'Error al crear producto',
        'CREATE_PRODUCT_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Actualiza un producto existente
   * @param {number} id - ID del producto
   * @param {Object} updateData - Datos a actualizar
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Producto actualizado
   */
  async updateProduct(id, updateData, requestUser, ipAddress) {
    try {
      // Verificar permisos (solo admin y supervisor)
      if (requestUser.role === 'asesor') {
        return Helpers.errorResponse(
          'No tienes permisos para modificar productos',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      // Obtener producto actual
      const currentProduct = await ProductRepository.findById(id);
      if (!currentProduct) {
        return Helpers.errorResponse(
          'Producto no encontrado',
          'PRODUCT_NOT_FOUND',
          null,
          404
        );
      }

      // Verificar disponibilidad del SKU si se actualiza
      if (updateData.sku) {
        const isSkuAvailable = await ProductRepository.isSkuAvailable(updateData.sku, id);
        if (!isSkuAvailable) {
          return Helpers.errorResponse(
            'Ya existe un producto con este SKU',
            'SKU_EXISTS',
            null,
            409
          );
        }
      }

      // Actualizar producto
      const updatedProduct = await ProductRepository.update(id, updateData);

      if (!updatedProduct) {
        return Helpers.errorResponse(
          'Producto no encontrado',
          'PRODUCT_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar cambios
      await ActivityLog.logUpdate(
        requestUser.id,
        'product',
        id,
        currentProduct,
        updatedProduct,
        ipAddress
      );

      return Helpers.successResponse(
        'Producto actualizado exitosamente',
        updatedProduct,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.updateProduct:', error);
      
      if (error.message.includes('SKU')) {
        return Helpers.errorResponse(
          error.message,
          'DUPLICATE_SKU',
          null,
          409
        );
      }

      return Helpers.errorResponse(
        'Error al actualizar producto',
        'UPDATE_PRODUCT_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Elimina un producto (soft delete)
   * @param {number} id - ID del producto
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteProduct(id, requestUser, ipAddress) {
    try {
      // Verificar permisos (solo admin)
      if (requestUser.role !== 'admin') {
        return Helpers.errorResponse(
          'Solo los administradores pueden eliminar productos',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      // Obtener producto para el log
      const productToDelete = await ProductRepository.findById(id);
      if (!productToDelete) {
        return Helpers.errorResponse(
          'Producto no encontrado',
          'PRODUCT_NOT_FOUND',
          null,
          404
        );
      }

      // Eliminar producto
      const success = await ProductRepository.delete(id);

      if (!success) {
        return Helpers.errorResponse(
          'Producto no encontrado',
          'PRODUCT_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar eliminación
      await ActivityLog.logDelete(
        requestUser.id,
        'product',
        id,
        productToDelete,
        ipAddress
      );

      return Helpers.successResponse(
        'Producto eliminado exitosamente',
        null,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.deleteProduct:', error);
      return Helpers.errorResponse(
        'Error al eliminar producto',
        'DELETE_PRODUCT_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Cambia el estado de un producto
   * @param {number} id - ID del producto
   * @param {string} status - Nuevo estado
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Producto con estado actualizado
   */
  async changeProductStatus(id, status, requestUser, ipAddress) {
    try {
      // Verificar permisos (solo admin y supervisor)
      if (requestUser.role === 'asesor') {
        return Helpers.errorResponse(
          'No tienes permisos para cambiar el estado de productos',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      const updatedProduct = await ProductRepository.changeStatus(id, status);

      if (!updatedProduct) {
        return Helpers.errorResponse(
          'Producto no encontrado',
          'PRODUCT_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar cambio de estado
      await ActivityLog.logAction({
        userId: requestUser.id,
        action: 'STATUS_CHANGE',
        entityType: 'product',
        entityId: id,
        newValues: { status },
        ipAddress: ipAddress,
        notes: `Estado del producto cambiado a: ${status}`
      });

      return Helpers.successResponse(
        `Estado del producto cambiado a ${status}`,
        updatedProduct,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.changeProductStatus:', error);
      return Helpers.errorResponse(
        'Error al cambiar estado del producto',
        'CHANGE_STATUS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Actualiza el stock de un producto
   * @param {number} id - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Producto actualizado
   */
  async updateStock(id, quantity, requestUser, ipAddress) {
    try {
      // Verificar permisos (solo admin y supervisor)
      if (requestUser.role === 'asesor') {
        return Helpers.errorResponse(
          'No tienes permisos para modificar stock',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      const updatedProduct = await ProductRepository.updateStock(id, quantity);

      if (!updatedProduct) {
        return Helpers.errorResponse(
          'Producto no encontrado',
          'PRODUCT_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar cambio de stock
      await ActivityLog.logAction({
        userId: requestUser.id,
        action: 'STOCK_UPDATE',
        entityType: 'product',
        entityId: id,
        newValues: { stock_quantity: quantity },
        ipAddress: ipAddress,
        notes: `Stock actualizado a: ${quantity} unidades`
      });

      return Helpers.successResponse(
        'Stock actualizado exitosamente',
        updatedProduct,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.updateStock:', error);
      return Helpers.errorResponse(
        'Error al actualizar stock',
        'UPDATE_STOCK_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Ajusta el stock de un producto
   * @param {number} id - ID del producto
   * @param {number} adjustment - Ajuste (positivo o negativo)
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @param {string} reason - Razón del ajuste
   * @returns {Promise<Object>} Producto actualizado
   */
  async adjustStock(id, adjustment, requestUser, ipAddress, reason = '') {
    try {
      // Verificar permisos (solo admin y supervisor)
      if (requestUser.role === 'asesor') {
        return Helpers.errorResponse(
          'No tienes permisos para ajustar stock',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      const updatedProduct = await ProductRepository.adjustStock(id, adjustment);

      if (!updatedProduct) {
        return Helpers.errorResponse(
          'Producto no encontrado',
          'PRODUCT_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar ajuste de stock
      await ActivityLog.logAction({
        userId: requestUser.id,
        action: 'STOCK_ADJUSTMENT',
        entityType: 'product',
        entityId: id,
        newValues: { 
          adjustment,
          new_stock: updatedProduct.stock_quantity,
          reason 
        },
        ipAddress: ipAddress,
        notes: `Ajuste de stock: ${adjustment > 0 ? '+' : ''}${adjustment}. Razón: ${reason}`
      });

      return Helpers.successResponse(
        'Stock ajustado exitosamente',
        updatedProduct,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.adjustStock:', error);
      return Helpers.errorResponse(
        'Error al ajustar stock',
        'ADJUST_STOCK_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene productos destacados
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Object>} Lista de productos destacados
   */
  async getFeaturedProducts(limit = 10) {
    try {
      const products = await ProductRepository.findFeatured(limit);

      return Helpers.successResponse(
        'Productos destacados obtenidos exitosamente',
        products,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.getFeaturedProducts:', error);
      return Helpers.errorResponse(
        'Error al obtener productos destacados',
        'GET_FEATURED_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene productos con stock bajo
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Object>} Lista de productos con stock bajo
   */
  async getLowStockProducts(limit = 50) {
    try {
      const products = await ProductRepository.findLowStock(limit);

      return Helpers.successResponse(
        'Productos con stock bajo obtenidos exitosamente',
        products,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.getLowStockProducts:', error);
      return Helpers.errorResponse(
        'Error al obtener productos con stock bajo',
        'GET_LOW_STOCK_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Busca productos por texto
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Object>} Lista de productos encontrados
   */
  async searchProducts(searchTerm, limit = 20) {
    try {
      const products = await ProductRepository.search(searchTerm, limit);

      return Helpers.successResponse(
        'Búsqueda de productos completada',
        products,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.searchProducts:', error);
      return Helpers.errorResponse(
        'Error al buscar productos',
        'SEARCH_PRODUCTS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene estadísticas de productos
   * @returns {Promise<Object>} Estadísticas
   */
  async getProductStats() {
    try {
      const stats = await ProductRepository.getStats();

      return Helpers.successResponse(
        'Estadísticas de productos obtenidas',
        stats,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.getProductStats:', error);
      return Helpers.errorResponse(
        'Error al obtener estadísticas',
        'GET_STATS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene productos por rango de precios
   * @param {number} minPrice - Precio mínimo
   * @param {number} maxPrice - Precio máximo
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Lista de productos
   */
  async getProductsByPriceRange(minPrice, maxPrice, options = {}) {
    try {
      const products = await ProductRepository.findByPriceRange(minPrice, maxPrice, options);

      return Helpers.successResponse(
        'Productos por rango de precio obtenidos',
        products,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.getProductsByPriceRange:', error);
      return Helpers.errorResponse(
        'Error al obtener productos por precio',
        'GET_PRODUCTS_BY_PRICE_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Marca/desmarca un producto como destacado
   * @param {number} id - ID del producto
   * @param {boolean} featured - Estado destacado
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Producto actualizado
   */
  async setFeatured(id, featured, requestUser, ipAddress) {
    try {
      // Verificar permisos (solo admin y supervisor)
      if (requestUser.role === 'asesor') {
        return Helpers.errorResponse(
          'No tienes permisos para destacar productos',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      const updatedProduct = await ProductRepository.setFeatured(id, featured);

      if (!updatedProduct) {
        return Helpers.errorResponse(
          'Producto no encontrado',
          'PRODUCT_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar cambio
      await ActivityLog.logAction({
        userId: requestUser.id,
        action: 'FEATURED_CHANGE',
        entityType: 'product',
        entityId: id,
        newValues: { featured },
        ipAddress: ipAddress,
        notes: `Producto ${featured ? 'marcado como destacado' : 'desmarcado como destacado'}`
      });

      return Helpers.successResponse(
        `Producto ${featured ? 'marcado' : 'desmarcado'} como destacado`,
        updatedProduct,
        200
      );

    } catch (error) {
      console.error('Error en ProductService.setFeatured:', error);
      return Helpers.errorResponse(
        'Error al cambiar estado destacado',
        'SET_FEATURED_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Verifica la disponibilidad de un SKU
   * @param {string} sku - SKU a verificar
   * @param {number} excludeId - ID a excluir
   * @returns {Promise<Object>} Disponibilidad del SKU
   */
  async checkSkuAvailability(sku, excludeId = null) {
    try {
      const isAvailable = await ProductRepository.isSkuAvailable(sku, excludeId);

      return Helpers.successResponse(
        isAvailable ? 'SKU disponible' : 'SKU no disponible',
        { available: isAvailable, sku },
        200
      );

    } catch (error) {
      console.error('Error en ProductService.checkSkuAvailability:', error);
      return Helpers.errorResponse(
        'Error al verificar disponibilidad del SKU',
        'CHECK_SKU_ERROR',
        null,
        500
      );
    }
  }
}

module.exports = new ProductService();