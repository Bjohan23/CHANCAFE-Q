package com.example.chancafe_q.utils;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;

import com.example.chancafe_q.data.remote.ApiClient;
import com.example.chancafe_q.model.ApiResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import com.example.chancafe_q.utils.Configuration;

/**
 * Utilidades para el manejo de red y API
 */
public class NetworkUtils {
    private static final String TAG = "NetworkUtils";

    /**
     * Verifica si hay conexión a internet
     */
    public static boolean isNetworkAvailable(Context context) {
        ConnectivityManager connectivityManager = 
            (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        
        if (connectivityManager != null) {
            NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
            return activeNetworkInfo != null && activeNetworkInfo.isConnected();
        }
        
        return false;
    }

    /**
     * Interface genérica para callbacks de API
     */
    public interface ApiCallback<T> {
        void onSuccess(T data);
        void onError(String message, int errorCode);
        default void onLoading() {} // Opcional
    }

    /**
     * Wrapper genérico para llamadas API que maneja errores comunes
     */
    public static <T> void executeCall(Call<ApiResponse<T>> call, ApiCallback<T> callback) {
        callback.onLoading();
        
        call.enqueue(new Callback<ApiResponse<T>>() {
            @Override
            public void onResponse(Call<ApiResponse<T>> call, Response<ApiResponse<T>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<T> apiResponse = response.body();
                    
                    if (apiResponse.isSuccess()) {
                        callback.onSuccess(apiResponse.getData());
                    } else {
                        callback.onError(apiResponse.getMessage(), apiResponse.getStatusCode());
                    }
                } else {
                    handleHttpError(response.code(), callback);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<T>> call, Throwable t) {
                Log.e(TAG, "Network call failed", t);
                callback.onError("Error de conexión: " + t.getMessage(), 500);
            }
        });
    }

    /**
     * Maneja errores HTTP comunes
     */
    private static <T> void handleHttpError(int errorCode, ApiCallback<T> callback) {
        String errorMessage;
        
        switch (errorCode) {
            case 400:
                errorMessage = "Datos inválidos";
                break;
            case 401:
                errorMessage = "No autorizado - Sesión expirada";
                // Limpiar token si es 401
                ApiClient.clearAuthToken();
                break;
            case 403:
                errorMessage = "Acceso denegado";
                break;
            case 404:
                errorMessage = "Recurso no encontrado";
                break;
            case 500:
                errorMessage = "Error interno del servidor";
                break;
            case 503:
                errorMessage = "Servicio no disponible";
                break;
            default:
                errorMessage = "Error del servidor: " + errorCode;
        }
        
        callback.onError(errorMessage, errorCode);
    }

    /**
     * Valida que el endpoint esté disponible
     */
    public static boolean validateEndpoint(String endpoint) {
        return endpoint != null && !endpoint.trim().isEmpty();
    }

    /**
     * Construye URL completa para depuración
     */
    public static String getFullUrl(String endpoint) {
        return Constants.BASE_URL + endpoint;
    }

    /**
     * Log para debugging de requests
     */
    public static void logRequest(String method, String endpoint, Object data) {
        if (Configuration.AppConfig.isDebugMode()) {
            Log.d(TAG, String.format("API %s: %s", method, getFullUrl(endpoint)));
            if (data != null) {
                Log.d(TAG, "Request data: " + data.toString());
            }
        }
    }
}
