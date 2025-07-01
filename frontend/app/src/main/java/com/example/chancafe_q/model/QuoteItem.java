package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de datos para el Item de Cotización
 */
public class QuoteItem {
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

    // Métodos de utilidad
    public void calculateTotal() {
        this.totalPrice = this.quantity * this.unitPrice;
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