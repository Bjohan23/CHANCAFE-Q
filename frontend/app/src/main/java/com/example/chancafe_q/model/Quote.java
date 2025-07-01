package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.util.Date;
import java.util.List;

/**
 * Modelo de datos para la Cotización
 */
public class Quote {
    private int id;
    
    @SerializedName("client_id")
    private int clientId;
    
    @SerializedName("user_id")
    private int userId;
    
    @SerializedName("quote_number")
    private String quoteNumber;
    
    private String description;
    
    @SerializedName("subtotal")
    private double subtotal;
    
    @SerializedName("tax_amount")
    private double taxAmount;
    
    @SerializedName("total_amount")
    private double totalAmount;
    
    private String status; // "draft", "sent", "approved", "rejected", "expired"
    
    @SerializedName("valid_until")
    private Date validUntil;
    
    private int revision;
    
    @SerializedName("pdf_generated")
    private boolean pdfGenerated;
    
    @SerializedName("pdf_url")
    private String pdfUrl;
    
    @SerializedName("created_at")
    private Date createdAt;
    
    @SerializedName("updated_at")
    private Date updatedAt;
    
    // Relaciones
    private Client client;
    private User user;
    
    @SerializedName("quote_items")
    private List<QuoteItem> quoteItems;

    // Constructor vacío
    public Quote() {
        this.status = "draft";
        this.revision = 1;
        this.subtotal = 0.0;
        this.taxAmount = 0.0;
        this.totalAmount = 0.0;
        this.pdfGenerated = false;
    }

    // Constructor con parámetros básicos
    public Quote(int clientId, int userId, String description) {
        this();
        this.clientId = clientId;
        this.userId = userId;
        this.description = description;
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

    public String getQuoteNumber() {
        return quoteNumber;
    }

    public void setQuoteNumber(String quoteNumber) {
        this.quoteNumber = quoteNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    public double getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(double taxAmount) {
        this.taxAmount = taxAmount;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(Date validUntil) {
        this.validUntil = validUntil;
    }

    public int getRevision() {
        return revision;
    }

    public void setRevision(int revision) {
        this.revision = revision;
    }

    public boolean isPdfGenerated() {
        return pdfGenerated;
    }

    public void setPdfGenerated(boolean pdfGenerated) {
        this.pdfGenerated = pdfGenerated;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
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

    public List<QuoteItem> getQuoteItems() {
        return quoteItems;
    }

    public void setQuoteItems(List<QuoteItem> quoteItems) {
        this.quoteItems = quoteItems;
    }

    // Métodos de utilidad
    public boolean isDraft() {
        return "draft".equals(status);
    }

    public boolean isSent() {
        return "sent".equals(status);
    }

    public boolean isApproved() {
        return "approved".equals(status);
    }

    public boolean isExpired() {
        return "expired".equals(status) || (validUntil != null && validUntil.before(new Date()));
    }

    public String getStatusDisplayName() {
        switch (status) {
            case "draft": return "Borrador";
            case "sent": return "Enviada";
            case "approved": return "Aprobada";
            case "rejected": return "Rechazada";
            case "expired": return "Expirada";
            default: return status;
        }
    }

    public void calculateTotals() {
        if (quoteItems != null) {
            subtotal = quoteItems.stream()
                    .mapToDouble(item -> item.getQuantity() * item.getUnitPrice())
                    .sum();
            taxAmount = subtotal * 0.18; // IGV 18%
            totalAmount = subtotal + taxAmount;
        }
    }

    @Override
    public String toString() {
        return "Quote{" +
                "id=" + id +
                ", quoteNumber='" + quoteNumber + '\'' +
                ", clientId=" + clientId +
                ", description='" + description + '\'' +
                ", totalAmount=" + totalAmount +
                ", status='" + status + '\'' +
                ", revision=" + revision +
                '}';
    }
}