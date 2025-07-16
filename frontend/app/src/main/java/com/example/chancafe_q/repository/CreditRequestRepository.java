package com.example.chancafe_q.repository;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.example.chancafe_q.data.remote.ApiClient;
import com.example.chancafe_q.data.remote.ApiService;
import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.CreditRequest;
import com.example.chancafe_q.model.CreditRequestsResponse;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CreditRequestRepository {
    private final ApiService apiService;
    private final MutableLiveData<List<CreditRequest>> creditRequestsLiveData = new MutableLiveData<>();
    private final MutableLiveData<CreditRequest> creditRequestLiveData = new MutableLiveData<>();
    private final MutableLiveData<Map<String, Object>> statisticsLiveData = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loadingLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> errorLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> successLiveData = new MutableLiveData<>();

    public CreditRequestRepository() {
        this.apiService = ApiClient.getApiService();
    }

    // Getters para LiveData
    public LiveData<List<CreditRequest>> getCreditRequestsLiveData() {
        return creditRequestsLiveData;
    }

    public LiveData<CreditRequest> getCreditRequestLiveData() {
        return creditRequestLiveData;
    }

    public LiveData<Map<String, Object>> getStatisticsLiveData() {
        return statisticsLiveData;
    }

    public LiveData<Boolean> getLoadingLiveData() {
        return loadingLiveData;
    }

    public LiveData<String> getErrorLiveData() {
        return errorLiveData;
    }

    public LiveData<String> getSuccessLiveData() {
        return successLiveData;
    }

    // Obtener todas las solicitudes de crédito
    public void getAllCreditRequests(String status, Integer clientId, Integer userId, String priority,
                                   String currency, String dateFrom, String dateTo, String search, 
                                   Integer page, Integer limit) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequestsResponse>> call = apiService.getAllCreditRequests(
            status, clientId, userId, priority, currency, dateFrom, dateTo, search, page, limit
        );
        
        call.enqueue(new Callback<ApiResponse<CreditRequestsResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequestsResponse>> call, Response<ApiResponse<CreditRequestsResponse>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        CreditRequestsResponse data = response.body().getData();
                        if (data != null && data.getCreditRequests() != null) {
                            creditRequestsLiveData.postValue(data.getCreditRequests());
                        } else {
                            creditRequestsLiveData.postValue(new java.util.ArrayList<>());
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar solicitudes de crédito");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequestsResponse>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener solicitud por ID
    public void getCreditRequestById(int id) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequest>> call = apiService.getCreditRequestById(id);
        
        call.enqueue(new Callback<ApiResponse<CreditRequest>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequest>> call, Response<ApiResponse<CreditRequest>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        creditRequestLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar la solicitud de crédito");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequest>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener solicitudes por estado
    public void getCreditRequestsByStatus(String status) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequestsResponse>> call = apiService.getCreditRequestsByStatus(status);
        
        call.enqueue(new Callback<ApiResponse<CreditRequestsResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequestsResponse>> call, Response<ApiResponse<CreditRequestsResponse>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        CreditRequestsResponse data = response.body().getData();
                        if (data != null && data.getCreditRequests() != null) {
                            creditRequestsLiveData.postValue(data.getCreditRequests());
                        } else {
                            creditRequestsLiveData.postValue(new java.util.ArrayList<>());
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar solicitudes por estado");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequestsResponse>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener solicitudes por cliente
    public void getCreditRequestsByClient(int clientId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequestsResponse>> call = apiService.getCreditRequestsByClient(clientId);
        
        call.enqueue(new Callback<ApiResponse<CreditRequestsResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequestsResponse>> call, Response<ApiResponse<CreditRequestsResponse>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        CreditRequestsResponse data = response.body().getData();
                        if (data != null && data.getCreditRequests() != null) {
                            creditRequestsLiveData.postValue(data.getCreditRequests());
                        } else {
                            creditRequestsLiveData.postValue(new java.util.ArrayList<>());
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar solicitudes del cliente");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequestsResponse>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener solicitudes por usuario
    public void getCreditRequestsByUser(int userId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequestsResponse>> call = apiService.getCreditRequestsByUser(userId);
        
        call.enqueue(new Callback<ApiResponse<CreditRequestsResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequestsResponse>> call, Response<ApiResponse<CreditRequestsResponse>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        CreditRequestsResponse data = response.body().getData();
                        if (data != null && data.getCreditRequests() != null) {
                            creditRequestsLiveData.postValue(data.getCreditRequests());
                        } else {
                            creditRequestsLiveData.postValue(new java.util.ArrayList<>());
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar solicitudes del usuario");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequestsResponse>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener solicitudes por prioridad
    public void getCreditRequestsByPriority(String priority) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequestsResponse>> call = apiService.getCreditRequestsByPriority(priority);
        
        call.enqueue(new Callback<ApiResponse<CreditRequestsResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequestsResponse>> call, Response<ApiResponse<CreditRequestsResponse>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        CreditRequestsResponse data = response.body().getData();
                        if (data != null && data.getCreditRequests() != null) {
                            creditRequestsLiveData.postValue(data.getCreditRequests());
                        } else {
                            creditRequestsLiveData.postValue(new java.util.ArrayList<>());
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar solicitudes por prioridad");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequestsResponse>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener estadísticas
    public void getCreditRequestStatistics() {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Map<String, Object>>> call = apiService.getCreditRequestStatistics();
        
        call.enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        statisticsLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar estadísticas");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Crear solicitud de crédito
    public void createCreditRequest(CreditRequest creditRequest) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequest>> call = apiService.createCreditRequest(creditRequest);
        
        call.enqueue(new Callback<ApiResponse<CreditRequest>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequest>> call, Response<ApiResponse<CreditRequest>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        creditRequestLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Solicitud de crédito creada exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al crear la solicitud de crédito");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequest>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Actualizar solicitud de crédito
    public void updateCreditRequest(int id, CreditRequest creditRequest) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequest>> call = apiService.updateCreditRequest(id, creditRequest);
        
        call.enqueue(new Callback<ApiResponse<CreditRequest>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequest>> call, Response<ApiResponse<CreditRequest>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        creditRequestLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Solicitud actualizada exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al actualizar la solicitud");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequest>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Eliminar solicitud de crédito
    public void deleteCreditRequest(int id) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<String>> call = apiService.deleteCreditRequest(id);
        
        call.enqueue(new Callback<ApiResponse<String>>() {
            @Override
            public void onResponse(Call<ApiResponse<String>> call, Response<ApiResponse<String>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        successLiveData.postValue("Solicitud eliminada exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al eliminar la solicitud");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<String>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Cambiar estado de solicitud
    public void changeCreditRequestStatus(int id, String status) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequest>> call = apiService.changeCreditRequestStatus(id, status);
        
        call.enqueue(new Callback<ApiResponse<CreditRequest>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequest>> call, Response<ApiResponse<CreditRequest>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        creditRequestLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Estado actualizado exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cambiar el estado");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequest>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Aprobar solicitud
    public void approveCreditRequest(int id, Double approvedAmount, String approvedTerms, String conditions) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequest>> call = apiService.approveCreditRequest(id, approvedAmount, approvedTerms, conditions);
        
        call.enqueue(new Callback<ApiResponse<CreditRequest>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequest>> call, Response<ApiResponse<CreditRequest>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        creditRequestLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Solicitud aprobada exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al aprobar la solicitud");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequest>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Rechazar solicitud
    public void rejectCreditRequest(int id, String rejectionReason) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequest>> call = apiService.rejectCreditRequest(id, rejectionReason);
        
        call.enqueue(new Callback<ApiResponse<CreditRequest>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequest>> call, Response<ApiResponse<CreditRequest>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        creditRequestLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Solicitud rechazada");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al rechazar la solicitud");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequest>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Actualizar evaluación de riesgo
    public void updateRiskAssessment(int id, String riskAssessment) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<CreditRequest>> call = apiService.updateCreditRequestRiskAssessment(id, riskAssessment);
        
        call.enqueue(new Callback<ApiResponse<CreditRequest>>() {
            @Override
            public void onResponse(Call<ApiResponse<CreditRequest>> call, Response<ApiResponse<CreditRequest>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        creditRequestLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Evaluación de riesgo actualizada");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al actualizar evaluación");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<CreditRequest>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Marcar solicitudes expiradas
    public void markExpiredCreditRequests() {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<String>> call = apiService.markExpiredCreditRequests();
        
        call.enqueue(new Callback<ApiResponse<String>>() {
            @Override
            public void onResponse(Call<ApiResponse<String>> call, Response<ApiResponse<String>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        successLiveData.postValue("Solicitudes expiradas marcadas");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al marcar solicitudes expiradas");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<String>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Limpiar mensajes
    public void clearMessages() {
        errorLiveData.postValue(null);
        successLiveData.postValue(null);
    }
}