const { DataTypes } = require('sequelize');

/**
 * Modelo de Cliente
 * Representa a los clientes atendidos por los asesores
 */
module.exports = (sequelize) => {
  const Client = sequelize.define('Client', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del asesor asignado',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    document_type: {
      type: DataTypes.ENUM('dni', 'ruc', 'passport', 'ce'),
      allowNull: false,
      comment: 'Tipo de documento'
    },
    document_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Número de documento'
    },
    business_name: {
      type: DataTypes.STRING(150),
      comment: 'Razón social (para empresas)'
    },
    contact_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del contacto'
    },
    email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true
      },
      comment: 'Email del cliente'
    },
    phone: {
      type: DataTypes.STRING(15),
      comment: 'Teléfono principal'
    },
    phone_secondary: {
      type: DataTypes.STRING(15),
      comment: 'Teléfono secundario'
    },
    address: {
      type: DataTypes.TEXT,
      comment: 'Dirección completa'
    },
    district: {
      type: DataTypes.STRING(50),
      comment: 'Distrito'
    },
    province: {
      type: DataTypes.STRING(50),
      comment: 'Provincia'
    },
    department: {
      type: DataTypes.STRING(50),
      comment: 'Departamento'
    },
    postal_code: {
      type: DataTypes.STRING(10),
      comment: 'Código postal'
    },
    client_type: {
      type: DataTypes.ENUM('individual', 'business'),
      allowNull: false,
      defaultValue: 'individual',
      comment: 'Tipo de cliente'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blacklist'),
      defaultValue: 'active',
      comment: 'Estado del cliente'
    },
    credit_limit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Límite de crédito'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Notas adicionales del cliente'
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
    tableName: 'clients',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['document_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['client_type']
      },
      {
        unique: true,
        fields: ['document_type', 'document_number']
      }
    ],
    hooks: {
      beforeCreate: (client) => {
        if (client.email) {
          client.email = client.email.toLowerCase();
        }
        // Limpiar y formatear el número de documento
        if (client.document_number) {
          client.document_number = client.document_number.replace(/\D/g, '');
        }
      },
      beforeUpdate: (client) => {
        if (client.email) {
          client.email = client.email.toLowerCase();
        }
        if (client.document_number) {
          client.document_number = client.document_number.replace(/\D/g, '');
        }
      }
    }
  });

  // Definir asociaciones
  Client.associate = (models) => {
    // Un cliente pertenece a un usuario (asesor)
    Client.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'advisor'
    });

    // Un cliente tiene muchas cotizaciones
    Client.hasMany(models.Quote, {
      foreignKey: 'client_id',
      as: 'quotes'
    });

    // Un cliente tiene muchas solicitudes de crédito
    Client.hasMany(models.CreditRequest, {
      foreignKey: 'client_id',
      as: 'creditRequests'
    });
  };

  // Métodos de instancia
  Client.prototype.getFullAddress = function() {
    const parts = [this.address, this.district, this.province, this.department].filter(Boolean);
    return parts.join(', ');
  };

  Client.prototype.isActive = function() {
    return this.status === 'active';
  };

  Client.prototype.isBusiness = function() {
    return this.client_type === 'business';
  };

  Client.prototype.getDisplayName = function() {
    return this.business_name || this.contact_name;
  };

  Client.prototype.canRequestCredit = function() {
    return this.status === 'active' && this.credit_limit > 0;
  };

  // Métodos estáticos
  Client.findByDocument = function(documentType, documentNumber) {
    return this.findOne({
      where: {
        document_type: documentType,
        document_number: documentNumber.replace(/\D/g, '')
      }
    });
  };

  Client.findByAdvisor = function(advisorId) {
    return this.findAll({
      where: { user_id: advisorId },
      order: [['contact_name', 'ASC']],
      include: ['advisor']
    });
  };

  Client.findActiveClients = function() {
    return this.findAll({
      where: { status: 'active' },
      order: [['contact_name', 'ASC']]
    });
  };

  Client.searchByName = function(name) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        [Op.or]: [
          { contact_name: { [Op.like]: `%${name}%` } },
          { business_name: { [Op.like]: `%${name}%` } }
        ],
        status: 'active'
      },
      order: [['contact_name', 'ASC']]
    });
  };

  return Client;
};