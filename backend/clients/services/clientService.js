const clientRepository = require('../repository/clientRepository');
const { ClientDTO, ClientUpdateDTO } = require('../interfaces/clientDto');
const sentinelApiService = require('../../external-apis/services/sentinelApiService');

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

  // 🆕 MÉTODOS PARA INTEGRACIÓN CON SENTINEL API
  async performCreditCheck(clientId) {
    try {
      const client = await clientRepository.findById(clientId);
      if (!client) {
        throw new Error("Cliente no encontrado");
      }

      if (client.document_type !== 'DNI') {
        throw new Error("La consulta crediticia solo está disponible para clientes con DNI");
      }

      if (client.document_number.length !== 8) {
        throw new Error("DNI debe tener 8 dígitos");
      }

      console.log(`🔍 [Client Service] Realizando consulta crediticia para DNI: ${client.document_number}`);
      
      const sentinelData = await sentinelApiService.getQuickCreditAssessment(client.document_number);
      
      const updateData = {
        credit_score: sentinelData.persona.scoreCredito,
        risk_classification: sentinelData.persona.clasificacionRiesgo,
        total_debts: sentinelData.deudas.totalDeudas,
        active_credits: sentinelData.deudas.cantidadDeudas,
        last_credit_check: new Date(),
        sentinel_data: sentinelData,
        automatic_evaluation: sentinelData.evaluacion.recomendacion,
        evaluation_justification: sentinelData.evaluacion.justificacion,
        suggested_credit_limit: sentinelData.evaluacion.limiteCredito,
        is_banked: sentinelData.persona.scoreCredito > 400,
        banking_history_summary: this.generateBankingHistorySummary(sentinelData)
      };

      const updatedClient = await clientRepository.update(clientId, updateData);
      
      return {
        client: this.formatClientResponse(updatedClient),
        creditAssessment: sentinelData.evaluacion,
        message: "Consulta crediticia realizada exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en ClientService.performCreditCheck:', error.message);
      throw error;
    }
  }

  async getCreditAssessment(clientId) {
    try {
      const client = await clientRepository.findById(clientId);
      if (!client) {
        throw new Error("Cliente no encontrado");
      }

      if (!client.credit_score || client.credit_score === null) {
        throw new Error("No hay datos crediticios disponibles. Realice una consulta crediticia primero.");
      }

      return {
        client: this.formatClientResponse(client),
        creditInfo: {
          score: client.credit_score,
          scoreLabel: this.getCreditScoreLabel(client.credit_score),
          riskClassification: client.risk_classification,
          totalDebts: client.total_debts,
          activeCredits: client.active_credits,
          automaticEvaluation: client.automatic_evaluation,
          evaluationJustification: client.evaluation_justification,
          suggestedCreditLimit: client.suggested_credit_limit,
          isBanked: client.is_banked,
          lastCreditCheck: client.last_credit_check
        }
      };
    } catch (error) {
      console.error('❌ Error en ClientService.getCreditAssessment:', error.message);
      throw error;
    }
  }

  async getClientsByDNI(dni) {
    try {
      const client = await clientRepository.findByDocument('DNI', dni);
      if (!client) {
        throw new Error("Cliente no encontrado");
      }
      return this.formatClientResponse(client);
    } catch (error) {
      console.error('❌ Error en ClientService.getClientsByDNI:', error.message);
      throw error;
    }
  }

  async getClientsByCreditScore(minScore, maxScore) {
    try {
      const clients = await clientRepository.findByCreditScore(minScore, maxScore);
      return clients.map(client => this.formatClientResponse(client));
    } catch (error) {
      console.error('❌ Error en ClientService.getClientsByCreditScore:', error.message);
      throw error;
    }
  }

  async getClientsByRiskClassification(riskClass) {
    try {
      const clients = await clientRepository.findByRiskClassification(riskClass);
      return clients.map(client => this.formatClientResponse(client));
    } catch (error) {
      console.error('❌ Error en ClientService.getClientsByRiskClassification:', error.message);
      throw error;
    }
  }

  async getBankedClients() {
    try {
      const clients = await clientRepository.findBankedClients();
      return clients.map(client => this.formatClientResponse(client));
    } catch (error) {
      console.error('❌ Error en ClientService.getBankedClients:', error.message);
      throw error;
    }
  }

  async getClientsNeedingCreditCheck() {
    try {
      const clients = await clientRepository.findNeedingCreditCheck();
      return clients.map(client => this.formatClientResponse(client));
    } catch (error) {
      console.error('❌ Error en ClientService.getClientsNeedingCreditCheck:', error.message);
      throw error;
    }
  }

  async getCreditReport() {
    try {
      const report = await clientRepository.getCreditReport();
      return report;
    } catch (error) {
      console.error('❌ Error en ClientService.getCreditReport:', error.message);
      throw error;
    }
  }

  async getHighRiskClients() {
    try {
      const clients = await clientRepository.getHighRiskClients();
      return clients.map(client => this.formatClientResponse(client));
    } catch (error) {
      console.error('❌ Error en ClientService.getHighRiskClients:', error.message);
      throw error;
    }
  }

  async bulkCreditCheck(dniList) {
    try {
      const results = [];
      
      for (const dni of dniList) {
        try {
          const client = await clientRepository.findByDocument('DNI', dni);
          if (client) {
            const result = await this.performCreditCheck(client.id);
            results.push({
              dni,
              status: 'success',
              result
            });
          } else {
            results.push({
              dni,
              status: 'error',
              error: 'Cliente no encontrado'
            });
          }
        } catch (error) {
          results.push({
            dni,
            status: 'error',
            error: error.message
          });
        }
      }
      
      return {
        results,
        summary: {
          total: dniList.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'error').length
        }
      };
    } catch (error) {
      console.error('❌ Error en ClientService.bulkCreditCheck:', error.message);
      throw error;
    }
  }

  generateBankingHistorySummary(sentinelData) {
    if (!sentinelData.persona || !sentinelData.deudas) {
      return 'No hay información bancaria disponible';
    }

    const { scoreCredito, clasificacionRiesgo } = sentinelData.persona;
    const { totalDeudas, cantidadDeudas } = sentinelData.deudas;

    let summary = `Score crediticio: ${scoreCredito} (${this.getCreditScoreLabel(scoreCredito)}). `;
    summary += `Clasificación de riesgo: ${clasificacionRiesgo}. `;
    summary += `Total deudas: S/. ${totalDeudas.toFixed(2)}. `;
    summary += `Cantidad de deudas: ${cantidadDeudas}.`;

    return summary;
  }

  getCreditScoreLabel(score) {
    if (!score) return 'No evaluado';
    
    if (score >= 750) return 'Excelente';
    if (score >= 650) return 'Bueno';
    if (score >= 550) return 'Regular';
    if (score >= 450) return 'Malo';
    return 'Muy malo';
  }

  formatClientResponse(client) {
    if (!client) return null;

    const baseResponse = {
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

    // Agregar datos crediticios si existen
    if (client.credit_score !== null && client.credit_score !== undefined) {
      baseResponse.creditInfo = {
        score: client.credit_score,
        scoreLabel: this.getCreditScoreLabel(client.credit_score),
        riskClassification: client.risk_classification,
        totalDebts: client.total_debts,
        activeCredits: client.active_credits,
        overdueCredits: client.overdue_credits,
        automaticEvaluation: client.automatic_evaluation,
        evaluationJustification: client.evaluation_justification,
        suggestedCreditLimit: client.suggested_credit_limit,
        isBanked: client.is_banked,
        lastCreditCheck: client.last_credit_check,
        bankingHistorySummary: client.banking_history_summary
      };
    }

    return baseResponse;
  }
}

module.exports = new ClientService();