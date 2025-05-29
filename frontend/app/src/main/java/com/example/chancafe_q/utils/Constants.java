package com.example.chancafe_q.utils;

/**
 * Constantes de la aplicación
 */
public class Constants {
    
    // API Constants (para futuro uso)
    public static final String BASE_URL = "https://api.chancafe.com/"; // TODO: Reemplazar con URL real
    public static final String API_VERSION = "v1";
    public static final int TIMEOUT_SECONDS = 30;
    
    // SharedPreferences Keys
    public static final String PREF_USER_ID = "user_id";
    public static final String PREF_USER_CODE = "user_code";
    public static final String PREF_USER_NAME = "user_name";
    public static final String PREF_USER_EMAIL = "user_email";
    public static final String PREF_USER_ROLE = "user_role";
    public static final String PREF_IS_LOGGED_IN = "is_logged_in";
    public static final String PREF_ACCESS_TOKEN = "access_token";
    public static final String PREF_REFRESH_TOKEN = "refresh_token";
    public static final String PREF_REMEMBER_USER = "remember_user";
    
    // Database Constants (para futuro uso)
    public static final String DB_NAME = "chancafe_q_database";
    public static final int DB_VERSION = 1;
    
    // Request Codes
    public static final int REQUEST_CODE_LOGIN = 1001;
    public static final int REQUEST_CODE_PERMISSION = 1002;
    
    // Bundle Keys
    public static final String BUNDLE_USER_DATA = "user_data";
    public static final String BUNDLE_QUOTE_ID = "quote_id";
    public static final String BUNDLE_CLIENT_ID = "client_id";
    public static final String BUNDLE_PRODUCT_ID = "product_id";
    
    // Error Messages
    public static final String ERROR_NETWORK = "Error de conexión a internet";
    public static final String ERROR_SERVER = "Error del servidor";
    public static final String ERROR_INVALID_CREDENTIALS = "Credenciales inválidas";
    public static final String ERROR_SESSION_EXPIRED = "Sesión expirada";
    public static final String ERROR_PERMISSION_DENIED = "Permisos denegados";
    
    // Success Messages
    public static final String SUCCESS_LOGIN = "Inicio de sesión exitoso";
    public static final String SUCCESS_LOGOUT = "Sesión cerrada exitosamente";
    public static final String SUCCESS_SAVE = "Guardado exitosamente";
    public static final String SUCCESS_UPDATE = "Actualizado exitosamente";
    public static final String SUCCESS_DELETE = "Eliminado exitosamente";
    
    // Menu Items
    public static final String MENU_NEW_QUOTE = "new_quote";
    public static final String MENU_MY_QUOTES = "my_quotes";
    public static final String MENU_CLIENTS = "clients";
    public static final String MENU_PRODUCTS = "products";
    public static final String MENU_CREDIT_REQUESTS = "credit_requests";
    public static final String MENU_HOME = "home";
    public static final String MENU_AGENDA = "agenda";
    public static final String MENU_PROFILE = "profile";
    
    // Validation Constants
    public static final int MIN_PASSWORD_LENGTH = 6;
    public static final int MIN_USER_CODE_LENGTH = 3;
    public static final int MAX_USER_CODE_LENGTH = 20;
    public static final int MAX_NAME_LENGTH = 100;
    
    // Animation Durations
    public static final int ANIMATION_DURATION_SHORT = 200;
    public static final int ANIMATION_DURATION_MEDIUM = 300;
    public static final int ANIMATION_DURATION_LONG = 500;
    
    // Date Formats
    public static final String DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
    public static final String DATE_FORMAT_SERVER = "yyyy-MM-dd";
    public static final String DATETIME_FORMAT_DISPLAY = "dd/MM/yyyy HH:mm";
    public static final String DATETIME_FORMAT_SERVER = "yyyy-MM-dd'T'HH:mm:ss";
    
    // Private constructor to prevent instantiation
    private Constants() {
        throw new AssertionError("Cannot instantiate Constants class");
    }
}