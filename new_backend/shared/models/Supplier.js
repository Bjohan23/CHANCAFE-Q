const { DataTypes } = require('sequelize');

/**
 * Modelo de Proveedor
 * Representa a los proveedores de productos
 */
module.exports = (sequelize) => {
  const Supplier = sequelize.define('Supplier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nombre del proveedor'
    },
    business_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Razón social'
    },
    tax_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'RUC/Tax ID'
    },
    contact_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre del contacto'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      },
      comment: 'Email principal'
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: 'Teléfono principal'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección completa'
    },
    website: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Sitio web'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: 'Estado del proveedor'
    },
    payment_terms: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Términos de pago'
    },
    delivery_time: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tiempo de entrega típico'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales'
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
    tableName: 'suppliers',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['name']
      },
      {
        fields: ['tax_id']
      }
    ],
    hooks: {
      beforeCreate: (supplier) => {
        if (supplier.email) {
          supplier.email = supplier.email.toLowerCase();
        }
        // Formatear website si se proporciona
        if (supplier.website && !supplier.website.startsWith('http')) {
          supplier.website = 'https://' + supplier.website;
        }
      },
      beforeUpdate: (supplier) => {
        if (supplier.email) {
          supplier.email = supplier.email.toLowerCase();
        }
        if (supplier.website && !supplier.website.startsWith('http')) {
          supplier.website = 'https://' + supplier.website;
        }
      }
    }
  });

  // Definir asociaciones
  Supplier.associate = (models) => {
    // Un proveedor tiene muchos productos
    Supplier.hasMany(models.Product, {
      foreignKey: 'supplier_id',
      as: 'products'
    });
  };

  // Métodos de instancia
  Supplier.prototype.isActive = function() {
    return this.status === 'active';
  };

  Supplier.prototype.getDisplayName = function() {
    return this.business_name || this.name;
  };

  Supplier.prototype.getContactInfo = function() {
    return {
      name: this.contact_name,
      email: this.email,
      phone: this.phone
    };
  };

  // Métodos estáticos
  Supplier.findActive = function() {
    return this.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });
  };

  Supplier.findByTaxId = function(taxId) {
    return this.findOne({
      where: { tax_id: taxId }
    });
  };

  Supplier.searchByName = function(name) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${name}%` } },
          { business_name: { [Op.like]: `%${name}%` } },
          { contact_name: { [Op.like]: `%${name}%` } }
        ],
        status: 'active'
      },
      order: [['name', 'ASC']]
    });
  };

  Supplier.findWithProductCount = function() {
    return this.findAll({
      attributes: [
        'id',
        'name',
        'business_name',
        'status',
        [sequelize.fn('COUNT', sequelize.col('products.id')), 'product_count']
      ],
      include: [{
        model: sequelize.models.Product,
        as: 'products',
        attributes: [],
        required: false
      }],
      group: ['Supplier.id'],
      order: [['name', 'ASC']]
    });
  };

  return Supplier;
};