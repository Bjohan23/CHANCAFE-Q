package com.example.chancafe_q.utils;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Maneja la persistencia del token JWT usando SharedPreferences
 */
public class TokenManager {
    private static final String PREFS_NAME = "chancafe_prefs";
    private static final String TOKEN_KEY = "jwt_token";
    private static final String USER_ID_KEY = "user_id";
    private static final String USERNAME_KEY = "username";
    private static final String USER_ROLE_KEY = "user_role";
    
    private SharedPreferences sharedPreferences;
    private static TokenManager instance;
    
    private TokenManager(Context context) {
        sharedPreferences = context.getApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }
    
    public static synchronized TokenManager getInstance(Context context) {
        if (instance == null) {
            instance = new TokenManager(context);
        }
        return instance;
    }
    
    /**
     * Guarda el token JWT
     */
    public void saveToken(String token) {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(TOKEN_KEY, token);
        editor.apply();
    }
    
    /**
     * Obtiene el token JWT guardado
     */
    public String getToken() {
        return sharedPreferences.getString(TOKEN_KEY, null);
    }
    
    /**
     * Verifica si hay un token válido guardado
     */
    public boolean hasToken() {
        String token = getToken();
        return token != null && !token.isEmpty();
    }
    
    /**
     * Guarda la información del usuario
     */
    public void saveUserInfo(int userId, String username, String role) {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putInt(USER_ID_KEY, userId);
        editor.putString(USERNAME_KEY, username);
        editor.putString(USER_ROLE_KEY, role);
        editor.apply();
    }
    
    /**
     * Obtiene el ID del usuario guardado
     */
    public int getUserId() {
        return sharedPreferences.getInt(USER_ID_KEY, -1);
    }
    
    /**
     * Obtiene el nombre de usuario guardado
     */
    public String getUsername() {
        return sharedPreferences.getString(USERNAME_KEY, null);
    }
    
    /**
     * Obtiene el rol del usuario guardado
     */
    public String getUserRole() {
        return sharedPreferences.getString(USER_ROLE_KEY, null);
    }
    
    /**
     * Limpia toda la información de sesión
     */
    public void clearSession() {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.remove(TOKEN_KEY);
        editor.remove(USER_ID_KEY);
        editor.remove(USERNAME_KEY);
        editor.remove(USER_ROLE_KEY);
        editor.apply();
    }
    
    /**
     * Verifica si el usuario está autenticado
     */
    public boolean isAuthenticated() {
        return hasToken() && getUserId() != -1;
    }
}