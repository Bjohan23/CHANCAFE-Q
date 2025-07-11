package com.example.chancafe_q.repository;

import androidx.lifecycle.MutableLiveData;
import com.example.chancafe_q.data.remote.ApiClient;
import com.example.chancafe_q.data.remote.ApiService;
import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.Client;
import com.example.chancafe_q.utils.NetworkUtils;

import java.util.List;

/**
 * Repositorio para manejo de clientes con la API
 * Ejemplo de uso de NetworkUtils para simplificar las llamadas
 */
public class ClientRepository {
    private static ClientRepository instance;
    private ApiService apiService;

    private ClientRepository() {
        apiService = ApiClient.getApiService();
    }

    public static synchronized ClientRepository getInstance() {
        if (instance == null) {
            instance = new ClientRepository();
        }
        return instance;
    }

    /**
     * Obtiene todos los clientes
     */
    public MutableLiveData<ApiResponse<List<Client>>> getClients() {
        MutableLiveData<ApiResponse<List<Client>>> result = new MutableLiveData<>();

        NetworkUtils.executeCall(
            apiService.getAllClients(),
            new NetworkUtils.ApiCallback<List<Client>>() {
                @Override
                public void onSuccess(List<Client> data) {
                    ApiResponse<List<Client>> response = new ApiResponse<>(
                        true, 
                        "Clientes obtenidos exitosamente", 
                        data, 
                        200
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<List<Client>> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }

    /**
     * Obtiene un cliente específico por ID
     */
    public MutableLiveData<ApiResponse<Client>> getClient(int clientId) {
        MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();

        NetworkUtils.executeCall(
            apiService.getClientById(clientId),
            new NetworkUtils.ApiCallback<Client>() {
                @Override
                public void onSuccess(Client data) {
                    ApiResponse<Client> response = new ApiResponse<>(
                        true, 
                        "Cliente obtenido exitosamente", 
                        data, 
                        200
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<Client> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }

    /**
     * Crea un nuevo cliente
     */
    public MutableLiveData<ApiResponse<Client>> createClient(Client client) {
        MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();

        NetworkUtils.logRequest("POST", "clients", client);

        NetworkUtils.executeCall(
            apiService.createClient(client),
            new NetworkUtils.ApiCallback<Client>() {
                @Override
                public void onSuccess(Client data) {
                    ApiResponse<Client> response = new ApiResponse<>(
                        true, 
                        "Cliente creado exitosamente", 
                        data, 
                        201
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<Client> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }

    /**
     * Actualiza un cliente existente
     */
    public MutableLiveData<ApiResponse<Client>> updateClient(int clientId, Client client) {
        MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();

        NetworkUtils.logRequest("PUT", "clients/" + clientId, client);

        NetworkUtils.executeCall(
            apiService.updateClient(clientId, client),
            new NetworkUtils.ApiCallback<Client>() {
                @Override
                public void onSuccess(Client data) {
                    ApiResponse<Client> response = new ApiResponse<>(
                        true, 
                        "Cliente actualizado exitosamente", 
                        data, 
                        200
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<Client> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }

    /**
     * Elimina un cliente
     */
    public MutableLiveData<ApiResponse<Void>> deleteClient(int clientId) {
        MutableLiveData<ApiResponse<Void>> result = new MutableLiveData<>();

        NetworkUtils.logRequest("DELETE", "clients/" + clientId, null);

        NetworkUtils.executeCall(
            apiService.deleteClient(clientId),
            new NetworkUtils.ApiCallback<Void>() {
                @Override
                public void onSuccess(Void data) {
                    ApiResponse<Void> response = new ApiResponse<>(
                        true, 
                        "Cliente eliminado exitosamente", 
                        null, 
                        200
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<Void> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }

    /**
     * Obtiene clientes activos
     */
    public MutableLiveData<ApiResponse<List<Client>>> getActiveClients() {
        MutableLiveData<ApiResponse<List<Client>>> result = new MutableLiveData<>();

        NetworkUtils.executeCall(
            apiService.getActiveClients(),
            new NetworkUtils.ApiCallback<List<Client>>() {
                @Override
                public void onSuccess(List<Client> data) {
                    ApiResponse<List<Client>> response = new ApiResponse<>(
                        true, 
                        "Clientes activos obtenidos exitosamente", 
                        data, 
                        200
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<List<Client>> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }

    /**
     * Obtiene clientes por tipo
     */
    public MutableLiveData<ApiResponse<List<Client>>> getClientsByType(String type) {
        MutableLiveData<ApiResponse<List<Client>>> result = new MutableLiveData<>();

        NetworkUtils.executeCall(
            apiService.getClientsByType(type),
            new NetworkUtils.ApiCallback<List<Client>>() {
                @Override
                public void onSuccess(List<Client> data) {
                    ApiResponse<List<Client>> response = new ApiResponse<>(
                        true, 
                        "Clientes de tipo " + type + " obtenidos exitosamente", 
                        data, 
                        200
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<List<Client>> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }

    /**
     * Obtiene estadísticas de clientes
     */
    public MutableLiveData<ApiResponse<Object>> getClientStats() {
        MutableLiveData<ApiResponse<Object>> result = new MutableLiveData<>();

        NetworkUtils.executeCall(
            apiService.getClientStats(),
            new NetworkUtils.ApiCallback<Object>() {
                @Override
                public void onSuccess(Object data) {
                    ApiResponse<Object> response = new ApiResponse<>(
                        true, 
                        "Estadísticas obtenidas exitosamente", 
                        data, 
                        200
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<Object> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }

    /**
     * Cambia el status de un cliente
     */
    public MutableLiveData<ApiResponse<Client>> changeClientStatus(int clientId, String status) {
        MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();

        // Crear objeto con el nuevo status
        java.util.Map<String, String> statusData = new java.util.HashMap<>();
        statusData.put("status", status);

        NetworkUtils.executeCall(
            apiService.changeClientStatus(clientId, statusData),
            new NetworkUtils.ApiCallback<Client>() {
                @Override
                public void onSuccess(Client data) {
                    ApiResponse<Client> response = new ApiResponse<>(
                        true, 
                        "Status del cliente actualizado exitosamente", 
                        data, 
                        200
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<Client> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }

    /**
     * Actualiza el límite de crédito de un cliente
     */
    public MutableLiveData<ApiResponse<Client>> updateCreditLimit(int clientId, double creditLimit) {
        MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();

        // Crear objeto con el nuevo límite de crédito
        java.util.Map<String, Double> creditData = new java.util.HashMap<>();
        creditData.put("creditLimit", creditLimit);

        NetworkUtils.executeCall(
            apiService.updateCreditLimit(clientId, creditData),
            new NetworkUtils.ApiCallback<Client>() {
                @Override
                public void onSuccess(Client data) {
                    ApiResponse<Client> response = new ApiResponse<>(
                        true, 
                        "Límite de crédito actualizado exitosamente", 
                        data, 
                        200
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<Client> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }

    /**
     * Busca cliente por documento
     */
    public MutableLiveData<ApiResponse<Client>> getClientByDocument(String document) {
        MutableLiveData<ApiResponse<Client>> result = new MutableLiveData<>();

        NetworkUtils.executeCall(
            apiService.getClientByDocument(document),
            new NetworkUtils.ApiCallback<Client>() {
                @Override
                public void onSuccess(Client data) {
                    ApiResponse<Client> response = new ApiResponse<>(
                        true, 
                        "Cliente encontrado", 
                        data, 
                        200
                    );
                    result.postValue(response);
                }

                @Override
                public void onError(String message, int errorCode) {
                    ApiResponse<Client> errorResponse = new ApiResponse<>(
                        false, 
                        message, 
                        null, 
                        errorCode
                    );
                    result.postValue(errorResponse);
                }
            }
        );

        return result;
    }
}
