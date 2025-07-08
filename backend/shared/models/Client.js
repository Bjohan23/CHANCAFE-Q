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
    assigned_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID del asesor asignado',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    document_type: {
      type: DataTypes.ENUM('DNI', 'RUC', 'passport', 'CE'),
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
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Nombre (para personas naturales)'
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Apellido (para personas naturales)'
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
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'blacklisted'),
      defaultValue: 'active',
      comment: 'Estado del cliente'
    },
    credit_limit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Límite de crédito'
    },
    payment_terms: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: 'Términos de pago en días'
    },
    contact_method: {
      type: DataTypes.ENUM('email', 'phone', 'whatsapp', 'visit'),
      defaultValue: 'email',
      comment: 'Método de contacto'
    },
    contact_preference: {
      type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'anytime'),
      defaultValue: 'anytime',
      comment: 'Preferencia de horario de contacto'
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
    // 🆕 CAMPOS PARA INTEGRACIÓN CON SENTINEL API
    credit_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Score crediticio desde Sentinel API (300-850)'
    },
    risk_classification: {
      type: DataTypes.ENUM('BAJO', 'MEDIO', 'ALTO', 'MUY_ALTO'),
      allowNull: true,
      comment: 'Clasificación de riesgo crediticio'
    },
    total_debts: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Total de deudas vigentes'
    },
    active_credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número de créditos activos'
    },
    overdue_credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número de créditos vencidos'
    },
    reporting_entities: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número de entidades reportantes'
    },
    last_credit_check: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Última consulta crediticia realizada'
    },
    sentinel_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Datos completos de Sentinel API (JSON)'
    },
    automatic_evaluation: {
      type: DataTypes.ENUM('APROBAR', 'RECHAZAR', 'REVISAR'),
      allowNull: true,
      comment: 'Evaluación automática basada en Sentinel'
    },
    evaluation_justification: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Justificación de la evaluación automática'
    },
    suggested_credit_limit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Límite de crédito sugerido por evaluación automática'
    },
    is_banked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si el cliente está bancarizado'
    },
    banking_history_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Resumen del historial bancario'
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
        fields: ['assigned_user_id']
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
      foreignKey: 'assigned_user_id',
      as: 'assignedUser',
      allowNull: true
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
    if (this.client_type === 'business') {
      return this.business_name;
    } else {
      return `${this.first_name} ${this.last_name}`.trim();
    }
  };

  Client.prototype.canRequestCredit = function() {
    return this.status === 'active' && this.credit_limit > 0;
  };

  Client.prototype.getPreferredContactInfo = function() {
    switch (this.contact_method) {
      case 'email': return this.email;
      case 'phone': return this.phone;
      case 'whatsapp': return this.phone;
      case 'visit': return this.getFullAddress();
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

  // 🆕 MÉTODOS PARA MANEJO DE DATOS CREDITICIOS
  Client.prototype.getCreditScoreLabel = function() {
    if (!this.credit_score) return 'No evaluado';
    
    if (this.credit_score >= 750) return 'Excelente';
    if (this.credit_score >= 650) return 'Bueno';
    if (this.credit_score >= 550) return 'Regular';
    if (this.credit_score >= 450) return 'Malo';
    return 'Muy malo';
  };

  Client.prototype.getRiskClassificationLabel = function() {
    const labels = {
      'BAJO': 'Riesgo Bajo',
      'MEDIO': 'Riesgo Medio',
      'ALTO': 'Riesgo Alto',
      'MUY_ALTO': 'Riesgo Muy Alto'
    };
    return labels[this.risk_classification] || 'No evaluado';
  };

  Client.prototype.getAutomaticEvaluationLabel = function() {
    const labels = {
      'APROBAR': 'Aprobar',
      'RECHAZAR': 'Rechazar',
      'REVISAR': 'Requiere Revisión'
    };
    return labels[this.automatic_evaluation] || 'No evaluado';
  };

  Client.prototype.needsCreditCheck = function() {
    if (!this.last_credit_check) return true;
    
    const daysSinceLastCheck = (Date.now() - this.last_credit_check.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastCheck > 30; // Revisar cada 30 días
  };

  Client.prototype.hasDNI = function() {
    return this.document_type === 'DNI' && this.document_number && this.document_number.length === 8;
  };

  Client.prototype.canPerformCreditCheck = function() {
    return this.hasDNI() && this.status === 'active';
  };

  Client.prototype.getSentinelSummary = function() {
    return {
      dni: this.document_number,
      creditScore: this.credit_score,
      riskClassification: this.risk_classification,
      totalDebts: this.total_debts,
      activeCredits: this.active_credits,
      overdueCredits: this.overdue_credits,
      automaticEvaluation: this.automatic_evaluation,
      suggestedCreditLimit: this.suggested_credit_limit,
      isBanked: this.is_banked,
      lastCheck: this.last_credit_check
    };
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
      where: { assigned_user_id: advisorId },
      order: [['first_name', 'ASC'], ['last_name', 'ASC'], ['business_name', 'ASC']],
      include: ['assignedUser']
    });
  };

  Client.findActiveClients = function() {
    return this.findAll({
      where: { status: 'active' },
      order: [['first_name', 'ASC'], ['last_name', 'ASC'], ['business_name', 'ASC']]
    });
  };

  Client.searchByName = function(name) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.like]: `%${name}%` } },
          { last_name: { [Op.like]: `%${name}%` } },
          { business_name: { [Op.like]: `%${name}%` } }
        ],
        status: 'active'
      },
      order: [['first_name', 'ASC'], ['last_name', 'ASC'], ['business_name', 'ASC']]
    });
  };

  Client.findByIndustry = function(industry) {
    return this.findAll({
      where: {
        industry,
        status: 'active'
      },
      order: [['first_name', 'ASC'], ['last_name', 'ASC'], ['business_name', 'ASC']]
    });
  };

  Client.findByCompanySize = function(companySize) {
    return this.findAll({
      where: {
        company_size: companySize,
        status: 'active'
      },
      order: [['first_name', 'ASC'], ['last_name', 'ASC'], ['business_name', 'ASC']]
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

  // 🆕 MÉTODOS ESTÁTICOS PARA DATOS CREDITICIOS
  Client.findByDNI = function(dni) {
    return this.findOne({
      where: {
        document_type: 'DNI',
        document_number: dni.replace(/\D/g, '')
      }
    });
  };

  Client.findByCreditScore = function(minScore, maxScore) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        credit_score: {
          [Op.between]: [minScore, maxScore]
        },
        status: 'active'
      },
      order: [['credit_score', 'DESC']]
    });
  };

  Client.findByRiskClassification = function(riskClass) {
    return this.findAll({
      where: {
        risk_classification: riskClass,
        status: 'active'
      },
      order: [['credit_score', 'DESC']]
    });
  };

  Client.findByAutomaticEvaluation = function(evaluation) {
    return this.findAll({
      where: {
        automatic_evaluation: evaluation,
        status: 'active'
      },
      order: [['credit_score', 'DESC']]
    });
  };

  Client.findBankedClients = function() {
    return this.findAll({
      where: {
        is_banked: true,
        status: 'active'
      },
      order: [['credit_score', 'DESC']]
    });
  };

  Client.findNeedingCreditCheck = function() {
    const { Op } = require('sequelize');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return this.findAll({
      where: {
        document_type: 'DNI',
        status: 'active',
        [Op.or]: [
          { last_credit_check: null },
          { last_credit_check: { [Op.lt]: thirtyDaysAgo } }
        ]
      },
      order: [['last_credit_check', 'ASC']]
    });
  };

  Client.getCreditReport = function() {
    return this.findAll({
      attributes: [
        'risk_classification',
        [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'client_count'],
        [this.sequelize.fn('AVG', this.sequelize.col('credit_score')), 'avg_credit_score'],
        [this.sequelize.fn('SUM', this.sequelize.col('total_debts')), 'total_debts_sum']
      ],
      where: { 
        status: 'active',
        credit_score: { [this.sequelize.Op.ne]: null }
      },
      group: ['risk_classification'],
      order: [[this.sequelize.fn('COUNT', this.sequelize.col('id')), 'DESC']]
    });
  };

  Client.getHighRiskClients = function() {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { risk_classification: 'ALTO' },
          { risk_classification: 'MUY_ALTO' },
          { credit_score: { [Op.lt]: 450 } }
        ]
      },
      order: [['credit_score', 'ASC']]
    });
  };

  return Client;
};