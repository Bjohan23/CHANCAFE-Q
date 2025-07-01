package com.example.chancafe_q.repository;

import androidx.lifecycle.MutableLiveData;
import com.example.chancafe_q.data.remote.ApiClient;
import com.example.chancafe_q.data.remote.ApiService;
import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.LoginRequest;
import com.example.chancafe_q.model.LoginResponse;
import com.example.chancafe_q.model.User;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Repositorio para manejo de autenticación con API real
 */
public class AuthRepository {
    private static AuthRepository instance;
    private ApiService apiService;

    private AuthRepository() {
        apiService = ApiClient.getApiService();
    }

    public static synchronized AuthRepository getInstance() {
        if (instance == null) {
            instance = new AuthRepository();
        }
        return instance;
    }

    /**
     * Realiza login con la API real
     */
    public MutableLiveData<ApiResponse<LoginResponse>> login(LoginRequest loginRequest) {
        MutableLiveData<ApiResponse<LoginResponse>> result = new MutableLiveData<>();

        Call<ApiResponse<LoginResponse>> call = apiService.login(loginRequest);
        
        call.enqueue(new Callback<ApiResponse<LoginResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<LoginResponse>> call, Response<ApiResponse<LoginResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<LoginResponse> apiResponse = response.body();
                    
                    // Guardar token si el login fue exitoso
                    if (apiResponse.isSuccess() && apiResponse.getData() != null && apiResponse.getData().getToken() != null) {
                        ApiClient.setAuthToken(apiResponse.getData().getToken());
                    }
                    
                    result.postValue(apiResponse);
                } else {
                    // Error de servidor
                    ApiResponse<LoginResponse> errorResponse = new ApiResponse<>(
                            false,
                            "Error del servidor: " + response.code(),
                            null,
                            response.code()
                    );
                    result.postValue(errorResponse);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<LoginResponse>> call, Throwable t) {
                // Error de conexión
                ApiResponse<LoginResponse> errorResponse = new ApiResponse<>(
                        false,
                        "Error de conexión: " + t.getMessage(),
                        null,
                        500
                );
                result.postValue(errorResponse);
            }
        });

        return result;
    }

    /**
     * Registra un nuevo usuario
     */
    public MutableLiveData<ApiResponse<User>> register(User user) {
        MutableLiveData<ApiResponse<User>> result = new MutableLiveData<>();

        Call<ApiResponse<User>> call = apiService.register(user);
        
        call.enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(response.body());
                } else {
                    ApiResponse<User> errorResponse = new ApiResponse<>(
                            false,
                            "Error del servidor: " + response.code(),
                            null,
                            response.code()
                    );
                    result.postValue(errorResponse);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                ApiResponse<User> errorResponse = new ApiResponse<>(
                        false,
                        "Error de conexión: " + t.getMessage(),
                        null,
                        500
                );
                result.postValue(errorResponse);
            }
        });

        return result;
    }

    /**
     * Obtiene el perfil del usuario actual
     */
    public MutableLiveData<ApiResponse<User>> getUserProfile() {
        MutableLiveData<ApiResponse<User>> result = new MutableLiveData<>();

        if (!ApiClient.isAuthenticated()) {
            ApiResponse<User> errorResponse = new ApiResponse<>(
                    false,
                    "No hay sesión activa",
                    null,
                    401
            );
            result.postValue(errorResponse);
            return result;
        }

        Call<ApiResponse<User>> call = apiService.getUserProfile();
        
        call.enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(response.body());
                } else {
                    // Si es 401, limpiar el token
                    if (response.code() == 401) {
                        ApiClient.clearAuthToken();
                    }
                    
                    ApiResponse<User> errorResponse = new ApiResponse<>(
                            false,
                            "Error del servidor: " + response.code(),
                            null,
                            response.code()
                    );
                    result.postValue(errorResponse);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                ApiResponse<User> errorResponse = new ApiResponse<>(
                        false,
                        "Error de conexión: " + t.getMessage(),
                        null,
                        500
                );
                result.postValue(errorResponse);
            }
        });

        return result;
    }

    /**
     * Cierra la sesión del usuario
     */
    public MutableLiveData<ApiResponse<Void>> logout() {
        MutableLiveData<ApiResponse<Void>> result = new MutableLiveData<>();

        if (!ApiClient.isAuthenticated()) {
            // Si no hay token, considerar logout exitoso
            ApiResponse<Void> response = new ApiResponse<>(
                    true,
                    "Sesión cerrada exitosamente",
                    null,
                    200
            );
            result.postValue(response);
            return result;
        }

        Call<ApiResponse<Void>> call = apiService.logout();
        
        call.enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                // Independientemente de la respuesta, limpiar el token local
                ApiClient.clearAuthToken();
                
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(response.body());
                } else {
                    // Aunque el servidor falle, consideramos logout exitoso localmente
                    ApiResponse<Void> successResponse = new ApiResponse<>(
                            true,
                            "Sesión cerrada localmente",
                            null,
                            200
                    );
                    result.postValue(successResponse);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                // Incluso si falla la conexión, limpiar token local
                ApiClient.clearAuthToken();
                
                ApiResponse<Void> response = new ApiResponse<>(
                        true,
                        "Sesión cerrada localmente",
                        null,
                        200
                );
                result.postValue(response);
            }
        });

        return result;
    }

    /**
     * Verifica si hay una sesión activa
     */
    public boolean isAuthenticated() {
        return ApiClient.isAuthenticated();
    }

    /**
     * Obtiene el token actual
     */
    public String getCurrentToken() {
        return ApiClient.getAuthToken();
    }
}