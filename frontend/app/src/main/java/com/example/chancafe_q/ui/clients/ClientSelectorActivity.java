package com.example.chancafe_q.ui.clients;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Client;
import com.example.chancafe_q.viewmodel.ClientViewModel;

import java.util.List;

public class ClientSelectorActivity extends AppCompatActivity implements ClientSelectorAdapter.OnClientSelectListener {

    private ClientViewModel clientViewModel;
    private ClientSelectorAdapter clientAdapter;
    
    // UI Components
    private Toolbar toolbar;
    private EditText etSearch;
    private RecyclerView rvClients;
    private ProgressBar progressBar;
    private LinearLayout layoutEmpty;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_client_selector);
        
        initializeViews();
        setupToolbar();
        setupRecyclerView();
        setupViewModel();
        setupListeners();
        
        // Cargar clientes
        clientViewModel.loadActiveClients();
    }

    private void initializeViews() {
        toolbar = findViewById(R.id.toolbar);
        etSearch = findViewById(R.id.et_search);
        rvClients = findViewById(R.id.rv_clients);
        progressBar = findViewById(R.id.progress_bar);
        layoutEmpty = findViewById(R.id.layout_empty);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Seleccionar Cliente");
        }
    }

    private void setupRecyclerView() {
        clientAdapter = new ClientSelectorAdapter(this);
        clientAdapter.setOnClientSelectListener(this);
        
        rvClients.setLayoutManager(new LinearLayoutManager(this));
        rvClients.setAdapter(clientAdapter);
    }

    private void setupViewModel() {
        clientViewModel = new ViewModelProvider(this).get(ClientViewModel.class);
        
        // Observar clientes
        clientViewModel.getClients().observe(this, this::updateClientsList);
        
        // Observar loading
        clientViewModel.getLoading().observe(this, this::showLoading);
        
        // Observar errores
        clientViewModel.getError().observe(this, error -> {
            if (error != null && !error.isEmpty()) {
                // Si es error de sesión expirada, redirigir al login
                if (error.contains("Sesión expirada")) {
                    handleSessionExpired();
                } else {
                    showError(error);
                }
                clientViewModel.clearMessages();
            }
        });
    }

    private void setupListeners() {
        // Búsqueda
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(Editable s) {
                clientViewModel.searchClients(s.toString().trim());
            }
        });
    }

    private void updateClientsList(List<Client> clients) {
        if (clients != null && !clients.isEmpty()) {
            clientAdapter.updateClients(clients);
            rvClients.setVisibility(View.VISIBLE);
            layoutEmpty.setVisibility(View.GONE);
        } else {
            rvClients.setVisibility(View.GONE);
            layoutEmpty.setVisibility(View.VISIBLE);
        }
    }

    private void showLoading(Boolean isLoading) {
        if (isLoading != null) {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
        }
    }

    private void showError(String message) {
        Toast.makeText(this, "Error: " + message, Toast.LENGTH_LONG).show();
    }

    private void handleSessionExpired() {
        Toast.makeText(this, "Sesión expirada. Por favor, inicia sesión nuevamente.", Toast.LENGTH_LONG).show();
        
        // Redirigir al login
        Intent loginIntent = new Intent(this, com.example.chancafe_q.ui.login.LoginActivity.class);
        loginIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(loginIntent);
        finish();
    }

    // Implementación de OnClientSelectListener

    @Override
    public void onClientSelected(Client client) {
        Intent resultIntent = new Intent();
        resultIntent.putExtra("selected_client_id", client.getId());
        
        // Determinar el nombre del cliente con prioridad: businessName > fullName > firstName + lastName
        String clientName;
        if (client.getBusinessName() != null && !client.getBusinessName().isEmpty()) {
            clientName = client.getBusinessName();
        } else if (client.getFullName() != null && !client.getFullName().isEmpty()) {
            clientName = client.getFullName();
        } else {
            String firstName = client.getFirstName() != null ? client.getFirstName() : "";
            String lastName = client.getLastName() != null ? client.getLastName() : "";
            clientName = (firstName + " " + lastName).trim();
            
            if (clientName.isEmpty()) {
                clientName = "Cliente ID: " + client.getId();
            }
        }
        
        resultIntent.putExtra("selected_client_name", clientName);
        resultIntent.putExtra("selected_client_document_type", client.getDocumentType());
        resultIntent.putExtra("selected_client_document_number", client.getDocumentNumber());
        resultIntent.putExtra("selected_client_type", client.getClientType());
        
        setResult(RESULT_OK, resultIntent);
        finish();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}