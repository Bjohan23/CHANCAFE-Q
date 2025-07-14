package com.example.chancafe_q.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.chancafe_q.model.Quote;
import com.example.chancafe_q.model.QuoteItem;
import com.example.chancafe_q.repository.QuoteRepository;
import java.util.List;
import java.util.Map;

public class QuoteViewModel extends ViewModel {
    private final QuoteRepository quoteRepository;
    private final MutableLiveData<String> filterStatusLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> searchQueryLiveData = new MutableLiveData<>();
    private final MutableLiveData<Integer> selectedClientLiveData = new MutableLiveData<>();
    private final MutableLiveData<Integer> selectedUserLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> selectedCurrencyLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> dateFromLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> dateToLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> sortOrderLiveData = new MutableLiveData<>();
    private final MutableLiveData<Boolean> creditCheckEnabledLiveData = new MutableLiveData<>();

    public QuoteViewModel() {
        quoteRepository = new QuoteRepository();
        // Inicializar valores por defecto
        filterStatusLiveData.setValue("all");
        searchQueryLiveData.setValue("");
        selectedClientLiveData.setValue(null);
        selectedUserLiveData.setValue(null);
        selectedCurrencyLiveData.setValue("PEN");
        dateFromLiveData.setValue(null);
        dateToLiveData.setValue(null);
        sortOrderLiveData.setValue("created_desc");
        creditCheckEnabledLiveData.setValue(true);
    }

    // Getters para LiveData del repository
    public LiveData<List<Quote>> getQuotes() {
        return quoteRepository.getQuotesLiveData();
    }

    public LiveData<Quote> getQuote() {
        return quoteRepository.getQuoteLiveData();
    }

    public LiveData<List<QuoteItem>> getQuoteItems() {
        return quoteRepository.getQuoteItemsLiveData();
    }

    public LiveData<Map<String, Object>> getCreditAssessment() {
        return quoteRepository.getCreditAssessmentLiveData();
    }

    public LiveData<Boolean> getLoading() {
        return quoteRepository.getLoadingLiveData();
    }

    public LiveData<String> getError() {
        return quoteRepository.getErrorLiveData();
    }

    public LiveData<String> getSuccess() {
        return quoteRepository.getSuccessLiveData();
    }

    // Getters para filtros
    public LiveData<String> getFilterStatus() {
        return filterStatusLiveData;
    }

    public LiveData<String> getSearchQuery() {
        return searchQueryLiveData;
    }

    public LiveData<Integer> getSelectedClient() {
        return selectedClientLiveData;
    }

    public LiveData<Integer> getSelectedUser() {
        return selectedUserLiveData;
    }

    public LiveData<String> getSelectedCurrency() {
        return selectedCurrencyLiveData;
    }

    public LiveData<String> getDateFrom() {
        return dateFromLiveData;
    }

    public LiveData<String> getDateTo() {
        return dateToLiveData;
    }

    public LiveData<String> getSortOrder() {
        return sortOrderLiveData;
    }

    public LiveData<Boolean> getCreditCheckEnabled() {
        return creditCheckEnabledLiveData;
    }

    // Métodos para actualizar filtros
    public void setFilterStatus(String status) {
        filterStatusLiveData.setValue(status);
        loadQuotes();
    }

    public void setSearchQuery(String query) {
        searchQueryLiveData.setValue(query);
        loadQuotes();
    }

    public void setSelectedClient(Integer clientId) {
        selectedClientLiveData.setValue(clientId);
        if (clientId != null) {
            loadQuotesByClient(clientId);
        } else {
            loadQuotes();
        }
    }

    public void setSelectedUser(Integer userId) {
        selectedUserLiveData.setValue(userId);
        if (userId != null) {
            loadQuotesByUser(userId);
        } else {
            loadQuotes();
        }
    }

    public void setSelectedCurrency(String currency) {
        selectedCurrencyLiveData.setValue(currency);
        loadQuotes();
    }

    public void setDateFrom(String dateFrom) {
        dateFromLiveData.setValue(dateFrom);
        loadQuotes();
    }

    public void setDateTo(String dateTo) {
        dateToLiveData.setValue(dateTo);
        loadQuotes();
    }

    public void setSortOrder(String sortOrder) {
        sortOrderLiveData.setValue(sortOrder);
        loadQuotes();
    }

    public void setCreditCheckEnabled(boolean enabled) {
        creditCheckEnabledLiveData.setValue(enabled);
    }

    // Métodos principales para cargar cotizaciones
    public void loadQuotes() {
        String status = filterStatusLiveData.getValue();
        if ("all".equals(status)) {
            status = null;
        }
        
        Integer clientId = selectedClientLiveData.getValue();
        Integer userId = selectedUserLiveData.getValue();
        String currency = selectedCurrencyLiveData.getValue();
        String dateFrom = dateFromLiveData.getValue();
        String dateTo = dateToLiveData.getValue();
        String search = searchQueryLiveData.getValue();
        
        if (search != null && search.trim().isEmpty()) {
            search = null;
        }

        quoteRepository.getAllQuotes(
            status, clientId, userId, currency, dateFrom, dateTo, search, null, null
        );
    }

    public void loadQuotesByClient(int clientId) {
        quoteRepository.getQuotesByClient(clientId);
    }

    public void loadQuotesByUser(int userId) {
        quoteRepository.getQuotesByUser(userId);
    }

    public void loadQuotesByStatus(String status) {
        quoteRepository.getQuotesByStatus(status);
    }

    public void loadQuoteById(int id) {
        quoteRepository.getQuoteById(id);
    }

    public void loadQuoteByNumber(String quoteNumber) {
        quoteRepository.getQuoteByNumber(quoteNumber);
    }

    // Métodos CRUD para cotizaciones
    public void createQuote(Quote quote) {
        if (validateQuote(quote)) {
            if (creditCheckEnabledLiveData.getValue() && quote.getClientId() != null) {
                quoteRepository.createQuoteWithCreditCheck(quote);
            } else {
                quoteRepository.createQuote(quote);
            }
        }
    }

    public void updateQuote(int id, Quote quote) {
        if (validateQuote(quote)) {
            quoteRepository.updateQuote(id, quote);
        }
    }

    public void deleteQuote(int id) {
        quoteRepository.deleteQuote(id);
    }

    public void changeQuoteStatus(int id, String status) {
        quoteRepository.changeQuoteStatus(id, status);
    }

    public void recalculateQuote(int id) {
        quoteRepository.recalculateQuote(id);
    }

    // Métodos para ítems de cotización
    public void loadQuoteItems(int quoteId) {
        quoteRepository.getQuoteItems(quoteId);
    }

    public void addQuoteItem(int quoteId, QuoteItem quoteItem) {
        if (validateQuoteItem(quoteItem)) {
            quoteRepository.addQuoteItem(quoteId, quoteItem);
        }
    }

    public void updateQuoteItem(int itemId, QuoteItem quoteItem) {
        if (validateQuoteItem(quoteItem)) {
            quoteRepository.updateQuoteItem(itemId, quoteItem);
        }
    }

    public void deleteQuoteItem(int itemId) {
        quoteRepository.deleteQuoteItem(itemId);
    }

    // Métodos para evaluación crediticia
    public void performCreditCheck(int clientId) {
        quoteRepository.performCreditCheck(clientId);
    }

    public void getCreditAssessment(int clientId) {
        quoteRepository.getCreditAssessment(clientId);
    }

    public void getQuoteWithCreditInfo(int quoteId) {
        quoteRepository.getQuoteWithCreditInfo(quoteId);
    }

    // Validación de cotizaciones
    private boolean validateQuote(Quote quote) {
        if (quote == null) {
            quoteRepository.getErrorLiveData().postValue("Cotización no válida");
            return false;
        }

        if (quote.getTitle() == null || quote.getTitle().trim().isEmpty()) {
            quoteRepository.getErrorLiveData().postValue("El título de la cotización es requerido");
            return false;
        }

        if (quote.getClientId() == null || quote.getClientId() <= 0) {
            quoteRepository.getErrorLiveData().postValue("Debe seleccionar un cliente");
            return false;
        }

        if (quote.getUserId() == null || quote.getUserId() <= 0) {
            quoteRepository.getErrorLiveData().postValue("Debe especificar el usuario");
            return false;
        }

        if (quote.getCurrency() == null || quote.getCurrency().trim().isEmpty()) {
            quoteRepository.getErrorLiveData().postValue("Debe especificar la moneda");
            return false;
        }

        if (quote.getSubtotal() == null || quote.getSubtotal() < 0) {
            quoteRepository.getErrorLiveData().postValue("El subtotal no puede ser negativo");
            return false;
        }

        if (quote.getTaxPercentage() == null || quote.getTaxPercentage() < 0 || quote.getTaxPercentage() > 100) {
            quoteRepository.getErrorLiveData().postValue("El porcentaje de impuesto debe estar entre 0 y 100");
            return false;
        }

        return true;
    }

    // Validación de ítems de cotización
    private boolean validateQuoteItem(QuoteItem quoteItem) {
        if (quoteItem == null) {
            quoteRepository.getErrorLiveData().postValue("Ítem de cotización no válido");
            return false;
        }

        if (quoteItem.getProductId() == null || quoteItem.getProductId() <= 0) {
            quoteRepository.getErrorLiveData().postValue("Debe seleccionar un producto");
            return false;
        }

        if (quoteItem.getQuantity() == null || quoteItem.getQuantity() <= 0) {
            quoteRepository.getErrorLiveData().postValue("La cantidad debe ser mayor a cero");
            return false;
        }

        if (quoteItem.getUnitPrice() == null || quoteItem.getUnitPrice() <= 0) {
            quoteRepository.getErrorLiveData().postValue("El precio unitario debe ser mayor a cero");
            return false;
        }

        if (quoteItem.getDiscount() != null && (quoteItem.getDiscount() < 0 || quoteItem.getDiscount() > 100)) {
            quoteRepository.getErrorLiveData().postValue("El descuento debe estar entre 0 y 100");
            return false;
        }

        return true;
    }

    // Métodos de utilidad
    public void clearFilters() {
        filterStatusLiveData.setValue("all");
        searchQueryLiveData.setValue("");
        selectedClientLiveData.setValue(null);
        selectedUserLiveData.setValue(null);
        selectedCurrencyLiveData.setValue("PEN");
        dateFromLiveData.setValue(null);
        dateToLiveData.setValue(null);
        loadQuotes();
    }

    public void clearMessages() {
        quoteRepository.clearMessages();
    }

    public void refresh() {
        loadQuotes();
    }

    // Métodos para manejo de estados
    public String getFilterStatusValue() {
        return filterStatusLiveData.getValue();
    }

    public String getSearchQueryValue() {
        return searchQueryLiveData.getValue();
    }

    public Integer getSelectedClientValue() {
        return selectedClientLiveData.getValue();
    }

    public Integer getSelectedUserValue() {
        return selectedUserLiveData.getValue();
    }

    public String getSelectedCurrencyValue() {
        return selectedCurrencyLiveData.getValue();
    }

    public String getDateFromValue() {
        return dateFromLiveData.getValue();
    }

    public String getDateToValue() {
        return dateToLiveData.getValue();
    }

    public String getSortOrderValue() {
        return sortOrderLiveData.getValue();
    }

    public boolean getCreditCheckEnabledValue() {
        return creditCheckEnabledLiveData.getValue() != null ? creditCheckEnabledLiveData.getValue() : true;
    }

    // Métodos para filtros rápidos
    public void applyQuickFilter(String filterType) {
        clearFilters();
        switch (filterType) {
            case "all":
                setFilterStatus("all");
                break;
            case "pending":
                setFilterStatus("pending");
                break;
            case "approved":
                setFilterStatus("approved");
                break;
            case "rejected":
                setFilterStatus("rejected");
                break;
            case "expired":
                setFilterStatus("expired");
                break;
            case "today":
                // Filtrar cotizaciones de hoy
                String today = java.time.LocalDate.now().toString();
                setDateFrom(today);
                setDateTo(today);
                break;
            case "this_week":
                // Filtrar cotizaciones de esta semana
                String startOfWeek = java.time.LocalDate.now().minusDays(7).toString();
                setDateFrom(startOfWeek);
                setDateTo(java.time.LocalDate.now().toString());
                break;
            case "this_month":
                // Filtrar cotizaciones de este mes
                String startOfMonth = java.time.LocalDate.now().withDayOfMonth(1).toString();
                setDateFrom(startOfMonth);
                setDateTo(java.time.LocalDate.now().toString());
                break;
            default:
                loadQuotes();
                break;
        }
    }

    public boolean hasActiveFilters() {
        String status = filterStatusLiveData.getValue();
        String search = searchQueryLiveData.getValue();
        Integer clientId = selectedClientLiveData.getValue();
        Integer userId = selectedUserLiveData.getValue();
        String currency = selectedCurrencyLiveData.getValue();
        String dateFrom = dateFromLiveData.getValue();
        String dateTo = dateToLiveData.getValue();

        return (status != null && !status.equals("all")) ||
               (search != null && !search.trim().isEmpty()) ||
               (clientId != null && clientId > 0) ||
               (userId != null && userId > 0) ||
               (currency != null && !currency.equals("PEN")) ||
               (dateFrom != null && !dateFrom.trim().isEmpty()) ||
               (dateTo != null && !dateTo.trim().isEmpty());
    }

    // Métodos para cálculos
    public double calculateSubtotal(List<QuoteItem> items) {
        if (items == null || items.isEmpty()) {
            return 0.0;
        }

        double subtotal = 0.0;
        for (QuoteItem item : items) {
            double itemTotal = item.getQuantity() * item.getUnitPrice();
            if (item.getDiscount() != null && item.getDiscount() > 0) {
                itemTotal = itemTotal * (1 - item.getDiscount() / 100);
            }
            subtotal += itemTotal;
        }
        return subtotal;
    }

    public double calculateTax(double subtotal, double taxPercentage) {
        return subtotal * (taxPercentage / 100);
    }

    public double calculateTotal(double subtotal, double taxPercentage) {
        return subtotal + calculateTax(subtotal, taxPercentage);
    }

    @Override
    protected void onCleared() {
        super.onCleared();
        // Limpiar recursos si es necesario
    }
}