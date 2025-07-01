package com.example.chancafe_q.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.Client;
import com.example.chancafe_q.repository.ClientRepository;
import com.example.chancafe_q.utils.NetworkUtils;

import java.util.List;

/**
 * ViewModel para manejo de clientes
 * Ejemplo de implementación usando el patrón MVVM con Repository
 */
public class ClientViewModel extends AndroidViewModel {
    
    private ClientRepository clientRepository;
    
    // LiveData para la UI
    private MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private MutableLiveData<String> successMessage = new MutableLiveData<>();
    
    public ClientViewModel(@NonNull Application application) {
        super(application);
        clientRepository = ClientRepository.getInstance();
    }
    
    // Getters para LiveData
    public LiveData<Boolean> getIsLoading() { return isLoading; }
    public LiveData<String> getErrorMessage() { return errorMessage; }
    public LiveData<String> getSuccessMessage() { return successMessage; }
    
    /**
     * Obtiene todos los clientes
     */
    public LiveData<ApiResponse<List<Client>>> getClients() {
        // Verificar conexión antes de hacer la llamada
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            MutableLiveData<ApiResponse<List<Client>>> result = new MutableLiveData<>();
            ApiResponse<List<Client>> errorResponse = new ApiResponse<>(
                false, 
                "No hay conexión a internet", 
                null, 
                0
            );
            result.setValue(errorResponse);
            return result;
        }
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<List<Client>>> result = clientRepository.getClients();
        
        // Observar el resultado para manejar loading
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null) {
                if (response.isSuccess()) {
                    successMessage.setValue(response.getMessage());
                } else {
                    errorMessage.setValue(response.getMessage());
                }
            }
        });
        
        return result;
    }
    
    /**
     * Obtiene un cliente específico
     */
    public LiveData<ApiResponse<Client>> getClient(int clientId) {
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();
            ApiResponse<Client> errorResponse = new ApiResponse<>(
                false, 
                "No hay conexión a internet", 
                null, 
                0
            );
            result.setValue(errorResponse);
            return result;
        }
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<Client>> result = clientRepository.getClient(clientId);
        
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null) {
                if (response.isSuccess()) {
                    successMessage.setValue(response.getMessage());
                } else {
                    errorMessage.setValue(response.getMessage());
                }
            }
        });
        
        return result;
    }
    
    /**
     * Crea un nuevo cliente
     */
    public LiveData<ApiResponse<Client>> createClient(Client client) {
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();
            ApiResponse<Client> errorResponse = new ApiResponse<>(
                false, 
                "No hay conexión a internet", 
                null, 
                0
            );
            result.setValue(errorResponse);
            return result;
        }
        
        // Validaciones básicas
        if (client == null) {
            MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();
            ApiResponse<Client> errorResponse = new ApiResponse<>(
                false, 
                "Datos del cliente requeridos", 
                null, 
                400
            );
            result.setValue(errorResponse);
            return result;
        }
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<Client>> result = clientRepository.createClient(client);
        
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null) {
                if (response.isSuccess()) {
                    successMessage.setValue(response.getMessage());
                } else {
                    errorMessage.setValue(response.getMessage());
                }
            }
        });
        
        return result;
    }
    
    /**
     * Actualiza un cliente existente
     */
    public LiveData<ApiResponse<Client>> updateClient(int clientId, Client client) {
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();
            ApiResponse<Client> errorResponse = new ApiResponse<>(
                false, 
                "No hay conexión a internet", 
                null, 
                0
            );
            result.setValue(errorResponse);
            return result;
        }
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<Client>> result = clientRepository.updateClient(clientId, client);
        
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null) {
                if (response.isSuccess()) {
                    successMessage.setValue(response.getMessage());
                } else {
                    errorMessage.setValue(response.getMessage());
                }
            }
        });
        
        return result;
    }
    
    /**
     * Elimina un cliente
     */
    public LiveData<ApiResponse<Void>> deleteClient(int clientId) {
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            MutableLiveData<ApiResponse<Void>> result = new MutableLiveData<>();
            ApiResponse<Void> errorResponse = new ApiResponse<>(
                false, 
                "No hay conexión a internet", 
                null, 
                0
            );
            result.setValue(errorResponse);
            return result;
        }
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<Void>> result = clientRepository.deleteClient(clientId);
        
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null) {
                if (response.isSuccess()) {
                    successMessage.setValue(response.getMessage());
                } else {
                    errorMessage.setValue(response.getMessage());
                }
            }
        });
        
        return result;
    }
    
    /**
     * Busca clientes por texto
     */
    public LiveData<ApiResponse<List<Client>>> searchClients(String query) {
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            MutableLiveData<ApiResponse<List<Client>>> result = new MutableLiveData<>();
            ApiResponse<List<Client>> errorResponse = new ApiResponse<>(
                false, 
                "No hay conexión a internet", 
                null, 
                0
            );
            result.setValue(errorResponse);
            return result;
        }
        
        if (query == null || query.trim().isEmpty()) {
            MutableLiveData<ApiResponse<List<Client>>> result = new MutableLiveData<>();
            ApiResponse<List<Client>> errorResponse = new ApiResponse<>(
                false, 
                "Término de búsqueda requerido", 
                null, 
                400
            );
            result.setValue(errorResponse);
            return result;
        }
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<List<Client>>> result = clientRepository.searchClients(query);
        
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null) {
                if (response.isSuccess()) {
                    successMessage.setValue(response.getMessage());
                } else {
                    errorMessage.setValue(response.getMessage());
                }
            }
        });
        
        return result;
    }
    
    /**
     * Limpia los mensajes de error y éxito
     */
    public void clearMessages() {
        errorMessage.setValue(null);
        successMessage.setValue(null);
    }
    
    /**
     * Verifica si el usuario está autenticado
     */
    public boolean isUserAuthenticated() {
        return clientRepository.getInstance() != null; // O usar AuthRepository.isAuthenticated()
    }
}
