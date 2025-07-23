package com.example.chancafe_q.repository;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.example.chancafe_q.data.remote.ApiClient;
import com.example.chancafe_q.data.remote.ApiService;
import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.Quote;
import com.example.chancafe_q.model.QuoteItem;
import com.example.chancafe_q.model.QuoteWithItemsResponse;
import com.example.chancafe_q.model.QuotesResponse;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class QuoteRepository {
    private final ApiService apiService;
    private final MutableLiveData<List<Quote>> quotesLiveData = new MutableLiveData<>();
    private final MutableLiveData<Quote> quoteLiveData = new MutableLiveData<>();
    private final MutableLiveData<List<QuoteItem>> quoteItemsLiveData = new MutableLiveData<>();
    private final MutableLiveData<Map<String, Object>> creditAssessmentLiveData = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loadingLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> errorLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> successLiveData = new MutableLiveData<>();

    public QuoteRepository() {
        this.apiService = ApiClient.getApiService();
    }

    // Getters para LiveData
    public LiveData<List<Quote>> getQuotesLiveData() {
        return quotesLiveData;
    }

    public LiveData<Quote> getQuoteLiveData() {
        return quoteLiveData;
    }

    public LiveData<List<QuoteItem>> getQuoteItemsLiveData() {
        return quoteItemsLiveData;
    }

    public LiveData<Map<String, Object>> getCreditAssessmentLiveData() {
        return creditAssessmentLiveData;
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

    // Obtener todas las cotizaciones
    public void getAllQuotes(String status, Integer clientId, Integer userId, String currency,
                            String dateFrom, String dateTo, String search, Integer page, Integer limit) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<QuotesResponse>> call = apiService.getAllQuotes(
            status, clientId, userId, currency, dateFrom, dateTo, search, page, limit, null
        );
        
        call.enqueue(new Callback<ApiResponse<QuotesResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<QuotesResponse>> call, Response<ApiResponse<QuotesResponse>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        QuotesResponse quotesResponse = response.body().getData();
                        if (quotesResponse != null && quotesResponse.getQuotes() != null) {
                            quotesLiveData.postValue(quotesResponse.getQuotes());
                        } else {
                            quotesLiveData.postValue(null);
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    // Si es 401, limpiar el token y notificar sesión expirada
                    if (response.code() == 401) {
                        ApiClient.clearAuthToken();
                        errorLiveData.postValue("Sesión expirada. Por favor, inicia sesión nuevamente.");
                    } else {
                        errorLiveData.postValue("Error al cargar cotizaciones");
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<QuotesResponse>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener cotización por ID
    public void getQuoteById(int id) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Quote>> call = apiService.getQuoteById(id);
        
        call.enqueue(new Callback<ApiResponse<Quote>>() {
            @Override
            public void onResponse(Call<ApiResponse<Quote>> call, Response<ApiResponse<Quote>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        quoteLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar la cotización");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Quote>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener cotizaciones por cliente
    public void getQuotesByClient(int clientId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<QuotesResponse>> call = apiService.getQuotesByClient(clientId);
        
        call.enqueue(new Callback<ApiResponse<QuotesResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<QuotesResponse>> call, Response<ApiResponse<QuotesResponse>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        QuotesResponse quotesResponse = response.body().getData();
                        if (quotesResponse != null && quotesResponse.getQuotes() != null) {
                            quotesLiveData.postValue(quotesResponse.getQuotes());
                        } else {
                            quotesLiveData.postValue(null);
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar cotizaciones del cliente");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<QuotesResponse>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener cotizaciones por usuario
    public void getQuotesByUser(int userId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<QuotesResponse>> call = apiService.getQuotesByUser(userId);
        
        call.enqueue(new Callback<ApiResponse<QuotesResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<QuotesResponse>> call, Response<ApiResponse<QuotesResponse>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        QuotesResponse quotesResponse = response.body().getData();
                        if (quotesResponse != null && quotesResponse.getQuotes() != null) {
                            quotesLiveData.postValue(quotesResponse.getQuotes());
                        } else {
                            quotesLiveData.postValue(null);
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar cotizaciones del usuario");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<QuotesResponse>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener cotizaciones por estado
    public void getQuotesByStatus(String status) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<QuotesResponse>> call = apiService.getQuotesByStatus(status);
        
        call.enqueue(new Callback<ApiResponse<QuotesResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<QuotesResponse>> call, Response<ApiResponse<QuotesResponse>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        QuotesResponse quotesResponse = response.body().getData();
                        if (quotesResponse != null && quotesResponse.getQuotes() != null) {
                            quotesLiveData.postValue(quotesResponse.getQuotes());
                        } else {
                            quotesLiveData.postValue(null);
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar cotizaciones por estado");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<QuotesResponse>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener cotización por número
    public void getQuoteByNumber(String quoteNumber) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Quote>> call = apiService.getQuoteByNumber(quoteNumber);
        
        call.enqueue(new Callback<ApiResponse<Quote>>() {
            @Override
            public void onResponse(Call<ApiResponse<Quote>> call, Response<ApiResponse<Quote>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        quoteLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al buscar cotización por número");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Quote>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Crear cotización
    public void createQuote(Quote quote) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Quote>> call = apiService.createQuote(quote);
        
        call.enqueue(new Callback<ApiResponse<Quote>>() {
            @Override
            public void onResponse(Call<ApiResponse<Quote>> call, Response<ApiResponse<Quote>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        quoteLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Cotización creada exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al crear la cotización");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Quote>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Crear cotización con evaluación crediticia
    public void createQuoteWithCreditCheck(Quote quote) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Map<String, Object>>> call = apiService.createQuoteWithCreditCheck(quote);
        
        call.enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        Map<String, Object> result = response.body().getData();
                        
                        // Extraer la cotización del resultado
                        if (result.containsKey("quote")) {
                            // Aquí podrías convertir el Map a Quote si es necesario
                            successLiveData.postValue("Cotización creada con evaluación crediticia exitosamente");
                        }
                        
                        // Extraer la evaluación crediticia
                        if (result.containsKey("creditAssessment")) {
                            creditAssessmentLiveData.postValue(result);
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al crear la cotización con evaluación crediticia");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Actualizar cotización
    public void updateQuote(int id, Quote quote) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Quote>> call = apiService.updateQuote(id, quote);
        
        call.enqueue(new Callback<ApiResponse<Quote>>() {
            @Override
            public void onResponse(Call<ApiResponse<Quote>> call, Response<ApiResponse<Quote>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        quoteLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Cotización actualizada exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al actualizar la cotización");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Quote>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Eliminar cotización
    public void deleteQuote(int id) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<String>> call = apiService.deleteQuote(id);
        
        call.enqueue(new Callback<ApiResponse<String>>() {
            @Override
            public void onResponse(Call<ApiResponse<String>> call, Response<ApiResponse<String>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        successLiveData.postValue("Cotización eliminada exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al eliminar la cotización");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<String>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Cambiar estado de cotización
    public void changeQuoteStatus(int id, String status) {
        android.util.Log.d("QuoteRepository", "changeQuoteStatus called with ID: " + id + ", status: '" + status + "'");
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Quote>> call = apiService.changeQuoteStatus(id, status);
        
        call.enqueue(new Callback<ApiResponse<Quote>>() {
            @Override
            public void onResponse(Call<ApiResponse<Quote>> call, Response<ApiResponse<Quote>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        quoteLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Estado de cotización actualizado");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cambiar el estado");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Quote>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Recalcular totales de cotización
    public void recalculateQuote(int id) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Quote>> call = apiService.recalculateQuote(id);
        
        call.enqueue(new Callback<ApiResponse<Quote>>() {
            @Override
            public void onResponse(Call<ApiResponse<Quote>> call, Response<ApiResponse<Quote>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        quoteLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Totales recalculados exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al recalcular totales");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Quote>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener ítems de cotización
    public void getQuoteItems(int quoteId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<QuoteWithItemsResponse>> call = apiService.getQuoteItems(quoteId);
        
        call.enqueue(new Callback<ApiResponse<QuoteWithItemsResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<QuoteWithItemsResponse>> call, Response<ApiResponse<QuoteWithItemsResponse>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        QuoteWithItemsResponse data = response.body().getData();
                        if (data != null && data.getQuote() != null) {
                            Quote quote = data.getQuote();
                            
                            // Update quote data as well
                            quoteLiveData.postValue(quote);
                            
                            // Extract items from the quote
                            if (quote.getQuoteItems() != null) {
                                quoteItemsLiveData.postValue(quote.getQuoteItems());
                            } else {
                                quoteItemsLiveData.postValue(new java.util.ArrayList<>());
                            }
                        } else {
                            errorLiveData.postValue("Respuesta inválida del servidor");
                        }
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar ítems de cotización");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<QuoteWithItemsResponse>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Agregar ítem a cotización
    public void addQuoteItem(int quoteId, QuoteItem quoteItem) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<QuoteItem>> call = apiService.addQuoteItem(quoteId, quoteItem);
        
        call.enqueue(new Callback<ApiResponse<QuoteItem>>() {
            @Override
            public void onResponse(Call<ApiResponse<QuoteItem>> call, Response<ApiResponse<QuoteItem>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        successLiveData.postValue("Ítem agregado exitosamente");
                        // Recargar ítems de cotización
                        getQuoteItems(quoteId);
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al agregar ítem");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<QuoteItem>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Actualizar ítem de cotización
    public void updateQuoteItem(int itemId, QuoteItem quoteItem) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<QuoteItem>> call = apiService.updateQuoteItem(itemId, quoteItem);
        
        call.enqueue(new Callback<ApiResponse<QuoteItem>>() {
            @Override
            public void onResponse(Call<ApiResponse<QuoteItem>> call, Response<ApiResponse<QuoteItem>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        successLiveData.postValue("Ítem actualizado exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al actualizar ítem");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<QuoteItem>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Eliminar ítem de cotización
    public void deleteQuoteItem(int itemId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<String>> call = apiService.deleteQuoteItem(itemId);
        
        call.enqueue(new Callback<ApiResponse<String>>() {
            @Override
            public void onResponse(Call<ApiResponse<String>> call, Response<ApiResponse<String>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        successLiveData.postValue("Ítem eliminado exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al eliminar ítem");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<String>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Realizar evaluación crediticia manual
    public void performCreditCheck(int clientId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Map<String, Object>>> call = apiService.performCreditCheck(clientId);
        
        call.enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        creditAssessmentLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Evaluación crediticia realizada exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al realizar evaluación crediticia");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener evaluación crediticia existente
    public void getCreditAssessment(int clientId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Map<String, Object>>> call = apiService.getCreditAssessment(clientId);
        
        call.enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        creditAssessmentLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al obtener evaluación crediticia");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener cotización con información crediticia
    public void getQuoteWithCreditInfo(int quoteId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Map<String, Object>>> call = apiService.getQuoteWithCreditInfo(quoteId);
        
        call.enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        creditAssessmentLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al obtener cotización con información crediticia");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
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