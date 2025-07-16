package com.example.chancafe_q.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.chancafe_q.model.CreditRequest;
import com.example.chancafe_q.repository.CreditRequestRepository;
import java.util.List;
import java.util.Map;

public class CreditRequestViewModel extends ViewModel {
    private final CreditRequestRepository creditRequestRepository;
    private final MutableLiveData<String> filterStatusLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> filterPriorityLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> searchQueryLiveData = new MutableLiveData<>();
    private final MutableLiveData<Integer> selectedClientLiveData = new MutableLiveData<>();
    private final MutableLiveData<Integer> selectedUserLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> selectedCurrencyLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> dateFromLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> dateToLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> sortOrderLiveData = new MutableLiveData<>();

    public CreditRequestViewModel() {
        creditRequestRepository = new CreditRequestRepository();
        // Inicializar valores por defecto
        filterStatusLiveData.setValue("all");
        filterPriorityLiveData.setValue("all");
        searchQueryLiveData.setValue("");
        selectedClientLiveData.setValue(null);
        selectedUserLiveData.setValue(null);
        selectedCurrencyLiveData.setValue("PEN");
        dateFromLiveData.setValue(null);
        dateToLiveData.setValue(null);
        sortOrderLiveData.setValue("created_desc");
    }

    // Getters para LiveData del repository
    public LiveData<List<CreditRequest>> getCreditRequests() {
        return creditRequestRepository.getCreditRequestsLiveData();
    }

    public LiveData<CreditRequest> getCreditRequest() {
        return creditRequestRepository.getCreditRequestLiveData();
    }

    public LiveData<Map<String, Object>> getStatistics() {
        return creditRequestRepository.getStatisticsLiveData();
    }

    public LiveData<Boolean> getLoading() {
        return creditRequestRepository.getLoadingLiveData();
    }

    public LiveData<String> getError() {
        return creditRequestRepository.getErrorLiveData();
    }

    public LiveData<String> getSuccess() {
        return creditRequestRepository.getSuccessLiveData();
    }

    // Getters para filtros
    public LiveData<String> getFilterStatus() {
        return filterStatusLiveData;
    }

    public LiveData<String> getFilterPriority() {
        return filterPriorityLiveData;
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

    // Métodos para actualizar filtros
    public void setFilterStatus(String status) {
        filterStatusLiveData.setValue(status);
        loadCreditRequests();
    }

    public void setFilterPriority(String priority) {
        filterPriorityLiveData.setValue(priority);
        loadCreditRequests();
    }

    public void setSearchQuery(String query) {
        searchQueryLiveData.setValue(query);
        loadCreditRequests();
    }

    public void setSelectedClient(Integer clientId) {
        selectedClientLiveData.setValue(clientId);
        if (clientId != null) {
            loadCreditRequestsByClient(clientId);
        } else {
            loadCreditRequests();
        }
    }

    public void setSelectedUser(Integer userId) {
        selectedUserLiveData.setValue(userId);
        if (userId != null) {
            loadCreditRequestsByUser(userId);
        } else {
            loadCreditRequests();
        }
    }

    public void setSelectedCurrency(String currency) {
        selectedCurrencyLiveData.setValue(currency);
        loadCreditRequests();
    }

    public void setDateFrom(String dateFrom) {
        dateFromLiveData.setValue(dateFrom);
        loadCreditRequests();
    }

    public void setDateTo(String dateTo) {
        dateToLiveData.setValue(dateTo);
        loadCreditRequests();
    }

    public void setSortOrder(String sortOrder) {
        sortOrderLiveData.setValue(sortOrder);
        loadCreditRequests();
    }

    // Métodos principales para cargar solicitudes
    public void loadCreditRequests() {
        String status = filterStatusLiveData.getValue();
        if ("all".equals(status)) {
            status = null;
        }

        String priority = filterPriorityLiveData.getValue();
        if ("all".equals(priority)) {
            priority = null;
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

        creditRequestRepository.getAllCreditRequests(
            status, clientId, userId, priority, currency, dateFrom, dateTo, search, null, null
        );
    }

    public void loadCreditRequestsByClient(int clientId) {
        creditRequestRepository.getCreditRequestsByClient(clientId);
    }

    public void loadCreditRequestsByUser(int userId) {
        creditRequestRepository.getCreditRequestsByUser(userId);
    }

    public void loadCreditRequestsByStatus(String status) {
        creditRequestRepository.getCreditRequestsByStatus(status);
    }

    public void loadCreditRequestsByPriority(String priority) {
        creditRequestRepository.getCreditRequestsByPriority(priority);
    }

    public void loadCreditRequestById(int id) {
        creditRequestRepository.getCreditRequestById(id);
    }

    public void loadStatistics() {
        creditRequestRepository.getCreditRequestStatistics();
    }

    // Métodos CRUD para solicitudes de crédito
    public void createCreditRequest(CreditRequest creditRequest) {
        if (validateCreditRequest(creditRequest)) {
            creditRequestRepository.createCreditRequest(creditRequest);
        }
    }

    public void updateCreditRequest(int id, CreditRequest creditRequest) {
        if (validateCreditRequest(creditRequest)) {
            creditRequestRepository.updateCreditRequest(id, creditRequest);
        }
    }

    public void deleteCreditRequest(int id) {
        creditRequestRepository.deleteCreditRequest(id);
    }

    public void changeCreditRequestStatus(int id, String status) {
        creditRequestRepository.changeCreditRequestStatus(id, status);
    }

    // Métodos para workflow de aprobación
    public void approveCreditRequest(int id, Double approvedAmount, String approvedTerms, String conditions) {
        creditRequestRepository.approveCreditRequest(id, approvedAmount, approvedTerms, conditions);
    }

    public void rejectCreditRequest(int id, String rejectionReason) {
        creditRequestRepository.rejectCreditRequest(id, rejectionReason);
    }

    public void updateRiskAssessment(int id, String riskAssessment) {
        creditRequestRepository.updateRiskAssessment(id, riskAssessment);
    }

    public void markExpiredCreditRequests() {
        creditRequestRepository.markExpiredCreditRequests();
    }

    // Validación de solicitudes de crédito
    private boolean validateCreditRequest(CreditRequest creditRequest) {
        if (creditRequest == null) {
            // Crear una validación local y usar el repositorio para crear una solicitud vacía que genere error
            return false;
        }

        if (creditRequest.getClientId() <= 0) {
            return false;
        }

        if (creditRequest.getUserId() <= 0) {
            return false;
        }

        if (creditRequest.getRequestedAmount() == null || creditRequest.getRequestedAmount() <= 0) {
            return false;
        }

        if (creditRequest.getPurpose() == null || creditRequest.getPurpose().trim().isEmpty()) {
            return false;
        }

        if (creditRequest.getPaymentTerms() == null || creditRequest.getPaymentTerms() <= 0) {
            return false;
        }

        if (creditRequest.getCurrency() == null || creditRequest.getCurrency().trim().isEmpty()) {
            return false;
        }

        return true;
    }

    // Métodos de utilidad
    public void clearFilters() {
        filterStatusLiveData.setValue("all");
        filterPriorityLiveData.setValue("all");
        searchQueryLiveData.setValue("");
        selectedClientLiveData.setValue(null);
        selectedUserLiveData.setValue(null);
        selectedCurrencyLiveData.setValue("PEN");
        dateFromLiveData.setValue(null);
        dateToLiveData.setValue(null);
        loadCreditRequests();
    }

    public void clearMessages() {
        creditRequestRepository.clearMessages();
    }

    public void refresh() {
        loadCreditRequests();
    }

    // Métodos para manejo de estados
    public String getFilterStatusValue() {
        return filterStatusLiveData.getValue();
    }

    public String getFilterPriorityValue() {
        return filterPriorityLiveData.getValue();
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
            case "high_priority":
                setFilterPriority("high");
                break;
            case "urgent":
                setFilterPriority("urgent");
                break;
            case "today":
                // Filtrar solicitudes de hoy
                String today = java.time.LocalDate.now().toString();
                setDateFrom(today);
                setDateTo(today);
                break;
            case "this_week":
                // Filtrar solicitudes de esta semana
                String startOfWeek = java.time.LocalDate.now().minusDays(7).toString();
                setDateFrom(startOfWeek);
                setDateTo(java.time.LocalDate.now().toString());
                break;
            case "this_month":
                // Filtrar solicitudes de este mes
                String startOfMonth = java.time.LocalDate.now().withDayOfMonth(1).toString();
                setDateFrom(startOfMonth);
                setDateTo(java.time.LocalDate.now().toString());
                break;
            default:
                loadCreditRequests();
                break;
        }
    }

    public boolean hasActiveFilters() {
        String status = filterStatusLiveData.getValue();
        String priority = filterPriorityLiveData.getValue();
        String search = searchQueryLiveData.getValue();
        Integer clientId = selectedClientLiveData.getValue();
        Integer userId = selectedUserLiveData.getValue();
        String currency = selectedCurrencyLiveData.getValue();
        String dateFrom = dateFromLiveData.getValue();
        String dateTo = dateToLiveData.getValue();

        return (status != null && !status.equals("all")) ||
               (priority != null && !priority.equals("all")) ||
               (search != null && !search.trim().isEmpty()) ||
               (clientId != null && clientId > 0) ||
               (userId != null && userId > 0) ||
               (currency != null && !currency.equals("PEN")) ||
               (dateFrom != null && !dateFrom.trim().isEmpty()) ||
               (dateTo != null && !dateTo.trim().isEmpty());
    }

    // Métodos para cálculos y utilidades
    public double calculateDebtToIncomeRatio(double monthlyIncome, double currentDebts) {
        if (monthlyIncome <= 0) return 0;
        return (currentDebts / monthlyIncome) * 100;
    }

    public double calculateMonthlyPayment(double amount, int termsInMonths, double interestRate) {
        if (termsInMonths <= 0) return 0;
        
        if (interestRate <= 0) {
            // Cálculo simple sin intereses
            return amount / termsInMonths;
        } else {
            // Cálculo con intereses usando fórmula de cuota fija
            double monthlyRate = interestRate / 100 / 12;
            return amount * (monthlyRate * Math.pow(1 + monthlyRate, termsInMonths)) / 
                   (Math.pow(1 + monthlyRate, termsInMonths) - 1);
        }
    }

    public String determineRiskLevel(double debtToIncomeRatio, int creditScore) {
        if (creditScore >= 750 && debtToIncomeRatio <= 30) {
            return "low";
        } else if (creditScore >= 650 && debtToIncomeRatio <= 40) {
            return "medium";
        } else {
            return "high";
        }
    }

    @Override
    protected void onCleared() {
        super.onCleared();
        // Limpiar recursos si es necesario
    }
}