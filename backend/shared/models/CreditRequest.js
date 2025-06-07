const { DataTypes } = require('sequelize');

/**
 * Modelo de Solicitud de Crédito
 * Representa las solicitudes de crédito de los clientes
 */
module.exports = (sequelize) => {
  const CreditRequest = sequelize.define('CreditRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    request_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Número de solicitud (generado automáticamente)'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del asesor que crea la solicitud',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del cliente solicitante',
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    quote_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de cotización relacionada (opcional)',
      references: {
        model: 'quotes',
        key: 'id'
      }
    },
    requested_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'Monto solicitado'
    },
    currency: {
      type: DataTypes.ENUM('PEN', 'USD'),
      defaultValue: 'PEN',
      comment: 'Moneda del crédito'
    },
    payment_term_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Plazo de pago en meses'
    },
    interest_rate: {
      type: DataTypes.DECIMAL(5, 2),
      comment: 'Tasa de interés propuesta'
    },
    monthly_payment: {
      type: DataTypes.DECIMAL(12, 2),
      comment: 'Cuota mensual calculada'
    },
    purpose: {
      type: DataTypes.TEXT,
      comment: 'Propósito del crédito'
    },
    status: {
      type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'pending',
      comment: 'Estado de la solicitud'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      comment: 'Prioridad'
    },
    guarantees: {
      type: DataTypes.TEXT,
      comment: 'Garantías ofrecidas'
    },
    documents_submitted: {
      type: DataTypes.JSON,
      comment: 'Documentos presentados'
    },
    risk_assessment: {
      type: DataTypes.JSON,
      comment: 'Evaluación de riesgo'
    },
    approval_conditions: {
      type: DataTypes.TEXT,
      comment: 'Condiciones de aprobación'
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      comment: 'Motivo de rechazo'
    },
    internal_notes: {
      type: DataTypes.TEXT,
      comment: 'Notas internas del análisis'
    },
    submitted_at: {
      type: DataTypes.DATE,
      comment: 'Fecha de presentación'
    },
    reviewed_at: {
      type: DataTypes.DATE,
      comment: 'Fecha de revisión'
    },
    resolved_at: {
      type: DataTypes.DATE,
      comment: 'Fecha de resolución'
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
    tableName: 'credit_requests',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['request_number']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['client_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Definir asociaciones
  CreditRequest.associate = (models) => {
    // Una solicitud pertenece a un usuario (asesor)
    CreditRequest.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'advisor'
    });

    // Una solicitud pertenece a un cliente
    CreditRequest.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client'
    });

    // Una solicitud puede estar relacionada con una cotización
    CreditRequest.belongsTo(models.Quote, {
      foreignKey: 'quote_id',
      as: 'quote'
    });
  };

  // Métodos de instancia
  CreditRequest.prototype.isPending = function() {
    return this.status === 'pending';
  };

  CreditRequest.prototype.isApproved = function() {
    return this.status === 'approved';
  };

  CreditRequest.prototype.isRejected = function() {
    return this.status === 'rejected';
  };

  CreditRequest.prototype.submit = function() {
    this.status = 'under_review';
    this.submitted_at = new Date();
    return this.save();
  };

  CreditRequest.prototype.approve = function(conditions = null) {
    this.status = 'approved';
    this.approval_conditions = conditions;
    this.resolved_at = new Date();
    return this.save();
  };

  CreditRequest.prototype.reject = function(reason) {
    this.status = 'rejected';
    this.rejection_reason = reason;
    this.resolved_at = new Date();
    return this.save();
  };

  // Métodos estáticos
  CreditRequest.findByNumber = function(requestNumber) {
    return this.findOne({
      where: { request_number: requestNumber },
      include: ['advisor', 'client', 'quote']
    });
  };

  CreditRequest.findPendingRequests = function() {
    return this.findAll({
      where: { status: 'pending' },
      include: ['advisor', 'client'],
      order: [['created_at', 'ASC']]
    });
  };

  CreditRequest.findByAdvisor = function(advisorId) {
    return this.findAll({
      where: { user_id: advisorId },
      include: ['client', 'quote'],
      order: [['created_at', 'DESC']]
    });
  };

  return CreditRequest;
};