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
    // 🆕 NUEVOS CAMPOS AGREGADOS
    website: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Sitio web del cliente'
    },
    industry: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Industria/sector'
    },
    company_size: {
      type: DataTypes.ENUM('micro', 'small', 'medium', 'large'),
      allowNull: true,
      comment: 'Tamaño de empresa'
    },
    tax_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'RUC/Tax ID adicional'
    },
    preferred_contact_method: {
      type: DataTypes.ENUM('email', 'phone', 'whatsapp'),
      defaultValue: 'email',
      comment: 'Método de contacto preferido'
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
      },
      {
        fields: ['industry']
      },
      {
        fields: ['company_size']
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
        // Formatear website si se proporciona
        if (client.website && !client.website.startsWith('http')) {
          client.website = 'https://' + client.website;
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

  Client.prototype.getPreferredContactInfo = function() {
    switch (this.preferred_contact_method) {
      case 'email': return this.email;
      case 'phone': return this.phone;
      case 'whatsapp': return this.phone;
      default: return this.email || this.phone;
    }
  };

  Client.prototype.getCompanySizeLabel = function() {
    const labels = {
      micro: 'Microempresa',
      small: 'Pequeña empresa',
      medium: 'Mediana empresa',
      large: 'Gran empresa'
    };
    return labels[this.company_size] || 'No especificado';
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

  Client.findByIndustry = function(industry) {
    return this.findAll({
      where: {
        industry,
        status: 'active'
      },
      order: [['contact_name', 'ASC']]
    });
  };

  Client.findByCompanySize = function(companySize) {
    return this.findAll({
      where: {
        company_size: companySize,
        status: 'active'
      },
      order: [['contact_name', 'ASC']]
    });
  };

  Client.getIndustriesReport = function() {
    return this.findAll({
      attributes: [
        'industry',
        [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'client_count']
      ],
      where: { status: 'active' },
      group: ['industry'],
      order: [[this.sequelize.fn('COUNT', this.sequelize.col('id')), 'DESC']]
    });
  };

  return Client;
};