const express = require('express');
const userController = require('../controllers/userController');

// Usar tu middleware existente
const authMiddleware = require('../../shared/middlewares/authMiddleware');

// Si quieres usar los middlewares adicionales, puedes importarlos así:
// const { requireAdmin, requireAdminOrSupervisor, requireOwnershipOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// ===== RUTAS DE AUTENTICACIÓN (públicas) =====
router.post('/login', userController.login);
router.post('/register', userController.register);

// ===== RUTAS PROTEGIDAS DE AUTENTICACIÓN =====
router.post('/auth/logout', authMiddleware, userController.logout);
router.post('/auth/change-password', authMiddleware, userController.changePassword);

// ===== RUTAS DE PERFIL DE USUARIO =====
router.get('/users/profile', authMiddleware, userController.getProfile);
router.put('/users/profile', authMiddleware, userController.updateProfile);

// ===== RUTAS ADMINISTRATIVAS DE USUARIOS =====

// Obtener todos los usuarios (solo admin/supervisor - verificación manual en controller)
router.get('/users', authMiddleware, userController.getAllUsers);

// Obtener usuarios activos (todos los roles autenticados)
router.get('/users/active', authMiddleware, userController.getActiveUsers);

// Obtener estadísticas de usuarios (solo admin - verificación manual en controller)
router.get('/users/stats', authMiddleware, userController.getUserStats);

// Obtener usuarios por rol (solo admin/supervisor - verificación manual en controller)
router.get('/users/by-role/:role', authMiddleware, userController.getUsersByRole);

// Obtener usuarios por sucursal (solo admin/supervisor - verificación manual en controller)
router.get('/users/by-branch/:branchOffice', authMiddleware, userController.getUsersByBranchOffice);

// Obtener usuario específico (verificación de propiedad en controller)
router.get('/users/:id', authMiddleware, userController.getUserById);

// Actualizar usuario (verificación de propiedad en controller)
router.put('/users/:id', authMiddleware, userController.updateUser);

// Eliminar usuario (solo admin - verificación manual en controller)
router.delete('/users/:id', authMiddleware, userController.deleteUser);

// Cambiar estado de usuario (solo admin - verificación manual en controller)
router.patch('/users/:id/status', authMiddleware, userController.changeUserStatus);

// Cambiar rol de usuario (solo admin - verificación manual en controller)
router.patch('/users/:id/role', authMiddleware, userController.changeUserRole);

module.exports = router;