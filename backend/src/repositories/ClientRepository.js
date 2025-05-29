const { Client, User } = require('../models');
const { Helpers } = require('../utils');
const { Op } = require('sequelize');

/**
 * Repositorio de Clientes
 * Maneja toda la lógica de acceso a datos relacionada con clientes
 */
class ClientRepository {

  /**
   * Obtiene todos los clientes con paginación y filtros
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Clientes paginados
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        advisorId = null,
        clientType = null,
        status = null,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const pagination = Helpers.calculatePagination(page, limit);
      const where = {};

      // Filtros
      if (search) {
        where[Op.or] = [
          { contact_name: { [Op.like]: `%${search}%` } },
          { business_name: { [Op.like]: `%${search}%` } },
          { document_number: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      if (advisorId) {
        where.user_id = advisorId;
      }

      if (clientType) {
        where.client_type = clientType;
      }

      if (status) {
        where.status = status;
      }

      const { count, rows } = await Client.findAndCountAll({
        where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            model: User,
            as: 'advisor',
            attributes: ['id', 'code', 'name']
          }
        ]
      });

      return {
        clients: rows,
        pagination: pagination.getMetadata(count)
      };

    } catch (error) {
      throw new Error(`Error al obtener clientes: ${error.message}`);
    }
  }

  /**
   * Busca un cliente por ID
   * @param {number} id - ID del cliente
   * @returns {Promise<Object|null>} Cliente encontrado o null
   */
  async findById(id) {
    try {
      return await Client.findByPk(id, {
        include: [
          {
            model: User,
            as: 'advisor',
            attributes: ['id', 'code', 'name', 'email']
          },
          {
            association: 'quotes',
            limit: 10,
            order: [['created_at', 'DESC']]
          },
          {
            association: 'creditRequests',
            limit: 5,
            order: [['created_at', 'DESC']]
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al buscar cliente: ${error.message}`);
    }
  }

  /**
   * Busca un cliente por documento
   * @param {string} documentType - Tipo de documento
   * @param {string} documentNumber - Número de documento
   * @returns {Promise<Object|null>} Cliente encontrado o null
   */
  async findByDocument(documentType, documentNumber) {
    try {
      return await Client.findOne({
        where: {
          document_type: documentType,
          document_number: documentNumber.replace(/\D/g, '')
        },
        include: [
          {
            model: User,
            as: 'advisor',
            attributes: ['id', 'code', 'name']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al buscar cliente por documento: ${error.message}`);
    }
  }

  /**
   * Obtiene clientes de un asesor específico
   * @param {number} advisorId - ID del asesor
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Clientes del asesor
   */
  async findByAdvisor(advisorId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = 'active'
      } = options;

      const pagination = Helpers.calculatePagination(page, limit);
      const where = { user_id: advisorId };

      if (search) {
        where[Op.or] = [
          { contact_name: { [Op.like]: `%${search}%` } },
          { business_name: { [Op.like]: `%${search}%` } },
          { document_number: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        where.status = status;
      }

      const { count, rows } = await Client.findAndCountAll({
        where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: [['contact_name', 'ASC']]
      });

      return {
        clients: rows,
        pagination: pagination.getMetadata(count)
      };

    } catch (error) {
      throw new Error(`Error al obtener clientes del asesor: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo cliente
   * @param {Object} clientData - Datos del cliente
   * @returns {Promise<Object>} Cliente creado
   */
  async create(clientData) {
    try {
      // Limpiar número de documento
      if (clientData.document_number) {
        clientData.document_number = clientData.document_number.replace(/\D/g, '');
      }

      // Convertir email a minúsculas
      if (clientData.email) {
        clientData.email = clientData.email.toLowerCase();
      }

      const client = await Client.create(clientData);
      
      // Incluir información del asesor en la respuesta
      return await this.findById(client.id);

    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe un cliente con este número de documento');
      }
      throw new Error(`Error al crear cliente: ${error.message}`);
    }
  }

  /**
   * Actualiza un cliente
   * @param {number} id - ID del cliente
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object|null>} Cliente actualizado o null
   */
  async update(id, updateData) {
    try {
      const client = await Client.findByPk(id);
      
      if (!client) {
        return null;
      }

      // Limpiar número de documento si se actualiza
      if (updateData.document_number) {
        updateData.document_number = updateData.document_number.replace(/\D/g, '');
      }

      // Convertir email a minúsculas
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      await client.update(updateData);
      
      // Retornar cliente actualizado con relaciones
      return await this.findById(client.id);

    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe un cliente con este número de documento');
      }
      throw new Error(`Error al actualizar cliente: ${error.message}`);
    }
  }

  /**
   * Elimina un cliente (soft delete)
   * @param {number} id - ID del cliente
   * @returns {Promise<boolean>} True si se eliminó exitosamente
   */
  async delete(id) {
    try {
      const client = await Client.findByPk(id);
      
      if (!client) {
        return false;
      }

      // Soft delete - cambiar estado a inactive
      await client.update({ status: 'inactive' });
      return true;

    } catch (error) {
      throw new Error(`Error al eliminar cliente: ${error.message}`);
    }
  }

  /**
   * Cambia el estado de un cliente
   * @param {number} id - ID del cliente
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object|null>} Cliente actualizado o null
   */
  async changeStatus(id, status) {
    try {
      const client = await Client.findByPk(id);
      
      if (!client) {
        return null;
      }

      await client.update({ status });
      return await this.findById(client.id);

    } catch (error) {
      throw new Error(`Error al cambiar estado del cliente: ${error.message}`);
    }
  }

  /**
   * Busca clientes por nombre
   * @param {string} name - Nombre a buscar
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de clientes
   */
  async searchByName(name, limit = 10) {
    try {
      return await Client.findAll({
        where: {
          [Op.or]: [
            { contact_name: { [Op.like]: `%${name}%` } },
            { business_name: { [Op.like]: `%${name}%` } }
          ],
          status: 'active'
        },
        limit,
        order: [['contact_name', 'ASC']],
        include: [
          {
            model: User,
            as: 'advisor',
            attributes: ['id', 'code', 'name']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al buscar clientes por nombre: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de clientes
   * @param {number} advisorId - ID del asesor (opcional)
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats(advisorId = null) {
    try {
      const where = advisorId ? { user_id: advisorId } : {};

      const totalClients = await Client.count({ where });
      const activeClients = await Client.count({ 
        where: { ...where, status: 'active' } 
      });
      const businessClients = await Client.count({ 
        where: { ...where, client_type: 'business', status: 'active' } 
      });
      const individualClients = await Client.count({ 
        where: { ...where, client_type: 'individual', status: 'active' } 
      });

      const newClientsThisMonth = await Client.count({
        where: {
          ...where,
          created_at: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      });

      return {
        total: totalClients,
        active: activeClients,
        business: businessClients,
        individual: individualClients,
        newThisMonth: newClientsThisMonth
      };

    } catch (error) {
      throw new Error(`Error al obtener estadísticas de clientes: ${error.message}`);
    }
  }

  /**
   * Verifica si un documento está disponible
   * @param {string} documentType - Tipo de documento
   * @param {string} documentNumber - Número de documento
   * @param {number} excludeId - ID a excluir de la verificación
   * @returns {Promise<boolean>} True si está disponible
   */
  async isDocumentAvailable(documentType, documentNumber, excludeId = null) {
    try {
      const cleanDocument = documentNumber.replace(/\D/g, '');
      const where = {
        document_type: documentType,
        document_number: cleanDocument
      };
      
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const existingClient = await Client.findOne({ where });
      return !existingClient;

    } catch (error) {
      throw new Error(`Error al verificar disponibilidad de documento: ${error.message}`);
    }
  }

  /**
   * Obtiene clientes con límite de crédito disponible
   * @param {number} advisorId - ID del asesor (opcional)
   * @returns {Promise<Array>} Lista de clientes con crédito
   */
  async findWithCreditLimit(advisorId = null) {
    try {
      const where = {
        status: 'active',
        credit_limit: { [Op.gt]: 0 }
      };

      if (advisorId) {
        where.user_id = advisorId;
      }

      return await Client.findAll({
        where,
        order: [['contact_name', 'ASC']],
        include: [
          {
            model: User,
            as: 'advisor',
            attributes: ['id', 'code', 'name']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al obtener clientes con crédito: ${error.message}`);
    }
  }

  /**
   * Actualiza el límite de crédito de un cliente
   * @param {number} id - ID del cliente
   * @param {number} creditLimit - Nuevo límite de crédito
   * @returns {Promise<Object|null>} Cliente actualizado o null
   */
  async updateCreditLimit(id, creditLimit) {
    try {
      const client = await Client.findByPk(id);
      
      if (!client) {
        return null;
      }

      await client.update({ credit_limit: creditLimit });
      return await this.findById(client.id);

    } catch (error) {
      throw new Error(`Error al actualizar límite de crédito: ${error.message}`);
    }
  }

  /**
   * Obtiene clientes recientes
   * @param {number} limit - Límite de resultados
   * @param {number} advisorId - ID del asesor (opcional)
   * @returns {Promise<Array>} Lista de clientes recientes
   */
  async findRecent(limit = 10, advisorId = null) {
    try {
      const where = advisorId ? { user_id: advisorId } : {};

      return await Client.findAll({
        where,
        limit,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: User,
            as: 'advisor',
            attributes: ['id', 'code', 'name']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al obtener clientes recientes: ${error.message}`);
    }
  }
}

module.exports = new ClientRepository();