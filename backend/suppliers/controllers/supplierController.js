const supplierService = require('../services/supplierService');

class SupplierController {

  // ===== ENDPOINTS CRUD BÁSICOS =====

  /**
   * POST /suppliers
   */
  async createSupplier(req, res) {
    try {
      const supplierData = req.body;

      const result = await supplierService.createSupplier(supplierData);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Proveedor creado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /suppliers
   */
  async getAllSuppliers(req, res) {
    try {
      const {
        status,
        search,
        page,
        limit
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (search) filters.search = search;

      const pagination = {};
      if (page && limit) {
        pagination.page = parseInt(page);
        pagination.limit = parseInt(limit);
      }

      const result = await supplierService.getAllSuppliers(filters, pagination);

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
   * GET /suppliers/:id
   */
  async getSupplierById(req, res) {
    try {
      const { id } = req.params;
      const { include } = req.query; // Relaciones a incluir

      let supplier;
      if (include) {
        const relations = include.split(',');
        supplier = await supplierService.getSupplierWithRelations(id, relations);
      } else {
        supplier = await supplierService.getSupplierById(id);
      }

      res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /suppliers/:id
   */
  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedSupplier = await supplierService.updateSupplier(id, updateData);

      res.status(200).json({
        success: true,
        data: updatedSupplier,
        message: 'Proveedor actualizado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /suppliers/:id
   */
  async deleteSupplier(req, res) {
    try {
      const { id } = req.params;
      
      const result = await supplierService.deleteSupplier(id);

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
   * GET /suppliers/active
   */
  async getActiveSuppliers(req, res) {
    try {
      const suppliers = await supplierService.getActiveSuppliers();

      res.status(200).json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /suppliers/byTaxId/:taxId
   */
  async getSupplierByTaxId(req, res) {
    try {
      const { taxId } = req.params;
      const supplier = await supplierService.getSupplierByTaxId(taxId);

      res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /suppliers/withProductCount
   */
  async getSuppliersWithProductCount(req, res) {
    try {
      const suppliers = await supplierService.getSuppliersWithProductCount();

      res.status(200).json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PATCH /suppliers/:id/status
   */
  async changeSupplierStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Estado es obligatorio'
        });
      }

      const result = await supplierService.changeSupplierStatus(id, status);

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
   * GET /suppliers/search
   */
  async searchSuppliers(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Parámetro de búsqueda "q" es obligatorio'
        });
      }

      const suppliers = await supplierService.searchSuppliers(q);

      res.status(200).json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /suppliers/stats
   */
  async getSupplierStats(req, res) {
    try {
      const stats = await supplierService.getSupplierStats();

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
   * GET /suppliers/byPaymentTerms
   */
  async getSuppliersByPaymentTerms(req, res) {
    try {
      const { terms } = req.query;

      if (!terms) {
        return res.status(400).json({
          success: false,
          message: 'Parámetro "terms" es obligatorio'
        });
      }

      const suppliers = await supplierService.getSuppliersByPaymentTerms(terms);

      res.status(200).json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /suppliers/byDeliveryTime
   */
  async getSuppliersByDeliveryTime(req, res) {
    try {
      const { time } = req.query;

      if (!time) {
        return res.status(400).json({
          success: false,
          message: 'Parámetro "time" es obligatorio'
        });
      }

      const suppliers = await supplierService.getSuppliersByDeliveryTime(time);

      res.status(200).json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /suppliers/:id/contactInfo
   */
  async getSupplierContactInfo(req, res) {
    try {
      const { id } = req.params;
      const contactInfo = await supplierService.getSupplierContactInfo(id);

      res.status(200).json({
        success: true,
        data: contactInfo
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /suppliers/statusSummary
   */
  async getSupplierStatusSummary(req, res) {
    try {
      const summary = await supplierService.getSupplierStatusSummary();

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

module.exports = new SupplierController();