package com.example.chancafe_q.utils;

/**
 * Configuración de ambientes para la aplicación
 * Permite cambiar fácilmente entre desarrollo, staging y producción
 */
public class Configuration {
    
    // Enum para diferentes ambientes
    public enum Environment {
        DEVELOPMENT,
        STAGING,
        PRODUCTION
    }
    
    // Ambiente actual (cambiar según necesidad)
    private static final Environment CURRENT_ENVIRONMENT = Environment.DEVELOPMENT;
    
    // URLs por ambiente
    private static final String DEV_BASE_URL = "http://10.0.2.2:3000/api/";  // IP Ethernet principal
    // private static final String DEV_BASE_URL = "http://10.0.2.2:3000/api/"; // Para emulador (localhost del host)
    // private static final String DEV_BASE_URL = "http://172.21.208.1:3000/api/"; // Si usas WSL
    private static final String STAGING_BASE_URL = "https://staging.chancafe.com/api/";
    private static final String PROD_BASE_URL = "https://api.chancafe.com/api/";
    
    /**
     * Obtiene la URL base según el ambiente actual
     */
    public static String getBaseUrl() {
        switch (CURRENT_ENVIRONMENT) {
            case DEVELOPMENT:
                return DEV_BASE_URL;
            case STAGING:
                return STAGING_BASE_URL;
            case PRODUCTION:
                return PROD_BASE_URL;
            default:
                return DEV_BASE_URL;
        }
    }
    
    /**
     * Obtiene el ambiente actual
     */
    public static Environment getCurrentEnvironment() {
        return CURRENT_ENVIRONMENT;
    }
    
    /**
     * Verifica si estamos en modo desarrollo
     */
    public static boolean isDevelopment() {
        return CURRENT_ENVIRONMENT == Environment.DEVELOPMENT;
    }
    
    /**
     * Verifica si estamos en modo producción
     */
    public static boolean isProduction() {
        return CURRENT_ENVIRONMENT == Environment.PRODUCTION;
    }
    
    /**
     * Configuraciones de red por ambiente
     */
    public static class NetworkConfig {
        public static int getConnectTimeout() {
            return isDevelopment() ? 60 : 30; // Más tiempo en desarrollo
        }
        
        public static int getReadTimeout() {
            return isDevelopment() ? 60 : 30;
        }
        
        public static int getWriteTimeout() {
            return isDevelopment() ? 60 : 30;
        }
        
        public static boolean isLoggingEnabled() {
            return isDevelopment(); // Solo logs en desarrollo
        }
    }
    
    /**
     * Configuraciones de la aplicación
     */
    public static class AppConfig {
        public static String getAppName() {
            switch (CURRENT_ENVIRONMENT) {
                case DEVELOPMENT:
                    return "ChancafeQ Dev";
                case STAGING:
                    return "ChancafeQ Staging";
                case PRODUCTION:
                    return "ChancafeQ";
                default:
                    return "ChancafeQ";
            }
        }
        
        public static boolean isDebugMode() {
            return CURRENT_ENVIRONMENT != Environment.PRODUCTION;
        }
    }
}
