package com.example.chancafe_q.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.LoginRequest;
import com.example.chancafe_q.model.LoginResponse;
import com.example.chancafe_q.model.User;
import com.example.chancafe_q.repository.AuthRepository;

/**
 * ViewModel para la pantalla de Login
 * Maneja la lógica de presentación y comunica con el Repository
 */
public class LoginViewModel extends ViewModel {
    private AuthRepository authRepository;
    private MutableLiveData<ApiResponse<LoginResponse>> loginResult;
    private MutableLiveData<Boolean> isLoading;
    private MutableLiveData<String> userCodeError;
    private MutableLiveData<String> passwordError;

    public LoginViewModel() {
        authRepository = AuthRepository.getInstance();
        loginResult = new MutableLiveData<>();
        isLoading = new MutableLiveData<>(false);
        userCodeError = new MutableLiveData<>();
        passwordError = new MutableLiveData<>();
    }

    // Getters para observar desde la Vista
    public LiveData<ApiResponse<LoginResponse>> getLoginResult() {
        return loginResult;
    }

    public LiveData<Boolean> getIsLoading() {
        return isLoading;
    }

    public LiveData<String> getUserCodeError() {
        return userCodeError;
    }

    public LiveData<String> getPasswordError() {
        return passwordError;
    }

    /**
     * Intenta hacer login con las credenciales proporcionadas
     */
    public void login(String userCode, String password) {
        // Limpiar errores previos
        userCodeError.setValue(null);
        passwordError.setValue(null);

        // Validar campos
        if (!validateInputs(userCode, password)) {
            return;
        }

        // Iniciar carga
        isLoading.setValue(true);

        // Crear request
        LoginRequest request = new LoginRequest(userCode.trim(), password);

        // Hacer llamada al repository
        authRepository.login(request).observeForever(response -> {
            isLoading.setValue(false);
            loginResult.setValue(response);
        });
    }

    /**
     * Obtiene el usuario desde el resultado del login
     */
    public User getCurrentUser() {
        ApiResponse<LoginResponse> response = loginResult.getValue();
        if (response != null && response.isSuccess() && response.getData() != null) {
            return response.getData().getUser();
        }
        return null;
    }

    /**
     * Obtiene el token desde el resultado del login
     */
    public String getCurrentToken() {
        ApiResponse<LoginResponse> response = loginResult.getValue();
        if (response != null && response.isSuccess() && response.getData() != null) {
            return response.getData().getToken();
        }
        return null;
    }

    /**
     * Verifica si el login fue exitoso
     */
    public boolean isLoginSuccessful() {
        ApiResponse<LoginResponse> response = loginResult.getValue();
        return response != null && response.isSuccess() && response.getData() != null
                && response.getData().getUser() != null && response.getData().getToken() != null;
    }

    /**
     * Obtiene el mensaje de error del login
     */
    public String getLoginErrorMessage() {
        ApiResponse<LoginResponse> response = loginResult.getValue();
        if (response != null && !response.isSuccess()) {
            return response.getMessage();
        }
        return null;
    }

    /**
     * Valida los campos de entrada
     */
    private boolean validateInputs(String userCode, String password) {
        boolean isValid = true;

        // Validar código de usuario
        if (userCode == null || userCode.trim().isEmpty()) {
            userCodeError.setValue("El código de usuario es requerido");
            isValid = false;
        } else if (userCode.trim().length() < 3) {
            userCodeError.setValue("El código debe tener al menos 3 caracteres");
            isValid = false;
        }

        // Validar contraseña
        if (password == null || password.isEmpty()) {
            passwordError.setValue("La contraseña es requerida");
            isValid = false;
        } else if (password.length() < 6) {
            passwordError.setValue("La contraseña debe tener al menos 6 caracteres");
            isValid = false;
        }

        return isValid;
    }

    /**
     * Limpia los resultados del login
     */
    public void clearLoginResult() {
        loginResult.setValue(null);
    }

    /**
     * Limpia los errores de validación
     */
    public void clearErrors() {
        userCodeError.setValue(null);
        passwordError.setValue(null);
    }

    /**
     * Verifica si el usuario está autenticado
     */
    public boolean isAuthenticated() {
        return authRepository.isAuthenticated();
    }

    /**
     * Cierra la sesión del usuario
     */
    public LiveData<ApiResponse<Void>> logout() {
        return authRepository.logout();
    }
}
