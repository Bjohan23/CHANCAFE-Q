const { DataTypes } = require('sequelize');

/**
 * Modelo de Usuario (Asesor de Ventas)
 * Representa a los asesores de ventas que usan la aplicación
 */
module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Código único del asesor'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre completo del asesor'
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: {
        isEmail: true
      },
      comment: 'Email del asesor'
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Hash de la contraseña'
    },
    phone: {
      type: DataTypes.STRING(15),
      comment: 'Teléfono del asesor'
    },
    role: {
      type: DataTypes.ENUM('asesor', 'supervisor', 'admin'),
      defaultValue: 'asesor',
      comment: 'Rol del usuario'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
      comment: 'Estado del usuario'
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      comment: 'URL de la foto de perfil'
    },
    hire_date: {
      type: DataTypes.DATEONLY,
      comment: 'Fecha de contratación'
    },
    branch_office: {
      type: DataTypes.STRING(50),
      comment: 'Sucursal asignada'
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Porcentaje de comisión'
    },
    last_login: {
      type: DataTypes.DATE,
      comment: 'Último inicio de sesión'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['code']
      },
      {
        fields: ['email']
      },
      {
        fields: ['status']
      },
      {
        fields: ['role']
      }
    ],
    hooks: {
      beforeCreate: (user) => {
        // Convertir email a minúsculas
        if (user.email) {
          user.email = user.email.toLowerCase();
        }
      },
      beforeUpdate: (user) => {
        if (user.email) {
          user.email = user.email.toLowerCase();
        }
      }
    }
  });

  // Definir asociaciones
  User.associate = (models) => {
    // Un usuario tiene muchos clientes
    User.hasMany(models.Client, {
      foreignKey: 'user_id',
      as: 'clients'
    });

    // Un usuario tiene muchas cotizaciones
    User.hasMany(models.Quote, {
      foreignKey: 'user_id',
      as: 'quotes'
    });

    // Un usuario tiene muchas solicitudes de crédito
    User.hasMany(models.CreditRequest, {
      foreignKey: 'user_id',
      as: 'creditRequests'
    });

    // Un usuario tiene muchas sesiones
    User.hasMany(models.UserSession, {
      foreignKey: 'user_id',
      as: 'sessions'
    });

    // Un usuario tiene muchos logs de actividad
    User.hasMany(models.ActivityLog, {
      foreignKey: 'user_id',
      as: 'activityLogs'
    });
  };

  // Métodos de instancia
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    // No enviar el password_hash en las respuestas JSON
    delete values.password_hash;
    return values;
  };

  User.prototype.isActive = function() {
    return this.status === 'active';
  };

  User.prototype.isAdmin = function() {
    return this.role === 'admin';
  };

  User.prototype.updateLastLogin = function() {
    this.last_login = new Date();
    return this.save();
  };

  // Métodos estáticos
  User.findByCode = function(code) {
    return this.findOne({
      where: { code },
      include: ['clients', 'quotes']
    });
  };

  User.findByEmail = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase() }
    });
  };

  User.findActiveUsers = function() {
    return this.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });
  };

  return User;
};