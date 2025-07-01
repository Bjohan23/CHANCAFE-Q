package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.util.Date;

/**
 * Modelo de datos para el Proveedor
 */
public class Supplier {
    private int id;
    
    private String name;
    private String ruc;
    private String address;
    private String phone;
    private String email;
    
    @SerializedName("contact_person")
    private String contactPerson;
    
    @SerializedName("payment_terms")
    private String paymentTerms;
    
    private String status; // "active", "inactive", "blocked"
    
    private String notes;
    
    @SerializedName("created_at")
    private Date createdAt;
    
    @SerializedName("updated_at")
    private Date updatedAt;

    // Constructor vacío
    public Supplier() {
        this.status = "active";
    }

    // Constructor con parámetros básicos
    public Supplier(String name, String ruc, String phone, String email) {
        this();
        this.name = name;
        this.ruc = ruc;
        this.phone = phone;
        this.email = email;
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

    public String getRuc() {
        return ruc;
    }

    public void setRuc(String ruc) {
        this.ruc = ruc;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    // Métodos de utilidad
    public boolean isActive() {
        return "active".equals(status);
    }

    public boolean isBlocked() {
        return "blocked".equals(status);
    }

    @Override
    public String toString() {
        return "Supplier{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", ruc='" + ruc + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}