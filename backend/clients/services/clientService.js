const clientRepository = require('../repository/clientRepository');
const { ClientDTO, ClientUpdateDTO } = require('../interfaces/clientDto');

class ClientService {

  async createClient(clientData) {
    try {
      const {
        documentType,
        documentNumber,
        clientType,
        businessName,
        firstName,
        lastName,
        email,
        phone,
        address,
        district,
        province,
        department,
        postalCode,
        creditLimit,
        paymentTerms,
        contactMethod,
        contactPreference,
        industry,
        companySize,
        website,
        notes,
        assignedUserId,
        status = 'active'
      } = clientData;

      if (!documentNumber || !documentType) {
        throw new Error("Número y tipo de documento son obligatorios");
      }

      if (!clientType || !['individual', 'business'].includes(clientType)) {
        throw new Error("Tipo de cliente debe ser 'individual' o 'business'");
      }

      const existingClient = await clientRepository.existsByDocumentNumber(documentNumber);
      if (existingClient) {
        throw new Error("Ya existe un cliente con este número de documento");
      }

      if (email) {
        const emailExists = await clientRepository.existsByEmail(email);
        if (emailExists) {
          throw new Error("Ya existe un cliente con este email");
        }
      }

      if (clientType === 'business' && !businessName) {
        throw new Error("El nombre de la empresa es obligatorio para clientes empresariales");
      }

      if (clientType === 'individual' && (!firstName || !lastName)) {
        throw new Error("Nombre y apellido son obligatorios para clientes individuales");
      }

      const clientDto = new ClientDTO({
        documentType,
        documentNumber,
        clientType,
        businessName,
        firstName,
        lastName,
        email: email ? email.toLowerCase() : null,
        phone,
        address,
        district,
        province,
        department,
        postalCode,
        creditLimit: creditLimit || 0,
        paymentTerms: paymentTerms || 30,
        contactMethod,
        contactPreference,
        industry,
        companySize,
        website,
        notes,
        status
      });

      const newClient = await clientRepository.create({
        ...clientDto,
        assigned_user_id: assignedUserId
      });

      return {
        client: this.formatClientResponse(newClient),
        message: "Cliente creado exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en ClientService.createClient:', error.message);
      throw error;
    }
  }

  async getClientById(id) {
    try {
      const client = await clientRepository.findById(id);
      if (!client) {
        throw new Error("Cliente no encontrado");
      }
      return this.formatClientResponse(client);
    } catch (error) {
      console.error('❌ Error en ClientService.getClientById:', error.message);
      throw error;
    }
  }

  async getClientByDocumentNumber(documentNumber) {
    try {
      const client = await clientRepository.findByDocumentNumber(documentNumber);
      if (!client) {
        throw new Error("Cliente no encontrado");
      }
      return this.formatClientResponse(client);
    } catch (error) {
      console.error('❌ Error en ClientService.getClientByDocumentNumber:', error.message);
      throw error;
    }
  }

  async getAllClients(filters = {}, pagination = {}) {
    try {
      if (pagination.page && pagination.limit) {
        const result = await clientRepository.findAndCountAll(filters, pagination);
        return {
          clients: result.clients.map(client => this.formatClientResponse(client)),
          pagination: {
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            pageSize: result.pageSize
          }
        };
      } else {
        const clients = await clientRepository.findAll(filters);
        return clients.map(client => this.formatClientResponse(client));
      }
    } catch (error) {
      console.error('❌ Error en ClientService.getAllClients:', error.message);
      throw error;
    }
  }

  async getActiveClients() {
    try {
      const clients = await clientRepository.findActiveClients();
      return clients.map(client => this.formatClientResponse(client));
    } catch (error) {
      console.error('❌ Error en ClientService.getActiveClients:', error.message);
      throw error;
    }
  }

  async getClientsByType(clientType) {
    try {
      const clients = await clientRepository.findByClientType(clientType);
      return clients.map(client => this.formatClientResponse(client));
    } catch (error) {
      console.error('❌ Error en ClientService.getClientsByType:', error.message);
      throw error;
    }
  }

  async getClientsByAssignedUser(userId) {
    try {
      const clients = await clientRepository.findByAssignedUser(userId);
      return clients.map(client => this.formatClientResponse(client));
    } catch (error) {
      console.error('❌ Error en ClientService.getClientsByAssignedUser:', error.message);
      throw error;
    }
  }

  async updateClient(id, updateData) {
    try {
      const existingClient = await clientRepository.findById(id);
      if (!existingClient) {
        throw new Error("Cliente no encontrado");
      }

      if (updateData.documentNumber && updateData.documentNumber !== existingClient.document_number) {
        const documentExists = await clientRepository.existsByDocumentNumber(updateData.documentNumber);
        if (documentExists) {
          throw new Error("Ya existe un cliente con este número de documento");
        }
      }

      if (updateData.email && updateData.email !== existingClient.email) {
        const emailExists = await clientRepository.existsByEmail(updateData.email);
        if (emailExists) {
          throw new Error("Ya existe un cliente con este email");
        }
        updateData.email = updateData.email.toLowerCase();
      }

      const clientUpdateDto = new ClientUpdateDTO(updateData);
      const updatedClient = await clientRepository.update(id, clientUpdateDto);
      
      return {
        client: this.formatClientResponse(updatedClient),
        message: "Cliente actualizado exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en ClientService.updateClient:', error.message);
      throw error;
    }
  }

  async changeClientStatus(id, status) {
    try {
      const updatedClient = await clientRepository.changeStatus(id, status);
      if (!updatedClient) {
        throw new Error("Cliente no encontrado");
      }
      return {
        message: `Estado del cliente actualizado a: ${status}`,
        client: this.formatClientResponse(updatedClient)
      };
    } catch (error) {
      console.error('❌ Error en ClientService.changeClientStatus:', error.message);
      throw error;
    }
  }

  async updateCreditLimit(id, creditLimit) {
    try {
      if (creditLimit < 0) {
        throw new Error("El límite de crédito no puede ser negativo");
      }

      const updatedClient = await clientRepository.updateCreditLimit(id, creditLimit);
      if (!updatedClient) {
        throw new Error("Cliente no encontrado");
      }

      return {
        message: "Límite de crédito actualizado exitosamente",
        client: this.formatClientResponse(updatedClient)
      };
    } catch (error) {
      console.error('❌ Error en ClientService.updateCreditLimit:', error.message);
      throw error;
    }
  }

  async deleteClient(id) {
    try {
      const client = await clientRepository.findById(id);
      if (!client) {
        throw new Error("Cliente no encontrado");
      }

      const deleted = await clientRepository.delete(id);
      if (!deleted) {
        throw new Error("Error al eliminar el cliente");
      }

      return {
        message: "Cliente eliminado exitosamente",
        deletedClient: this.formatClientResponse(client)
      };
    } catch (error) {
      console.error('❌ Error en ClientService.deleteClient:', error.message);
      throw error;
    }
  }

  async getClientStats() {
    try {
      return await clientRepository.getClientStats();
    } catch (error) {
      console.error('❌ Error en ClientService.getClientStats:', error.message);
      throw error;
    }
  }

  async getClientWithRelations(id, relations = []) {
    try {
      const client = await clientRepository.findWithRelations(id, relations);
      if (!client) {
        throw new Error("Cliente no encontrado");
      }
      return this.formatClientResponse(client);
    } catch (error) {
      console.error('❌ Error en ClientService.getClientWithRelations:', error.message);
      throw error;
    }
  }

  async getClientsWithHighCreditLimit(minLimit) {
    try {
      const clients = await clientRepository.findClientsWithHighCreditLimit(minLimit);
      return clients.map(client => this.formatClientResponse(client));
    } catch (error) {
      console.error('❌ Error en ClientService.getClientsWithHighCreditLimit:', error.message);
      throw error;
    }
  }

  formatClientResponse(client) {
    if (!client) return null;

    return {
      id: client.id,
      documentType: client.document_type,
      documentNumber: client.document_number,
      clientType: client.client_type,
      businessName: client.business_name,
      firstName: client.first_name,
      lastName: client.last_name,
      fullName: this.getClientFullName(client),
      email: client.email,
      phone: client.phone,
      address: client.address,
      district: client.district,
      province: client.province,
      department: client.department,
      postalCode: client.postal_code,
      creditLimit: client.credit_limit,
      paymentTerms: client.payment_terms,
      contactMethod: client.contact_method,
      contactPreference: client.contact_preference,
      industry: client.industry,
      companySize: client.company_size,
      website: client.website,
      notes: client.notes,
      status: client.status,
      assignedUserId: client.assigned_user_id,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
      isActive: client.status === 'active',
      isBusiness: client.client_type === 'business'
    };
  }

  getClientFullName(client) {
    if (client.client_type === 'business') {
      return client.business_name;
    } else {
      return `${client.first_name} ${client.last_name}`;
    }
  }

  validateClientData(clientData, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      if (!clientData.documentType) errors.push("El tipo de documento es obligatorio");
      if (!clientData.documentNumber) errors.push("El número de documento es obligatorio");
      if (!clientData.clientType) errors.push("El tipo de cliente es obligatorio");
    }

    if (clientData.clientType && !['individual', 'business'].includes(clientData.clientType)) {
      errors.push("El tipo de cliente debe ser 'individual' o 'business'");
    }

    if (clientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      errors.push("El formato del email es inválido");
    }

    if (clientData.status && !['active', 'inactive', 'suspended', 'blacklisted'].includes(clientData.status)) {
      errors.push("Estado inválido");
    }

    if (clientData.creditLimit && clientData.creditLimit < 0) {
      errors.push("El límite de crédito no puede ser negativo");
    }

    if (clientData.paymentTerms && clientData.paymentTerms < 0) {
      errors.push("Los términos de pago no pueden ser negativos");
    }

    const validDocumentTypes = ['DNI', 'RUC', 'passport', 'CE'];
    if (clientData.documentType && !validDocumentTypes.includes(clientData.documentType)) {
      errors.push("Tipo de documento inválido");
    }

    return errors;
  }
}

module.exports = new ClientService();