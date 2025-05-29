package com.example.chancafe_q.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.chancafe_q.model.User;

/**
 * ViewModel para la pantalla de Dashboard
 * Maneja la lógica de presentación del panel principal
 */
public class DashboardViewModel extends ViewModel {
    private MutableLiveData<User> currentUser;
    private MutableLiveData<String> selectedMenuItem;

    public DashboardViewModel() {
        currentUser = new MutableLiveData<>();
        selectedMenuItem = new MutableLiveData<>("home");
    }

    // Getters para observar desde la Vista
    public LiveData<User> getCurrentUser() {
        return currentUser;
    }

    public LiveData<String> getSelectedMenuItem() {
        return selectedMenuItem;
    }

    /**
     * Establece el usuario actual
     */
    public void setCurrentUser(User user) {
        currentUser.setValue(user);
    }

    /**
     * Maneja la selección de elementos del menú
     */
    public void selectMenuItem(String menuItem) {
        selectedMenuItem.setValue(menuItem);
    }

    /**
     * Obtiene el mensaje de bienvenida personalizado
     */
    public String getWelcomeMessage() {
        User user = currentUser.getValue();
        if (user != null && user.getName() != null) {
            return "Bienvenido, " + user.getName();
        }
        return "Bienvenido";
    }

    /**
     * Maneja el clic en Nueva Cotización
     */
    public void onNewQuoteClicked() {
        // TODO: Implementar navegación a Nueva Cotización
        selectedMenuItem.setValue("new_quote");
    }

    /**
     * Maneja el clic en Mis Cotizaciones
     */
    public void onMyQuotesClicked() {
        // TODO: Implementar navegación a Mis Cotizaciones
        selectedMenuItem.setValue("my_quotes");
    }

    /**
     * Maneja el clic en Clientes
     */
    public void onClientsClicked() {
        // TODO: Implementar navegación a Clientes
        selectedMenuItem.setValue("clients");
    }

    /**
     * Maneja el clic en Productos
     */
    public void onProductsClicked() {
        // TODO: Implementar navegación a Productos
        selectedMenuItem.setValue("products");
    }

    /**
     * Maneja el clic en Solicitudes de Crédito
     */
    public void onCreditRequestsClicked() {
        // TODO: Implementar navegación a Solicitudes de Crédito
        selectedMenuItem.setValue("credit_requests");
    }

    /**
     * Maneja el clic en navegación Home
     */
    public void onHomeNavClicked() {
        selectedMenuItem.setValue("home");
    }

    /**
     * Maneja el clic en navegación Agenda
     */
    public void onAgendaNavClicked() {
        selectedMenuItem.setValue("agenda");
    }

    /**
     * Maneja el clic en navegación Perfil
     */
    public void onProfileNavClicked() {
        selectedMenuItem.setValue("profile");
    }
}