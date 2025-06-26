class CreditRequestDTO {
    constructor({
        clientId,
        userId,
        requestNumber,
        requestedAmount,
        currency = 'PEN',
        exchangeRate = 1,
        paymentTerms,
        purpose,
        description,
        status = 'pending',
        priority = 'medium',
        riskAssessment,
        documents,
        approvalConditions,
        rejectionReason,
        approvedAmount,
        approvedTerms,
        approvedBy,
        approvedAt,
        expiresAt,
        notes,
        internalNotes
    }) {
        this.clientId = clientId;
        this.userId = userId;
        this.requestNumber = requestNumber;
        this.requestedAmount = requestedAmount;
        this.currency = currency;
        this.exchangeRate = exchangeRate;
        this.paymentTerms = paymentTerms;
        this.purpose = purpose;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.riskAssessment = riskAssessment;
        this.documents = documents;
        this.approvalConditions = approvalConditions;
        this.rejectionReason = rejectionReason;
        this.approvedAmount = approvedAmount;
        this.approvedTerms = approvedTerms;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt;
        this.expiresAt = expiresAt;
        this.notes = notes;
        this.internalNotes = internalNotes;
    }
}

class CreditRequestUpdateDTO {
    constructor({
        requestedAmount,
        currency,
        exchangeRate,
        paymentTerms,
        purpose,
        description,
        status,
        priority,
        riskAssessment,
        documents,
        approvalConditions,
        rejectionReason,
        approvedAmount,
        approvedTerms,
        expiresAt,
        notes,
        internalNotes
    }) {
        this.requestedAmount = requestedAmount;
        this.currency = currency;
        this.exchangeRate = exchangeRate;
        this.paymentTerms = paymentTerms;
        this.purpose = purpose;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.riskAssessment = riskAssessment;
        this.documents = documents;
        this.approvalConditions = approvalConditions;
        this.rejectionReason = rejectionReason;
        this.approvedAmount = approvedAmount;
        this.approvedTerms = approvedTerms;
        this.expiresAt = expiresAt;
        this.notes = notes;
        this.internalNotes = internalNotes;
    }
}

class CreditRequestApprovalDTO {
    constructor({
        approvedAmount,
        approvedTerms,
        approvalConditions,
        expiresAt,
        notes
    }) {
        this.approvedAmount = approvedAmount;
        this.approvedTerms = approvedTerms;
        this.approvalConditions = approvalConditions;
        this.expiresAt = expiresAt;
        this.notes = notes;
    }
}

class CreditRequestRejectionDTO {
    constructor({
        rejectionReason,
        notes
    }) {
        this.rejectionReason = rejectionReason;
        this.notes = notes;
    }
}

module.exports = { 
    CreditRequestDTO, 
    CreditRequestUpdateDTO, 
    CreditRequestApprovalDTO, 
    CreditRequestRejectionDTO 
};