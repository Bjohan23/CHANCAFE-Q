const { DataTypes } = require('sequelize');

/**
 * Modelo de Relación Producto-Categorías
 * Tabla intermedia para la relación muchos a muchos entre productos y categorías
 */
module.exports = (sequelize) => {
  const ProductCategories = sequelize.define('ProductCategories', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID de la categoría',
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Categoría principal del producto'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'product_categories',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['product_id']
      },
      {
        fields: ['category_id']
      },
      {
        fields: ['is_primary']
      },
      {
        unique: true,
        fields: ['product_id', 'category_id']
      }
    ],
    hooks: {
      beforeCreate: async (productCategory) => {
        // Si se marca como primaria, desmarcar otras primarias del mismo producto
        if (productCategory.is_primary) {
          await ProductCategories.update(
            { is_primary: false },
            { 
              where: { 
                product_id: productCategory.product_id,
                is_primary: true 
              } 
            }
          );
        }
      },
      beforeUpdate: async (productCategory) => {
        if (productCategory.is_primary) {
          await ProductCategories.update(
            { is_primary: false },
            { 
              where: { 
                product_id: productCategory.product_id,
                is_primary: true,
                id: { [sequelize.Sequelize.Op.ne]: productCategory.id }
              } 
            }
          );
        }
      }
    }
  });

  // Definir asociaciones
  ProductCategories.associate = (models) => {
    // Relación con Product
    ProductCategories.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });

    // Relación con Category
    ProductCategories.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
  };

  // Métodos estáticos
  ProductCategories.findByProduct = function(productId) {
    return this.findAll({
      where: { product_id: productId },
      include: ['category'],
      order: [['is_primary', 'DESC'], ['created_at', 'ASC']]
    });
  };

  ProductCategories.findByCategory = function(categoryId) {
    return this.findAll({
      where: { category_id: categoryId },
      include: ['product'],
      order: [['created_at', 'DESC']]
    });
  };

  ProductCategories.findPrimaryCategory = function(productId) {
    return this.findOne({
      where: { 
        product_id: productId,
        is_primary: true 
      },
      include: ['category']
    });
  };

  ProductCategories.setPrimaryCategory = async function(productId, categoryId) {
    // Buscar si ya existe la relación
    let productCategory = await this.findOne({
      where: { product_id: productId, category_id: categoryId }
    });

    if (!productCategory) {
      // Crear nueva relación
      productCategory = await this.create({
        product_id: productId,
        category_id: categoryId,
        is_primary: true
      });
    } else {
      // Actualizar la existente como primaria
      await productCategory.update({ is_primary: true });
    }

    return productCategory;
  };

  ProductCategories.addProductToCategory = async function(productId, categoryId, isPrimary = false) {
    // Verificar si ya existe la relación
    const existing = await this.findOne({
      where: { product_id: productId, category_id: categoryId }
    });

    if (existing) {
      throw new Error('El producto ya está asignado a esta categoría');
    }

    return this.create({
      product_id: productId,
      category_id: categoryId,
      is_primary: isPrimary
    });
  };

  ProductCategories.removeProductFromCategory = function(productId, categoryId) {
    return this.destroy({
      where: { product_id: productId, category_id: categoryId }
    });
  };

  return ProductCategories;
};