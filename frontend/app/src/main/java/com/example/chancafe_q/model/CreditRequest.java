package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.util.Date;

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
    private double requestedAmount;
    
    @SerializedName("requested_terms")
    private int requestedTerms; // en meses
    
    @SerializedName("monthly_income")
    private double monthlyIncome;
    
    @SerializedName("current_debts")
    private double currentDebts;
    
    @SerializedName("purpose")
    private String purpose;
    
    @SerializedName("risk_level")
    private String riskLevel; // "low", "medium", "high"
    
    private String status; // "pending", "approved", "rejected", "expired"
    
    @SerializedName("approved_amount")
    private Double approvedAmount;
    
    @SerializedName("approved_terms")
    private Integer approvedTerms;
    
    @SerializedName("rejection_reason")
    private String rejectionReason;
    
    @SerializedName("expires_at")
    private Date expiresAt;
    
    private String notes;
    
    @SerializedName("created_at")
    private Date createdAt;
    
    @SerializedName("updated_at")
    private Date updatedAt;
    
    // Relaciones
    private Client client;
    private User user;

    // Constructor vacío
    public CreditRequest() {
        this.status = "pending";
        this.riskLevel = "medium";
        this.requestedAmount = 0.0;
        this.monthlyIncome = 0.0;
        this.currentDebts = 0.0;
        this.requestedTerms = 12;
    }

    // Constructor con parámetros básicos
    public CreditRequest(int clientId, int userId, double requestedAmount, int requestedTerms, String purpose) {
        this();
        this.clientId = clientId;
        this.userId = userId;
        this.requestedAmount = requestedAmount;
        this.requestedTerms = requestedTerms;
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

    public double getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(double requestedAmount) {
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

    public Integer getApprovedTerms() {
        return approvedTerms;
    }

    public void setApprovedTerms(Integer approvedTerms) {
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
        int terms = approvedTerms != null ? approvedTerms : requestedTerms;
        
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