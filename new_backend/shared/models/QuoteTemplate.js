const { DataTypes } = require('sequelize');

/**
 * Modelo de Plantillas de Cotización
 * Permite guardar plantillas reutilizables para cotizaciones
 */
module.exports = (sequelize) => {
  const QuoteTemplate = sequelize.define('QuoteTemplate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre de la plantilla'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de la plantilla'
    },
    template_data: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Datos de la plantilla en formato JSON'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Categoría de la plantilla'
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Plantilla por defecto'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Usuario que creó la plantilla',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: 'Estado de la plantilla'
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
    tableName: 'quote_templates',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['is_default']
      },
      {
        fields: ['category']
      }
    ],
    hooks: {
      beforeCreate: async (template) => {
        // Si se marca como default, desmarcar otras por defecto de la misma categoría
        if (template.is_default) {
          await QuoteTemplate.update(
            { is_default: false },
            { 
              where: { 
                category: template.category,
                is_default: true 
              } 
            }
          );
        }
      },
      beforeUpdate: async (template) => {
        if (template.is_default) {
          await QuoteTemplate.update(
            { is_default: false },
            { 
              where: { 
                category: template.category,
                is_default: true,
                id: { [sequelize.Sequelize.Op.ne]: template.id }
              } 
            }
          );
        }
      }
    }
  });

  // Definir asociaciones
  QuoteTemplate.associate = (models) => {
    // Una plantilla pertenece a un usuario creador
    QuoteTemplate.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
  };

  // Métodos de instancia
  QuoteTemplate.prototype.isActive = function() {
    return this.status === 'active';
  };

  QuoteTemplate.prototype.isDefault = function() {
    return this.is_default === true;
  };

  QuoteTemplate.prototype.applyToQuote = function(quoteData = {}) {
    const templateData = this.template_data;
    
    // Fusionar datos de la plantilla con datos específicos de la cotización
    return {
      title: templateData.title || quoteData.title,
      notes: templateData.notes || quoteData.notes,
      delivery_time: templateData.delivery_time || quoteData.delivery_time,
      payment_terms: templateData.payment_terms || quoteData.payment_terms,
      tax_percentage: templateData.tax_percentage || quoteData.tax_percentage || 18.00,
      currency: templateData.currency || quoteData.currency || 'PEN',
      ...quoteData,
      // Los items se pueden incluir de la plantilla si existen
      template_items: templateData.items || []
    };
  };

  // Métodos estáticos
  QuoteTemplate.findActive = function() {
    return this.findAll({
      where: { status: 'active' },
      include: ['creator'],
      order: [['name', 'ASC']]
    });
  };

  QuoteTemplate.findByCategory = function(category) {
    return this.findAll({
      where: { 
        category,
        status: 'active' 
      },
      include: ['creator'],
      order: [['is_default', 'DESC'], ['name', 'ASC']]
    });
  };

  QuoteTemplate.findByCreator = function(creatorId) {
    return this.findAll({
      where: { 
        created_by: creatorId,
        status: 'active' 
      },
      order: [['created_at', 'DESC']]
    });
  };

  QuoteTemplate.findDefault = function(category = null) {
    const where = { 
      is_default: true,
      status: 'active' 
    };
    
    if (category) {
      where.category = category;
    }

    return this.findOne({
      where,
      include: ['creator']
    });
  };

  QuoteTemplate.getCategories = function() {
    return this.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'template_count']
      ],
      where: { 
        status: 'active',
        category: { [sequelize.Sequelize.Op.ne]: null }
      },
      group: ['category'],
      order: [['category', 'ASC']]
    });
  };

  QuoteTemplate.createFromQuote = async function(quote, templateData) {
    // Extraer datos relevantes de la cotización para crear plantilla
    const quoteTemplateData = {
      title: quote.title,
      notes: quote.notes,
      delivery_time: quote.delivery_time,
      payment_terms: quote.payment_terms,
      tax_percentage: quote.tax_percentage,
      currency: quote.currency,
      // Incluir items si existen
      items: quote.items ? quote.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes
      })) : []
    };

    return this.create({
      ...templateData,
      template_data: quoteTemplateData
    });
  };

  QuoteTemplate.searchByName = function(name) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        name: { [Op.like]: `%${name}%` },
        status: 'active'
      },
      include: ['creator'],
      order: [['name', 'ASC']]
    });
  };

  return QuoteTemplate;
};