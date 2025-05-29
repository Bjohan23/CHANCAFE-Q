package com.example.chancafe_q.model;

/**
 * Modelo de datos para el Usuario/Asesor
 */
public class User {
    private String id;
    private String code;
    private String name;
    private String email;
    private String role;
    private boolean isActive;

    // Constructor vacío
    public User() {
    }

    // Constructor con parámetros
    public User(String id, String code, String name, String email, String role, boolean isActive) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.email = email;
        this.role = role;
        this.isActive = isActive;
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}