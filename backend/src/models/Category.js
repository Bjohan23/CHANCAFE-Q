const { DataTypes } = require('sequelize');

/**
 * Modelo de Categoría de Productos
 * Permite organizar productos en categorías y subcategorías
 */
module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre de la categoría'
    },
    description: {
      type: DataTypes.TEXT,
      comment: 'Descripción de la categoría'
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de categoría padre (para subcategorías)',
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    image_url: {
      type: DataTypes.STRING(255),
      comment: 'URL de imagen de la categoría'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: 'Estado de la categoría'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Orden de visualización'
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
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['parent_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['sort_order']
      }
    ]
  });

  // Definir asociaciones
  Category.associate = (models) => {
    // Una categoría puede tener una categoría padre
    Category.belongsTo(Category, {
      foreignKey: 'parent_id',
      as: 'parent'
    });

    // Una categoría puede tener muchas subcategorías
    Category.hasMany(Category, {
      foreignKey: 'parent_id',
      as: 'subcategories'
    });

    // Una categoría tiene muchos productos
    Category.hasMany(models.Product, {
      foreignKey: 'category_id',
      as: 'products'
    });
  };

  // Métodos de instancia
  Category.prototype.isActive = function() {
    return this.status === 'active';
  };

  Category.prototype.hasParent = function() {
    return this.parent_id !== null;
  };

  Category.prototype.isParentCategory = function() {
    return this.parent_id === null;
  };

  // Métodos estáticos
  Category.findActiveCategories = function() {
    return this.findAll({
      where: { status: 'active' },
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });
  };

  Category.findParentCategories = function() {
    return this.findAll({
      where: {
        parent_id: null,
        status: 'active'
      },
      include: [{
        model: Category,
        as: 'subcategories',
        where: { status: 'active' },
        required: false
      }],
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });
  };

  Category.findWithProducts = function() {
    return this.findAll({
      where: { status: 'active' },
      include: [{
        model: this.sequelize.models.Product,
        as: 'products',
        where: { status: 'active' },
        required: false
      }],
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });
  };

  return Category;
};