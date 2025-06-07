const userService = require('../services/userService');
const { authService } = require('../services/authService');

class UserController {

  // ===== ENDPOINTS DE AUTENTICACIÓN =====

  /**
   * POST /auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email y contraseña son obligatorios"
        });
      }

      const result = await authService.loginUser(email, password);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /auth/register
   */
  async register(req, res) {
    try {
      const userData = req.body;

      // Validar datos
      const validationErrors = userService.validateUserData(userData);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Datos inválidos",
          errors: validationErrors
        });
      }

      const result = await authService.registerUser(userData);

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
   * POST /auth/logout
   */
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token no proporcionado"
        });
      }

      const result = await authService.logout(token);

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
   * POST /auth/change-password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId || req.user.id; // Compatible con tu estructura de token

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Contraseña actual y nueva contraseña son obligatorias"
        });
      }

      const result = await authService.changePassword(userId, currentPassword, newPassword);

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

  // ===== ENDPOINTS DE GESTIÓN DE USUARIOS =====

  /**
   * GET /users/profile
   */
  async getProfile(req, res) {
    try {
      // Obtener userId desde token (compatible con tu estructura)
      const userId = req.user.userId || req.user.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario no encontrado en token"
        });
      }
      
      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /users/profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const updateData = req.body;

      // Remover campos que no deben ser actualizados por el usuario
      delete updateData.id;
      delete updateData.role;
      delete updateData.status;
      delete updateData.password; // Use change-password endpoint

      const validationErrors = userService.validateUserData(updateData, true);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Datos inválidos",
          errors: validationErrors
        });
      }

      const updatedUser = await userService.updateUser(userId, updateData);

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "Perfil actualizado exitosamente"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /users
   */
  async getAllUsers(req, res) {
    try {
      const {
        status,
        role,
        branch_office,
        search,
        page,
        limit
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (role) filters.role = role;
      if (branch_office) filters.branch_office = branch_office;
      if (search) filters.search = search;

      const pagination = {};
      if (page && limit) {
        pagination.page = parseInt(page);
        pagination.limit = parseInt(limit);
      }

      const result = await userService.getAllUsers(filters, pagination);

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
   * GET /users/:id
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const { include } = req.query; // Relaciones a incluir

      let user;
      if (include) {
        const relations = include.split(',');
        user = await userService.getUserWithRelations(id, relations);
      } else {
        user = await userService.getUserById(id);
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /users/:id
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Obtener datos del usuario desde token (compatible con tu estructura)
      const currentUserId = req.user.userId || req.user.id;
      const userRole = req.user.role || req.user.fullUserData?.role;

      // Verificar permisos (solo admin puede actualizar otros usuarios)
      if (userRole !== 'admin' && currentUserId !== parseInt(id)) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para actualizar este usuario"
        });
      }

      const validationErrors = userService.validateUserData(updateData, true);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Datos inválidos",
          errors: validationErrors
        });
      }

      const updatedUser = await userService.updateUser(id, updateData);

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "Usuario actualizado exitosamente"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /users/:id
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Obtener rol del usuario (compatible con tu estructura)
      const userRole = req.user.role || req.user.fullUserData?.role;
      const currentUserId = req.user.userId || req.user.id;

      // Solo admin puede eliminar usuarios
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para eliminar usuarios"
        });
      }

      // No permitir auto-eliminación
      if (currentUserId === parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: "No puedes eliminar tu propio usuario"
        });
      }

      const result = await userService.deleteUser(id);

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
   * PATCH /users/:id/status
   */
  async changeUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Obtener rol del usuario (compatible con tu estructura)
      const userRole = req.user.role || req.user.fullUserData?.role;

      // Solo admin puede cambiar estados
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para cambiar estados de usuarios"
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Estado es obligatorio"
        });
      }

      const result = await userService.changeUserStatus(id, status);

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
   * PATCH /users/:id/role
   */
  async changeUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      // Obtener rol del usuario (compatible con tu estructura)
      const userRole = req.user.role || req.user.fullUserData?.role;

      // Solo admin puede cambiar roles
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para cambiar roles de usuarios"
        });
      }

      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Rol es obligatorio"
        });
      }

      const result = await userService.changeUserRole(id, role);

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
   * GET /users/stats
   */
  async getUserStats(req, res) {
    try {
      // Obtener rol del usuario (compatible con tu estructura)
      const userRole = req.user.role || req.user.fullUserData?.role;
      
      // Solo admin puede ver estadísticas
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para ver estadísticas"
        });
      }

      const stats = await userService.getUserStats();

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
   * GET /users/active
   */
  async getActiveUsers(req, res) {
    try {
      const users = await userService.getActiveUsers();

      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /users/by-role/:role
   */
  async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const users = await userService.getUsersByRole(role);

      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /users/by-branch/:branchOffice
   */
  async getUsersByBranchOffice(req, res) {
    try {
      const { branchOffice } = req.params;
      const users = await userService.getUsersByBranchOffice(branchOffice);

      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();