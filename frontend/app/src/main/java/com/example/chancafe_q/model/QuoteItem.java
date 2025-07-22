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
    
    // Cambiar quantity a String para coincidir con la API
    private String quantity;
    
    @SerializedName("unit_price")
    private String unitPrice;
    
    @SerializedName("total_price")
    private String totalPrice;
    
    // Agregar subtotal que viene de la API
    private String subtotal;
    
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
        this.quantity = "1";
        this.unitPrice = "0.0";
        this.totalPrice = "0.0";
        this.subtotal = "0.0";
    }

    // Constructor con parámetros
    public QuoteItem(int quoteId, String description, String quantity, String unitPrice) {
        this();
        this.quoteId = quoteId;
        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        try {
            double qty = Double.parseDouble(quantity);
            double price = Double.parseDouble(unitPrice);
            this.totalPrice = String.valueOf(qty * price);
            this.subtotal = this.totalPrice;
        } catch (NumberFormatException e) {
            this.totalPrice = "0.0";
            this.subtotal = "0.0";
        }
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

    public String getQuantity() {
        return quantity;
    }
    
    public int getQuantityAsInt() {
        try {
            return (int) Double.parseDouble(quantity != null ? quantity : "0");
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    public double getQuantityAsDouble() {
        try {
            return Double.parseDouble(quantity != null ? quantity : "0");
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
        calculateTotalPrice();
    }

    public String getUnitPrice() {
        return unitPrice;
    }
    
    public double getUnitPriceAsDouble() {
        try {
            return Double.parseDouble(unitPrice != null ? unitPrice : "0");
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    public void setUnitPrice(String unitPrice) {
        this.unitPrice = unitPrice;
        calculateTotalPrice();
    }

    public String getTotalPrice() {
        return totalPrice;
    }
    
    public double getTotalPriceAsDouble() {
        try {
            return Double.parseDouble(totalPrice != null ? totalPrice : "0");
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    public void setTotalPrice(String totalPrice) {
        this.totalPrice = totalPrice;
    }
    
    public String getSubtotal() {
        return subtotal;
    }
    
    public double getSubtotalAsDouble() {
        try {
            return Double.parseDouble(subtotal != null ? subtotal : "0");
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
    
    public void setSubtotal(String subtotal) {
        this.subtotal = subtotal;
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
    
    public double getDiscountPercentageAsDouble() {
        if (discountPercentage != null) {
            return discountPercentage;
        }
        return 0.0;
    }
    
    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }
    
    public Double getDiscountAmount() {
        return discountAmount;
    }
    
    public double getDiscountAmountAsDouble() {
        if (discountAmount != null) {
            return discountAmount;
        }
        return 0.0;
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
    public void calculateTotalPrice() {
        try {
            double qty = getQuantityAsDouble();
            double price = getUnitPriceAsDouble();
            double total = qty * price;
            
            // Apply discount if any
            if (discountPercentage != null && discountPercentage > 0) {
                total = total * (1 - discountPercentage / 100);
            } else if (discountAmount != null && discountAmount > 0) {
                total = Math.max(0, total - discountAmount);
            }
            
            this.totalPrice = String.valueOf(total);
            this.subtotal = this.totalPrice;
        } catch (Exception e) {
            this.totalPrice = "0.0";
            this.subtotal = "0.0";
        }
    }
    
    public void calculateTotal() {
        calculateTotalPrice();
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