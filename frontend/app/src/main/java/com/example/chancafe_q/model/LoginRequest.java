package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo para las credenciales de login
 * Compatible con el backend que espera email y password
 */
public class LoginRequest {
    @SerializedName("email")
    private String email;
    
    private String password;

    // Constructor vacío
    public LoginRequest() {
    }

    // Constructor con parámetros
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Constructor de compatibilidad (userCode se mapea a email)
    public static LoginRequest fromUserCode(String userCode, String password) {
        return new LoginRequest(userCode, password);
    }

    // Getters y Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Método de compatibilidad para getUserCode()
    public String getUserCode() {
        return email;
    }

    public void setUserCode(String userCode) {
        this.email = userCode;
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
                "email='" + email + '\'' +
                ", password='[PROTECTED]'" +
                '}';
    }
}
