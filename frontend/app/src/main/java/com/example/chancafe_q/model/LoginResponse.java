package com.example.chancafe_q.model;

/**
 * Modelo de respuesta para el login
 * Incluye los datos del usuario y el token JWT
 */
public class LoginResponse {
    private User user;
    private String token;
    private String refreshToken;
    
    // Constructores
    public LoginResponse() {}
    
    public LoginResponse(User user, String token) {
        this.user = user;
        this.token = token;
    }
    
    public LoginResponse(User user, String token, String refreshToken) {
        this.user = user;
        this.token = token;
        this.refreshToken = refreshToken;
    }
    
    // Getters y Setters
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    @Override
    public String toString() {
        return "LoginResponse{" +
                "user=" + user +
                ", token='" + token + '\'' +
                ", refreshToken='" + refreshToken + '\'' +
                '}';
    }
}
