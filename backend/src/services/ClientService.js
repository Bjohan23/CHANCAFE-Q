const { ClientRepository } = require('../repositories');
const { Helpers } = require('../utils');
const { ActivityLog } = require('../models');

/**
 * Servicio de Clientes
 * Contiene toda la lógica de negocio relacionada con gestión de clientes
 */
class ClientService {

  /**
   * Obtiene una lista paginada de clientes con filtros
   * @param {Object} options - Opciones de consulta
   * @param {Object} requestUser - Usuario que hace la petición
   * @returns {Promise<Object>} Lista de clientes
   */
  async getClients(options = {}, requestUser = null) {
    try {
      // Si es asesor, solo puede ver sus propios clientes
      if (requestUser && requestUser.role === 'asesor') {
        options.advisorId = requestUser.id;
      }

      const result = await ClientRepository.findAll(options);

      return Helpers.successResponse(
        'Clientes obtenidos exitosamente',
        result,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.getClients:', error);
      return Helpers.errorResponse(
        'Error al obtener clientes',
        'GET_CLIENTS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene un cliente por ID
   * @param {number} id - ID del cliente
   * @param {Object} requestUser - Usuario que hace la petición
   * @returns {Promise<Object>} Cliente encontrado
   */
  async getClientById(id, requestUser = null) {
    try {
      const client = await ClientRepository.findById(id);

      if (!client) {
        return Helpers.errorResponse(
          'Cliente no encontrado',
          'CLIENT_NOT_FOUND',
          null,
          404
        );
      }

      // Verificar permisos (asesor solo puede ver sus clientes)
      if (requestUser && requestUser.role === 'asesor' && client.user_id !== requestUser.id) {
        return Helpers.errorResponse(
          'No tienes permisos para ver este cliente',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      return Helpers.successResponse(
        'Cliente obtenido exitosamente',
        client,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.getClientById:', error);
      return Helpers.errorResponse(
        'Error al obtener cliente',
        'GET_CLIENT_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene clientes de un asesor específico
   * @param {number} advisorId - ID del asesor
   * @param {Object} options - Opciones de consulta
   * @param {Object} requestUser - Usuario que hace la petición
   * @returns {Promise<Object>} Clientes del asesor
   */
  async getClientsByAdvisor(advisorId, options = {}, requestUser = null) {
    try {
      // Verificar permisos
      if (requestUser && requestUser.role === 'asesor' && requestUser.id !== advisorId) {
        return Helpers.errorResponse(
          'No tienes permisos para ver clientes de otros asesores',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      const result = await ClientRepository.findByAdvisor(advisorId, options);

      return Helpers.successResponse(
        'Clientes del asesor obtenidos exitosamente',
        result,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.getClientsByAdvisor:', error);
      return Helpers.errorResponse(
        'Error al obtener clientes del asesor',
        'GET_ADVISOR_CLIENTS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Crea un nuevo cliente
   * @param {Object} clientData - Datos del cliente
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Cliente creado
   */
  async createClient(clientData, requestUser, ipAddress) {
    try {
      // Asignar asesor si no se especifica (para asesores, se auto-asignan)
      if (!clientData.user_id) {
        if (requestUser.role === 'asesor') {
          clientData.user_id = requestUser.id;
        } else {
          return Helpers.errorResponse(
            'Debe especificar un asesor para el cliente',
            'ADVISOR_REQUIRED',
            null,
            400
          );
        }
      }

      // Verificar permisos (asesor solo puede crear clientes para sí mismo)
      if (requestUser.role === 'asesor' && clientData.user_id !== requestUser.id) {
        return Helpers.errorResponse(
          'Solo puedes crear clientes para tu propia cartera',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      // Verificar disponibilidad del documento
      const isDocumentAvailable = await ClientRepository.isDocumentAvailable(
        clientData.document_type,
        clientData.document_number
      );

      if (!isDocumentAvailable) {
        return Helpers.errorResponse(
          'Ya existe un cliente con este número de documento',
          'DOCUMENT_EXISTS',
          null,
          409
        );
      }

      // Crear cliente
      const newClient = await ClientRepository.create(clientData);

      // Registrar actividad
      await ActivityLog.logCreate(
        requestUser.id,
        'client',
        newClient.id,
        newClient,
        ipAddress
      );

      return Helpers.successResponse(
        'Cliente creado exitosamente',
        newClient,
        201
      );

    } catch (error) {
      console.error('Error en ClientService.createClient:', error);
      
      if (error.message.includes('documento')) {
        return Helpers.errorResponse(
          error.message,
          'DUPLICATE_DOCUMENT',
          null,
          409
        );
      }

      return Helpers.errorResponse(
        'Error al crear cliente',
        'CREATE_CLIENT_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Actualiza un cliente existente
   * @param {number} id - ID del cliente
   * @param {Object} updateData - Datos a actualizar
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Cliente actualizado
   */
  async updateClient(id, updateData, requestUser, ipAddress) {
    try {
      // Obtener cliente actual
      const currentClient = await ClientRepository.findById(id);
      if (!currentClient) {
        return Helpers.errorResponse(
          'Cliente no encontrado',
          'CLIENT_NOT_FOUND',
          null,
          404
        );
      }

      // Verificar permisos
      if (requestUser.role === 'asesor' && currentClient.user_id !== requestUser.id) {
        return Helpers.errorResponse(
          'No tienes permisos para modificar este cliente',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      // Si se actualiza el asesor, verificar permisos
      if (updateData.user_id && requestUser.role === 'asesor' && updateData.user_id !== requestUser.id) {
        return Helpers.errorResponse(
          'No puedes asignar clientes a otros asesores',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      // Verificar disponibilidad del documento si se actualiza
      if (updateData.document_number || updateData.document_type) {
        const documentType = updateData.document_type || currentClient.document_type;
        const documentNumber = updateData.document_number || currentClient.document_number;
        
        const isDocumentAvailable = await ClientRepository.isDocumentAvailable(
          documentType,
          documentNumber,
          id
        );

        if (!isDocumentAvailable) {
          return Helpers.errorResponse(
            'Ya existe un cliente con este número de documento',
            'DOCUMENT_EXISTS',
            null,
            409
          );
        }
      }

      // Actualizar cliente
      const updatedClient = await ClientRepository.update(id, updateData);

      if (!updatedClient) {
        return Helpers.errorResponse(
          'Cliente no encontrado',
          'CLIENT_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar cambios
      await ActivityLog.logUpdate(
        requestUser.id,
        'client',
        id,
        currentClient,
        updatedClient,
        ipAddress
      );

      return Helpers.successResponse(
        'Cliente actualizado exitosamente',
        updatedClient,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.updateClient:', error);
      
      if (error.message.includes('documento')) {
        return Helpers.errorResponse(
          error.message,
          'DUPLICATE_DOCUMENT',
          null,
          409
        );
      }

      return Helpers.errorResponse(
        'Error al actualizar cliente',
        'UPDATE_CLIENT_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Elimina un cliente (soft delete)
   * @param {number} id - ID del cliente
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteClient(id, requestUser, ipAddress) {
    try {
      // Obtener cliente para verificar permisos
      const clientToDelete = await ClientRepository.findById(id);
      if (!clientToDelete) {
        return Helpers.errorResponse(
          'Cliente no encontrado',
          'CLIENT_NOT_FOUND',
          null,
          404
        );
      }

      // Verificar permisos
      if (requestUser.role === 'asesor' && clientToDelete.user_id !== requestUser.id) {
        return Helpers.errorResponse(
          'No tienes permisos para eliminar este cliente',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      // Eliminar cliente
      const success = await ClientRepository.delete(id);

      if (!success) {
        return Helpers.errorResponse(
          'Cliente no encontrado',
          'CLIENT_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar eliminación
      await ActivityLog.logDelete(
        requestUser.id,
        'client',
        id,
        clientToDelete,
        ipAddress
      );

      return Helpers.successResponse(
        'Cliente eliminado exitosamente',
        null,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.deleteClient:', error);
      return Helpers.errorResponse(
        'Error al eliminar cliente',
        'DELETE_CLIENT_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Cambia el estado de un cliente
   * @param {number} id - ID del cliente
   * @param {string} status - Nuevo estado
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Cliente con estado actualizado
   */
  async changeClientStatus(id, status, requestUser, ipAddress) {
    try {
      // Obtener cliente para verificar permisos
      const client = await ClientRepository.findById(id);
      if (!client) {
        return Helpers.errorResponse(
          'Cliente no encontrado',
          'CLIENT_NOT_FOUND',
          null,
          404
        );
      }

      // Verificar permisos
      if (requestUser.role === 'asesor' && client.user_id !== requestUser.id) {
        return Helpers.errorResponse(
          'No tienes permisos para cambiar el estado de este cliente',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      const updatedClient = await ClientRepository.changeStatus(id, status);

      if (!updatedClient) {
        return Helpers.errorResponse(
          'Cliente no encontrado',
          'CLIENT_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar cambio de estado
      await ActivityLog.logAction({
        userId: requestUser.id,
        action: 'STATUS_CHANGE',
        entityType: 'client',
        entityId: id,
        newValues: { status },
        ipAddress: ipAddress,
        notes: `Estado del cliente cambiado a: ${status}`
      });

      return Helpers.successResponse(
        `Estado del cliente cambiado a ${status}`,
        updatedClient,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.changeClientStatus:', error);
      return Helpers.errorResponse(
        'Error al cambiar estado del cliente',
        'CHANGE_STATUS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Busca clientes por nombre
   * @param {string} name - Nombre a buscar
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Object>} Lista de clientes encontrados
   */
  async searchClientsByName(name, requestUser, limit = 10) {
    try {
      let clients = await ClientRepository.searchByName(name, limit);

      // Si es asesor, filtrar solo sus clientes
      if (requestUser.role === 'asesor') {
        clients = clients.filter(client => client.user_id === requestUser.id);
      }

      return Helpers.successResponse(
        'Búsqueda de clientes completada',
        clients,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.searchClientsByName:', error);
      return Helpers.errorResponse(
        'Error al buscar clientes',
        'SEARCH_CLIENTS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene estadísticas de clientes
   * @param {Object} requestUser - Usuario que hace la petición
   * @returns {Promise<Object>} Estadísticas
   */
  async getClientStats(requestUser) {
    try {
      // Si es asesor, solo sus estadísticas
      const advisorId = requestUser.role === 'asesor' ? requestUser.id : null;
      const stats = await ClientRepository.getStats(advisorId);

      return Helpers.successResponse(
        'Estadísticas de clientes obtenidas',
        stats,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.getClientStats:', error);
      return Helpers.errorResponse(
        'Error al obtener estadísticas',
        'GET_STATS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Obtiene clientes con límite de crédito
   * @param {Object} requestUser - Usuario que hace la petición
   * @returns {Promise<Object>} Lista de clientes con crédito
   */
  async getClientsWithCredit(requestUser) {
    try {
      // Si es asesor, solo sus clientes
      const advisorId = requestUser.role === 'asesor' ? requestUser.id : null;
      const clients = await ClientRepository.findWithCreditLimit(advisorId);

      return Helpers.successResponse(
        'Clientes con límite de crédito obtenidos',
        clients,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.getClientsWithCredit:', error);
      return Helpers.errorResponse(
        'Error al obtener clientes con crédito',
        'GET_CREDIT_CLIENTS_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Actualiza el límite de crédito de un cliente
   * @param {number} id - ID del cliente
   * @param {number} creditLimit - Nuevo límite
   * @param {Object} requestUser - Usuario que hace la petición
   * @param {string} ipAddress - IP del cliente
   * @returns {Promise<Object>} Cliente actualizado
   */
  async updateCreditLimit(id, creditLimit, requestUser, ipAddress) {
    try {
      // Verificar permisos (solo supervisores y admins)
      if (requestUser.role === 'asesor') {
        return Helpers.errorResponse(
          'No tienes permisos para modificar límites de crédito',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      const updatedClient = await ClientRepository.updateCreditLimit(id, creditLimit);

      if (!updatedClient) {
        return Helpers.errorResponse(
          'Cliente no encontrado',
          'CLIENT_NOT_FOUND',
          null,
          404
        );
      }

      // Registrar cambio
      await ActivityLog.logAction({
        userId: requestUser.id,
        action: 'CREDIT_LIMIT_UPDATE',
        entityType: 'client',
        entityId: id,
        newValues: { credit_limit: creditLimit },
        ipAddress: ipAddress,
        notes: `Límite de crédito actualizado a: ${Helpers.formatCurrency(creditLimit)}`
      });

      return Helpers.successResponse(
        'Límite de crédito actualizado exitosamente',
        updatedClient,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.updateCreditLimit:', error);
      return Helpers.errorResponse(
        'Error al actualizar límite de crédito',
        'UPDATE_CREDIT_LIMIT_ERROR',
        null,
        500
      );
    }
  }

  /**
   * Busca un cliente por documento
   * @param {string} documentType - Tipo de documento
   * @param {string} documentNumber - Número de documento
   * @param {Object} requestUser - Usuario que hace la petición
   * @returns {Promise<Object>} Cliente encontrado
   */
  async findByDocument(documentType, documentNumber, requestUser) {
    try {
      const client = await ClientRepository.findByDocument(documentType, documentNumber);

      if (!client) {
        return Helpers.errorResponse(
          'Cliente no encontrado con ese documento',
          'CLIENT_NOT_FOUND',
          null,
          404
        );
      }

      // Verificar permisos
      if (requestUser.role === 'asesor' && client.user_id !== requestUser.id) {
        return Helpers.errorResponse(
          'Este cliente no está asignado a tu cartera',
          'INSUFFICIENT_PERMISSIONS',
          null,
          403
        );
      }

      return Helpers.successResponse(
        'Cliente encontrado',
        client,
        200
      );

    } catch (error) {
      console.error('Error en ClientService.findByDocument:', error);
      return Helpers.errorResponse(
        'Error al buscar cliente por documento',
        'FIND_BY_DOCUMENT_ERROR',
        null,
        500
      );
    }
  }
}

module.exports = new ClientService();