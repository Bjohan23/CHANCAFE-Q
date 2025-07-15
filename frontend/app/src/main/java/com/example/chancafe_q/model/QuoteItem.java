package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

/**
 * Modelo de datos para el Item de Cotización
 */
public class QuoteItem implements Serializable {
    private int id;
    
    @SerializedName("quote_id")
    private int quoteId;
    
    @SerializedName("product_id")
    private Integer productId;
    
    private String description;
    private int quantity;
    
    @SerializedName("unit_price")
    private double unitPrice;
    
    @SerializedName("total_price")
    private double totalPrice;
    
    private Double discount;
    
    @SerializedName("discount_percentage")
    private Double discountPercentage;
    
    @SerializedName("discount_amount")
    private Double discountAmount;
    
    private String currency;
    private String notes;
    
    // Relación
    private Product product;

    // Constructor vacío
    public QuoteItem() {
        this.quantity = 1;
        this.unitPrice = 0.0;
        this.totalPrice = 0.0;
    }

    // Constructor con parámetros
    public QuoteItem(int quoteId, String description, int quantity, double unitPrice) {
        this();
        this.quoteId = quoteId;
        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = quantity * unitPrice;
    }

    // Getters y Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getQuoteId() {
        return quoteId;
    }

    public void setQuoteId(int quoteId) {
        this.quoteId = quoteId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
        this.totalPrice = quantity * unitPrice;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
        this.totalPrice = quantity * unitPrice;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Double getDiscount() {
        return discount;
    }

    public void setDiscount(Double discount) {
        this.discount = discount;
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
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getProductName() {
        if (product != null && product.getName() != null) {
            return product.getName();
        }
        return description;
    }

    // Métodos de utilidad
    public void calculateTotal() {
        double total = this.quantity * this.unitPrice;
        if (discount != null && discount > 0) {
            total = total * (1 - discount / 100);
        }
        this.totalPrice = total;
    }

    public String getDisplayDescription() {
        if (product != null && product.getName() != null) {
            return product.getName();
        }
        return description != null ? description : "";
    }

    @Override
    public String toString() {
        return "QuoteItem{" +
                "id=" + id +
                ", quoteId=" + quoteId +
                ", description='" + description + '\'' +
                ", quantity=" + quantity +
                ", unitPrice=" + unitPrice +
                ", totalPrice=" + totalPrice +
                '}';
    }
}