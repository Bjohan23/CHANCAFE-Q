package com.example.chancafe_q.utils;

import com.example.chancafe_q.data.remote.ApiClient;

/**
 * Verificación de compilación
 * Este archivo verifica que todas las dependencias estén correctas
 */
public class CompilationTest {
    
    public static void testImports() {
        // Test Configuration
        String baseUrl = Configuration.getBaseUrl();
        boolean isDebug = Configuration.AppConfig.isDebugMode();
        
        // Test NetworkUtils
        String fullUrl = NetworkUtils.getFullUrl("test");
        
        // Test ApiClient  
        boolean isAuth = ApiClient.isAuthenticated();
        
        System.out.println("✅ Todas las importaciones funcionan correctamente");
        System.out.println("📍 Base URL: " + baseUrl);
        System.out.println("🔧 Debug Mode: " + isDebug);
    }
}
