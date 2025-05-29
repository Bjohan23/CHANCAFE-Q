package com.example.chancafe_q.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.LoginRequest;
import com.example.chancafe_q.model.User;
import com.example.chancafe_q.repository.AuthRepository;

/**
 * ViewModel para la pantalla de Login
 * Maneja la lógica de presentación y comunica con el Repository
 */
public class LoginViewModel extends ViewModel {
    private AuthRepository authRepository;
    private MutableLiveData<ApiResponse<User>> loginResult;
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
    public LiveData<ApiResponse<User>> getLoginResult() {
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
}