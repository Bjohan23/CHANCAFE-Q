const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require('../repository/authRepository');

class UserService {

  // ===== MÉTODOS DE AUTENTICACIÓN =====

  /**
   * Generar token JWT (compatible con tu estructura actual)
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      // Campos adicionales opcionales (puedes comentarlos si no los necesitas)
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    };

    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: "6h" };

    return jwt.sign(payload, secret, options);
  }

  /**
   * Verificar token JWT (compatible con tu authMiddleware)
   */
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expirado");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Token inválido");
      } else {
        throw new Error("Error al verificar token");
      }
    }
  }

  /**
   * Login de usuario
   */
  async loginUser(email, password) {
    try {
      // Buscar usuario por email
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error("Credenciales incorrectas");
      }

      // Verificar que el usuario esté activo
      if (!user.isActive()) {
        throw new Error("Usuario inactivo. Contacte al administrador");
      }

      // Comparar contraseñas
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Credenciales incorrectas");
      }

      // Actualizar último login
      await userRepository.updateLastLogin(user.id);

      // Generar token
      const token = this.generateToken(user);

      // Devolver usuario sin contraseña
      const userResponse = this.formatUserResponse(user);

      return { 
        user: userResponse, 
        token,
        message: "Login exitoso"
      };
    } catch (error) {
      console.error('❌ Error en UserService.loginUser:', error.message);
      throw error;
    }
  }

  /**
   * Registro de usuario
   */
  async registerUser(userData) {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        phone,
        role = 'sales_rep',
        status = 'active',
        avatar_url,
        hire_date,
        branch_office,
        commission_rate = 0.00
      } = userData;

      // Verificar si el email ya existe
      const existingUser = await userRepository.existsByEmail(email);
      if (existingUser) {
        throw new Error("Ya existe un usuario con este email");
      }

      // Validaciones básicas
      if (!first_name || !last_name || !email || !password) {
        throw new Error("Los campos nombre, apellido, email y contraseña son obligatorios");
      }

      if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }

      // Generar avatar aleatorio si no se proporciona
      const finalAvatarUrl = avatar_url || this.generateRandomAvatar();

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const newUser = await userRepository.create({
        first_name,
        last_name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role,
        status,
        avatar_url: finalAvatarUrl,
        hire_date,
        branch_office,
        commission_rate
      });

      // Generar token
      const token = this.generateToken(newUser);

      // Devolver usuario sin contraseña
      const userResponse = this.formatUserResponse(newUser);

      return { 
        user: userResponse, 
        token,
        message: "Usuario registrado exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en UserService.registerUser:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS DE GESTIÓN DE USUARIOS =====

  /**
   * Obtener usuario por ID
   */
  async getUserById(id) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      return this.formatUserResponse(user);
    } catch (error) {
      console.error('❌ Error en UserService.getUserById:', error.message);
      throw error;
    }
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email) {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      return this.formatUserResponse(user);
    } catch (error) {
      console.error('❌ Error en UserService.getUserByEmail:', error.message);
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios con filtros
   */
  async getAllUsers(filters = {}, pagination = {}) {
    try {
      if (pagination.page && pagination.limit) {
        const result = await userRepository.findAndCountAll(filters, pagination);
        return {
          users: result.users.map(user => this.formatUserResponse(user)),
          pagination: {
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            pageSize: result.pageSize
          }
        };
      } else {
        const users = await userRepository.findAll(filters);
        return users.map(user => this.formatUserResponse(user));
      }
    } catch (error) {
      console.error('❌ Error en UserService.getAllUsers:', error.message);
      throw error;
    }
  }

  /**
   * Obtener usuarios activos
   */
  async getActiveUsers() {
    try {
      const users = await userRepository.findActiveUsers();
      return users.map(user => this.formatUserResponse(user));
    } catch (error) {
      console.error('❌ Error en UserService.getActiveUsers:', error.message);
      throw error;
    }
  }

  /**
   * Obtener usuarios por rol
   */
  async getUsersByRole(role) {
    try {
      const users = await userRepository.findByRole(role);
      return users.map(user => this.formatUserResponse(user));
    } catch (error) {
      console.error('❌ Error en UserService.getUsersByRole:', error.message);
      throw error;
    }
  }

  /**
   * Obtener usuarios por sucursal
   */
  async getUsersByBranchOffice(branchOffice) {
    try {
      const users = await userRepository.findByBranchOffice(branchOffice);
      return users.map(user => this.formatUserResponse(user));
    } catch (error) {
      console.error('❌ Error en UserService.getUsersByBranchOffice:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  async updateUser(id, updateData) {
    try {
      // Verificar que el usuario existe
      const existingUser = await userRepository.findById(id);
      if (!existingUser) {
        throw new Error("Usuario no encontrado");
      }

      // Si se está actualizando el email, verificar que no exista otro usuario con ese email
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await userRepository.existsByEmail(updateData.email);
        if (emailExists) {
          throw new Error("Ya existe un usuario con este email");
        }
        updateData.email = updateData.email.toLowerCase();
      }

      // Si se está actualizando la contraseña, encriptarla
      if (updateData.password) {
        if (updateData.password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres");
        }
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = await userRepository.update(id, updateData);
      return this.formatUserResponse(updatedUser);
    } catch (error) {
      console.error('❌ Error en UserService.updateUser:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(id, currentPassword, newPassword) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error("Contraseña actual incorrecta");
      }

      // Validar nueva contraseña
      if (newPassword.length < 6) {
        throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
      }

      // Encriptar nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      const updatedUser = await userRepository.update(id, { password: hashedNewPassword });
      
      return {
        message: "Contraseña actualizada exitosamente",
        user: this.formatUserResponse(updatedUser)
      };
    } catch (error) {
      console.error('❌ Error en UserService.changePassword:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar estado del usuario
   */
  async changeUserStatus(id, status) {
    try {
      const updatedUser = await userRepository.changeStatus(id, status);
      if (!updatedUser) {
        throw new Error("Usuario no encontrado");
      }
      return {
        message: `Estado del usuario actualizado a: ${status}`,
        user: this.formatUserResponse(updatedUser)
      };
    } catch (error) {
      console.error('❌ Error en UserService.changeUserStatus:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar rol del usuario
   */
  async changeUserRole(id, role) {
    try {
      const updatedUser = await userRepository.changeRole(id, role);
      if (!updatedUser) {
        throw new Error("Usuario no encontrado");
      }
      return {
        message: `Rol del usuario actualizado a: ${role}`,
        user: this.formatUserResponse(updatedUser)
      };
    } catch (error) {
      console.error('❌ Error en UserService.changeUserRole:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  async deleteUser(id) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const deleted = await userRepository.delete(id);
      if (!deleted) {
        throw new Error("Error al eliminar el usuario");
      }

      return {
        message: "Usuario eliminado exitosamente",
        deletedUser: this.formatUserResponse(user)
      };
    } catch (error) {
      console.error('❌ Error en UserService.deleteUser:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats() {
    try {
      return await userRepository.getUserStats();
    } catch (error) {
      console.error('❌ Error en UserService.getUserStats:', error.message);
      throw error;
    }
  }

  /**
   * Obtener usuario con relaciones
   */
  async getUserWithRelations(id, relations = []) {
    try {
      const user = await userRepository.findWithRelations(id, relations);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      return this.formatUserResponse(user);
    } catch (error) {
      console.error('❌ Error en UserService.getUserWithRelations:', error.message);
      throw error;
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Formatear respuesta del usuario (sin contraseña)
   */
  formatUserResponse(user) {
    if (!user) return null;

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.getFullName ? user.getFullName() : `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar_url: user.avatar_url,
      hire_date: user.hire_date,
      branch_office: user.branch_office,
      commission_rate: user.commission_rate,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at,
      // Métodos de estado
      isActive: user.isActive ? user.isActive() : user.status === 'active',
      isAdmin: user.isAdmin ? user.isAdmin() : user.role === 'admin'
    };
  }

  /**
   * Generar avatar aleatorio
   */
  generateRandomAvatar() {
    const avatars = ['avatar.png', 'avatar2.png', 'avatar3.png', 'avatar4.png'];
    const randomIndex = Math.floor(Math.random() * avatars.length);
    return `/storage/img/${avatars[randomIndex]}`;
  }

  /**
   * Validar datos de usuario
   */
  validateUserData(userData, isUpdate = false) {
    const errors = [];

    // Validaciones para creación
    if (!isUpdate) {
      if (!userData.first_name) errors.push("El nombre es obligatorio");
      if (!userData.last_name) errors.push("El apellido es obligatorio");
      if (!userData.email) errors.push("El email es obligatorio");
      if (!userData.password) errors.push("La contraseña es obligatoria");
    }

    // Validaciones comunes
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push("El formato del email es inválido");
    }

    if (userData.password && userData.password.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
    }

    if (userData.role && !['admin', 'supervisor', 'sales_rep'].includes(userData.role)) {
      errors.push("Rol inválido");
    }

    if (userData.status && !['active', 'inactive', 'suspended'].includes(userData.status)) {
      errors.push("Estado inválido");
    }

    if (userData.commission_rate && (userData.commission_rate < 0 || userData.commission_rate > 100)) {
      errors.push("La tasa de comisión debe estar entre 0 y 100");
    }

    return errors;
  }
}

module.exports = new UserService();