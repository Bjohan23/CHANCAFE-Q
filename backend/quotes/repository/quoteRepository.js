const { Op } = require('sequelize');

function getQuoteModel() {
  try {
    try {
      const { getModel } = require('../../shared/models/index');
      const Quote = getModel('Quote');
      if (Quote) {
        console.log('✅ Modelo Quote obtenido desde shared/models');
        return Quote;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener Quote desde shared/models:', error.message);
    }

    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (sequelize && sequelize.models && sequelize.models.Quote) {
        console.log('✅ Modelo Quote obtenido desde sequelize.models');
        return sequelize.models.Quote;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener Quote desde sequelize.models:', error.message);
    }

    throw new Error('Modelo Quote no está disponible');
  } catch (error) {
    console.error('❌ Error al obtener modelo Quote:', error.message);
    throw error;
  }
}

function getQuoteItemModel() {
  try {
    try {
      const { getModel } = require('../../shared/models/index');
      const QuoteItem = getModel('QuoteItem');
      if (QuoteItem) {
        console.log('✅ Modelo QuoteItem obtenido desde shared/models');
        return QuoteItem;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener QuoteItem desde shared/models:', error.message);
    }

    try {
      const { getSequelize } = require('../../shared/config/db');
      const sequelize = getSequelize();
      
      if (sequelize && sequelize.models && sequelize.models.QuoteItem) {
        console.log('✅ Modelo QuoteItem obtenido desde sequelize.models');
        return sequelize.models.QuoteItem;
      }
    } catch (error) {
      console.log('⚠️  No se pudo obtener QuoteItem desde sequelize.models:', error.message);
    }

    throw new Error('Modelo QuoteItem no está disponible');
  } catch (error) {
    console.error('❌ Error al obtener modelo QuoteItem:', error.message);
    throw error;
  }
}

class QuoteRepository {
  
  async create(quoteData) {
    try {
      const Quote = getQuoteModel();
      const newQuote = await Quote.create(quoteData);
      return newQuote;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.create:', error.message);
      throw error;
    }
  }

  async findById(id, options = {}) {
    try {
      const Quote = getQuoteModel();
      const quote = await Quote.findByPk(id, {
        ...options
      });
      return quote;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.findById:', error.message);
      throw error;
    }
  }

  async findByQuoteNumber(quoteNumber, options = {}) {
    try {
      const Quote = getQuoteModel();
      const quote = await Quote.findOne({
        where: { quote_number: quoteNumber },
        ...options
      });
      return quote;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.findByQuoteNumber:', error.message);
      throw error;
    }
  }

  async findAll(filters = {}, options = {}) {
    try {
      const Quote = getQuoteModel();
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
      if (filters.currency) {
        queryOptions.where.currency = filters.currency;
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
          { quote_number: { [Op.like]: `%${filters.search}%` } },
          { title: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } },
          { project_name: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const quotes = await Quote.findAll(queryOptions);
      return quotes;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.findAll:', error.message);
      throw error;
    }
  }

  async findAndCountAll(filters = {}, pagination = {}) {
    try {
      const Quote = getQuoteModel();
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
      if (filters.currency) {
        queryOptions.where.currency = filters.currency;
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
          { quote_number: { [Op.like]: `%${filters.search}%` } },
          { title: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } },
          { project_name: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const result = await Quote.findAndCountAll(queryOptions);
      
      return {
        quotes: result.rows,
        totalCount: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      };
    } catch (error) {
      console.error('❌ Error en QuoteRepository.findAndCountAll:', error.message);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const Quote = getQuoteModel();
      const [updatedRowsCount] = await Quote.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        return null;
      }

      const updatedQuote = await this.findById(id);
      return updatedQuote;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.update:', error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const Quote = getQuoteModel();
      const deletedRowsCount = await Quote.destroy({
        where: { id }
      });
      return deletedRowsCount > 0;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.delete:', error.message);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      return await this.findAll({ status }, options);
    } catch (error) {
      console.error('❌ Error en QuoteRepository.findByStatus:', error.message);
      throw error;
    }
  }

  async findByClient(clientId, options = {}) {
    try {
      return await this.findAll({ clientId }, options);
    } catch (error) {
      console.error('❌ Error en QuoteRepository.findByClient:', error.message);
      throw error;
    }
  }

  async findByUser(userId, options = {}) {
    try {
      return await this.findAll({ userId }, options);
    } catch (error) {
      console.error('❌ Error en QuoteRepository.findByUser:', error.message);
      throw error;
    }
  }

  async changeStatus(id, status) {
    try {
      const validStatuses = ['draft', 'sent', 'approved', 'rejected', 'expired', 'converted'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado inválido: ${status}. Estados válidos: ${validStatuses.join(', ')}`);
      }
      return await this.update(id, { status });
    } catch (error) {
      console.error('❌ Error en QuoteRepository.changeStatus:', error.message);
      throw error;
    }
  }

  async getQuoteStats() {
    try {
      const Quote = getQuoteModel();
      
      const [totalQuotes, draftQuotes, sentQuotes, approvedQuotes, byStatus] = await Promise.all([
        Quote.count(),
        Quote.count({ where: { status: 'draft' } }),
        Quote.count({ where: { status: 'sent' } }),
        Quote.count({ where: { status: 'approved' } }),
        Quote.findAll({
          attributes: [
            'status',
            [Quote.sequelize.fn('COUNT', Quote.sequelize.col('id')), 'count'],
            [Quote.sequelize.fn('SUM', Quote.sequelize.col('total_amount')), 'total_amount']
          ],
          group: ['status']
        })
      ]);

      const statusStats = byStatus.reduce((acc, item) => {
        acc[item.status] = {
          count: parseInt(item.dataValues.count),
          totalAmount: parseFloat(item.dataValues.total_amount) || 0
        };
        return acc;
      }, {});

      return {
        total: totalQuotes,
        draft: draftQuotes,
        sent: sentQuotes,
        approved: approvedQuotes,
        byStatus: statusStats
      };
    } catch (error) {
      console.error('❌ Error en QuoteRepository.getQuoteStats:', error.message);
      throw error;
    }
  }

  async findWithRelations(id, relations = []) {
    try {
      const Quote = getQuoteModel();
      const include = [];

      const availableRelations = {
        client: 'client',
        user: 'user',
        items: 'items'
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

      const quote = await Quote.findByPk(id, { include });
      return quote;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.findWithRelations:', error.message);
      throw error;
    }
  }

  async generateQuoteNumber(year = new Date().getFullYear()) {
    try {
      const Quote = getQuoteModel();
      const lastQuote = await Quote.findOne({
        where: {
          quote_number: {
            [Op.like]: `COT-${year}-%`
          }
        },
        order: [['quote_number', 'DESC']]
      });

      let nextNumber = 1;
      if (lastQuote) {
        const lastNumber = lastQuote.quote_number.split('-')[2];
        nextNumber = parseInt(lastNumber) + 1;
      }

      return `COT-${year}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.generateQuoteNumber:', error.message);
      throw error;
    }
  }

  async createItem(itemData) {
    try {
      const QuoteItem = getQuoteItemModel();
      const newItem = await QuoteItem.create(itemData);
      return newItem;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.createItem:', error.message);
      throw error;
    }
  }

  async findItemById(id, options = {}) {
    try {
      const QuoteItem = getQuoteItemModel();
      const item = await QuoteItem.findByPk(id, {
        ...options
      });
      return item;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.findItemById:', error.message);
      throw error;
    }
  }

  async findItemsByQuote(quoteId, options = {}) {
    try {
      const QuoteItem = getQuoteItemModel();
      const items = await QuoteItem.findAll({
        where: { quote_id: quoteId },
        order: [['sort_order', 'ASC']],
        ...options
      });
      return items;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.findItemsByQuote:', error.message);
      throw error;
    }
  }

  async updateItem(id, updateData) {
    try {
      const QuoteItem = getQuoteItemModel();
      const [updatedRowsCount] = await QuoteItem.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        return null;
      }

      const updatedItem = await this.findItemById(id);
      return updatedItem;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.updateItem:', error.message);
      throw error;
    }
  }

  async deleteItem(id) {
    try {
      const QuoteItem = getQuoteItemModel();
      const deletedRowsCount = await QuoteItem.destroy({
        where: { id }
      });
      return deletedRowsCount > 0;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.deleteItem:', error.message);
      throw error;
    }
  }

  async deleteItemsByQuote(quoteId) {
    try {
      const QuoteItem = getQuoteItemModel();
      const deletedRowsCount = await QuoteItem.destroy({
        where: { quote_id: quoteId }
      });
      return deletedRowsCount;
    } catch (error) {
      console.error('❌ Error en QuoteRepository.deleteItemsByQuote:', error.message);
      throw error;
    }
  }
}

module.exports = new QuoteRepository();