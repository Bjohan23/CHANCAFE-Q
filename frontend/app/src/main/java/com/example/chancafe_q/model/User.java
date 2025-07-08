package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.util.Date;

/**
 * Modelo de datos para el Usuario/Asesor
 */
public class User {
    private int id;
    
    @SerializedName("user_code")
    private String userCode; // Código de usuario para login
    
    @SerializedName("first_name")
    private String firstName;
    
    @SerializedName("last_name")
    private String lastName;
    
    @SerializedName("full_name")
    private String fullName;
    
    private String email;
    private String password;
    private String phone;
    private String role; // "admin", "asesor", "supervisor", "sales_rep"
    
    @SerializedName("branch_office")
    private String branchOffice;
    
    private String status; // "active", "inactive"
    
    @SerializedName("avatar_url")
    private String avatarUrl;
    
    @SerializedName("hire_date")
    private Date hireDate;
    
    @SerializedName("commission_rate")
    private String commissionRate;
    
    @SerializedName("last_login")
    private String lastLogin;
    
    @SerializedName("isActive")
    private boolean isActiveFlag;
    
    @SerializedName("isAdmin")
    private boolean isAdminFlag;
    
    @SerializedName("created_at")
    private Date createdAt;
    
    @SerializedName("updated_at")
    private Date updatedAt;

    // Constructor vacío
    public User() {
        this.role = "asesor";
        this.status = "active";
    }

    // Constructor con parámetros básicos
    public User(String userCode, String firstName, String lastName, String email, String role) {
        this();
        this.userCode = userCode;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
    }

    // Constructor completo para registro
    public User(String userCode, String firstName, String lastName, String email, String password, String phone, String role, String branchOffice) {
        this();
        this.userCode = userCode;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        this.branchOffice = branchOffice;
    }

    // Getters y Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUserCode() {
        return userCode;
    }

    public void setUserCode(String userCode) {
        this.userCode = userCode;
    }

    // Método de compatibilidad para getCode()
    public String getCode() {
        return userCode;
    }

    public void setCode(String code) {
        this.userCode = code;
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

    public String getFullName() {
        // Priorizar el full_name de la API si está disponible
        if (fullName != null && !fullName.trim().isEmpty()) {
            return fullName;
        }
        // Fallback a concatenar first_name + last_name
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getBranchOffice() {
        return branchOffice;
    }

    public void setBranchOffice(String branchOffice) {
        this.branchOffice = branchOffice;
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

    // Getters y setters para nuevos campos
    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Date getHireDate() {
        return hireDate;
    }

    public void setHireDate(Date hireDate) {
        this.hireDate = hireDate;
    }

    public String getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(String commissionRate) {
        this.commissionRate = commissionRate;
    }

    public String getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(String lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean getIsActiveFlag() {
        return isActiveFlag;
    }

    public void setIsActiveFlag(boolean isActiveFlag) {
        this.isActiveFlag = isActiveFlag;
    }

    public boolean getIsAdminFlag() {
        return isAdminFlag;
    }

    public void setIsAdminFlag(boolean isAdminFlag) {
        this.isAdminFlag = isAdminFlag;
    }

    // Métodos de utilidad
    public boolean isActive() {
        // Priorizar el flag isActive de la API
        return isActiveFlag || "active".equals(status);
    }

    public boolean isAdmin() {
        // Priorizar el flag isAdmin de la API
        return isAdminFlag || "admin".equals(role);
    }

    public boolean isAsesor() {
        return "asesor".equals(role) || "sales_rep".equals(role);
    }

    public boolean isSupervisor() {
        return "supervisor".equals(role);
    }

    public String getRoleDisplayName() {
        switch (role != null ? role : "") {
            case "admin": return "Administrador";
            case "asesor": return "Asesor";
            case "sales_rep": return "Asesor de Ventas";
            case "supervisor": return "Supervisor";
            default: return role != null ? role : "Usuario";
        }
    }

    // Método de compatibilidad para getName()
    public String getName() {
        return getFullName().trim();
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", branchOffice='" + branchOffice + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}