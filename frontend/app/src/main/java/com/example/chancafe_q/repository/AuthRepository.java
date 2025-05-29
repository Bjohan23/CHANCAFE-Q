package com.example.chancafe_q.repository;

import androidx.lifecycle.MutableLiveData;
import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.LoginRequest;
import com.example.chancafe_q.model.User;

/**
 * Repositorio para manejo de autenticación
 * Por ahora simula datos, posteriormente se conectará con API real
 */
public class AuthRepository {
    private static AuthRepository instance;

    private AuthRepository() {
    }

    public static synchronized AuthRepository getInstance() {
        if (instance == null) {
            instance = new AuthRepository();
        }
        return instance;
    }

    /**
     * Simula el login del usuario
     * TODO: Reemplazar con llamada real a la API
     */
    public MutableLiveData<ApiResponse<User>> login(LoginRequest loginRequest) {
        MutableLiveData<ApiResponse<User>> result = new MutableLiveData<>();

        // Simular delay de red
        new Thread(() -> {
            try {
                Thread.sleep(1500); // Simular 1.5 segundos de carga

                // Validaciones mock
                if (isValidCredentials(loginRequest)) {
                    // Usuario de prueba
                    User user = new User(
                            "1",
                            loginRequest.getUserCode(),
                            "Juan Pérez", 
                            "juan.perez@chancafe.com",
                            "Asesor de Ventas",
                            true
                    );

                    ApiResponse<User> response = new ApiResponse<>(
                            true,
                            "Login exitoso",
                            user,
                            200
                    );
                    result.postValue(response);
                } else {
                    ApiResponse<User> response = new ApiResponse<>(
                            false,
                            "Credenciales inválidas",
                            null,
                            401
                    );
                    result.postValue(response);
                }
            } catch (InterruptedException e) {
                ApiResponse<User> response = new ApiResponse<>(
                        false,
                        "Error interno del servidor",
                        null,
                        500
                );
                result.postValue(response);
            }
        }).start();

        return result;
    }

    /**
     * Valida las credenciales (mock)
     * TODO: Reemplazar con validación real
     */
    private boolean isValidCredentials(LoginRequest request) {
        // Credenciales de prueba - reemplazar por validación real
        return "admin".equals(request.getUserCode()) && 
               "123456".equals(request.getPassword());
    }

    /**
     * Cierra la sesión del usuario
     * TODO: Implementar logout con API
     */
    public MutableLiveData<ApiResponse<Void>> logout() {
        MutableLiveData<ApiResponse<Void>> result = new MutableLiveData<>();

        new Thread(() -> {
            try {
                Thread.sleep(500);
                ApiResponse<Void> response = new ApiResponse<>(
                        true,
                        "Sesión cerrada exitosamente",
                        null,
                        200
                );
                result.postValue(response);
            } catch (InterruptedException e) {
                ApiResponse<Void> response = new ApiResponse<>(
                        false,
                        "Error al cerrar sesión",
                        null,
                        500
                );
                result.postValue(response);
            }
        }).start();

        return result;
    }
}