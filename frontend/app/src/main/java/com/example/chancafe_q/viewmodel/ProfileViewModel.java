package com.example.chancafe_q.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.User;
import com.example.chancafe_q.repository.AuthRepository;

/**
 * ViewModel para la pantalla de perfil
 */
public class ProfileViewModel extends AndroidViewModel {
    
    private AuthRepository authRepository;
    
    // LiveData para la UI
    private MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private MutableLiveData<String> successMessage = new MutableLiveData<>();
    private MutableLiveData<User> currentUser = new MutableLiveData<>();

    public ProfileViewModel(@NonNull Application application) {
        super(application);
        authRepository = AuthRepository.getInstance();
    }

    // Getters para LiveData
    public LiveData<Boolean> getIsLoading() { return isLoading; }
    public LiveData<String> getErrorMessage() { return errorMessage; }
    public LiveData<String> getSuccessMessage() { return successMessage; }
    public LiveData<User> getCurrentUser() { return currentUser; }

    /**
     * Carga el perfil del usuario desde la API
     */
    public void loadUserProfile() {
        if (!authRepository.isAuthenticated()) {
            errorMessage.setValue("No hay sesión activa");
            return;
        }

        isLoading.setValue(true);
        
        authRepository.getUserProfile().observeForever(response -> {
            isLoading.setValue(false);
            
            if (response != null) {
                if (response.isSuccess() && response.getData() != null) {
                    currentUser.setValue(response.getData());
                    successMessage.setValue("Perfil cargado exitosamente");
                } else {
                    errorMessage.setValue(response.getMessage() != null ? 
                        response.getMessage() : "Error al cargar el perfil");
                }
            } else {
                errorMessage.setValue("Error de conexión");
            }
        });
    }

    /**
     * Cierra la sesión del usuario
     */
    public LiveData<ApiResponse<Void>> logout() {
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<Void>> result = authRepository.logout();
        
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null && response.isSuccess()) {
                successMessage.setValue("Sesión cerrada exitosamente");
            }
        });
        
        return result;
    }

    /**
     * Obtiene los datos del usuario actual en memoria
     */
    public User getUserData() {
        return currentUser.getValue();
    }

    /**
     * Verifica si el usuario está autenticado
     */
    public boolean isAuthenticated() {
        return authRepository.isAuthenticated();
    }

    /**
     * Limpia los mensajes
     */
    public void clearMessages() {
        errorMessage.setValue(null);
        successMessage.setValue(null);
    }
}
