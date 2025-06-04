const { DataTypes } = require('sequelize');

/**
 * Modelo de Log de Actividad
 * Registra todas las acciones importantes del sistema para auditoría
 */
module.exports = (sequelize) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID del usuario (NULL para actividades del sistema)',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Acción realizada'
    },
    entity_type: {
      type: DataTypes.STRING(50),
      comment: 'Tipo de entidad afectada'
    },
    entity_id: {
      type: DataTypes.INTEGER,
      comment: 'ID de la entidad afectada'
    },
    old_values: {
      type: DataTypes.JSON,
      comment: 'Valores anteriores (para updates)'
    },
    new_values: {
      type: DataTypes.JSON,
      comment: 'Valores nuevos'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      comment: 'IP desde donde se realizó la acción'
    },
    user_agent: {
      type: DataTypes.TEXT,
      comment: 'User agent'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Notas adicionales'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'activity_logs',
    timestamps: false, // Solo necesitamos created_at
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['action']
      },
      {
        fields: ['entity_type', 'entity_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Definir asociaciones
  ActivityLog.associate = (models) => {
    // Un log puede pertenecer a un usuario
    ActivityLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  // Métodos de instancia
  ActivityLog.prototype.isSystemAction = function() {
    return this.user_id === null;
  };

  // Métodos estáticos
  ActivityLog.logAction = function(data) {
    return this.create({
      user_id: data.userId || null,
      action: data.action,
      entity_type: data.entityType || null,
      entity_id: data.entityId || null,
      old_values: data.oldValues || null,
      new_values: data.newValues || null,
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      notes: data.notes || null
    });
  };

  ActivityLog.findByUser = function(userId, limit = 50) {
    return this.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      include: ['user']
    });
  };

  ActivityLog.findByEntity = function(entityType, entityId, limit = 50) {
    return this.findAll({
      where: {
        entity_type: entityType,
        entity_id: entityId
      },
      order: [['created_at', 'DESC']],
      limit,
      include: ['user']
    });
  };

  ActivityLog.findByAction = function(action, limit = 100) {
    return this.findAll({
      where: { action },
      order: [['created_at', 'DESC']],
      limit,
      include: ['user']
    });
  };

  ActivityLog.findRecent = function(limit = 100) {
    return this.findAll({
      order: [['created_at', 'DESC']],
      limit,
      include: ['user']
    });
  };

  // Métodos para diferentes tipos de acciones
  ActivityLog.logLogin = function(userId, ipAddress, userAgent) {
    return this.logAction({
      userId,
      action: 'LOGIN',
      ipAddress,
      userAgent,
      notes: 'Usuario inició sesión'
    });
  };

  ActivityLog.logLogout = function(userId, ipAddress) {
    return this.logAction({
      userId,
      action: 'LOGOUT',
      ipAddress,
      notes: 'Usuario cerró sesión'
    });
  };

  ActivityLog.logCreate = function(userId, entityType, entityId, newValues, ipAddress) {
    return this.logAction({
      userId,
      action: 'CREATE',
      entityType,
      entityId,
      newValues,
      ipAddress,
      notes: `Creado ${entityType} con ID ${entityId}`
    });
  };

  ActivityLog.logUpdate = function(userId, entityType, entityId, oldValues, newValues, ipAddress) {
    return this.logAction({
      userId,
      action: 'UPDATE',
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      notes: `Actualizado ${entityType} con ID ${entityId}`
    });
  };

  ActivityLog.logDelete = function(userId, entityType, entityId, oldValues, ipAddress) {
    return this.logAction({
      userId,
      action: 'DELETE',
      entityType,
      entityId,
      oldValues,
      ipAddress,
      notes: `Eliminado ${entityType} con ID ${entityId}`
    });
  };

  return ActivityLog;
};