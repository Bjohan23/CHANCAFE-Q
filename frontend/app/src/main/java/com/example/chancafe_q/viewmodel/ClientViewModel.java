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
    
    // LiveData para listas de clientes
    private MutableLiveData<List<Client>> clientsList = new MutableLiveData<>();
    
    public ClientViewModel(@NonNull Application application) {
        super(application);
        clientRepository = ClientRepository.getInstance();
    }
    
    // Getters para LiveData
    public LiveData<Boolean> getIsLoading() { return isLoading; }
    public LiveData<Boolean> getLoading() { return isLoading; }
    public LiveData<String> getErrorMessage() { return errorMessage; }
    public LiveData<String> getError() { return errorMessage; }
    public LiveData<String> getSuccessMessage() { return successMessage; }
    
    // Getter para lista de clientes (usado por ClientSelectorActivity)
    public LiveData<List<Client>> getClients() { return clientsList; }
    
    /**
     * Obtiene todos los clientes (retorna ApiResponse)
     */
    public LiveData<ApiResponse<List<Client>>> getAllClients() {
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
        android.util.Log.d("ClientViewModel", "=== CREATE CLIENT START ===");
        
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            android.util.Log.e("ClientViewModel", "No network available");
            MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();
            ApiResponse<Client> errorResponse = new ApiResponse<>(
                false, 
                "No hay conexión a internet. Verifica tu conexión y vuelve a intentar.", 
                null, 
                0
            );
            result.setValue(errorResponse);
            errorMessage.setValue("No hay conexión a internet");
            return result;
        }
        
        // Validaciones básicas
        if (client == null) {
            android.util.Log.e("ClientViewModel", "Client object is null");
            MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();
            ApiResponse<Client> errorResponse = new ApiResponse<>(
                false, 
                "Error interno: Datos del cliente no válidos", 
                null, 
                400
            );
            result.setValue(errorResponse);
            errorMessage.setValue("Error interno: Datos del cliente no válidos");
            return result;
        }
        
        android.util.Log.d("ClientViewModel", "Client validation passed, starting network call");
        android.util.Log.d("ClientViewModel", "Client data: " + client.toString());
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<Client>> result = clientRepository.createClient(client);
        
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null) {
                android.util.Log.d("ClientViewModel", "Response received - Success: " + response.isSuccess());
                android.util.Log.d("ClientViewModel", "Response message: " + response.getMessage());
                android.util.Log.d("ClientViewModel", "Response code: " + response.getStatusCode());
                
                if (response.isSuccess()) {
                    String message = response.getMessage() != null ? response.getMessage() : "Cliente creado exitosamente";
                    successMessage.setValue(message);
                } else {
                    String errorMsg = buildDetailedErrorMessage(response);
                    android.util.Log.e("ClientViewModel", "Error creating client: " + errorMsg);
                    errorMessage.setValue(errorMsg);
                }
            } else {
                android.util.Log.e("ClientViewModel", "Response is null");
                errorMessage.setValue("Error desconocido: No se recibió respuesta del servidor");
            }
        });
        
        return result;
    }
    
    /**
     * Actualiza un cliente existente
     */
    public LiveData<ApiResponse<Client>> updateClient(int clientId, Client client) {
        android.util.Log.d("ClientViewModel", "=== UPDATE CLIENT START ===");
        android.util.Log.d("ClientViewModel", "Client ID: " + clientId);
        
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            android.util.Log.e("ClientViewModel", "No network available for update");
            MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();
            ApiResponse<Client> errorResponse = new ApiResponse<>(
                false, 
                "No hay conexión a internet. Verifica tu conexión y vuelve a intentar.", 
                null, 
                0
            );
            result.setValue(errorResponse);
            errorMessage.setValue("No hay conexión a internet");
            return result;
        }
        
        if (client == null) {
            android.util.Log.e("ClientViewModel", "Client object is null for update");
            MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();
            ApiResponse<Client> errorResponse = new ApiResponse<>(
                false, 
                "Error interno: Datos del cliente no válidos", 
                null, 
                400
            );
            result.setValue(errorResponse);
            errorMessage.setValue("Error interno: Datos del cliente no válidos");
            return result;
        }
        
        android.util.Log.d("ClientViewModel", "Client validation passed, starting update network call");
        android.util.Log.d("ClientViewModel", "Client data: " + client.toString());
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<Client>> result = clientRepository.updateClient(clientId, client);
        
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null) {
                android.util.Log.d("ClientViewModel", "Update response received - Success: " + response.isSuccess());
                android.util.Log.d("ClientViewModel", "Update response message: " + response.getMessage());
                android.util.Log.d("ClientViewModel", "Update response code: " + response.getStatusCode());
                
                if (response.isSuccess()) {
                    String message = response.getMessage() != null ? response.getMessage() : "Cliente actualizado exitosamente";
                    successMessage.setValue(message);
                } else {
                    String errorMsg = buildDetailedErrorMessage(response);
                    android.util.Log.e("ClientViewModel", "Error updating client: " + errorMsg);
                    errorMessage.setValue(errorMsg);
                }
            } else {
                android.util.Log.e("ClientViewModel", "Update response is null");
                errorMessage.setValue("Error desconocido: No se recibió respuesta del servidor");
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
     * Obtiene clientes activos
     */
    public LiveData<ApiResponse<List<Client>>> getActiveClients() {
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
        
        MutableLiveData<ApiResponse<List<Client>>> result = clientRepository.getActiveClients();
        
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
     * Obtiene clientes por tipo
     */
    public LiveData<ApiResponse<List<Client>>> getClientsByType(String type) {
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
        
        MutableLiveData<ApiResponse<List<Client>>> result = clientRepository.getClientsByType(type);
        
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
     * Obtiene estadísticas de clientes
     */
    public LiveData<ApiResponse<Object>> getClientStats() {
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            MutableLiveData<ApiResponse<Object>> result = new MutableLiveData<>();
            ApiResponse<Object> errorResponse = new ApiResponse<>(
                false, 
                "No hay conexión a internet", 
                null, 
                0
            );
            result.setValue(errorResponse);
            return result;
        }
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<Object>> result = clientRepository.getClientStats();
        
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
     * Cambia el status de un cliente
     */
    public LiveData<ApiResponse<Client>> changeClientStatus(int clientId, String status) {
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
        
        MutableLiveData<ApiResponse<Client>> result = clientRepository.changeClientStatus(clientId, status);
        
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
     * Actualiza el límite de crédito de un cliente
     */
    public LiveData<ApiResponse<Client>> updateCreditLimit(int clientId, double creditLimit) {
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
        
        MutableLiveData<ApiResponse<Client>> result = clientRepository.updateCreditLimit(clientId, creditLimit);
        
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
     * Busca cliente por documento
     */
    public LiveData<ApiResponse<Client>> getClientByDocument(String document) {
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
        
        if (document == null || document.trim().isEmpty()) {
            MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();
            ApiResponse<Client> errorResponse = new ApiResponse<>(
                false, 
                "Número de documento requerido", 
                null, 
                400
            );
            result.setValue(errorResponse);
            return result;
        }
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<Client>> result = clientRepository.getClientByDocument(document);
        
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
     * Carga clientes activos (usado por ClientSelectorActivity)
     */
    public void loadActiveClients() {
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            errorMessage.setValue("No hay conexión a internet");
            return;
        }
        
        isLoading.setValue(true);
        
        MutableLiveData<ApiResponse<List<Client>>> result = clientRepository.getActiveClients();
        
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null) {
                if (response.isSuccess()) {
                    clientsList.setValue(response.getData());
                    successMessage.setValue(response.getMessage());
                } else {
                    errorMessage.setValue(response.getMessage());
                }
            }
        });
    }
    
    /**
     * Busca clientes por texto
     */
    public void searchClients(String query) {
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            errorMessage.setValue("No hay conexión a internet");
            return;
        }
        
        if (query == null || query.trim().isEmpty()) {
            // Si no hay búsqueda, cargar todos los clientes activos
            loadActiveClients();
            return;
        }
        
        isLoading.setValue(true);
        
        // Aquí deberías implementar la búsqueda real cuando esté disponible en el repositorio
        // Por ahora, simulamos filtrando clientes activos
        MutableLiveData<ApiResponse<List<Client>>> result = clientRepository.getActiveClients();
        
        result.observeForever(response -> {
            isLoading.setValue(false);
            if (response != null) {
                if (response.isSuccess()) {
                    List<Client> allClients = response.getData();
                    if (allClients != null) {
                        // Filtrar clientes por nombre, documento o empresa
                        List<Client> filteredClients = allClients.stream()
                            .filter(client -> 
                                (client.getFirstName() != null && client.getFirstName().toLowerCase().contains(query.toLowerCase())) ||
                                (client.getLastName() != null && client.getLastName().toLowerCase().contains(query.toLowerCase())) ||
                                (client.getDocumentNumber() != null && client.getDocumentNumber().contains(query)) ||
                                (client.getBusinessName() != null && client.getBusinessName().toLowerCase().contains(query.toLowerCase()))
                            )
                            .collect(java.util.stream.Collectors.toList());
                        
                        clientsList.setValue(filteredClients);
                    }
                    successMessage.setValue(response.getMessage());
                } else {
                    errorMessage.setValue(response.getMessage());
                }
            }
        });
    }
    
    /**
     * Construye un mensaje de error detallado basado en la respuesta de la API
     */
    private String buildDetailedErrorMessage(ApiResponse<?> response) {
        if (response == null) {
            return "Error desconocido: No se recibió respuesta del servidor";
        }
        
        StringBuilder errorMsg = new StringBuilder();
        int statusCode = response.getStatusCode();
        String message = response.getMessage();
        
        switch (statusCode) {
            case 400:
                errorMsg.append("Error de validación: ");
                if (message != null && !message.isEmpty()) {
                    errorMsg.append(message);
                } else {
                    errorMsg.append("Los datos enviados no son válidos. Revisa los campos obligatorios.");
                }
                break;
            case 401:
                errorMsg.append("Sesión expirada: Debes iniciar sesión nuevamente.");
                break;
            case 403:
                errorMsg.append("Acceso denegado: No tienes permisos para realizar esta acción.");
                break;
            case 404:
                errorMsg.append("Recurso no encontrado: El cliente no existe o fue eliminado.");
                break;
            case 409:
                errorMsg.append("Conflicto: ");
                if (message != null && message.contains("document")) {
                    errorMsg.append("Ya existe un cliente con este número de documento.");
                } else if (message != null && message.contains("email")) {
                    errorMsg.append("Ya existe un cliente con este email.");
                } else {
                    errorMsg.append(message != null ? message : "Los datos ya existen en el sistema.");
                }
                break;
            case 422:
                errorMsg.append("Datos inválidos: ");
                errorMsg.append(message != null ? message : "Revisa los formatos de los campos.");
                break;
            case 500:
                errorMsg.append("Error del servidor: ");
                errorMsg.append(message != null ? message : "Error interno. Intenta nuevamente más tarde.");
                break;
            case 0:
                errorMsg.append("Sin conexión: Verifica tu conexión a internet y vuelve a intentar.");
                break;
            default:
                errorMsg.append("Error ");
                errorMsg.append(statusCode);
                errorMsg.append(": ");
                errorMsg.append(message != null ? message : "Error desconocido");
                break;
        }
        
        return errorMsg.toString();
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
