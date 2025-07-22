package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * Modelo de datos para la Cotización
 */
public class Quote {
    private int id;
    
    @SerializedName("clientId")
    private Integer clientId;
    
    @SerializedName("userId")
    private Integer userId;
    
    @SerializedName("quoteNumber")
    private String quoteNumber;
    
    private String title;
    private String description;
    
    private Double subtotal;
    
    @SerializedName("discountPercentage")
    private Double discountPercentage;
    
    @SerializedName("discountAmount")
    private Double discountAmount;
    
    @SerializedName("taxPercentage")
    private Double taxPercentage;
    
    @SerializedName("taxAmount")
    private Double taxAmount;
    
    @SerializedName("totalAmount")
    private Double totalAmount;
    
    private String currency;
    
    @SerializedName("exchangeRate")
    private Double exchangeRate;
    
    private String status; // "draft", "sent", "approved", "rejected", "expired"
    
    @SerializedName("validUntil")
    private String validUntil;
    
    private String notes;
    
    @SerializedName("internalNotes")
    private String internalNotes;
    
    private int revision;
    
    @SerializedName("projectName")
    private String projectName;
    
    @SerializedName("pdfGenerated")
    private boolean pdfGenerated;
    
    @SerializedName("pdfUrl")
    private String pdfUrl;
    
    @SerializedName("createdAt")
    private String createdAt;
    
    @SerializedName("updatedAt")
    private String updatedAt;
    
    @SerializedName("isDraft")
    private Boolean isDraft;
    
    @SerializedName("isApproved")
    private Boolean isApproved;
    
    @SerializedName("isExpired")
    private Boolean isExpired;
    
    // Relaciones
    private Client client;
    private User user;
    
    @SerializedName("advisor")
    private User advisor;
    
    @SerializedName("items")
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
        if (subtotal != null) {
            return subtotal;
        }
        return 0.0;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }
    
    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public double getTaxAmount() {
        return taxAmount != null ? taxAmount : 0.0;
    }

    public void setTaxAmount(double taxAmount) {
        this.taxAmount = taxAmount;
    }
    
    public void setTaxAmount(Double taxAmount) {
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
    
    // Safe getter that returns 0.0 if totalAmount is null
    public double getTotalAmountSafe() {
        return totalAmount != null ? totalAmount : 0.0;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(String validUntil) {
        this.validUntil = validUntil;
    }
    
    // Métodos de conversión para compatibilidad con Date
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
    
    public Date getValidUntilAsDate() {
        if (validUntil == null || validUntil.isEmpty()) {
            return null;
        }
        try {
            return DATE_FORMAT.parse(validUntil);
        } catch (ParseException e) {
            return null;
        }
    }
    
    public void setValidUntil(Date date) {
        if (date != null) {
            this.validUntil = DATE_FORMAT.format(date);
        } else {
            this.validUntil = null;
        }
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

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Métodos de conversión para createdAt y updatedAt
    public Date getCreatedAtAsDate() {
        if (createdAt == null || createdAt.isEmpty()) {
            return null;
        }
        try {
            // El formato incluye hora: 2025-07-15 17:56:58
            SimpleDateFormat fullDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
            return fullDateFormat.parse(createdAt);
        } catch (ParseException e) {
            // Intentar solo fecha si falla
            try {
                return DATE_FORMAT.parse(createdAt);
            } catch (ParseException ex) {
                return null;
            }
        }
    }
    
    public Date getUpdatedAtAsDate() {
        if (updatedAt == null || updatedAt.isEmpty()) {
            return null;
        }
        try {
            SimpleDateFormat fullDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
            return fullDateFormat.parse(updatedAt);
        } catch (ParseException e) {
            try {
                return DATE_FORMAT.parse(updatedAt);
            } catch (ParseException ex) {
                return null;
            }
        }
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public User getUser() {
        // Si user es null, devolver advisor (para compatibilidad con backend)
        return user != null ? user : advisor;
    }

    public void setUser(User user) {
        this.user = user;
    }
    
    public User getAdvisor() {
        return advisor;
    }

    public void setAdvisor(User advisor) {
        this.advisor = advisor;
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
    
    // Safe getters for UI
    public double getDiscountAmountSafe() {
        return discountAmount != null ? discountAmount : 0.0;
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

    public Boolean getIsDraft() {
        return isDraft;
    }

    public void setIsDraft(Boolean isDraft) {
        this.isDraft = isDraft;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }

    public Boolean getIsExpired() {
        return isExpired;
    }

    public void setIsExpired(Boolean isExpired) {
        this.isExpired = isExpired;
    }

    // Métodos de utilidad
    public boolean isDraft() {
        return Boolean.TRUE.equals(isDraft) || "draft".equals(status);
    }

    public boolean isSent() {
        return "sent".equals(status);
    }

    public boolean isApproved() {
        return Boolean.TRUE.equals(isApproved) || "approved".equals(status);
    }

    public boolean isExpired() {
        return Boolean.TRUE.equals(isExpired) || "expired".equals(status);
    }

    public String getStatusDisplayName() {
        if (status == null) return "Borrador";
        switch (status.toLowerCase()) {
            case "draft": return "Borrador";
            case "pending": return "Pendiente";
            case "sent": return "Enviada";
            case "approved": return "Aprobada";
            case "rejected": return "Rechazada";
            case "expired": return "Expirada";
            case "converted": return "Convertida";
            default: return status.substring(0, 1).toUpperCase() + status.substring(1);
        }
    }

    public void calculateTotals() {
        if (quoteItems != null) {
            subtotal = quoteItems.stream()
                    .mapToDouble(item -> item.getQuantityAsDouble() * item.getUnitPriceAsDouble())
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