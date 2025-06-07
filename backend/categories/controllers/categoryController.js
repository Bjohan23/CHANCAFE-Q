const categoryService = require('../services/categoryService');

class CategoryController {

  // ===== ENDPOINTS CRUD BÁSICOS =====

  /**
   * POST /categories
   */
  async createCategory(req, res) {
    try {
      const categoryData = req.body;

      const result = await categoryService.createCategory(categoryData);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Categoría creada exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /categories
   */
  async getAllCategories(req, res) {
    try {
      const {
        status,
        parentId,
        search,
        page,
        limit
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (parentId !== undefined) filters.parentId = parentId === 'null' ? null : parseInt(parentId);
      if (search) filters.search = search;

      const pagination = {};
      if (page && limit) {
        pagination.page = parseInt(page);
        pagination.limit = parseInt(limit);
      }

      const result = await categoryService.getAllCategories(filters, pagination);

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
   * GET /categories/:id
   */
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const { include } = req.query; // Relaciones a incluir

      let category;
      if (include) {
        const relations = include.split(',');
        category = await categoryService.getCategoryWithRelations(id, relations);
      } else {
        category = await categoryService.getCategoryById(id);
      }

      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /categories/:id
   */
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedCategory = await categoryService.updateCategory(id, updateData);

      res.status(200).json({
        success: true,
        data: updatedCategory,
        message: 'Categoría actualizada exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /categories/:id
   */
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      const result = await categoryService.deleteCategory(id);

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
   * GET /categories/active
   */
  async getActiveCategories(req, res) {
    try {
      const categories = await categoryService.getActiveCategories();

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /categories/parentCategories
   */
  async getParentCategories(req, res) {
    try {
      const categories = await categoryService.getParentCategories();

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /categories/:parentId/subcategories
   */
  async getSubcategories(req, res) {
    try {
      const { parentId } = req.params;
      const subcategories = await categoryService.getSubcategories(parentId);

      res.status(200).json({
        success: true,
        data: subcategories
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /categories/tree
   */
  async getCategoryTree(req, res) {
    try {
      const tree = await categoryService.getCategoryTree();

      res.status(200).json({
        success: true,
        data: tree
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /categories/withProductCount
   */
  async getCategoriesWithProductCount(req, res) {
    try {
      const categories = await categoryService.getCategoriesWithProductCount();

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PATCH /categories/:id/status
   */
  async changeCategoryStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Estado es obligatorio'
        });
      }

      const result = await categoryService.changeCategoryStatus(id, status);

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
   * POST /categories/reorder
   */
  async reorderCategories(req, res) {
    try {
      const { categoryOrders } = req.body;

      if (!categoryOrders || !Array.isArray(categoryOrders)) {
        return res.status(400).json({
          success: false,
          message: 'categoryOrders debe ser un array con objetos {id, sortOrder}'
        });
      }

      const result = await categoryService.reorderCategories(categoryOrders);

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
   * GET /categories/search
   */
  async searchCategories(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Parámetro de búsqueda "q" es obligatorio'
        });
      }

      const categories = await categoryService.searchCategories(q);

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /categories/stats
   */
  async getCategoryStats(req, res) {
    try {
      const stats = await categoryService.getCategoryStats();

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
}

module.exports = new CategoryController();