const categoryRepository = require('../repository/categoryRepository');

class CategoryService {

  // ===== MÉTODOS CRUD BÁSICOS =====

  /**
   * Crear una nueva categoría
   */
  async createCategory(categoryData) {
    try {
      // Validar datos
      const validationErrors = this.validateCategoryData(categoryData);
      if (validationErrors.length > 0) {
        throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
      }

      // Verificar que no exista otra categoría con el mismo nombre
      const nameExists = await categoryRepository.existsByName(categoryData.name);
      if (nameExists) {
        throw new Error('Ya existe una categoría con este nombre');
      }

      // Si tiene parent_id, verificar que el padre exista y esté activo
      if (categoryData.parent_id) {
        const parentCategory = await categoryRepository.findById(categoryData.parent_id);
        if (!parentCategory) {
          throw new Error('La categoría padre no existe');
        }
        if (!parentCategory.isActive()) {
          throw new Error('La categoría padre no está activa');
        }
      }

      const newCategory = await categoryRepository.create({
        name: categoryData.name,
        description: categoryData.description || null,
        parent_id: categoryData.parent_id || null,
        image_url: categoryData.image_url || null,
        status: categoryData.status || 'active',
        sort_order: categoryData.sort_order || 0
      });

      return this.formatCategoryResponse(newCategory);
    } catch (error) {
      console.error('❌ Error en CategoryService.createCategory:', error.message);
      throw error;
    }
  }

  /**
   * Obtener categoría por ID
   */
  async getCategoryById(id) {
    try {
      const category = await categoryRepository.findById(id);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }
      return this.formatCategoryResponse(category);
    } catch (error) {
      console.error('❌ Error en CategoryService.getCategoryById:', error.message);
      throw error;
    }
  }

  /**
   * Obtener todas las categorías con filtros
   */
  async getAllCategories(filters = {}, pagination = {}) {
    try {
      if (pagination.page && pagination.limit) {
        const result = await categoryRepository.findAndCountAll(filters, pagination);
        return {
          categories: result.categories.map(category => this.formatCategoryResponse(category)),
          pagination: {
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            pageSize: result.pageSize
          }
        };
      } else {
        const categories = await categoryRepository.findAll(filters);
        return categories.map(category => this.formatCategoryResponse(category));
      }
    } catch (error) {
      console.error('❌ Error en CategoryService.getAllCategories:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar categoría
   */
  async updateCategory(id, updateData) {
    try {
      // Verificar que la categoría existe
      const existingCategory = await categoryRepository.findById(id);
      if (!existingCategory) {
        throw new Error('Categoría no encontrada');
      }

      // Validar datos de actualización
      const validationErrors = this.validateCategoryData(updateData, true);
      if (validationErrors.length > 0) {
        throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
      }

      // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
      if (updateData.name && updateData.name !== existingCategory.name) {
        const nameExists = await categoryRepository.existsByName(updateData.name, id);
        if (nameExists) {
          throw new Error('Ya existe una categoría con este nombre');
        }
      }

      // Si se está actualizando parent_id, verificar validez
      if (updateData.parent_id !== undefined) {
        if (updateData.parent_id !== null) {
          // No puede ser su propio padre
          if (parseInt(updateData.parent_id) === parseInt(id)) {
            throw new Error('Una categoría no puede ser padre de sí misma');
          }

          // Verificar que el padre exista y esté activo
          const parentCategory = await categoryRepository.findById(updateData.parent_id);
          if (!parentCategory) {
            throw new Error('La categoría padre no existe');
          }
          if (!parentCategory.isActive()) {
            throw new Error('La categoría padre no está activa');
          }

          // Verificar que no se cree un ciclo (el padre no puede ser hijo de esta categoría)
          const isDescendant = await this.isDescendant(updateData.parent_id, id);
          if (isDescendant) {
            throw new Error('No se puede crear una relación circular entre categorías');
          }
        }
      }

      const updatedCategory = await categoryRepository.update(id, updateData);
      return this.formatCategoryResponse(updatedCategory);
    } catch (error) {
      console.error('❌ Error en CategoryService.updateCategory:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar categoría
   */
  async deleteCategory(id) {
    try {
      const category = await categoryRepository.findById(id);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      const deleted = await categoryRepository.delete(id);
      if (!deleted) {
        throw new Error('Error al eliminar la categoría');
      }

      return {
        message: 'Categoría eliminada exitosamente',
        deletedCategory: this.formatCategoryResponse(category)
      };
    } catch (error) {
      console.error('❌ Error en CategoryService.deleteCategory:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DEL DOMINIO =====

  /**
   * Obtener categorías activas
   */
  async getActiveCategories() {
    try {
      const categories = await categoryRepository.findActiveCategories();
      return categories.map(category => this.formatCategoryResponse(category));
    } catch (error) {
      console.error('❌ Error en CategoryService.getActiveCategories:', error.message);
      throw error;
    }
  }

  /**
   * Obtener categorías padre (principales)
   */
  async getParentCategories() {
    try {
      const categories = await categoryRepository.findParentCategories();
      return categories.map(category => this.formatCategoryResponse(category));
    } catch (error) {
      console.error('❌ Error en CategoryService.getParentCategories:', error.message);
      throw error;
    }
  }

  /**
   * Obtener subcategorías de una categoría padre
   */
  async getSubcategories(parentId) {
    try {
      // Verificar que la categoría padre existe
      const parentCategory = await categoryRepository.findById(parentId);
      if (!parentCategory) {
        throw new Error('Categoría padre no encontrada');
      }

      const subcategories = await categoryRepository.findSubcategories(parentId);
      return subcategories.map(category => this.formatCategoryResponse(category));
    } catch (error) {
      console.error('❌ Error en CategoryService.getSubcategories:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar estado de la categoría
   */
  async changeCategoryStatus(id, status) {
    try {
      const updatedCategory = await categoryRepository.changeStatus(id, status);
      if (!updatedCategory) {
        throw new Error('Categoría no encontrada');
      }
      return {
        message: `Estado de la categoría actualizado a: ${status}`,
        category: this.formatCategoryResponse(updatedCategory)
      };
    } catch (error) {
      console.error('❌ Error en CategoryService.changeCategoryStatus:', error.message);
      throw error;
    }
  }

  /**
   * Obtener categorías con conteo de productos
   */
  async getCategoriesWithProductCount() {
    try {
      const categories = await categoryRepository.findWithProductCount();
      return categories.map(category => ({
        ...this.formatCategoryResponse(category),
        productCount: parseInt(category.dataValues.productCount) || 0
      }));
    } catch (error) {
      console.error('❌ Error en CategoryService.getCategoriesWithProductCount:', error.message);
      throw error;
    }
  }

  /**
   * Reordenar categorías
   */
  async reorderCategories(categoryOrders) {
    try {
      // Validar que todos los IDs existan
      const categoryIds = categoryOrders.map(item => item.id);
      for (const id of categoryIds) {
        const category = await categoryRepository.findById(id);
        if (!category) {
          throw new Error(`Categoría con ID ${id} no encontrada`);
        }
      }

      const success = await categoryRepository.reorderCategories(categoryOrders);
      if (!success) {
        throw new Error('Error al reordenar categorías');
      }

      return {
        message: 'Categorías reordenadas exitosamente'
      };
    } catch (error) {
      console.error('❌ Error en CategoryService.reorderCategories:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de categorías
   */
  async getCategoryStats() {
    try {
      return await categoryRepository.getCategoryStats();
    } catch (error) {
      console.error('❌ Error en CategoryService.getCategoryStats:', error.message);
      throw error;
    }
  }

  /**
   * Obtener categoría con relaciones
   */
  async getCategoryWithRelations(id, relations = []) {
    try {
      const category = await categoryRepository.findWithRelations(id, relations);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }
      return this.formatCategoryResponse(category);
    } catch (error) {
      console.error('❌ Error en CategoryService.getCategoryWithRelations:', error.message);
      throw error;
    }
  }

  /**
   * Buscar categorías
   */
  async searchCategories(searchTerm) {
    try {
      const categories = await categoryRepository.findAll({
        search: searchTerm,
        status: 'active'
      });
      return categories.map(category => this.formatCategoryResponse(category));
    } catch (error) {
      console.error('❌ Error en CategoryService.searchCategories:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Formatear respuesta de categoría
   */
  formatCategoryResponse(category) {
    if (!category) return null;

    const formatted = {
      id: category.id,
      name: category.name,
      description: category.description,
      parent_id: category.parent_id,
      image_url: category.image_url,
      status: category.status,
      sort_order: category.sort_order,
      created_at: category.created_at,
      updated_at: category.updated_at,
      // Métodos de estado
      isActive: category.isActive ? category.isActive() : category.status === 'active',
      hasParent: category.hasParent ? category.hasParent() : category.parent_id !== null,
      isParentCategory: category.isParentCategory ? category.isParentCategory() : category.parent_id === null
    };

    // Incluir relaciones si están presentes
    if (category.parent) {
      formatted.parent = {
        id: category.parent.id,
        name: category.parent.name,
        description: category.parent.description
      };
    }

    if (category.subcategories && category.subcategories.length > 0) {
      formatted.subcategories = category.subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        image_url: sub.image_url,
        sort_order: sub.sort_order
      }));
    }

    if (category.products) {
      formatted.products = category.products.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        status: product.status
      }));
    }

    return formatted;
  }

  /**
   * Validar datos de categoría
   */
  validateCategoryData(categoryData, isUpdate = false) {
    const errors = [];

    // Validaciones para creación
    if (!isUpdate) {
      if (!categoryData.name) errors.push('El nombre es obligatorio');
    }

    // Validaciones comunes
    if (categoryData.name && categoryData.name.length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (categoryData.name && categoryData.name.length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }

    if (categoryData.description && categoryData.description.length > 1000) {
      errors.push('La descripción no puede exceder 1000 caracteres');
    }

    if (categoryData.status && !['active', 'inactive'].includes(categoryData.status)) {
      errors.push('Estado inválido. Estados válidos: active, inactive');
    }

    if (categoryData.sort_order !== undefined) {
      if (!Number.isInteger(Number(categoryData.sort_order)) || Number(categoryData.sort_order) < 0) {
        errors.push('El orden debe ser un número entero mayor o igual a 0');
      }
    }

    if (categoryData.parent_id !== undefined && categoryData.parent_id !== null) {
      if (!Number.isInteger(Number(categoryData.parent_id)) || Number(categoryData.parent_id) <= 0) {
        errors.push('El ID de categoría padre debe ser un número entero positivo');
      }
    }

    return errors;
  }

  /**
   * Verificar si una categoría es descendiente de otra (para evitar ciclos)
   */
  async isDescendant(potentialParentId, categoryId) {
    try {
      const potentialParent = await categoryRepository.findById(potentialParentId);
      if (!potentialParent) return false;

      // Si no tiene padre, no puede ser descendiente
      if (!potentialParent.parent_id) return false;

      // Si el padre es la categoría que estamos verificando, es descendiente
      if (potentialParent.parent_id === parseInt(categoryId)) return true;

      // Verificar recursivamente
      return await this.isDescendant(potentialParent.parent_id, categoryId);
    } catch (error) {
      console.error('❌ Error en CategoryService.isDescendant:', error.message);
      return false;
    }
  }

  /**
   * Obtener árbol de categorías (estructura jerárquica)
   */
  async getCategoryTree() {
    try {
      const parentCategories = await this.getParentCategories();
      
      const tree = await Promise.all(
        parentCategories.map(async (parent) => {
          const subcategories = await this.getSubcategories(parent.id);
          return {
            ...parent,
            subcategories
          };
        })
      );

      return tree;
    } catch (error) {
      console.error('❌ Error en CategoryService.getCategoryTree:', error.message);
      throw error;
    }
  }
}

module.exports = new CategoryService();