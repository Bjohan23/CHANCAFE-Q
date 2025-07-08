package com.example.chancafe_q.ui.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.lifecycle.ViewModelProvider;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.User;
import com.example.chancafe_q.viewmodel.DashboardViewModel;

/**
 * Activity para la pantalla principal del Dashboard
 * Muestra las opciones principales del asesor
 */
public class DashboardActivity extends AppCompatActivity {

    private DashboardViewModel dashboardViewModel;
    
    // Views
    private TextView tvWelcome;
    private TextView tvRole;
    
    // Cards del menú principal
    private CardView cardNewQuote;
    private CardView cardMyQuotes;
    private CardView cardClients;
    private CardView cardProducts;
    private CardView cardCreditRequests;
    
    // Navegación inferior
    private android.widget.LinearLayout navHome;
    private android.widget.LinearLayout navAgenda;
    private android.widget.LinearLayout navProfile;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        initViews();
        initViewModel();
        setupUserData();
        setupObservers();
        setupClickListeners();
    }

    /**
     * Inicializa las vistas
     */
    private void initViews() {
        // Header views
        tvWelcome = findViewById(R.id.tv_welcome);
        tvRole = findViewById(R.id.tv_role);
        
        // Menu cards
        cardNewQuote = findViewById(R.id.card_new_quote);
        cardMyQuotes = findViewById(R.id.card_my_quotes);
        cardClients = findViewById(R.id.card_clients);
        cardProducts = findViewById(R.id.card_products);
        cardCreditRequests = findViewById(R.id.card_credit_requests);
        
        // Navigation
        navHome = findViewById(R.id.nav_home);
        navAgenda = findViewById(R.id.nav_agenda);
        navProfile = findViewById(R.id.nav_profile);
    }

    /**
     * Inicializa el ViewModel
     */
    private void initViewModel() {
        dashboardViewModel = new ViewModelProvider(this).get(DashboardViewModel.class);
    }

    /**
     * Configura los datos del usuario desde Intent
     */
    private void setupUserData() {
        // Obtener datos del usuario desde el Intent
        String userName = getIntent().getStringExtra("user_name");
        String userCode = getIntent().getStringExtra("user_code");
        String userRole = getIntent().getStringExtra("user_role");
        String userEmail = getIntent().getStringExtra("user_email");

        if (userName != null && userCode != null) {
            // Crear objeto User usando constructor vacío y setters
            User user = new User();
            user.setUserCode(userCode);
            user.setFirstName(userName); // Usar userName como firstName por simplicidad
            user.setRole(userRole != null ? userRole : "asesor");
            if (userEmail != null) {
                user.setEmail(userEmail);
            }
            
            dashboardViewModel.setCurrentUser(user);
        }
    }

    /**
     * Configura los observadores del ViewModel
     */
    private void setupObservers() {
        // Observar el usuario actual
        dashboardViewModel.getCurrentUser().observe(this, user -> {
            if (user != null) {
                updateUserUI(user);
            }
        });

        // Observar la selección de menú
        dashboardViewModel.getSelectedMenuItem().observe(this, menuItem -> {
            if (menuItem != null) {
                handleMenuSelection(menuItem);
            }
        });
    }

    /**
     * Actualiza la UI con la información del usuario
     */
    private void updateUserUI(User user) {
        if (user.getName() != null) {
            tvWelcome.setText(String.format(getString(R.string.dashboard_welcome), user.getName()));
        }
        
        if (user.getRole() != null) {
            tvRole.setText(user.getRole());
        }
    }

    /**
     * Maneja la selección de elementos del menú
     */
    private void handleMenuSelection(String menuItem) {
        Intent intent = null;
        String message = "";
        
        switch (menuItem) {
            case "new_quote":
                message = "Abriendo Nueva Cotización...";
                // TODO: intent = new Intent(this, NewQuoteActivity.class);
                break;
            case "my_quotes":
                intent = new Intent(this, com.example.chancafe_q.ui.quotes.QuotesActivity.class);
                break;
            case "clients":
                intent = new Intent(this, com.example.chancafe_q.ui.clients.ClientsActivity.class);
                break;
            case "products":
                intent = new Intent(this, com.example.chancafe_q.ui.products.ProductsActivity.class);
                break;
            case "credit_requests":
                intent = new Intent(this, com.example.chancafe_q.ui.credit.CreditRequestsActivity.class);
                break;
            case "agenda":
                intent = new Intent(this, com.example.chancafe_q.ui.agenda.AgendaActivity.class);
                break;
            case "profile":
                intent = new Intent(this, com.example.chancafe_q.ui.profile.ProfileActivity.class);
                break;
            default:
                return; // No mostrar mensaje para "home"
        }
        
        if (intent != null) {
            startActivity(intent);
        } else if (!message.isEmpty()) {
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Configura los listeners de clics
     */
    private void setupClickListeners() {
        // Cards del menú principal
        cardNewQuote.setOnClickListener(v -> 
            dashboardViewModel.onNewQuoteClicked());
        
        cardMyQuotes.setOnClickListener(v -> 
            dashboardViewModel.onMyQuotesClicked());
        
        cardClients.setOnClickListener(v -> 
            dashboardViewModel.onClientsClicked());
        
        cardProducts.setOnClickListener(v -> 
            dashboardViewModel.onProductsClicked());
        
        cardCreditRequests.setOnClickListener(v -> 
            dashboardViewModel.onCreditRequestsClicked());

        // Navegación inferior
        navHome.setOnClickListener(v -> 
            dashboardViewModel.onHomeNavClicked());
        
        navAgenda.setOnClickListener(v -> 
            dashboardViewModel.onAgendaNavClicked());
        
        navProfile.setOnClickListener(v -> 
            dashboardViewModel.onProfileNavClicked());
    }

    @Override
    public void onBackPressed() {
        // Evitar que el usuario regrese al Login sin cerrar sesión
        // Mostrar diálogo de confirmación para salir
        new androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Salir")
            .setMessage("¿Estás seguro que deseas salir de la aplicación?")
            .setPositiveButton("Sí", (dialog, which) -> {
                finishAffinity(); // Cierra toda la aplicación
            })
            .setNegativeButton("No", null)
            .show();
    }
}