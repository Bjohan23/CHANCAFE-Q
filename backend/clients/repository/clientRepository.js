const { Op } = require('sequelize');

function getClientModel() {
  try {
    try {
      const { getModel } = require('../../shared/models/index');
      const Client = getModel('Client');
      if (Client) {
        console.log('✅ Modelo Client obtenido desde shared/models');
        return Client;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener Client desde shared/models:', error.message);
    }

    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (sequelize && sequelize.models && sequelize.models.Client) {
        console.log('✅ Modelo Client obtenido desde sequelize.models');
        return sequelize.models.Client;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener Client desde sequelize.models:', error.message);
    }

    throw new Error('Modelo Client no está disponible');
  } catch (error) {
    console.error('❌ Error al obtener modelo Client:', error.message);
    throw error;
  }
}

class ClientRepository {
  
  async create(clientData) {
    try {
      const Client = getClientModel();
      const newClient = await Client.create(clientData);
      return newClient;
    } catch (error) {
      console.error('❌ Error en ClientRepository.create:', error.message);
      throw error;
    }
  }

  async findById(id, options = {}) {
    try {
      const Client = getClientModel();
      const client = await Client.findByPk(id, {
        ...options
      });
      return client;
    } catch (error) {
      console.error('❌ Error en ClientRepository.findById:', error.message);
      throw error;
    }
  }

  async findByDocumentNumber(documentNumber, options = {}) {
    try {
      const Client = getClientModel();
      const client = await Client.findOne({
        where: { document_number: documentNumber },
        ...options
      });
      return client;
    } catch (error) {
      console.error('❌ Error en ClientRepository.findByDocumentNumber:', error.message);
      throw error;
    }
  }

  async findByEmail(email, options = {}) {
    try {
      const Client = getClientModel();
      const client = await Client.findOne({
        where: { email: email.toLowerCase() },
        ...options
      });
      return client;
    } catch (error) {
      console.error('❌ Error en ClientRepository.findByEmail:', error.message);
      throw error;
    }
  }

  async findAll(filters = {}, options = {}) {
    try {
      const Client = getClientModel();
      const queryOptions = {
        where: {},
        order: [['business_name', 'ASC'], ['first_name', 'ASC'], ['last_name', 'ASC']],
        ...options
      };

      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.clientType) {
        queryOptions.where.client_type = filters.clientType;
      }
      if (filters.documentType) {
        queryOptions.where.document_type = filters.documentType;
      }
      if (filters.assignedUserId) {
        queryOptions.where.assigned_user_id = filters.assignedUserId;
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { business_name: { [Op.like]: `%${filters.search}%` } },
          { first_name: { [Op.like]: `%${filters.search}%` } },
          { last_name: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } },
          { document_number: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const clients = await Client.findAll(queryOptions);
      return clients;
    } catch (error) {
      console.error('❌ Error en ClientRepository.findAll:', error.message);
      throw error;
    }
  }

  async findAndCountAll(filters = {}, pagination = {}) {
    try {
      const Client = getClientModel();
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const queryOptions = {
        where: {},
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['business_name', 'ASC'], ['first_name', 'ASC'], ['last_name', 'ASC']]
      };

      if (filters.status) {
        queryOptions.where.status = filters.status;
      }
      if (filters.clientType) {
        queryOptions.where.client_type = filters.clientType;
      }
      if (filters.documentType) {
        queryOptions.where.document_type = filters.documentType;
      }
      if (filters.assignedUserId) {
        queryOptions.where.assigned_user_id = filters.assignedUserId;
      }
      if (filters.search) {
        queryOptions.where[Op.or] = [
          { business_name: { [Op.like]: `%${filters.search}%` } },
          { first_name: { [Op.like]: `%${filters.search}%` } },
          { last_name: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } },
          { document_number: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const result = await Client.findAndCountAll(queryOptions);
      
      return {
        clients: result.rows,
        totalCount: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      };
    } catch (error) {
      console.error('❌ Error en ClientRepository.findAndCountAll:', error.message);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const Client = getClientModel();
      const [updatedRowsCount] = await Client.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        return null;
      }

      const updatedClient = await this.findById(id);
      return updatedClient;
    } catch (error) {
      console.error('❌ Error en ClientRepository.update:', error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const Client = getClientModel();
      const deletedRowsCount = await Client.destroy({
        where: { id }
      });
      return deletedRowsCount > 0;
    } catch (error) {
      console.error('❌ Error en ClientRepository.delete:', error.message);
      throw error;
    }
  }

  async findActiveClients(options = {}) {
    try {
      return await this.findAll({ status: 'active' }, options);
    } catch (error) {
      console.error('❌ Error en ClientRepository.findActiveClients:', error.message);
      throw error;
    }
  }

  async findByClientType(clientType, options = {}) {
    try {
      return await this.findAll({ clientType }, options);
    } catch (error) {
      console.error('❌ Error en ClientRepository.findByClientType:', error.message);
      throw error;
    }
  }

  async findByAssignedUser(userId, options = {}) {
    try {
      return await this.findAll({ assignedUserId: userId }, options);
    } catch (error) {
      console.error('❌ Error en ClientRepository.findByAssignedUser:', error.message);
      throw error;
    }
  }

  async changeStatus(id, status) {
    try {
      const validStatuses = ['active', 'inactive', 'suspended', 'blacklisted'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado inválido: ${status}. Estados válidos: ${validStatuses.join(', ')}`);
      }
      return await this.update(id, { status });
    } catch (error) {
      console.error('❌ Error en ClientRepository.changeStatus:', error.message);
      throw error;
    }
  }

  async existsByDocumentNumber(documentNumber) {
    try {
      const client = await this.findByDocumentNumber(documentNumber);
      return !!client;
    } catch (error) {
      console.error('❌ Error en ClientRepository.existsByDocumentNumber:', error.message);
      throw error;
    }
  }

  async existsByEmail(email) {
    try {
      const client = await this.findByEmail(email);
      return !!client;
    } catch (error) {
      console.error('❌ Error en ClientRepository.existsByEmail:', error.message);
      throw error;
    }
  }

  async getClientStats() {
    try {
      const Client = getClientModel();
      
      const [totalClients, activeClients, inactiveClients, byType] = await Promise.all([
        Client.count(),
        Client.count({ where: { status: 'active' } }),
        Client.count({ where: { status: { [Op.in]: ['inactive', 'suspended', 'blacklisted'] } } }),
        Client.findAll({
          attributes: [
            'client_type',
            [Client.sequelize.fn('COUNT', Client.sequelize.col('id')), 'count']
          ],
          group: ['client_type']
        })
      ]);

      const typeStats = byType.reduce((acc, item) => {
        acc[item.client_type] = parseInt(item.dataValues.count);
        return acc;
      }, {});

      return {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients,
        byType: typeStats
      };
    } catch (error) {
      console.error('❌ Error en ClientRepository.getClientStats:', error.message);
      throw error;
    }
  }

  async findWithRelations(id, relations = []) {
    try {
      const Client = getClientModel();
      const include = [];

      const availableRelations = {
        assignedUser: 'assignedUser',
        quotes: 'quotes',
        creditRequests: 'creditRequests',
        activityLogs: 'activityLogs'
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

      const client = await Client.findByPk(id, { include });
      return client;
    } catch (error) {
      console.error('❌ Error en ClientRepository.findWithRelations:', error.message);
      throw error;
    }
  }

  async updateCreditLimit(id, creditLimit) {
    try {
      return await this.update(id, { credit_limit: creditLimit });
    } catch (error) {
      console.error('❌ Error en ClientRepository.updateCreditLimit:', error.message);
      throw error;
    }
  }

  async findClientsWithHighCreditLimit(minLimit) {
    try {
      const Client = getClientModel();
      const clients = await Client.findAll({
        where: {
          credit_limit: {
            [Op.gte]: minLimit
          },
          status: 'active'
        },
        order: [['credit_limit', 'DESC']]
      });
      return clients;
    } catch (error) {
      console.error('❌ Error en ClientRepository.findClientsWithHighCreditLimit:', error.message);
      throw error;
    }
  }
}

module.exports = new ClientRepository();