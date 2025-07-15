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
    private Integer clientId;
    
    @SerializedName("user_id")
    private Integer userId;
    
    @SerializedName("quote_number")
    private String quoteNumber;
    
    private String title;
    private String description;
    
    @SerializedName("subtotal")
    private Double subtotal;
    
    @SerializedName("discount_percentage")
    private Double discountPercentage;
    
    @SerializedName("discount_amount")
    private Double discountAmount;
    
    @SerializedName("tax_percentage")
    private Double taxPercentage;
    
    @SerializedName("tax_amount")
    private Double taxAmount;
    
    @SerializedName("total_amount")
    private Double totalAmount;
    
    private String currency;
    
    @SerializedName("exchange_rate")
    private Double exchangeRate;
    
    private String status; // "draft", "sent", "approved", "rejected", "expired"
    
    @SerializedName("valid_until")
    private Date validUntil;
    
    private String notes;
    
    @SerializedName("internal_notes")
    private String internalNotes;
    
    private int revision;
    
    @SerializedName("project_name")
    private String projectName;
    
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
        this.discountPercentage = 0.0;
        this.discountAmount = 0.0;
        this.taxPercentage = 18.0; // IGV por defecto
        this.taxAmount = 0.0;
        this.totalAmount = 0.0;
        this.currency = "PEN";
        this.exchangeRate = 1.0;
        this.pdfGenerated = false;
    }

    // Constructor con parámetros básicos
    public Quote(int clientId, int userId, String title, String description) {
        this();
        this.clientId = clientId;
        this.userId = userId;
        this.title = title;
        this.description = description;
    }

    // Getters y Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Integer getClientId() {
        return clientId;
    }

    public void setClientId(Integer clientId) {
        this.clientId = clientId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
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

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    // Alias method for compatibility
    public Double getTotal() {
        return totalAmount;
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

    // Getters y setters para nuevos campos
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public Double getTaxPercentage() {
        return taxPercentage;
    }

    public void setTaxPercentage(Double taxPercentage) {
        this.taxPercentage = taxPercentage;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getInternalNotes() {
        return internalNotes;
    }

    public void setInternalNotes(String internalNotes) {
        this.internalNotes = internalNotes;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
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