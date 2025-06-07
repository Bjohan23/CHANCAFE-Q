const { DataTypes } = require('sequelize');

/**
 * Modelo de Sesión de Usuario
 * Gestiona las sesiones activas y tokens JWT
 */
module.exports = (sequelize) => {
  const UserSession = sequelize.define('UserSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del usuario',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    session_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Token de sesión'
    },
    refresh_token: {
      type: DataTypes.STRING(255),
      comment: 'Token de renovación'
    },
    device_info: {
      type: DataTypes.JSON,
      comment: 'Información del dispositivo'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      comment: 'Dirección IP'
    },
    user_agent: {
      type: DataTypes.TEXT,
      comment: 'User agent del navegador/app'
    },
    location: {
      type: DataTypes.STRING(100),
      comment: 'Ubicación aproximada'
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'revoked'),
      defaultValue: 'active',
      comment: 'Estado de la sesión'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha de expiración'
    },
    last_activity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Última actividad'
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
    tableName: 'user_sessions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['session_token']
      },
      {
        fields: ['status']
      },
      {
        fields: ['expires_at']
      }
    ]
  });

  // Definir asociaciones
  UserSession.associate = (models) => {
    // Una sesión pertenece a un usuario
    UserSession.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  // Métodos de instancia
  UserSession.prototype.isActive = function() {
    return this.status === 'active' && new Date() < this.expires_at;
  };

  UserSession.prototype.isExpired = function() {
    return new Date() >= this.expires_at;
  };

  UserSession.prototype.revoke = function() {
    this.status = 'revoked';
    return this.save();
  };

  UserSession.prototype.updateActivity = function() {
    this.last_activity = new Date();
    return this.save();
  };

  // Métodos estáticos
  UserSession.findByToken = function(token) {
    return this.findOne({
      where: { session_token: token },
      include: ['user']
    });
  };

  UserSession.findActiveByUser = function(userId) {
    return this.findAll({
      where: {
        user_id: userId,
        status: 'active'
      },
      order: [['last_activity', 'DESC']]
    });
  };

  UserSession.revokeAllByUser = function(userId) {
    return this.update(
      { status: 'revoked' },
      { where: { user_id: userId, status: 'active' } }
    );
  };

  UserSession.cleanupExpired = function() {
    const { Op } = require('sequelize');
    return this.update(
      { status: 'expired' },
      {
        where: {
          status: 'active',
          expires_at: { [Op.lt]: new Date() }
        }
      }
    );
  };

  return UserSession;
};