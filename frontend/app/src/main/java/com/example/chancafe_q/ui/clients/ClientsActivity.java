package com.example.chancafe_q.ui.clients;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Client;
import com.example.chancafe_q.viewmodel.ClientViewModel;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

/**
 * Activity para gestión de clientes
 */
public class ClientsActivity extends AppCompatActivity implements ClientsAdapter.OnClientClickListener {

    private static final int REQUEST_ADD_CLIENT = 1001;
    private static final int REQUEST_EDIT_CLIENT = 1002;

    private ClientViewModel clientViewModel;
    private ClientsAdapter clientsAdapter;
    
    // Views
    private Toolbar toolbar;
    private EditText etSearch;
    private FloatingActionButton fabAddClient;
    private RecyclerView rvClients;
    private ProgressBar progressBar;
    private View layoutEmpty;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_clients);

        initViews();
        initViewModel();
        setupRecyclerView();
        setupObservers();
        setupClickListeners();
        
        // Cargar clientes al iniciar
        loadClients();
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        etSearch = findViewById(R.id.et_search);
        fabAddClient = findViewById(R.id.fab_add_client);
        rvClients = findViewById(R.id.rv_clients);
        progressBar = findViewById(R.id.progress_bar);
        layoutEmpty = findViewById(R.id.layout_empty);

        // Configurar toolbar
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowHomeEnabled(true);
        }
    }

    private void initViewModel() {
        clientViewModel = new ViewModelProvider(this).get(ClientViewModel.class);
    }

    private void setupRecyclerView() {
        clientsAdapter = new ClientsAdapter();
        clientsAdapter.setOnClientClickListener(this);
        
        rvClients.setLayoutManager(new LinearLayoutManager(this));
        rvClients.setAdapter(clientsAdapter);
    }

    private void setupObservers() {
        // Observar loading state
        clientViewModel.getIsLoading().observe(this, isLoading -> {
            if (isLoading != null) {
                progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            }
        });

        // Observar mensajes de error
        clientViewModel.getErrorMessage().observe(this, errorMessage -> {
            if (errorMessage != null && !errorMessage.isEmpty()) {
                Toast.makeText(this, errorMessage, Toast.LENGTH_LONG).show();
                clientViewModel.clearMessages();
            }
        });

        // Observar mensajes de éxito
        clientViewModel.getSuccessMessage().observe(this, successMessage -> {
            if (successMessage != null && !successMessage.isEmpty()) {
                Toast.makeText(this, successMessage, Toast.LENGTH_SHORT).show();
                clientViewModel.clearMessages();
            }
        });
    }

    private void setupClickListeners() {
        // Botón agregar cliente
        fabAddClient.setOnClickListener(v -> {
            // TODO: Abrir dialog o activity para agregar cliente
            showAddClientDialog();
        });

        // Búsqueda por documento
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(Editable s) {
                String query = s.toString().trim();
                if (query.length() >= 3) {
                    searchClientByDocument(query);
                } else if (query.isEmpty()) {
                    loadClients();
                }
            }
        });

        // Navegación back
        toolbar.setNavigationOnClickListener(v -> onBackPressed());
    }

    private void loadClients() {
        clientViewModel.getClients().observe(this, response -> {
            if (response != null) {
                if (response.isSuccess() && response.getData() != null) {
                    clientsAdapter.updateClients(response.getData());
                    
                    // Mostrar/ocultar empty state
                    if (response.getData().isEmpty()) {
                        layoutEmpty.setVisibility(View.VISIBLE);
                        rvClients.setVisibility(View.GONE);
                    } else {
                        layoutEmpty.setVisibility(View.GONE);
                        rvClients.setVisibility(View.VISIBLE);
                    }
                }
            }
        });
    }

    private void searchClientByDocument(String document) {
        clientViewModel.getClientByDocument(document).observe(this, response -> {
            if (response != null && response.isSuccess() && response.getData() != null) {
                // Crear una lista con un solo cliente para mostrar en el adapter
                java.util.List<Client> singleClientList = new java.util.ArrayList<>();
                singleClientList.add(response.getData());
                clientsAdapter.updateClients(singleClientList);
                
                // Mostrar/ocultar empty state
                layoutEmpty.setVisibility(View.GONE);
                rvClients.setVisibility(View.VISIBLE);
            } else if (response != null && !response.isSuccess()) {
                // Si no se encuentra el cliente, mostrar lista vacía
                clientsAdapter.updateClients(new java.util.ArrayList<>());
                layoutEmpty.setVisibility(View.VISIBLE);
                rvClients.setVisibility(View.GONE);
            }
        });
    }

    private void loadActiveClients() {
        clientViewModel.getActiveClients().observe(this, response -> {
            if (response != null) {
                if (response.isSuccess() && response.getData() != null) {
                    clientsAdapter.updateClients(response.getData());
                    
                    // Mostrar/ocultar empty state
                    if (response.getData().isEmpty()) {
                        layoutEmpty.setVisibility(View.VISIBLE);
                        rvClients.setVisibility(View.GONE);
                    } else {
                        layoutEmpty.setVisibility(View.GONE);
                        rvClients.setVisibility(View.VISIBLE);
                    }
                }
            }
        });
    }

    private void loadClientsByType(String type) {
        clientViewModel.getClientsByType(type).observe(this, response -> {
            if (response != null) {
                if (response.isSuccess() && response.getData() != null) {
                    clientsAdapter.updateClients(response.getData());
                    
                    // Mostrar/ocultar empty state
                    if (response.getData().isEmpty()) {
                        layoutEmpty.setVisibility(View.VISIBLE);
                        rvClients.setVisibility(View.GONE);
                    } else {
                        layoutEmpty.setVisibility(View.GONE);
                        rvClients.setVisibility(View.VISIBLE);
                    }
                }
            }
        });
    }

    private void showAddClientDialog() {
        Intent intent = new Intent(this, AddEditClientActivity.class);
        intent.putExtra(AddEditClientActivity.EXTRA_IS_EDIT_MODE, false);
        startActivityForResult(intent, REQUEST_ADD_CLIENT);
    }

    private void showEditClientDialog(Client client) {
        Intent intent = new Intent(this, AddEditClientActivity.class);
        intent.putExtra(AddEditClientActivity.EXTRA_CLIENT, client);
        intent.putExtra(AddEditClientActivity.EXTRA_IS_EDIT_MODE, true);
        startActivityForResult(intent, REQUEST_EDIT_CLIENT);
    }

    private void showClientOptionsDialog(Client client) {
        String[] options = {"Ver detalles", "Editar", "Cambiar estado", "Actualizar crédito", "Eliminar"};
        
        new AlertDialog.Builder(this)
                .setTitle(client.getFullName())
                .setItems(options, (dialog, which) -> {
                    switch (which) {
                        case 0: // Ver detalles
                            showClientDetails(client);
                            break;
                        case 1: // Editar
                            showEditClientDialog(client);
                            break;
                        case 2: // Cambiar estado
                            showChangeStatusDialog(client);
                            break;
                        case 3: // Actualizar crédito
                            showUpdateCreditDialog(client);
                            break;
                        case 4: // Eliminar
                            confirmDeleteClient(client);
                            break;
                    }
                })
                .show();
    }

    private void showClientDetails(Client client) {
        StringBuilder details = new StringBuilder();
        details.append("Nombre: ").append(client.getFullName()).append("\n");
        details.append("Documento: ").append(client.getDocumentType()).append(" - ").append(client.getDocumentNumber()).append("\n");
        details.append("Email: ").append(client.getEmail() != null ? client.getEmail() : "No especificado").append("\n");
        details.append("Teléfono: ").append(client.getPhone() != null ? client.getPhone() : "No especificado").append("\n");
        details.append("Tipo: ").append(client.getClientType()).append("\n");
        details.append("Estado: ").append(client.getStatus()).append("\n");
        details.append("Límite de crédito: S/ ").append(client.getCreditLimit()).append("\n");
        if (client.getAddress() != null) {
            details.append("Dirección: ").append(client.getFullAddress()).append("\n");
        }
        
        new AlertDialog.Builder(this)
                .setTitle("Detalles del Cliente")
                .setMessage(details.toString())
                .setPositiveButton("Cerrar", null)
                .show();
    }

    private void showChangeStatusDialog(Client client) {
        String[] statuses = {"active", "inactive", "suspended", "blacklisted"};
        String[] statusLabels = {"Activo", "Inactivo", "Suspendido", "Lista negra"};
        
        new AlertDialog.Builder(this)
                .setTitle("Cambiar Estado")
                .setItems(statusLabels, (dialog, which) -> {
                    String newStatus = statuses[which];
                    changeClientStatus(client, newStatus);
                })
                .show();
    }

    private void showUpdateCreditDialog(Client client) {
        final EditText input = new EditText(this);
        input.setInputType(android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL);
        input.setText(String.valueOf(client.getCreditLimit()));
        
        new AlertDialog.Builder(this)
                .setTitle("Actualizar Límite de Crédito")
                .setView(input)
                .setPositiveButton("Actualizar", (dialog, which) -> {
                    try {
                        double newCreditLimit = Double.parseDouble(input.getText().toString());
                        updateCreditLimit(client, newCreditLimit);
                    } catch (NumberFormatException e) {
                        Toast.makeText(this, "Ingrese un monto válido", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    private void changeClientStatus(Client client, String newStatus) {
        clientViewModel.changeClientStatus(client.getId(), newStatus).observe(this, response -> {
            if (response != null && response.isSuccess()) {
                // Actualizar el cliente en la lista
                client.setStatus(newStatus);
                clientsAdapter.updateClient(client);
                Toast.makeText(this, "Estado actualizado exitosamente", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateCreditLimit(Client client, double newCreditLimit) {
        clientViewModel.updateCreditLimit(client.getId(), newCreditLimit).observe(this, response -> {
            if (response != null && response.isSuccess()) {
                // Actualizar el cliente en la lista
                client.setCreditLimit(newCreditLimit);
                clientsAdapter.updateClient(client);
                Toast.makeText(this, "Límite de crédito actualizado exitosamente", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void confirmDeleteClient(Client client) {
        new AlertDialog.Builder(this)
                .setTitle("Eliminar Cliente")
                .setMessage("¿Estás seguro que deseas eliminar este cliente?\n\n" + 
                           client.getFullName())
                .setPositiveButton("Eliminar", (dialog, which) -> {
                    deleteClient(client);
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    private void deleteClient(Client client) {
        clientViewModel.deleteClient(client.getId()).observe(this, response -> {
            if (response != null && response.isSuccess()) {
                clientsAdapter.removeClient(client);
                Toast.makeText(this, "Cliente eliminado exitosamente", Toast.LENGTH_SHORT).show();
            }
        });
    }

    // Implementación de OnClientClickListener
    @Override
    public void onClientClick(Client client) {
        showClientOptionsDialog(client);
    }

    @Override
    public void onEditClick(Client client) {
        showEditClientDialog(client);
    }

    @Override
    public void onDeleteClick(Client client) {
        confirmDeleteClient(client);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu_clients, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        
        if (id == R.id.filter_all) {
            loadClients();
            return true;
        } else if (id == R.id.filter_active) {
            loadActiveClients();
            return true;
        } else if (id == R.id.filter_inactive) {
            loadClientsByStatus("inactive");
            return true;
        } else if (id == R.id.filter_individual) {
            loadClientsByType("individual");
            return true;
        } else if (id == R.id.filter_business) {
            loadClientsByType("business");
            return true;
        } else if (id == R.id.action_stats) {
            showClientStats();
            return true;
        } else if (id == R.id.action_refresh) {
            loadClients();
            return true;
        }
        
        return super.onOptionsItemSelected(item);
    }

    private void loadClientsByStatus(String status) {
        // Filtrar clientes por estado usando la API general y luego filtrar localmente
        clientViewModel.getClients().observe(this, response -> {
            if (response != null && response.isSuccess() && response.getData() != null) {
                java.util.List<Client> filteredClients = new java.util.ArrayList<>();
                for (Client client : response.getData()) {
                    if (status.equals(client.getStatus())) {
                        filteredClients.add(client);
                    }
                }
                clientsAdapter.updateClients(filteredClients);
                
                // Mostrar/ocultar empty state
                if (filteredClients.isEmpty()) {
                    layoutEmpty.setVisibility(View.VISIBLE);
                    rvClients.setVisibility(View.GONE);
                } else {
                    layoutEmpty.setVisibility(View.GONE);
                    rvClients.setVisibility(View.VISIBLE);
                }
            }
        });
    }

    private void showClientStats() {
        clientViewModel.getClientStats().observe(this, response -> {
            if (response != null && response.isSuccess()) {
                // Mostrar estadísticas en un dialog
                new AlertDialog.Builder(this)
                        .setTitle("Estadísticas de Clientes")
                        .setMessage("Estadísticas cargadas correctamente.\n\nEsta funcionalidad se implementará próximamente.")
                        .setPositiveButton("Cerrar", null)
                        .show();
            } else {
                Toast.makeText(this, "Error al cargar estadísticas", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (resultCode == RESULT_OK) {
            if (requestCode == REQUEST_ADD_CLIENT || requestCode == REQUEST_EDIT_CLIENT) {
                // Recargar la lista de clientes después de agregar o editar
                loadClients();
            }
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
