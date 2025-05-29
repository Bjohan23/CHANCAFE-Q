const { UserService } = require('../services');
const { Helpers } = require('../utils');
const { ErrorHandler } = require('../middlewares');

/**
 * Controlador de Usuarios
 * Maneja las peticiones HTTP relacionadas con gestión de usuarios
 */
class UserController {

  /**
   * Obtiene lista de usuarios con paginación y filtros
   * GET /api/v1/users
   */
  static getUsers = ErrorHandler.asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || '',
      role: req.query.role || null,
      status: req.query.status || null,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await UserService.getUsers(options, req.user);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Obtiene un usuario por ID
   * GET /api/v1/users/:id
   */
  static getUserById = ErrorHandler.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await UserService.getUserById(parseInt(id), req.user);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Crea un nuevo usuario
   * POST /api/v1/users
   */
  static createUser = ErrorHandler.asyncHandler(async (req, res) => {
    const userData = req.body;
    const ipAddress = Helpers.getClientIP(req);

    const result = await UserService.createUser(userData, req.user, ipAddress);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Actualiza un usuario existente
   * PUT /api/v1/users/:id
   */
  static updateUser = ErrorHandler.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const ipAddress = Helpers.getClientIP(req);

    const result = await UserService.updateUser(
      parseInt(id),
      updateData,
      req.user,
      ipAddress
    );
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Elimina un usuario (soft delete)
   * DELETE /api/v1/users/:id
   */
  static deleteUser = ErrorHandler.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ipAddress = Helpers.getClientIP(req);

    const result = await UserService.deleteUser(
      parseInt(id),
      req.user,
      ipAddress
    );
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Cambia el estado de un usuario
   * PATCH /api/v1/users/:id/status
   */
  static changeStatus = ErrorHandler.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const ipAddress = Helpers.getClientIP(req);

    const result = await UserService.changeUserStatus(
      parseInt(id),
      status,
      req.user,
      ipAddress
    );
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Obtiene estadísticas de usuarios
   * GET /api/v1/users/stats
   */
  static getStats = ErrorHandler.asyncHandler(async (req, res) => {
    const result = await UserService.getUserStats();
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Obtiene usuarios por rol
   * GET /api/v1/users/role/:role
   */
  static getUsersByRole = ErrorHandler.asyncHandler(async (req, res) => {
    const { role } = req.params;

    const result = await UserService.getUsersByRole(role);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Obtiene asesores disponibles
   * GET /api/v1/users/advisors
   */
  static getAdvisors = ErrorHandler.asyncHandler(async (req, res) => {
    const result = await UserService.getAvailableAdvisors();
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Obtiene dashboard de un asesor
   * GET /api/v1/users/:id/dashboard
   */
  static getDashboard = ErrorHandler.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);

    // Verificar que el usuario puede acceder a este dashboard
    if (req.user.role === 'asesor' && req.user.id !== userId) {
      const errorResponse = Helpers.errorResponse(
        'Solo puedes acceder a tu propio dashboard',
        'INSUFFICIENT_PERMISSIONS',
        null,
        403
      );
      return res.status(403).json(errorResponse);
    }

    const result = await UserService.getAdvisorDashboard(userId);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Verifica disponibilidad de código de usuario
   * GET /api/v1/users/check-code/:code
   */
  static checkCodeAvailability = ErrorHandler.asyncHandler(async (req, res) => {
    const { code } = req.params;
    const excludeId = req.query.excludeId ? parseInt(req.query.excludeId) : null;

    const result = await UserService.checkCodeAvailability(code, excludeId);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Verifica disponibilidad de email
   * GET /api/v1/users/check-email/:email
   */
  static checkEmailAvailability = ErrorHandler.asyncHandler(async (req, res) => {
    const { email } = req.params;
    const excludeId = req.query.excludeId ? parseInt(req.query.excludeId) : null;

    const result = await UserService.checkEmailAvailability(email, excludeId);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Obtiene perfil del usuario autenticado
   * GET /api/v1/users/profile
   */
  static getProfile = ErrorHandler.asyncHandler(async (req, res) => {
    const result = await UserService.getUserById(req.user.id, req.user);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Actualiza perfil del usuario autenticado
   * PUT /api/v1/users/profile
   */
  static updateProfile = ErrorHandler.asyncHandler(async (req, res) => {
    const updateData = req.body;
    const ipAddress = Helpers.getClientIP(req);

    // Filtrar campos que el usuario puede actualizar en su perfil
    const allowedFields = ['name', 'email', 'phone'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const result = await UserService.updateUser(
      req.user.id,
      filteredData,
      req.user,
      ipAddress
    );
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Busca usuarios por término
   * GET /api/v1/users/search
   */
  static searchUsers = ErrorHandler.asyncHandler(async (req, res) => {
    const { q: search } = req.query;
    
    if (!search || search.trim().length < 2) {
      const errorResponse = Helpers.errorResponse(
        'El término de búsqueda debe tener al menos 2 caracteres',
        'INVALID_SEARCH_TERM',
        null,
        400
      );
      return res.status(400).json(errorResponse);
    }

    const options = {
      page: 1,
      limit: 20,
      search: search.trim(),
      status: 'active'
    };

    const result = await UserService.getUsers(options, req.user);
    
    res.status(result.statusCode).json(result);
  });

  /**
   * Obtiene usuarios recientes
   * GET /api/v1/users/recent
   */
  static getRecentUsers = ErrorHandler.asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    const options = {
      page: 1,
      limit: Math.min(limit, 50),
      sortBy: 'created_at',
      sortOrder: 'DESC',
      status: 'active'
    };

    const result = await UserService.getUsers(options, req.user);
    
    res.status(result.statusCode).json(result);
  });
}

module.exports = UserController;