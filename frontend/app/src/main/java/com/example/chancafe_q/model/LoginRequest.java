package com.example.chancafe_q.model;

/**
 * Modelo para las credenciales de login
 */
public class LoginRequest {
    private String userCode;
    private String password;

    // Constructor vacío
    public LoginRequest() {
    }

    // Constructor con parámetros
    public LoginRequest(String userCode, String password) {
        this.userCode = userCode;
        this.password = password;
    }

    // Getters y Setters
    public String getUserCode() {
        return userCode;
    }

    public void setUserCode(String userCode) {
        this.userCode = userCode;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "LoginRequest{" +
                "userCode='" + userCode + '\'' +
                ", password='[PROTECTED]'" +
                '}';
    }
}