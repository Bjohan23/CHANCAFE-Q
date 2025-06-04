const { DataTypes } = require('sequelize');

/**
 * Modelo de Item de Cotización
 * Representa los productos incluidos en una cotización
 */
module.exports = (sequelize) => {
  const QuoteItem = sequelize.define('QuoteItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quote_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID de la cotización',
      references: {
        model: 'quotes',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del producto',
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.00,
      comment: 'Cantidad solicitada'
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'Precio unitario al momento de la cotización'
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Porcentaje de descuento del item'
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Monto de descuento del item'
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'Subtotal del item (cantidad * precio - descuento)'
    },
    notes: {
      type: DataTypes.STRING(255),
      comment: 'Notas específicas del item'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Orden del item en la cotización'
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
    tableName: 'quote_items',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['quote_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['sort_order']
      }
    ],
    hooks: {
      beforeSave: (item) => {
        // Calcular subtotal automáticamente
        const baseAmount = item.quantity * item.unit_price;
        const discountAmount = (baseAmount * item.discount_percentage) / 100;
        item.discount_amount = discountAmount;
        item.subtotal = baseAmount - discountAmount;
      }
    }
  });

  // Definir asociaciones
  QuoteItem.associate = (models) => {
    // Un item pertenece a una cotización
    QuoteItem.belongsTo(models.Quote, {
      foreignKey: 'quote_id',
      as: 'quote'
    });

    // Un item pertenece a un producto
    QuoteItem.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  // Métodos de instancia
  QuoteItem.prototype.calculateSubtotal = function() {
    const baseAmount = this.quantity * this.unit_price;
    const discountAmount = (baseAmount * this.discount_percentage) / 100;
    this.discount_amount = discountAmount;
    this.subtotal = baseAmount - discountAmount;
    return this.subtotal;
  };

  QuoteItem.prototype.hasDiscount = function() {
    return this.discount_percentage > 0;
  };

  // Métodos estáticos
  QuoteItem.findByQuote = function(quoteId) {
    return this.findAll({
      where: { quote_id: quoteId },
      include: ['product'],
      order: [['sort_order', 'ASC'], ['id', 'ASC']]
    });
  };

  return QuoteItem;
};