package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.util.Date;
import java.util.List;

/**
 * Modelo de datos para la Solicitud de Crédito
 */
public class CreditRequest {
    private int id;
    
    @SerializedName("client_id")
    private int clientId;
    
    @SerializedName("user_id")
    private int userId;
    
    @SerializedName("requested_amount")
    private Double requestedAmount;
    
    @SerializedName("request_number")
    private String requestNumber;
    
    private String currency;
    
    @SerializedName("exchange_rate")
    private Double exchangeRate;
    
    @SerializedName("payment_terms")
    private Integer paymentTerms;
    
    private String purpose;
    private String description;
    
    private String priority; // "low", "medium", "high", "urgent"
    
    @SerializedName("risk_assessment")
    private String riskAssessment;
    
    @SerializedName("documents")
    private List<String> documents;
    
    @SerializedName("approval_conditions")
    private String approvalConditions;
    
    private String status; // "pending", "approved", "rejected", "expired"
    
    @SerializedName("approved_amount")
    private Double approvedAmount;
    
    @SerializedName("approved_terms")
    private String approvedTerms;
    
    @SerializedName("approved_by")
    private Integer approvedBy;
    
    @SerializedName("approved_at")
    private Date approvedAt;
    
    @SerializedName("rejection_reason")
    private String rejectionReason;
    
    @SerializedName("expires_at")
    private Date expiresAt;
    
    private String notes;
    
    @SerializedName("internal_notes")
    private String internalNotes;
    
    @SerializedName("created_at")
    private Date createdAt;
    
    @SerializedName("updated_at")
    private Date updatedAt;
    
    // Campos adicionales para cálculos de crédito
    @SerializedName("requested_terms")
    private int requestedTerms;
    
    @SerializedName("monthly_income")
    private double monthlyIncome;
    
    @SerializedName("current_debts")
    private double currentDebts;
    
    @SerializedName("risk_level")
    private String riskLevel;
    
    // Relaciones
    @SerializedName("client")
    private Client client;
    
    @SerializedName("user")
    private User user;

    // Constructor vacío
    public CreditRequest() {
        this.status = "pending";
        this.priority = "medium";
        this.requestedAmount = 0.0;
        this.currency = "PEN";
        this.exchangeRate = 1.0;
    }

    // Constructor con parámetros básicos
    public CreditRequest(int clientId, int userId, Double requestedAmount, Integer paymentTerms, String purpose) {
        this();
        this.clientId = clientId;
        this.userId = userId;
        this.requestedAmount = requestedAmount;
        this.paymentTerms = paymentTerms;
        this.purpose = purpose;
    }

    // Getters y Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getClientId() {
        return clientId;
    }

    public void setClientId(int clientId) {
        this.clientId = clientId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public Double getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(Double requestedAmount) {
        this.requestedAmount = requestedAmount;
    }

    public int getRequestedTerms() {
        return requestedTerms;
    }

    public void setRequestedTerms(int requestedTerms) {
        this.requestedTerms = requestedTerms;
    }

    public double getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(double monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public double getCurrentDebts() {
        return currentDebts;
    }

    public void setCurrentDebts(double currentDebts) {
        this.currentDebts = currentDebts;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getApprovedAmount() {
        return approvedAmount;
    }

    public void setApprovedAmount(Double approvedAmount) {
        this.approvedAmount = approvedAmount;
    }

    public String getApprovedTerms() {
        return approvedTerms;
    }

    public void setApprovedTerms(String approvedTerms) {
        this.approvedTerms = approvedTerms;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Date getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Date expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // Getters y setters faltantes
    public String getRequestNumber() {
        return requestNumber;
    }

    public void setRequestNumber(String requestNumber) {
        this.requestNumber = requestNumber;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Double getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(Double exchangeRate) {
        this.exchangeRate = exchangeRate;
    }

    public Integer getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(Integer paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getRiskAssessment() {
        return riskAssessment;
    }

    public void setRiskAssessment(String riskAssessment) {
        this.riskAssessment = riskAssessment;
    }

    public List<String> getDocuments() {
        return documents;
    }

    public void setDocuments(List<String> documents) {
        this.documents = documents;
    }

    public String getApprovalConditions() {
        return approvalConditions;
    }

    public void setApprovalConditions(String approvalConditions) {
        this.approvalConditions = approvalConditions;
    }

    public Integer getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(Integer approvedBy) {
        this.approvedBy = approvedBy;
    }

    public Date getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(Date approvedAt) {
        this.approvedAt = approvedAt;
    }

    public String getInternalNotes() {
        return internalNotes;
    }

    public void setInternalNotes(String internalNotes) {
        this.internalNotes = internalNotes;
    }

    // Métodos de utilidad
    public boolean isPending() {
        return "pending".equals(status);
    }

    public boolean isApproved() {
        return "approved".equals(status);
    }

    public boolean isRejected() {
        return "rejected".equals(status);
    }

    public boolean isExpired() {
        return "expired".equals(status) || (expiresAt != null && expiresAt.before(new Date()));
    }

    public String getStatusDisplayName() {
        switch (status) {
            case "pending": return "Pendiente";
            case "approved": return "Aprobada";
            case "rejected": return "Rechazada";
            case "expired": return "Expirada";
            default: return status;
        }
    }

    public String getRiskLevelDisplayName() {
        switch (riskLevel) {
            case "low": return "Bajo";
            case "medium": return "Medio";
            case "high": return "Alto";
            default: return riskLevel;
        }
    }

    public double calculateDebtToIncomeRatio() {
        if (monthlyIncome <= 0) return 0;
        return (currentDebts / monthlyIncome) * 100;
    }

    public double calculateMonthlyPayment() {
        double amount = approvedAmount != null ? approvedAmount : requestedAmount;
        int terms = requestedTerms;
        
        // Si hay términos aprobados, intenta convertir de String a int
        if (approvedTerms != null && !approvedTerms.isEmpty()) {
            try {
                terms = Integer.parseInt(approvedTerms);
            } catch (NumberFormatException e) {
                // Si no se puede convertir, usa requestedTerms
                terms = requestedTerms;
            }
        }
        
        if (terms <= 0) return 0;
        
        // Cálculo simple sin intereses para demo
        return amount / terms;
    }

    @Override
    public String toString() {
        return "CreditRequest{" +
                "id=" + id +
                ", clientId=" + clientId +
                ", requestedAmount=" + requestedAmount +
                ", requestedTerms=" + requestedTerms +
                ", status='" + status + '\'' +
                ", riskLevel='" + riskLevel + '\'' +
                ", purpose='" + purpose + '\'' +
                '}';
    }
}