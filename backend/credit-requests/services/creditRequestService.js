const creditRequestRepository = require('../repository/creditRequestRepository');
const { CreditRequestDTO, CreditRequestUpdateDTO, CreditRequestApprovalDTO, CreditRequestRejectionDTO } = require('../interfaces/creditRequestDto');

class CreditRequestService {

  async createCreditRequest(creditRequestData) {
    try {
      const {
        clientId,
        userId,
        requestedAmount,
        currency = 'PEN',
        exchangeRate = 1,
        paymentTerms,
        purpose,
        description,
        priority = 'medium',
        riskAssessment,
        documents,
        notes,
        internalNotes
      } = creditRequestData;

      if (!clientId || !userId) {
        throw new Error("Cliente y usuario son obligatorios");
      }

      if (!requestedAmount || requestedAmount <= 0) {
        throw new Error("El monto solicitado debe ser mayor a 0");
      }

      if (!paymentTerms || paymentTerms <= 0) {
        throw new Error("Los términos de pago deben ser mayor a 0");
      }

      if (!purpose) {
        throw new Error("El propósito de la solicitud es obligatorio");
      }

      const requestNumber = await creditRequestRepository.generateRequestNumber();

      const creditRequestDto = new CreditRequestDTO({
        clientId,
        userId,
        requestNumber,
        requestedAmount,
        currency,
        exchangeRate,
        paymentTerms,
        purpose,
        description,
        status: 'pending',
        priority,
        riskAssessment,
        documents,
        notes,
        internalNotes
      });

      const newCreditRequest = await creditRequestRepository.create({
        client_id: creditRequestDto.clientId,
        user_id: creditRequestDto.userId,
        request_number: creditRequestDto.requestNumber,
        requested_amount: creditRequestDto.requestedAmount,
        currency: creditRequestDto.currency,
        exchange_rate: creditRequestDto.exchangeRate,
        payment_terms: creditRequestDto.paymentTerms,
        purpose: creditRequestDto.purpose,
        description: creditRequestDto.description,
        status: creditRequestDto.status,
        priority: creditRequestDto.priority,
        risk_assessment: creditRequestDto.riskAssessment,
        documents: creditRequestDto.documents,
        notes: creditRequestDto.notes,
        internal_notes: creditRequestDto.internalNotes
      });

      return {
        creditRequest: this.formatCreditRequestResponse(newCreditRequest),
        message: "Solicitud de crédito creada exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en CreditRequestService.createCreditRequest:', error.message);
      throw error;
    }
  }

  async getCreditRequestById(id) {
    try {
      const creditRequest = await creditRequestRepository.findById(id);
      if (!creditRequest) {
        throw new Error("Solicitud de crédito no encontrada");
      }
      return this.formatCreditRequestResponse(creditRequest);
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getCreditRequestById:', error.message);
      throw error;
    }
  }

  async getCreditRequestByNumber(requestNumber) {
    try {
      const creditRequest = await creditRequestRepository.findByRequestNumber(requestNumber);
      if (!creditRequest) {
        throw new Error("Solicitud de crédito no encontrada");
      }
      return this.formatCreditRequestResponse(creditRequest);
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getCreditRequestByNumber:', error.message);
      throw error;
    }
  }

  async getAllCreditRequests(filters = {}, pagination = {}) {
    try {
      if (pagination.page && pagination.limit) {
        const result = await creditRequestRepository.findAndCountAll(filters, pagination);
        return {
          creditRequests: result.creditRequests.map(cr => this.formatCreditRequestResponse(cr)),
          pagination: {
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            pageSize: result.pageSize
          }
        };
      } else {
        const creditRequests = await creditRequestRepository.findAll(filters);
        return creditRequests.map(cr => this.formatCreditRequestResponse(cr));
      }
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getAllCreditRequests:', error.message);
      throw error;
    }
  }

  async getCreditRequestsByStatus(status) {
    try {
      const creditRequests = await creditRequestRepository.findByStatus(status);
      return creditRequests.map(cr => this.formatCreditRequestResponse(cr));
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getCreditRequestsByStatus:', error.message);
      throw error;
    }
  }

  async getCreditRequestsByClient(clientId) {
    try {
      const creditRequests = await creditRequestRepository.findByClient(clientId);
      return creditRequests.map(cr => this.formatCreditRequestResponse(cr));
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getCreditRequestsByClient:', error.message);
      throw error;
    }
  }

  async getCreditRequestsByUser(userId) {
    try {
      const creditRequests = await creditRequestRepository.findByUser(userId);
      return creditRequests.map(cr => this.formatCreditRequestResponse(cr));
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getCreditRequestsByUser:', error.message);
      throw error;
    }
  }

  async getCreditRequestsByPriority(priority) {
    try {
      const creditRequests = await creditRequestRepository.findByPriority(priority);
      return creditRequests.map(cr => this.formatCreditRequestResponse(cr));
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getCreditRequestsByPriority:', error.message);
      throw error;
    }
  }

  async updateCreditRequest(id, updateData) {
    try {
      const existingCreditRequest = await creditRequestRepository.findById(id);
      if (!existingCreditRequest) {
        throw new Error("Solicitud de crédito no encontrada");
      }

      if (existingCreditRequest.status === 'approved' || existingCreditRequest.status === 'rejected') {
        throw new Error("No se puede modificar una solicitud aprobada o rechazada");
      }

      const creditRequestUpdateDto = new CreditRequestUpdateDTO(updateData);
      const updatedCreditRequest = await creditRequestRepository.update(id, {
        requested_amount: creditRequestUpdateDto.requestedAmount,
        currency: creditRequestUpdateDto.currency,
        exchange_rate: creditRequestUpdateDto.exchangeRate,
        payment_terms: creditRequestUpdateDto.paymentTerms,
        purpose: creditRequestUpdateDto.purpose,
        description: creditRequestUpdateDto.description,
        status: creditRequestUpdateDto.status,
        priority: creditRequestUpdateDto.priority,
        risk_assessment: creditRequestUpdateDto.riskAssessment,
        documents: creditRequestUpdateDto.documents,
        approval_conditions: creditRequestUpdateDto.approvalConditions,
        rejection_reason: creditRequestUpdateDto.rejectionReason,
        approved_amount: creditRequestUpdateDto.approvedAmount,
        approved_terms: creditRequestUpdateDto.approvedTerms,
        expires_at: creditRequestUpdateDto.expiresAt,
        notes: creditRequestUpdateDto.notes,
        internal_notes: creditRequestUpdateDto.internalNotes
      });
      
      return {
        creditRequest: this.formatCreditRequestResponse(updatedCreditRequest),
        message: "Solicitud de crédito actualizada exitosamente"
      };
    } catch (error) {
      console.error('❌ Error en CreditRequestService.updateCreditRequest:', error.message);
      throw error;
    }
  }

  async changeCreditRequestStatus(id, status) {
    try {
      const updatedCreditRequest = await creditRequestRepository.changeStatus(id, status);
      if (!updatedCreditRequest) {
        throw new Error("Solicitud de crédito no encontrada");
      }
      return {
        message: `Estado de la solicitud actualizado a: ${status}`,
        creditRequest: this.formatCreditRequestResponse(updatedCreditRequest)
      };
    } catch (error) {
      console.error('❌ Error en CreditRequestService.changeCreditRequestStatus:', error.message);
      throw error;
    }
  }

  async approveCreditRequest(id, approvalData, approvedByUserId) {
    try {
      const existingCreditRequest = await creditRequestRepository.findById(id);
      if (!existingCreditRequest) {
        throw new Error("Solicitud de crédito no encontrada");
      }

      if (existingCreditRequest.status !== 'pending' && existingCreditRequest.status !== 'under_review') {
        throw new Error("Solo se pueden aprobar solicitudes pendientes o en revisión");
      }

      const {
        approvedAmount,
        approvedTerms,
        approvalConditions,
        expiresAt,
        notes
      } = approvalData;

      if (!approvedAmount || approvedAmount <= 0) {
        throw new Error("El monto aprobado debe ser mayor a 0");
      }

      if (!approvedTerms || approvedTerms <= 0) {
        throw new Error("Los términos aprobados deben ser mayor a 0");
      }

      const approvalDto = new CreditRequestApprovalDTO({
        approvedAmount,
        approvedTerms,
        approvalConditions,
        expiresAt,
        notes
      });

      const updatedCreditRequest = await creditRequestRepository.approve(id, {
        ...approvalDto,
        approvedBy: approvedByUserId
      });

      return {
        message: "Solicitud de crédito aprobada exitosamente",
        creditRequest: this.formatCreditRequestResponse(updatedCreditRequest)
      };
    } catch (error) {
      console.error('❌ Error en CreditRequestService.approveCreditRequest:', error.message);
      throw error;
    }
  }

  async rejectCreditRequest(id, rejectionData, rejectedByUserId) {
    try {
      const existingCreditRequest = await creditRequestRepository.findById(id);
      if (!existingCreditRequest) {
        throw new Error("Solicitud de crédito no encontrada");
      }

      if (existingCreditRequest.status !== 'pending' && existingCreditRequest.status !== 'under_review') {
        throw new Error("Solo se pueden rechazar solicitudes pendientes o en revisión");
      }

      const {
        rejectionReason,
        notes
      } = rejectionData;

      if (!rejectionReason) {
        throw new Error("El motivo del rechazo es obligatorio");
      }

      const rejectionDto = new CreditRequestRejectionDTO({
        rejectionReason,
        notes
      });

      const updatedCreditRequest = await creditRequestRepository.reject(id, {
        ...rejectionDto,
        rejectedBy: rejectedByUserId
      });

      return {
        message: "Solicitud de crédito rechazada",
        creditRequest: this.formatCreditRequestResponse(updatedCreditRequest)
      };
    } catch (error) {
      console.error('❌ Error en CreditRequestService.rejectCreditRequest:', error.message);
      throw error;
    }
  }

  async deleteCreditRequest(id) {
    try {
      const creditRequest = await creditRequestRepository.findById(id);
      if (!creditRequest) {
        throw new Error("Solicitud de crédito no encontrada");
      }

      if (creditRequest.status === 'approved') {
        throw new Error("No se puede eliminar una solicitud aprobada");
      }

      const deleted = await creditRequestRepository.delete(id);
      if (!deleted) {
        throw new Error("Error al eliminar la solicitud de crédito");
      }

      return {
        message: "Solicitud de crédito eliminada exitosamente",
        deletedCreditRequest: this.formatCreditRequestResponse(creditRequest)
      };
    } catch (error) {
      console.error('❌ Error en CreditRequestService.deleteCreditRequest:', error.message);
      throw error;
    }
  }

  async getCreditRequestStats() {
    try {
      return await creditRequestRepository.getCreditRequestStats();
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getCreditRequestStats:', error.message);
      throw error;
    }
  }

  async getCreditRequestWithRelations(id, relations = []) {
    try {
      const creditRequest = await creditRequestRepository.findWithRelations(id, relations);
      if (!creditRequest) {
        throw new Error("Solicitud de crédito no encontrada");
      }
      return this.formatCreditRequestResponse(creditRequest);
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getCreditRequestWithRelations:', error.message);
      throw error;
    }
  }

  async getExpiringCreditRequests(days = 7) {
    try {
      const expiringRequests = await creditRequestRepository.findExpiring(days);
      return expiringRequests.map(cr => this.formatCreditRequestResponse(cr));
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getExpiringCreditRequests:', error.message);
      throw error;
    }
  }

  async getExpiredCreditRequests() {
    try {
      const expiredRequests = await creditRequestRepository.findExpired();
      return expiredRequests.map(cr => this.formatCreditRequestResponse(cr));
    } catch (error) {
      console.error('❌ Error en CreditRequestService.getExpiredCreditRequests:', error.message);
      throw error;
    }
  }

  async markExpiredCreditRequests() {
    try {
      const expiredRequests = await creditRequestRepository.findExpired();
      let markedCount = 0;

      for (const request of expiredRequests) {
        if (request.status === 'approved') {
          await creditRequestRepository.markAsExpired(request.id);
          markedCount++;
        }
      }

      return {
        message: `${markedCount} solicitudes marcadas como vencidas`,
        count: markedCount
      };
    } catch (error) {
      console.error('❌ Error en CreditRequestService.markExpiredCreditRequests:', error.message);
      throw error;
    }
  }

  async updateRiskAssessment(id, riskAssessment) {
    try {
      const existingCreditRequest = await creditRequestRepository.findById(id);
      if (!existingCreditRequest) {
        throw new Error("Solicitud de crédito no encontrada");
      }

      const updatedCreditRequest = await creditRequestRepository.update(id, {
        risk_assessment: riskAssessment,
        status: 'under_review'
      });

      return {
        message: "Evaluación de riesgo actualizada",
        creditRequest: this.formatCreditRequestResponse(updatedCreditRequest)
      };
    } catch (error) {
      console.error('❌ Error en CreditRequestService.updateRiskAssessment:', error.message);
      throw error;
    }
  }

  formatCreditRequestResponse(creditRequest) {
    if (!creditRequest) return null;

    return {
      id: creditRequest.id,
      clientId: creditRequest.client_id,
      userId: creditRequest.user_id,
      requestNumber: creditRequest.request_number,
      requestedAmount: creditRequest.requested_amount,
      approvedAmount: creditRequest.approved_amount,
      currency: creditRequest.currency,
      exchangeRate: creditRequest.exchange_rate,
      paymentTerms: creditRequest.payment_terms,
      approvedTerms: creditRequest.approved_terms,
      purpose: creditRequest.purpose,
      description: creditRequest.description,
      status: creditRequest.status,
      priority: creditRequest.priority,
      riskAssessment: creditRequest.risk_assessment,
      documents: creditRequest.documents,
      approvalConditions: creditRequest.approval_conditions,
      rejectionReason: creditRequest.rejection_reason,
      approvedBy: creditRequest.approved_by,
      approvedAt: creditRequest.approved_at,
      expiresAt: creditRequest.expires_at,
      notes: creditRequest.notes,
      internalNotes: creditRequest.internal_notes,
      createdAt: creditRequest.created_at,
      updatedAt: creditRequest.updated_at,
      isPending: creditRequest.status === 'pending',
      isApproved: creditRequest.status === 'approved',
      isRejected: creditRequest.status === 'rejected',
      isExpired: creditRequest.status === 'expired' || (creditRequest.expires_at && new Date(creditRequest.expires_at) < new Date()),
      isUnderReview: creditRequest.status === 'under_review'
    };
  }

  validateCreditRequestData(creditRequestData, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      if (!creditRequestData.clientId) errors.push("El cliente es obligatorio");
      if (!creditRequestData.userId) errors.push("El usuario es obligatorio");
      if (!creditRequestData.requestedAmount) errors.push("El monto solicitado es obligatorio");
      if (!creditRequestData.purpose) errors.push("El propósito es obligatorio");
    }

    if (creditRequestData.requestedAmount && creditRequestData.requestedAmount <= 0) {
      errors.push("El monto solicitado debe ser mayor a 0");
    }

    if (creditRequestData.approvedAmount && creditRequestData.approvedAmount <= 0) {
      errors.push("El monto aprobado debe ser mayor a 0");
    }

    if (creditRequestData.paymentTerms && creditRequestData.paymentTerms <= 0) {
      errors.push("Los términos de pago deben ser mayor a 0");
    }

    if (creditRequestData.approvedTerms && creditRequestData.approvedTerms <= 0) {
      errors.push("Los términos aprobados deben ser mayor a 0");
    }

    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'cancelled', 'expired'];
    if (creditRequestData.status && !validStatuses.includes(creditRequestData.status)) {
      errors.push("Estado inválido");
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (creditRequestData.priority && !validPriorities.includes(creditRequestData.priority)) {
      errors.push("Prioridad inválida");
    }

    const validCurrencies = ['PEN', 'USD', 'EUR'];
    if (creditRequestData.currency && !validCurrencies.includes(creditRequestData.currency)) {
      errors.push("Moneda inválida");
    }

    return errors;
  }
}

module.exports = new CreditRequestService();