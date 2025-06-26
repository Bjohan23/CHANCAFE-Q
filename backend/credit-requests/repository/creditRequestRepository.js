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
        order: [['created_at', 'DESC']]
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
      
      const [totalRequests, pendingRequests, approvedRequests, rejectedRequests, byStatus] = await Promise.all([
        CreditRequest.count(),
        CreditRequest.count({ where: { status: 'pending' } }),
        CreditRequest.count({ where: { status: 'approved' } }),
        CreditRequest.count({ where: { status: 'rejected' } }),
        CreditRequest.findAll({
          attributes: [
            'status',
            [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'count'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested'],
            [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('approved_amount')), 'total_approved']
          ],
          group: ['status']
        })
      ]);

      const statusStats = byStatus.reduce((acc, item) => {
        acc[item.status] = {
          count: parseInt(item.dataValues.count),
          totalRequested: parseFloat(item.dataValues.total_requested) || 0,
          totalApproved: parseFloat(item.dataValues.total_approved) || 0
        };
        return acc;
      }, {});

      return {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        byStatus: statusStats
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