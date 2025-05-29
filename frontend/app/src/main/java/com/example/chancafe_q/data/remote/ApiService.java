package com.example.chancafe_q.data.remote;

/**
 * Interfaz preparatoria para futura integración con servicios API
 * Esta interfaz definirá todos los endpoints de la API
 * 
 * TODO: Descomentar cuando se implemente Retrofit
 */

/*
import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.LoginRequest;
import com.example.chancafe_q.model.User;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Header;

public interface ApiService {
    
    // Authentication endpoints
    @POST("auth/login")
    Call<ApiResponse<User>> login(@Body LoginRequest loginRequest);
    
    @POST("auth/logout")
    Call<ApiResponse<Void>> logout(@Header("Authorization") String token);
    
    @POST("auth/refresh")
    Call<ApiResponse<String>> refreshToken(@Header("Authorization") String refreshToken);
    
    // User endpoints
    @GET("user/profile")
    Call<ApiResponse<User>> getUserProfile(@Header("Authorization") String token);
    
    // Quotes endpoints
    // TODO: Agregar endpoints para cotizaciones
    
    // Clients endpoints
    // TODO: Agregar endpoints para clientes
    
    // Products endpoints
    // TODO: Agregar endpoints para productos
    
    // Credit requests endpoints
    // TODO: Agregar endpoints para solicitudes de crédito
}
*/

public interface ApiService {
    // Placeholder interface - implementar cuando se añada Retrofit
}