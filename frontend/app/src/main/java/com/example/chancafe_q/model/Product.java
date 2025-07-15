package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.util.Date;

/**
 * Modelo de datos para el Producto
 */
public class Product implements java.io.Serializable {
    private static final long serialVersionUID = 1L;
    private int id;
    
    private String name;
    private String description;
    private String sku;
    
    @SerializedName("category_id")
    private Integer categoryId;
    
    @SerializedName("supplier_id")
    private Integer supplierId;
    
    private Double price;
    
    @SerializedName("cost_price")
    private Double costPrice;
    
    private Integer stock;
    
    @SerializedName("min_stock")
    private Integer minStock;
    
    @SerializedName("max_stock")
    private Integer maxStock;
    
    private String unit; // "unidad", "kg", "litro", etc.
    
    private String brand; // Marca del producto
    
    private String barcode; // Código de barras del producto
    
    private String notes; // Notas adicionales del producto
    
    private Boolean featured; // Producto destacado
    
    @SerializedName("image_url")
    private String imageUrl;
    
    private String status; // "active", "inactive", "discontinued"
    
    @SerializedName("created_at")
    private Date createdAt;
    
    @SerializedName("updated_at")
    private Date updatedAt;
    
    // Relaciones
    private Category category;
    private Supplier supplier;

    // Constructor vacío
    public Product() {
        this.status = "active";
        this.stock = 0;
        this.minStock = 0;
        this.price = 0.0;
        this.costPrice = 0.0;
        this.unit = "unidad";
    }

    // Constructor con parámetros básicos
    public Product(String name, String description, String sku, int categoryId, double price) {
        this();
        this.name = name;
        this.description = description;
        this.sku = sku;
        this.categoryId = categoryId;
        this.price = price;
    }

    // Getters y Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Integer supplierId) {
        this.supplierId = supplierId;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(Double costPrice) {
        this.costPrice = costPrice;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Integer getMinStock() {
        return minStock;
    }

    public void setMinStock(Integer minStock) {
        this.minStock = minStock;
    }

    public Integer getMaxStock() {
        return maxStock;
    }

    public void setMaxStock(Integer maxStock) {
        this.maxStock = maxStock;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean isFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    // Métodos de utilidad
    public boolean isActive() {
        return "active".equals(status);
    }

    public boolean isLowStock() {
        return stock <= minStock;
    }

    public boolean isOutOfStock() {
        return stock <= 0;
    }

    public double getMarginPercentage() {
        if (costPrice <= 0) return 0;
        return ((price - costPrice) / costPrice) * 100;
    }

    public String getDisplayName() {
        return name + " (" + sku + ")";
    }

    public String getCategoryName() {
        return category != null ? category.getName() : "";
    }

    public String getSupplierName() {
        return supplier != null ? supplier.getName() : "";
    }

    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", sku='" + sku + '\'' +
                ", price=" + price +
                ", stock=" + stock +
                ", status='" + status + '\'' +
                '}';
    }
}