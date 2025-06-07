const { DataTypes } = require('sequelize');

/**
 * Modelo de Producto
 * Representa los productos disponibles en el catálogo
 */
module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID de la categoría',
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Código único del producto'
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nombre del producto'
    },
    description: {
      type: DataTypes.TEXT,
      comment: 'Descripción detallada'
    },
    short_description: {
      type: DataTypes.STRING(255),
      comment: 'Descripción corta'
    },
    brand: {
      type: DataTypes.STRING(50),
      comment: 'Marca del producto'
    },
    model: {
      type: DataTypes.STRING(50),
      comment: 'Modelo del producto'
    },
    unit_type: {
      type: DataTypes.ENUM('unit', 'kg', 'lt', 'mt', 'pack', 'box'),
      defaultValue: 'unit',
      comment: 'Tipo de unidad'
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Precio unitario'
    },
    cost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Costo del producto'
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Cantidad en stock'
    },
    min_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Stock mínimo'
    },
    max_discount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Descuento máximo permitido (%)'
    },
    image_url: {
      type: DataTypes.STRING(255),
      comment: 'URL de imagen principal'
    },
    gallery_urls: {
      type: DataTypes.JSON,
      comment: 'URLs de galería de imágenes'
    },
    specifications: {
      type: DataTypes.JSON,
      comment: 'Especificaciones técnicas'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
      defaultValue: 'active',
      comment: 'Estado del producto'
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Producto destacado'
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      comment: 'Peso del producto (kg)'
    },
    dimensions: {
      type: DataTypes.STRING(50),
      comment: 'Dimensiones (largo x ancho x alto)'
    },
    warranty_months: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Meses de garantía'
    },
    // 🆕 NUEVOS CAMPOS AGREGADOS
    is_digital: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Producto digital/físico'
    },
    tax_exempt: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Exento de impuestos'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Usuario que creó el producto',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Código de barras'
    },
    supplier_sku: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'SKU del proveedor'
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Proveedor principal',
      references: {
        model: 'suppliers',
        key: 'id'
      }
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
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['category_id']
      },
      {
        fields: ['sku']
      },
      {
        fields: ['status']
      },
      {
        fields: ['featured']
      },
      {
        fields: ['brand']
      },
      {
        fields: ['barcode']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['supplier_id']
      }
    ]
  });

  // Definir asociaciones
  Product.associate = (models) => {
    // Un producto pertenece a una categoría
    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });

    // Un producto aparece en muchos items de cotización
    Product.hasMany(models.QuoteItem, {
      foreignKey: 'product_id',
      as: 'quoteItems'
    });

    // Un producto puede tener un usuario creador
    Product.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    // Un producto puede tener un proveedor
    Product.belongsTo(models.Supplier, {
      foreignKey: 'supplier_id',
      as: 'supplier'
    });

    // Un producto puede estar en múltiples categorías (muchos a muchos)
    Product.belongsToMany(models.Category, {
      through: models.ProductCategories,
      foreignKey: 'product_id',
      otherKey: 'category_id',
      as: 'categories'
    });
  };

  // Métodos de instancia
  Product.prototype.isActive = function() {
    return this.status === 'active';
  };

  Product.prototype.isInStock = function() {
    return this.stock_quantity > 0;
  };

  Product.prototype.needsRestock = function() {
    return this.stock_quantity <= this.min_stock;
  };

  Product.prototype.isFeatured = function() {
    return this.featured === true;
  };

  Product.prototype.calculateDiscountedPrice = function(discountPercentage = 0) {
    const maxDiscount = Math.min(discountPercentage, this.max_discount);
    const discountAmount = (this.price * maxDiscount) / 100;
    return this.price - discountAmount;
  };

  Product.prototype.getMarginPercentage = function() {
    if (this.cost <= 0) return 0;
    return ((this.price - this.cost) / this.cost) * 100;
  };

  // Métodos estáticos
  Product.findBySku = function(sku) {
    return this.findOne({
      where: { sku },
      include: ['category', 'creator', 'supplier']
    });
  };

  Product.findByBarcode = function(barcode) {
    return this.findOne({
      where: { barcode },
      include: ['category', 'creator', 'supplier']
    });
  };

  Product.findActiveProducts = function() {
    return this.findAll({
      where: { status: 'active' },
      include: ['category', 'supplier'],
      order: [['name', 'ASC']]
    });
  };

  Product.findFeaturedProducts = function() {
    return this.findAll({
      where: {
        status: 'active',
        featured: true
      },
      include: ['category'],
      order: [['name', 'ASC']]
    });
  };

  Product.findByCategory = function(categoryId) {
    return this.findAll({
      where: {
        category_id: categoryId,
        status: 'active'
      },
      include: ['category', 'supplier'],
      order: [['name', 'ASC']]
    });
  };

  Product.findBySupplier = function(supplierId) {
    return this.findAll({
      where: {
        supplier_id: supplierId,
        status: 'active'
      },
      include: ['category', 'supplier'],
      order: [['name', 'ASC']]
    });
  };

  Product.searchProducts = function(searchTerm) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } },
          { brand: { [Op.like]: `%${searchTerm}%` } },
          { model: { [Op.like]: `%${searchTerm}%` } },
          { sku: { [Op.like]: `%${searchTerm}%` } },
          { barcode: { [Op.like]: `%${searchTerm}%` } },
          { supplier_sku: { [Op.like]: `%${searchTerm}%` } }
        ]
      },
      include: ['category'],
      order: [['name', 'ASC']]
    });
  };

  Product.findLowStockProducts = function() {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        status: 'active',
        stock_quantity: {
          [Op.lte]: sequelize.col('min_stock')
        }
      },
      include: ['category'],
      order: [['stock_quantity', 'ASC']]
    });
  };

  return Product;
};