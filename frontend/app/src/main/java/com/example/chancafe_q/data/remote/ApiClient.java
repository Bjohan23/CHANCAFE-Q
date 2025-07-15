package com.example.chancafe_q.data.remote;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import com.example.chancafe_q.utils.Configuration;
import com.example.chancafe_q.utils.TokenManager;
import android.content.Context;

/**
 * Cliente API para configurar Retrofit
 * Maneja la configuración de la conexión HTTP con JWT authentication
 */
public class ApiClient {
    
    // BASE_URL se obtiene dinámicamente de Configuration
    private static Retrofit retrofit = null;
    private static String authToken = null;
    private static Context appContext = null;
    
    public static Retrofit getClient() {
        if (retrofit == null) {
            
            // Configurar Gson para manejo de fechas
            Gson gson = new GsonBuilder()
                    .setDateFormat("yyyy-MM-dd HH:mm:ss")
                    .setLenient()
                    .create();
            
            // Interceptor para logging (solo en debug)
            HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
            if (Configuration.NetworkConfig.isLoggingEnabled()) {
                loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
            } else {
                loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.NONE);
            }
            
            // Interceptor para agregar el token JWT automáticamente
            Interceptor authInterceptor = new Interceptor() {
                @Override
                public Response intercept(Chain chain) throws IOException {
                    Request originalRequest = chain.request();
                    
                    // Obtener token del TokenManager si está disponible
                    String token = null;
                    if (appContext != null) {
                        token = TokenManager.getInstance(appContext).getToken();
                    }
                    
                    // Si no hay token en TokenManager, usar el token en memoria
                    if (token == null || token.isEmpty()) {
                        token = authToken;
                    }
                    
                    // Si no hay token, enviar request normal
                    if (token == null || token.isEmpty()) {
                        return chain.proceed(originalRequest);
                    }
                    
                    // Agregar token Bearer a todas las requests
                    Request newRequest = originalRequest.newBuilder()
                            .header("Authorization", "Bearer " + token)
                            .build();
                    
                    return chain.proceed(newRequest);
                }
            };
            
            // Configurar OkHttpClient con timeouts dinámicos
            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                    .addInterceptor(authInterceptor)
                    .addInterceptor(loggingInterceptor)
                    .connectTimeout(Configuration.NetworkConfig.getConnectTimeout(), TimeUnit.SECONDS)
                    .readTimeout(Configuration.NetworkConfig.getReadTimeout(), TimeUnit.SECONDS)
                    .writeTimeout(Configuration.NetworkConfig.getWriteTimeout(), TimeUnit.SECONDS)
                    .build();
            
            // Crear instancia de Retrofit con URL dinámica
            retrofit = new Retrofit.Builder()
                    .baseUrl(Configuration.getBaseUrl())
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create(gson))
                    .build();
        }
        
        return retrofit;
    }
    
    /**
     * Obtiene la instancia del servicio API
     */
    public static ApiService getApiService() {
        return getClient().create(ApiService.class);
    }
    
    /**
     * Inicializa el contexto de la aplicación
     */
    public static void init(Context context) {
        appContext = context.getApplicationContext();
        // Cargar token desde SharedPreferences si existe
        if (appContext != null) {
            authToken = TokenManager.getInstance(appContext).getToken();
        }
    }
    
    /**
     * Guarda el token JWT para las futuras requests
     */
    public static void setAuthToken(String token) {
        authToken = token;
        // Guardar también en SharedPreferences
        if (appContext != null) {
            TokenManager.getInstance(appContext).saveToken(token);
        }
    }
    
    /**
     * Obtiene el token JWT actual
     */
    public static String getAuthToken() {
        if (appContext != null) {
            String persistedToken = TokenManager.getInstance(appContext).getToken();
            if (persistedToken != null && !persistedToken.isEmpty()) {
                return persistedToken;
            }
        }
        return authToken;
    }
    
    /**
     * Limpia el token JWT (útil para logout)
     */
    public static void clearAuthToken() {
        authToken = null;
        // Limpiar también de SharedPreferences
        if (appContext != null) {
            TokenManager.getInstance(appContext).clearSession();
        }
    }
    
    /**
     * Verifica si hay un token JWT válido
     */
    public static boolean isAuthenticated() {
        if (appContext != null) {
            return TokenManager.getInstance(appContext).isAuthenticated();
        }
        return authToken != null && !authToken.isEmpty();
    }
    
    /**
     * Reinicia el cliente (útil para cambiar configuración)
     */
    public static void resetClient() {
        retrofit = null;
    }
    
    /**
     * Configura una URL base diferente (para testing o diferentes ambientes)
     */
    public static void setBaseUrl(String baseUrl) {
        // Reiniciar el cliente para aplicar la nueva URL
        retrofit = null;
        
        // Crear nuevo cliente con la URL personalizada
        Gson gson = new GsonBuilder()
                .setDateFormat("yyyy-MM-dd HH:mm:ss")
                .setLenient()
                .create();
        
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
        
        Interceptor authInterceptor = new Interceptor() {
            @Override
            public Response intercept(Chain chain) throws IOException {
                Request originalRequest = chain.request();
                
                if (authToken == null || authToken.isEmpty()) {
                    return chain.proceed(originalRequest);
                }
                
                Request newRequest = originalRequest.newBuilder()
                        .header("Authorization", "Bearer " + authToken)
                        .build();
                
                return chain.proceed(newRequest);
            }
        };
        
        OkHttpClient okHttpClient = new OkHttpClient.Builder()
                .addInterceptor(authInterceptor)
                .addInterceptor(loggingInterceptor)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
        
        retrofit = new Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build();
    }
}