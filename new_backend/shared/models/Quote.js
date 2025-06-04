const { DataTypes } = require('sequelize');

/**
 * Modelo de Cotización
 * Representa las cotizaciones creadas por los asesores
 */
module.exports = (sequelize) => {
  const Quote = sequelize.define('Quote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quote_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Número de cotización (generado automáticamente)'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del asesor que crea la cotización',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del cliente',
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'approved', 'rejected', 'expired', 'converted'),
      defaultValue: 'draft',
      comment: 'Estado de la cotización'
    },
    title: {
      type: DataTypes.STRING(150),
      comment: 'Título de la cotización'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Notas adicionales'
    },
    internal_notes: {
      type: DataTypes.TEXT,
      comment: 'Notas internas (no visibles al cliente)'
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Subtotal antes de impuestos'
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Porcentaje de descuento general'
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Monto de descuento'
    },
    tax_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 18.00,
      comment: 'Porcentaje de IGV'
    },
    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Monto de IGV'
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Total final'
    },
    currency: {
      type: DataTypes.ENUM('PEN', 'USD'),
      defaultValue: 'PEN',
      comment: 'Moneda'
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(8, 4),
      defaultValue: 1.0000,
      comment: 'Tipo de cambio'
    },
    valid_until: {
      type: DataTypes.DATEONLY,
      comment: 'Válido hasta'
    },
    delivery_time: {
      type: DataTypes.STRING(50),
      comment: 'Tiempo de entrega'
    },
    payment_terms: {
      type: DataTypes.STRING(100),
      comment: 'Términos de pago'
    },
    sent_at: {
      type: DataTypes.DATE,
      comment: 'Fecha de envío al cliente'
    },
    approved_at: {
      type: DataTypes.DATE,
      comment: 'Fecha de aprobación'
    },
    converted_at: {
      type: DataTypes.DATE,
      comment: 'Fecha de conversión a venta'
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
    tableName: 'quotes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['quote_number']
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
        fields: ['created_at']
      },
      {
        fields: ['valid_until']
      }
    ],
    hooks: {
      beforeCreate: (quote) => {
        // Establecer fecha de validez por defecto (30 días)
        if (!quote.valid_until) {
          const validUntil = new Date();
          validUntil.setDate(validUntil.getDate() + 30);
          quote.valid_until = validUntil;
        }
      }
    }
  });

  // Definir asociaciones
  Quote.associate = (models) => {
    // Una cotización pertenece a un usuario (asesor)
    Quote.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'advisor'
    });

    // Una cotización pertenece a un cliente
    Quote.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client'
    });

    // Una cotización tiene muchos items
    Quote.hasMany(models.QuoteItem, {
      foreignKey: 'quote_id',
      as: 'items'
    });

    // Una cotización puede tener una solicitud de crédito
    Quote.hasOne(models.CreditRequest, {
      foreignKey: 'quote_id',
      as: 'creditRequest'
    });
  };

  // Métodos de instancia
  Quote.prototype.isDraft = function() {
    return this.status === 'draft';
  };

  Quote.prototype.isSent = function() {
    return this.status === 'sent';
  };

  Quote.prototype.isApproved = function() {
    return this.status === 'approved';
  };

  Quote.prototype.isExpired = function() {
    if (!this.valid_until) return false;
    return new Date() > new Date(this.valid_until);
  };

  Quote.prototype.canBeEdited = function() {
    return ['draft', 'rejected'].includes(this.status);
  };

  Quote.prototype.markAsSent = function() {
    this.status = 'sent';
    this.sent_at = new Date();
    return this.save();
  };

  Quote.prototype.approve = function() {
    this.status = 'approved';
    this.approved_at = new Date();
    return this.save();
  };

  Quote.prototype.reject = function() {
    this.status = 'rejected';
    return this.save();
  };

  Quote.prototype.convertToSale = function() {
    this.status = 'converted';
    this.converted_at = new Date();
    return this.save();
  };

  Quote.prototype.calculateTotals = function() {
    // Este método se llamará después de que se actualicen los items
    // Los totales se recalculan automáticamente en la base de datos
    return this.save();
  };

  // Métodos estáticos
  Quote.findByNumber = function(quoteNumber) {
    return this.findOne({
      where: { quote_number: quoteNumber },
      include: ['advisor', 'client', 'items']
    });
  };

  Quote.findByAdvisor = function(advisorId) {
    return this.findAll({
      where: { user_id: advisorId },
      include: ['client', 'items'],
      order: [['created_at', 'DESC']]
    });
  };

  Quote.findByClient = function(clientId) {
    return this.findAll({
      where: { client_id: clientId },
      include: ['advisor', 'items'],
      order: [['created_at', 'DESC']]
    });
  };

  Quote.findByStatus = function(status) {
    return this.findAll({
      where: { status },
      include: ['advisor', 'client'],
      order: [['created_at', 'DESC']]
    });
  };

  Quote.findPendingQuotes = function() {
    return this.findAll({
      where: { status: 'sent' },
      include: ['advisor', 'client'],
      order: [['sent_at', 'ASC']]
    });
  };

  Quote.findExpiredQuotes = function() {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        status: 'sent',
        valid_until: {
          [Op.lt]: new Date()
        }
      },
      include: ['advisor', 'client'],
      order: [['valid_until', 'ASC']]
    });
  };

  return Quote;
};