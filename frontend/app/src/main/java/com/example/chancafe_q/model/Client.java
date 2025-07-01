package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.util.Date;

/**
 * Modelo de datos para el Cliente
 */
public class Client {
    private int id;
    
    @SerializedName("first_name")
    private String firstName;
    
    @SerializedName("last_name")
    private String lastName;
    
    @SerializedName("document_type")
    private String documentType;
    
    @SerializedName("document_number")
    private String documentNumber;
    
    private String email;
    private String phone;
    private String address;
    
    @SerializedName("client_type")
    private String clientType; // "individual" o "business"
    
    @SerializedName("business_name")
    private String businessName;
    
    @SerializedName("business_ruc")
    private String businessRuc;
    
    @SerializedName("credit_limit")
    private double creditLimit;
    
    @SerializedName("assigned_user_id")
    private Integer assignedUserId;
    
    private String status; // "active", "inactive", "blocked"
    
    @SerializedName("created_at")
    private Date createdAt;
    
    @SerializedName("updated_at")
    private Date updatedAt;

    // Constructor vacío
    public Client() {
        this.status = "active";
        this.creditLimit = 0.0;
    }

    // Constructor con parámetros básicos
    public Client(String firstName, String lastName, String documentType, String documentNumber, String email, String phone) {
        this();
        this.firstName = firstName;
        this.lastName = lastName;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.email = email;
        this.phone = phone;
        this.clientType = "individual";
    }

    // Getters y Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getClientType() {
        return clientType;
    }

    public void setClientType(String clientType) {
        this.clientType = clientType;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessRuc() {
        return businessRuc;
    }

    public void setBusinessRuc(String businessRuc) {
        this.businessRuc = businessRuc;
    }

    public double getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(double creditLimit) {
        this.creditLimit = creditLimit;
    }

    public Integer getAssignedUserId() {
        return assignedUserId;
    }

    public void setAssignedUserId(Integer assignedUserId) {
        this.assignedUserId = assignedUserId;
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

    // Métodos de utilidad
    public String getFullName() {
        if (clientType != null && clientType.equals("business") && businessName != null) {
            return businessName;
        }
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }

    public boolean isActive() {
        return "active".equals(status);
    }

    public boolean isBusiness() {
        return "business".equals(clientType);
    }

    public boolean isIndividual() {
        return "individual".equals(clientType);
    }

    @Override
    public String toString() {
        return "Client{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", documentType='" + documentType + '\'' +
                ", documentNumber='" + documentNumber + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", clientType='" + clientType + '\'' +
                ", businessName='" + businessName + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}