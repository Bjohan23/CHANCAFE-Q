const { Op } = require('sequelize');

function getCreditRequestModel() {
  try {
    try {
      const { getModel } = require('../../shared/models/index');
      const CreditRequest = getModel('CreditRequest');
      if (CreditRequest) {
        console.log('✅ Modelo CreditRequest obtenido desde shared/models');
        return CreditRequest;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener CreditRequest desde shared/models:', error.message);
    }

    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (sequelize && sequelize.models && sequelize.models.CreditRequest) {
        console.log('✅ Modelo CreditRequest obtenido desde sequelize.models');
        return sequelize.models.CreditRequest;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener CreditRequest desde sequelize.models:', error.message);
    }

    throw new Error('Modelo CreditRequest no está disponible');
  } catch (error) {
    console.error('❌ Error al obtener modelo CreditRequest:', error.message);
    throw error;
  }
}

class CreditRequestRepository {
  
  async create(creditRequestData) {
    try {
      const CreditRequest = getCreditRequestModel();
      const newCreditRequest = await CreditRequest.create(creditRequestData);
      return newCreditRequest;
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.create:', error.message);
      throw error;
    }
  }

  async findById(id, options = {}) {
    try {
      const CreditRequest = getCreditRequestModel();
      const creditRequest = await CreditRequest.findByPk(id, {
        include: [
          { 
            association: 'client',
            attributes: ['id', 'first_name', 'last_name', 'business_name', 
                        'email', 'phone', 'phone_secondary', 'address', 
                        'document_type', 'document_number', 'client_type',
                        'credit_score', 'risk_classification', 'suggested_credit_limit',
                        'is_banked', 'tax_id', 'status', 'created_at']
          },
          { 
            association: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role']
          }
        ],
        ...options
      });
      return creditRequest;
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findById:', error.message);
      throw error;
    }
  }

  async findByRequestNumber(requestNumber, options = {}) {
    try {
      const CreditRequest = getCreditRequestModel();
      const creditRequest = await CreditRequest.findOne({
        where: { request_number: requestNumber },
        ...options
      });
      return creditRequest;
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findByRequestNumber:', error.message);
      throw error;
    }
  }

  async findAll(filters = {}, options = {}) {
    try {
      const CreditRequest = getCreditRequestModel();
      const queryOptions = {
        where: {},
        order: [['created_at', 'DESC']],
        include: [
          { 
            association: 'client',
            attributes: ['id', 'first_name', 'last_name', 'business_name', 
                        'email', 'phone', 'phone_secondary', 'address', 
                        'document_type', 'document_number', 'client_type',
                        'credit_score', 'risk_classification', 'suggested_credit_limit',
                        'is_banked', 'tax_id', 'status', 'created_at']
          },
          { 
            association: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role']
          }
        ],
        ...options
      };

      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.clientId) {
        queryOptions.where.client_id = filters.clientId;
      }
      if (filters.userId) {
        queryOptions.where.user_id = filters.userId;
      }
      if (filters.approvedBy) {
        queryOptions.where.approved_by = filters.approvedBy;
      }
      if (filters.priority) {
        queryOptions.where.priority = filters.priority;
      }
      if (filters.currency) {
        queryOptions.where.currency = filters.currency;
      }
      if (filters.minAmount) {
        queryOptions.where.requested_amount = {
          ...queryOptions.where.requested_amount,
          [Op.gte]: filters.minAmount
        };
      }
      if (filters.maxAmount) {
        queryOptions.where.requested_amount = {
          ...queryOptions.where.requested_amount,
          [Op.lte]: filters.maxAmount
        };
      }
      if (filters.dateFrom) {
        queryOptions.where.created_at = {
          ...queryOptions.where.created_at,
          [Op.gte]: new Date(filters.dateFrom)
        };
      }
      if (filters.dateTo) {
        queryOptions.where.created_at = {
          ...queryOptions.where.created_at,
          [Op.lte]: new Date(filters.dateTo)
        };
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { request_number: { [Op.like]: `%${filters.search}%` } },
          { purpose: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const creditRequests = await CreditRequest.findAll(queryOptions);
      return creditRequests;
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findAll:', error.message);
      throw error;
    }
  }

  async findAndCountAll(filters = {}, pagination = {}) {
    try {
      const CreditRequest = getCreditRequestModel();
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const queryOptions = {
        where: {},
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [
          { association: 'client' },
          { association: 'user' }
        ]
      };

      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.clientId) {
        queryOptions.where.client_id = filters.clientId;
      }
      if (filters.userId) {
        queryOptions.where.user_id = filters.userId;
      }
      if (filters.approvedBy) {
        queryOptions.where.approved_by = filters.approvedBy;
      }
      if (filters.priority) {
        queryOptions.where.priority = filters.priority;
      }
      if (filters.currency) {
        queryOptions.where.currency = filters.currency;
      }
      if (filters.minAmount) {
        queryOptions.where.requested_amount = {
          ...queryOptions.where.requested_amount,
          [Op.gte]: filters.minAmount
        };
      }
      if (filters.maxAmount) {
        queryOptions.where.requested_amount = {
          ...queryOptions.where.requested_amount,
          [Op.lte]: filters.maxAmount
        };
      }
      if (filters.dateFrom) {
        queryOptions.where.created_at = {
          ...queryOptions.where.created_at,
          [Op.gte]: new Date(filters.dateFrom)
        };
      }
      if (filters.dateTo) {
        queryOptions.where.created_at = {
          ...queryOptions.where.created_at,
          [Op.lte]: new Date(filters.dateTo)
        };
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { request_number: { [Op.like]: `%${filters.search}%` } },
          { purpose: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const result = await CreditRequest.findAndCountAll(queryOptions);
      
      return {
        creditRequests: result.rows,
        totalCount: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      };
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findAndCountAll:', error.message);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const CreditRequest = getCreditRequestModel();
      const [updatedRowsCount] = await CreditRequest.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        return null;
      }

      const updatedCreditRequest = await this.findById(id);
      return updatedCreditRequest;
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.update:', error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const CreditRequest = getCreditRequestModel();
      const deletedRowsCount = await CreditRequest.destroy({
        where: { id }
      });
      return deletedRowsCount > 0;
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.delete:', error.message);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      return await this.findAll({ status }, options);
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findByStatus:', error.message);
      throw error;
    }
  }

  async findByClient(clientId, options = {}) {
    try {
      return await this.findAll({ clientId }, options);
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findByClient:', error.message);
      throw error;
    }
  }

  async findByUser(userId, options = {}) {
    try {
      return await this.findAll({ userId }, options);
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findByUser:', error.message);
      throw error;
    }
  }

  async findByPriority(priority, options = {}) {
    try {
      return await this.findAll({ priority }, options);
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findByPriority:', error.message);
      throw error;
    }
  }

  async changeStatus(id, status) {
    try {
      const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'cancelled', 'expired'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado inválido: ${status}. Estados válidos: ${validStatuses.join(', ')}`);
      }
      return await this.update(id, { status });
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.changeStatus:', error.message);
      throw error;
    }
  }

  async approve(id, approvalData) {
    try {
      const updateData = {
        status: 'approved',
        approved_amount: approvalData.approvedAmount,
        approved_terms: approvalData.approvedTerms,
        approval_conditions: approvalData.approvalConditions,
        approved_by: approvalData.approvedBy,
        approved_at: new Date(),
        expires_at: approvalData.expiresAt,
        notes: approvalData.notes
      };
      return await this.update(id, updateData);
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.approve:', error.message);
      throw error;
    }
  }

  async reject(id, rejectionData) {
    try {
      const updateData = {
        status: 'rejected',
        rejection_reason: rejectionData.rejectionReason,
        approved_by: rejectionData.rejectedBy,
        approved_at: new Date(),
        notes: rejectionData.notes
      };
      return await this.update(id, updateData);
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.reject:', error.message);
      throw error;
    }
  }

  async getCreditRequestStats() {
    try {
      const CreditRequest = getCreditRequestModel();
      const { Op } = require('sequelize');
      
      // Fechas para análisis temporal
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const last7Days = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

      const [
        totalRequests, 
        pendingRequests, 
        approvedRequests, 
        rejectedRequests, 
        reviewRequests,
        byStatus,
        byPriority,
        byCurrency,
        byRiskAssessment,
        monthlyStats,
        yearlyStats,
        last30DaysStats,
        last7DaysStats,
        averageStats,
        topClients,
        expiringRequests
      ] = await Promise.all([
        // Conteos básicos
        CreditRequest.count(),
        CreditRequest.count({ where: { status: 'pending' } }),
        CreditRequest.count({ where: { status: 'approved' } }),
        CreditRequest.count({ where: { status: 'rejected' } }),
        CreditRequest.count({ where: { status: 'under_review' } }),
        
        // Estadísticas por status
        CreditRequest.findAll({
          attributes: [
            'status',
            [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'count'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('approved_amount')), 'total_approved'],
            [CreditRequest.sequelize.fn('AVG', CreditRequest.sequelize.col('requested_amount')), 'avg_requested'],
            [CreditRequest.sequelize.fn('MAX', CreditRequest.sequelize.col('requested_amount')), 'max_requested'],
            [CreditRequest.sequelize.fn('MIN', CreditRequest.sequelize.col('requested_amount')), 'min_requested']
          ],
          group: ['status']
        }),
        
        // Estadísticas por prioridad
        CreditRequest.findAll({
          attributes: [
            'priority',
            [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'count'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested']
          ],
          group: ['priority']
        }),
        
        // Estadísticas por moneda
        CreditRequest.findAll({
          attributes: [
            'currency',
            [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'count'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested']
          ],
          group: ['currency']
        }),
        
        // Estadísticas por evaluación de riesgo
        CreditRequest.findAll({
          attributes: [
            'risk_assessment',
            [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'count'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested']
          ],
          where: {
            risk_assessment: { [Op.not]: null }
          },
          group: ['risk_assessment']
        }),
        
        // Estadísticas del mes actual
        CreditRequest.findAll({
          attributes: [
            [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'count'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('approved_amount')), 'total_approved']
          ],
          where: {
            created_at: { [Op.gte]: startOfMonth }
          }
        }),
        
        // Estadísticas del año actual
        CreditRequest.findAll({
          attributes: [
            [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'count'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('approved_amount')), 'total_approved']
          ],
          where: {
            created_at: { [Op.gte]: startOfYear }
          }
        }),
        
        // Estadísticas últimos 30 días
        CreditRequest.findAll({
          attributes: [
            [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'count'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('approved_amount')), 'total_approved']
          ],
          where: {
            created_at: { [Op.gte]: last30Days }
          }
        }),
        
        // Estadísticas últimos 7 días
        CreditRequest.findAll({
          attributes: [
            [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'count'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('approved_amount')), 'total_approved']
          ],
          where: {
            created_at: { [Op.gte]: last7Days }
          }
        }),
        
        // Promedios generales
        CreditRequest.findAll({
          attributes: [
            [CreditRequest.sequelize.fn('AVG', CreditRequest.sequelize.col('requested_amount')), 'avg_requested'],
            [CreditRequest.sequelize.fn('AVG', CreditRequest.sequelize.col('approved_amount')), 'avg_approved'],
            [CreditRequest.sequelize.fn('MAX', CreditRequest.sequelize.col('requested_amount')), 'max_requested'],
            [CreditRequest.sequelize.fn('MIN', CreditRequest.sequelize.col('requested_amount')), 'min_requested'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('approved_amount')), 'total_approved']
          ]
        }),
        
        // Top 10 clientes con más solicitudes
        CreditRequest.findAll({
          attributes: [
            'client_id',
            [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'request_count'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('approved_amount')), 'total_approved']
          ],
          group: ['client_id'],
          order: [[CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'DESC']],
          limit: 10
        }),
        
        // Solicitudes próximas a expirar (próximos 7 días)
        CreditRequest.count({
          where: {
            status: 'pending',
            expires_at: {
              [Op.between]: [now, new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))]
            }
          }
        })
      ]);

      // Procesar estadísticas por status
      const statusStats = byStatus.reduce((acc, item) => {
        acc[item.status] = {
          count: parseInt(item.dataValues.count),
          totalRequested: parseFloat(item.dataValues.total_requested) || 0,
          totalApproved: parseFloat(item.dataValues.total_approved) || 0,
          avgRequested: parseFloat(item.dataValues.avg_requested) || 0,
          maxRequested: parseFloat(item.dataValues.max_requested) || 0,
          minRequested: parseFloat(item.dataValues.min_requested) || 0
        };
        return acc;
      }, {});

      // Procesar estadísticas por prioridad
      const priorityStats = byPriority.reduce((acc, item) => {
        acc[item.priority || 'no_priority'] = {
          count: parseInt(item.dataValues.count),
          totalRequested: parseFloat(item.dataValues.total_requested) || 0
        };
        return acc;
      }, {});

      // Procesar estadísticas por moneda
      const currencyStats = byCurrency.reduce((acc, item) => {
        acc[item.currency || 'PEN'] = {
          count: parseInt(item.dataValues.count),
          totalRequested: parseFloat(item.dataValues.total_requested) || 0
        };
        return acc;
      }, {});

      // Procesar estadísticas por evaluación de riesgo
      const riskStats = byRiskAssessment.reduce((acc, item) => {
        acc[item.risk_assessment] = {
          count: parseInt(item.dataValues.count),
          totalRequested: parseFloat(item.dataValues.total_requested) || 0
        };
        return acc;
      }, {});

      // Procesar datos de períodos
      const monthlyData = monthlyStats[0]?.dataValues || { count: 0, total_requested: 0, total_approved: 0 };
      const yearlyData = yearlyStats[0]?.dataValues || { count: 0, total_requested: 0, total_approved: 0 };
      const last30DaysData = last30DaysStats[0]?.dataValues || { count: 0, total_requested: 0, total_approved: 0 };
      const last7DaysData = last7DaysStats[0]?.dataValues || { count: 0, total_requested: 0, total_approved: 0 };
      const averageData = averageStats[0]?.dataValues || {};

      // Procesar top clientes
      const topClientsData = topClients.map(item => ({
        clientId: item.client_id,
        requestCount: parseInt(item.dataValues.request_count),
        totalRequested: parseFloat(item.dataValues.total_requested) || 0,
        totalApproved: parseFloat(item.dataValues.total_approved) || 0
      }));

      // Calcular tasas de aprobación
      const approvalRate = totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(2) : 0;
      const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(2) : 0;
      const pendingRate = totalRequests > 0 ? ((pendingRequests / totalRequests) * 100).toFixed(2) : 0;

      return {
        overview: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests,
          underReview: reviewRequests,
          expiringInWeek: expiringRequests
        },
        rates: {
          approvalRate: parseFloat(approvalRate),
          rejectionRate: parseFloat(rejectionRate),
          pendingRate: parseFloat(pendingRate)
        },
        amounts: {
          totalRequested: parseFloat(averageData.total_requested) || 0,
          totalApproved: parseFloat(averageData.total_approved) || 0,
          averageRequested: parseFloat(averageData.avg_requested) || 0,
          averageApproved: parseFloat(averageData.avg_approved) || 0,
          maxRequested: parseFloat(averageData.max_requested) || 0,
          minRequested: parseFloat(averageData.min_requested) || 0
        },
        periods: {
          thisMonth: {
            count: parseInt(monthlyData.count) || 0,
            totalRequested: parseFloat(monthlyData.total_requested) || 0,
            totalApproved: parseFloat(monthlyData.total_approved) || 0
          },
          thisYear: {
            count: parseInt(yearlyData.count) || 0,
            totalRequested: parseFloat(yearlyData.total_requested) || 0,
            totalApproved: parseFloat(yearlyData.total_approved) || 0
          },
          last30Days: {
            count: parseInt(last30DaysData.count) || 0,
            totalRequested: parseFloat(last30DaysData.total_requested) || 0,
            totalApproved: parseFloat(last30DaysData.total_approved) || 0
          },
          last7Days: {
            count: parseInt(last7DaysData.count) || 0,
            totalRequested: parseFloat(last7DaysData.total_requested) || 0,
            totalApproved: parseFloat(last7DaysData.total_approved) || 0
          }
        },
        byStatus: statusStats,
        byPriority: priorityStats,
        byCurrency: currencyStats,
        byRiskAssessment: riskStats,
        topClients: topClientsData,
        alerts: {
          expiringInWeek: expiringRequests,
          pendingRequests: pendingRequests,
          highPriorityPending: statusStats.pending?.count || 0
        },
        // Mantener compatibilidad con la estructura anterior
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests
      };
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.getCreditRequestStats:', error.message);
      throw error;
    }
  }

  async findWithRelations(id, relations = []) {
    try {
      const CreditRequest = getCreditRequestModel();
      const include = [];

      const availableRelations = {
        client: 'client',
        user: 'user',
        approver: 'approver'
      };

      relations.forEach(relation => {
        if (availableRelations[relation]) {
          try {
            include.push({ association: availableRelations[relation] });
          } catch (error) {
            console.warn(`⚠️  Relación ${relation} no disponible`);
          }
        }
      });

      const creditRequest = await CreditRequest.findByPk(id, { include });
      return creditRequest;
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findWithRelations:', error.message);
      throw error;
    }
  }

  async generateRequestNumber(year = new Date().getFullYear()) {
    try {
      const CreditRequest = getCreditRequestModel();
      const lastRequest = await CreditRequest.findOne({
        where: {
          request_number: {
            [Op.like]: `CR-${year}-%`
          }
        },
        order: [['request_number', 'DESC']]
      });

      let nextNumber = 1;
      if (lastRequest) {
        const lastNumber = lastRequest.request_number.split('-')[2];
        nextNumber = parseInt(lastNumber) + 1;
      }

      return `CR-${year}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.generateRequestNumber:', error.message);
      throw error;
    }
  }

  async findExpiring(days = 7) {
    try {
      const CreditRequest = getCreditRequestModel();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);

      const expiringRequests = await CreditRequest.findAll({
        where: {
          status: 'approved',
          expires_at: {
            [Op.lte]: expirationDate
          }
        },
        order: [['expires_at', 'ASC']]
      });

      return expiringRequests;
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findExpiring:', error.message);
      throw error;
    }
  }

  async findExpired() {
    try {
      const CreditRequest = getCreditRequestModel();
      const now = new Date();

      const expiredRequests = await CreditRequest.findAll({
        where: {
          status: 'approved',
          expires_at: {
            [Op.lt]: now
          }
        },
        order: [['expires_at', 'ASC']]
      });

      return expiredRequests;
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.findExpired:', error.message);
      throw error;
    }
  }

  async markAsExpired(id) {
    try {
      return await this.update(id, { status: 'expired' });
    } catch (error) {
      console.error('❌ Error en CreditRequestRepository.markAsExpired:', error.message);
      throw error;
    }
  }
}

module.exports = new CreditRequestRepository();