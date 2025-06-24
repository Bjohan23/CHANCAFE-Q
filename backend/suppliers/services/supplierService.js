const supplierRepository = require('../repository/supplierRepository');

class SupplierService {

  // ===== MÉTODOS CRUD BÁSICOS =====

  /**
   * Crear un nuevo proveedor
   */
  async createSupplier(supplierData) {
    try {
      // Validar datos
      const validationErrors = this.validateSupplierData(supplierData);
      if (validationErrors.length > 0) {
        throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
      }

      // Verificar que no exista otro proveedor con el mismo nombre
      const nameExists = await supplierRepository.existsByName(supplierData.name);
      if (nameExists) {
        throw new Error('Ya existe un proveedor con este nombre');
      }

      // Verificar RUC único si se proporciona
      if (supplierData.tax_id) {
        const taxIdExists = await supplierRepository.existsByTaxId(supplierData.tax_id);
        if (taxIdExists) {
          throw new Error('Ya existe un proveedor con este RUC/Tax ID');
        }
      }

      // Verificar email único si se proporciona
      if (supplierData.email) {
        const emailExists = await supplierRepository.existsByEmail(supplierData.email);
        if (emailExists) {
          throw new Error('Ya existe un proveedor con este email');
        }
      }

      const newSupplier = await supplierRepository.create({
        name: supplierData.name,
        business_name: supplierData.business_name || null,
        tax_id: supplierData.tax_id || null,
        contact_name: supplierData.contact_name || null,
        email: supplierData.email || null,
        phone: supplierData.phone || null,
        address: supplierData.address || null,
        website: supplierData.website || null,
        status: supplierData.status || 'active',
        payment_terms: supplierData.payment_terms || null,
        delivery_time: supplierData.delivery_time || null,
        notes: supplierData.notes || null
      });

      return this.formatSupplierResponse(newSupplier);
    } catch (error) {
      console.error('❌ Error en SupplierService.createSupplier:', error.message);
      throw error;
    }
  }

  /**
   * Obtener proveedor por ID
   */
  async getSupplierById(id) {
    try {
      const supplier = await supplierRepository.findById(id);
      if (!supplier) {
        throw new Error('Proveedor no encontrado');
      }
      return this.formatSupplierResponse(supplier);
    } catch (error) {
      console.error('❌ Error en SupplierService.getSupplierById:', error.message);
      throw error;
    }
  }

  /**
   * Obtener todos los proveedores con filtros
   */
  async getAllSuppliers(filters = {}, pagination = {}) {
    try {
      if (pagination.page && pagination.limit) {
        const result = await supplierRepository.findAndCountAll(filters, pagination);
        return {
          suppliers: result.suppliers.map(supplier => this.formatSupplierResponse(supplier)),
          pagination: {
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            pageSize: result.pageSize
          }
        };
      } else {
        const suppliers = await supplierRepository.findAll(filters);
        return suppliers.map(supplier => this.formatSupplierResponse(supplier));
      }
    } catch (error) {
      console.error('❌ Error en SupplierService.getAllSuppliers:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar proveedor
   */
  async updateSupplier(id, updateData) {
    try {
      // Verificar que el proveedor existe
      const existingSupplier = await supplierRepository.findById(id);
      if (!existingSupplier) {
        throw new Error('Proveedor no encontrado');
      }

      // Validar datos de actualización
      const validationErrors = this.validateSupplierData(updateData, true);
      if (validationErrors.length > 0) {
        throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
      }

      // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
      if (updateData.name && updateData.name !== existingSupplier.name) {
        const nameExists = await supplierRepository.existsByName(updateData.name, id);
        if (nameExists) {
          throw new Error('Ya existe un proveedor con este nombre');
        }
      }

      // Si se está actualizando el RUC, verificar que no exista otro con ese RUC
      if (updateData.tax_id && updateData.tax_id !== existingSupplier.tax_id) {
        const taxIdExists = await supplierRepository.existsByTaxId(updateData.tax_id, id);
        if (taxIdExists) {
          throw new Error('Ya existe un proveedor con este RUC/Tax ID');
        }
      }

      // Si se está actualizando el email, verificar que no exista otro con ese email
      if (updateData.email && updateData.email !== existingSupplier.email) {
        const emailExists = await supplierRepository.existsByEmail(updateData.email, id);
        if (emailExists) {
          throw new Error('Ya existe un proveedor con este email');
        }
      }

      const updatedSupplier = await supplierRepository.update(id, updateData);
      return this.formatSupplierResponse(updatedSupplier);
    } catch (error) {
      console.error('❌ Error en SupplierService.updateSupplier:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar proveedor
   */
  async deleteSupplier(id) {
    try {
      const supplier = await supplierRepository.findById(id);
      if (!supplier) {
        throw new Error('Proveedor no encontrado');
      }

      const deleted = await supplierRepository.delete(id);
      if (!deleted) {
        throw new Error('Error al eliminar el proveedor');
      }

      return {
        message: 'Proveedor eliminado exitosamente',
        deletedSupplier: this.formatSupplierResponse(supplier)
      };
    } catch (error) {
      console.error('❌ Error en SupplierService.deleteSupplier:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DEL DOMINIO =====

  /**
   * Obtener proveedores activos
   */
  async getActiveSuppliers() {
    try {
      const suppliers = await supplierRepository.findActiveSuppliers();
      return suppliers.map(supplier => this.formatSupplierResponse(supplier));
    } catch (error) {
      console.error('❌ Error en SupplierService.getActiveSuppliers:', error.message);
      throw error;
    }
  }

  /**
   * Buscar proveedor por RUC/Tax ID
   */
  async getSupplierByTaxId(taxId) {
    try {
      const supplier = await supplierRepository.findByTaxId(taxId);
      if (!supplier) {
        throw new Error('Proveedor no encontrado con ese RUC/Tax ID');
      }
      return this.formatSupplierResponse(supplier);
    } catch (error) {
      console.error('❌ Error en SupplierService.getSupplierByTaxId:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar estado del proveedor
   */
  async changeSupplierStatus(id, status) {
    try {
      const updatedSupplier = await supplierRepository.changeStatus(id, status);
      if (!updatedSupplier) {
        throw new Error('Proveedor no encontrado');
      }
      return {
        message: `Estado del proveedor actualizado a: ${status}`,
        supplier: this.formatSupplierResponse(updatedSupplier)
      };
    } catch (error) {
      console.error('❌ Error en SupplierService.changeSupplierStatus:', error.message);
      throw error;
    }
  }

  /**
   * Obtener proveedores con conteo de productos
   */
  async getSuppliersWithProductCount() {
    try {
      const suppliers = await supplierRepository.findWithProductCount();
      return suppliers.map(supplier => ({
        ...this.formatSupplierResponse(supplier),
        productCount: parseInt(supplier.dataValues.productCount) || 0
      }));
    } catch (error) {
      console.error('❌ Error en SupplierService.getSuppliersWithProductCount:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de proveedores
   */
  async getSupplierStats() {
    try {
      return await supplierRepository.getSupplierStats();
    } catch (error) {
      console.error('❌ Error en SupplierService.getSupplierStats:', error.message);
      throw error;
    }
  }

  /**
   * Obtener proveedor con relaciones
   */
  async getSupplierWithRelations(id, relations = []) {
    try {
      const supplier = await supplierRepository.findWithRelations(id, relations);
      if (!supplier) {
        throw new Error('Proveedor no encontrado');
      }
      return this.formatSupplierResponse(supplier);
    } catch (error) {
      console.error('❌ Error en SupplierService.getSupplierWithRelations:', error.message);
      throw error;
    }
  }

  /**
   * Buscar proveedores
   */
  async searchSuppliers(searchTerm) {
    try {
      const suppliers = await supplierRepository.findAll({
        search: searchTerm,
        status: 'active'
      });
      return suppliers.map(supplier => this.formatSupplierResponse(supplier));
    } catch (error) {
      console.error('❌ Error en SupplierService.searchSuppliers:', error.message);
      throw error;
    }
  }

  /**
   * Buscar proveedores por términos de pago
   */
  async getSuppliersByPaymentTerms(paymentTerms) {
    try {
      const suppliers = await supplierRepository.findByPaymentTerms(paymentTerms);
      return suppliers.map(supplier => this.formatSupplierResponse(supplier));
    } catch (error) {
      console.error('❌ Error en SupplierService.getSuppliersByPaymentTerms:', error.message);
      throw error;
    }
  }

  /**
   * Buscar proveedores por tiempo de entrega
   */
  async getSuppliersByDeliveryTime(deliveryTime) {
    try {
      const suppliers = await supplierRepository.findByDeliveryTime(deliveryTime);
      return suppliers.map(supplier => this.formatSupplierResponse(supplier));
    } catch (error) {
      console.error('❌ Error en SupplierService.getSuppliersByDeliveryTime:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Formatear respuesta de proveedor
   */
  formatSupplierResponse(supplier) {
    if (!supplier) return null;

    const formatted = {
      id: supplier.id,
      name: supplier.name,
      business_name: supplier.business_name,
      tax_id: supplier.tax_id,
      contact_name: supplier.contact_name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      website: supplier.website,
      status: supplier.status,
      payment_terms: supplier.payment_terms,
      delivery_time: supplier.delivery_time,
      notes: supplier.notes,
      created_at: supplier.created_at,
      updated_at: supplier.updated_at,
      // Métodos de estado
      isActive: supplier.isActive ? supplier.isActive() : supplier.status === 'active',
      displayName: supplier.getDisplayName ? supplier.getDisplayName() : (supplier.business_name || supplier.name),
      contactInfo: supplier.getContactInfo ? supplier.getContactInfo() : {
        name: supplier.contact_name,
        email: supplier.email,
        phone: supplier.phone
      }
    };

    // Incluir relaciones si están presentes
    if (supplier.products) {
      formatted.products = supplier.products.map(product => ({
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
   * Validar datos de proveedor
   */
  validateSupplierData(supplierData, isUpdate = false) {
    const errors = [];

    // Validaciones para creación
    if (!isUpdate) {
      if (!supplierData.name) errors.push('El nombre es obligatorio');
    }

    // Validaciones comunes
    if (supplierData.name && supplierData.name.length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (supplierData.name && supplierData.name.length > 150) {
      errors.push('El nombre no puede exceder 150 caracteres');
    }

    if (supplierData.business_name && supplierData.business_name.length > 150) {
      errors.push('La razón social no puede exceder 150 caracteres');
    }

    if (supplierData.tax_id && supplierData.tax_id.length > 20) {
      errors.push('El RUC/Tax ID no puede exceder 20 caracteres');
    }

    if (supplierData.contact_name && supplierData.contact_name.length > 100) {
      errors.push('El nombre del contacto no puede exceder 100 caracteres');
    }

    if (supplierData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierData.email)) {
      errors.push('El formato del email es inválido');
    }

    if (supplierData.email && supplierData.email.length > 100) {
      errors.push('El email no puede exceder 100 caracteres');
    }

    if (supplierData.phone && supplierData.phone.length > 15) {
      errors.push('El teléfono no puede exceder 15 caracteres');
    }

    if (supplierData.website && supplierData.website.length > 100) {
      errors.push('El sitio web no puede exceder 100 caracteres');
    }

    if (supplierData.status && !['active', 'inactive'].includes(supplierData.status)) {
      errors.push('Estado inválido. Estados válidos: active, inactive');
    }

    if (supplierData.payment_terms && supplierData.payment_terms.length > 100) {
      errors.push('Los términos de pago no pueden exceder 100 caracteres');
    }

    if (supplierData.delivery_time && supplierData.delivery_time.length > 50) {
      errors.push('El tiempo de entrega no puede exceder 50 caracteres');
    }

    if (supplierData.notes && supplierData.notes.length > 1000) {
      errors.push('Las notas no pueden exceder 1000 caracteres');
    }

    return errors;
  }

  /**
   * Validar RUC peruano (opcional - mejora futura)
   */
  validatePeruvianRUC(ruc) {
    if (!ruc) return true; // Es opcional
    
    // RUC peruano debe tener 11 dígitos
    if (!/^\d{11}$/.test(ruc)) {
      return false;
    }

    // Validación básica de RUC peruano (algoritmo de módulo 11)
    const digits = ruc.split('').map(Number);
    const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * factors[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;
    
    return checkDigit === digits[10];
  }

  /**
   * Obtener información de contacto completa
   */
  async getSupplierContactInfo(id) {
    try {
      const supplier = await this.getSupplierById(id);
      return {
        name: supplier.displayName,
        contact_person: supplier.contact_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        website: supplier.website,
        payment_terms: supplier.payment_terms,
        delivery_time: supplier.delivery_time
      };
    } catch (error) {
      console.error('❌ Error en SupplierService.getSupplierContactInfo:', error.message);
      throw error;
    }
  }

  /**
   * Obtener resumen de proveedores por estado
   */
  async getSupplierStatusSummary() {
    try {
      const statusStats = await supplierRepository.getSuppliersByStatus();
      return {
        active: statusStats.active || 0,
        inactive: statusStats.inactive || 0,
        total: (statusStats.active || 0) + (statusStats.inactive || 0)
      };
    } catch (error) {
      console.error('❌ Error en SupplierService.getSupplierStatusSummary:', error.message);
      throw error;
    }
  }
}

module.exports = new SupplierService();