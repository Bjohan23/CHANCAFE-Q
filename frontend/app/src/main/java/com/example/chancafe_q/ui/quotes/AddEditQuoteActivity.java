package com.example.chancafe_q.ui.quotes;

import android.app.AlertDialog;
import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Client;
import com.example.chancafe_q.model.Quote;
import com.example.chancafe_q.model.QuoteItem;
import com.example.chancafe_q.viewmodel.QuoteViewModel;
import com.example.chancafe_q.viewmodel.ClientViewModel;
import com.example.chancafe_q.ui.clients.ClientSelectorActivity;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class AddEditQuoteActivity extends AppCompatActivity implements QuoteItemsAdapter.OnQuoteItemListener {

    private QuoteViewModel quoteViewModel;
    private ClientViewModel clientViewModel;
    private QuoteItemsAdapter quoteItemsAdapter;
    
    // UI Components
    private Toolbar toolbar;
    private TextView tvSelectedClient;
    private ImageButton btnNewClient;
    private LinearLayout layoutCreditInfo;
    private TextView tvCreditStatus;
    private TextView tvCreditLimit;
    private ImageButton btnRefreshCredit;
    private EditText etTitle;
    private EditText etDescription;
    private EditText etProjectName;
    private TextView tvValidUntil;
    private Spinner spinnerCurrency;
    private LinearLayout layoutExchangeRate;
    private EditText etExchangeRate;
    private RecyclerView rvQuoteItems;
    private LinearLayout layoutEmptyItems;
    private Button btnAddItem;
    private TextView tvSubtotal;
    private TextView tvDiscount;
    private TextView tvTax;
    private TextView tvTotal;
    private EditText etNotes;
    private EditText etInternalNotes;
    private Button btnSaveDraft;
    private Button btnSaveAndSend;

    // Data
    private Quote currentQuote;
    private Client selectedClient;
    private List<QuoteItem> quoteItems;
    private boolean isEditing = false;
    private boolean isDuplicating = false;
    private int quoteIdToEdit = -1;
    private int duplicateFromQuoteId = -1;
    
    // Formatting
    private final NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "PE"));
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
    
    // Constants
    private static final int REQUEST_SELECT_CLIENT = 1001;
    private static final int REQUEST_ADD_ITEM = 1002;
    private static final int REQUEST_EDIT_ITEM = 1003;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_edit_quote);
        
        initializeViews();
        setupToolbar();
        setupRecyclerView();
        setupViewModel();
        setupListeners();
        setupSpinners();
        
        handleIntent();
        initializeQuote();
    }

    private void initializeViews() {
        toolbar = findViewById(R.id.toolbar);
        tvSelectedClient = findViewById(R.id.tv_selected_client);
        btnNewClient = findViewById(R.id.btn_new_client);
        layoutCreditInfo = findViewById(R.id.layout_credit_info);
        tvCreditStatus = findViewById(R.id.tv_credit_status);
        tvCreditLimit = findViewById(R.id.tv_credit_limit);
        btnRefreshCredit = findViewById(R.id.btn_refresh_credit);
        etTitle = findViewById(R.id.et_title);
        etDescription = findViewById(R.id.et_description);
        etProjectName = findViewById(R.id.et_project_name);
        tvValidUntil = findViewById(R.id.tv_valid_until);
        spinnerCurrency = findViewById(R.id.spinner_currency);
        layoutExchangeRate = findViewById(R.id.layout_exchange_rate);
        etExchangeRate = findViewById(R.id.et_exchange_rate);
        rvQuoteItems = findViewById(R.id.rv_quote_items);
        layoutEmptyItems = findViewById(R.id.layout_empty_items);
        btnAddItem = findViewById(R.id.btn_add_item);
        tvSubtotal = findViewById(R.id.tv_subtotal);
        tvDiscount = findViewById(R.id.tv_discount);
        tvTax = findViewById(R.id.tv_tax);
        tvTotal = findViewById(R.id.tv_total);
        etNotes = findViewById(R.id.et_notes);
        etInternalNotes = findViewById(R.id.et_internal_notes);
        btnSaveDraft = findViewById(R.id.btn_save_draft);
        btnSaveAndSend = findViewById(R.id.btn_save_and_send);
        
        quoteItems = new ArrayList<>();
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }

    private void setupRecyclerView() {
        quoteItemsAdapter = new QuoteItemsAdapter(this);
        quoteItemsAdapter.setOnQuoteItemListener(this);
        
        rvQuoteItems.setLayoutManager(new LinearLayoutManager(this));
        rvQuoteItems.setAdapter(quoteItemsAdapter);
        rvQuoteItems.setNestedScrollingEnabled(false);
    }

    private void setupViewModel() {
        quoteViewModel = new ViewModelProvider(this).get(QuoteViewModel.class);
        clientViewModel = new ViewModelProvider(this).get(ClientViewModel.class);
        
        // Observar quote
        quoteViewModel.getQuote().observe(this, this::onQuoteLoaded);
        
        // Observar loading
        quoteViewModel.getLoading().observe(this, this::showLoading);
        
        // Observar errores
        quoteViewModel.getError().observe(this, error -> {
            if (error != null && !error.isEmpty()) {
                showError(error);
                quoteViewModel.clearMessages();
            }
        });
        
        // Observar éxito
        quoteViewModel.getSuccess().observe(this, success -> {
            if (success != null && !success.isEmpty()) {
                showSuccess(success);
                quoteViewModel.clearMessages();
                // Volver a la lista después de guardar
                finish();
            }
        });
        
        // Observar evaluación crediticia
        quoteViewModel.getCreditAssessment().observe(this, this::onCreditAssessmentReceived);
    }

    private void setupListeners() {
        // Selección de cliente
        tvSelectedClient.setOnClickListener(v -> openClientSelector());
        
        // Nuevo cliente
        btnNewClient.setOnClickListener(v -> {
            Intent intent = new Intent(this, com.example.chancafe_q.ui.clients.AddEditClientActivity.class);
            startActivity(intent);
        });
        
        // Actualizar evaluación crediticia
        btnRefreshCredit.setOnClickListener(v -> {
            if (selectedClient != null) {
                quoteViewModel.performCreditCheck(selectedClient.getId());
            }
        });
        
        // Fecha válida hasta
        tvValidUntil.setOnClickListener(v -> showDatePicker());
        
        // Agregar item
        btnAddItem.setOnClickListener(v -> openAddItem());
        
        // Guardar como borrador
        btnSaveDraft.setOnClickListener(v -> saveQuote("draft"));
        
        // Guardar y enviar
        btnSaveAndSend.setOnClickListener(v -> saveQuote("sent"));
        
        // Cambio de moneda
        spinnerCurrency.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                String currency = (String) parent.getItemAtPosition(position);
                layoutExchangeRate.setVisibility("USD".equals(currency) ? View.VISIBLE : View.GONE);
                updateTotals();
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });
    }

    private void setupSpinners() {
        // Configurar spinner de moneda
        String[] currencies = {"PEN", "USD"};
        ArrayAdapter<String> currencyAdapter = new ArrayAdapter<>(this, 
            android.R.layout.simple_spinner_item, currencies);
        currencyAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerCurrency.setAdapter(currencyAdapter);
    }

    private void handleIntent() {
        Intent intent = getIntent();
        
        if (intent.hasExtra("quote_id")) {
            isEditing = true;
            quoteIdToEdit = intent.getIntExtra("quote_id", -1);
            if (getSupportActionBar() != null) {
                getSupportActionBar().setTitle("Editar Cotización");
            }
        } else if (intent.hasExtra("duplicate_from_quote_id")) {
            isDuplicating = true;
            duplicateFromQuoteId = intent.getIntExtra("duplicate_from_quote_id", -1);
            if (getSupportActionBar() != null) {
                getSupportActionBar().setTitle("Duplicar Cotización");
            }
        } else {
            if (getSupportActionBar() != null) {
                getSupportActionBar().setTitle("Nueva Cotización");
            }
        }
    }

    private void initializeQuote() {
        if (isEditing && quoteIdToEdit != -1) {
            // Cargar cotización existente
            quoteViewModel.loadQuoteById(quoteIdToEdit);
        } else if (isDuplicating && duplicateFromQuoteId != -1) {
            // Cargar cotización para duplicar
            quoteViewModel.loadQuoteById(duplicateFromQuoteId);
        } else {
            // Nueva cotización
            currentQuote = new Quote();
            setDefaultValues();
        }
    }

    private void setDefaultValues() {
        // Establecer fecha válida hasta (30 días por defecto)
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, 30);
        currentQuote.setValidUntil(calendar.getTime());
        tvValidUntil.setText(dateFormat.format(calendar.getTime()));
        
        // Moneda por defecto
        spinnerCurrency.setSelection(0); // PEN
        
        // Tipo de cambio por defecto
        etExchangeRate.setText("3.75");
        
        updateTotals();
    }

    private void onQuoteLoaded(Quote quote) {
        if (quote != null) {
            if (isDuplicating) {
                // Si es duplicación, crear nueva cotización con datos de la original
                currentQuote = new Quote();
                currentQuote.setTitle(quote.getTitle() + " (Copia)");
                currentQuote.setDescription(quote.getDescription());
                currentQuote.setProjectName(quote.getProjectName());
                currentQuote.setCurrency(quote.getCurrency());
                currentQuote.setExchangeRate(quote.getExchangeRate());
                currentQuote.setTaxPercentage(quote.getTaxPercentage());
                currentQuote.setNotes(quote.getNotes());
                
                // Establecer nueva fecha válida hasta
                Calendar calendar = Calendar.getInstance();
                calendar.add(Calendar.DAY_OF_MONTH, 30);
                currentQuote.setValidUntil(calendar.getTime());
                
                // Duplicar items
                if (quote.getQuoteItems() != null) {
                    quoteItems.clear();
                    for (QuoteItem originalItem : quote.getQuoteItems()) {
                        QuoteItem newItem = new QuoteItem();
                        newItem.setProductId(originalItem.getProductId());
                        newItem.setDescription(originalItem.getDescription());
                        newItem.setQuantity(originalItem.getQuantity());
                        newItem.setUnitPrice(originalItem.getUnitPrice());
                        newItem.setDiscount(originalItem.getDiscount());
                        newItem.setNotes(originalItem.getNotes());
                        newItem.setProduct(originalItem.getProduct());
                        newItem.calculateTotal();
                        quoteItems.add(newItem);
                    }
                }
            } else {
                // Edición normal
                currentQuote = quote;
                if (quote.getQuoteItems() != null) {
                    quoteItems.clear();
                    quoteItems.addAll(quote.getQuoteItems());
                }
            }
            
            // Cargar cliente si existe
            if (quote.getClient() != null) {
                selectedClient = quote.getClient();
                updateClientInfo();
                // Cargar evaluación crediticia si el cliente tiene DNI
                if ("DNI".equals(selectedClient.getDocumentType())) {
                    quoteViewModel.getCreditAssessment(selectedClient.getId());
                }
            }
            
            populateFields();
            updateItemsList();
            updateTotals();
        }
    }

    private void populateFields() {
        if (currentQuote != null) {
            if (currentQuote.getTitle() != null) {
                etTitle.setText(currentQuote.getTitle());
            }
            if (currentQuote.getDescription() != null) {
                etDescription.setText(currentQuote.getDescription());
            }
            if (currentQuote.getProjectName() != null) {
                etProjectName.setText(currentQuote.getProjectName());
            }
            if (currentQuote.getValidUntilAsDate() != null) {
                tvValidUntil.setText(dateFormat.format(currentQuote.getValidUntilAsDate()));
            }
            if (currentQuote.getCurrency() != null) {
                if ("USD".equals(currentQuote.getCurrency())) {
                    spinnerCurrency.setSelection(1);
                } else {
                    spinnerCurrency.setSelection(0);
                }
            }
            if (currentQuote.getExchangeRate() != null) {
                etExchangeRate.setText(String.valueOf(currentQuote.getExchangeRate()));
            }
            if (currentQuote.getNotes() != null) {
                etNotes.setText(currentQuote.getNotes());
            }
            if (currentQuote.getInternalNotes() != null) {
                etInternalNotes.setText(currentQuote.getInternalNotes());
            }
        }
    }

    private void openClientSelector() {
        Intent intent = new Intent(this, ClientSelectorActivity.class);
        startActivityForResult(intent, REQUEST_SELECT_CLIENT);
    }

    private void openAddItem() {
        Intent intent = new Intent(this, AddEditQuoteItemActivity.class);
        intent.putExtra("is_editing", false);
        startActivityForResult(intent, REQUEST_ADD_ITEM);
    }

    private void openEditItem(QuoteItem item, int position) {
        Intent intent = new Intent(this, AddEditQuoteItemActivity.class);
        intent.putExtra("is_editing", true);
        intent.putExtra("item_position", position);
        intent.putExtra("quote_item", item);
        startActivityForResult(intent, REQUEST_EDIT_ITEM);
    }

    private void showDatePicker() {
        Calendar calendar = Calendar.getInstance();
        if (currentQuote != null && currentQuote.getValidUntilAsDate() != null) {
            calendar.setTime(currentQuote.getValidUntilAsDate());
        }

        DatePickerDialog datePickerDialog = new DatePickerDialog(
            this,
            (view, year, month, dayOfMonth) -> {
                Calendar selectedDate = Calendar.getInstance();
                selectedDate.set(year, month, dayOfMonth);
                
                if (currentQuote == null) {
                    currentQuote = new Quote();
                }
                currentQuote.setValidUntil(selectedDate.getTime());
                tvValidUntil.setText(dateFormat.format(selectedDate.getTime()));
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        );
        
        // Establecer fecha mínima como hoy
        datePickerDialog.getDatePicker().setMinDate(System.currentTimeMillis());
        datePickerDialog.show();
    }

    private void updateClientInfo() {
        if (selectedClient != null) {
            String clientName = null;
            
            // Prioridad: businessName > fullName > firstName + lastName
            if (selectedClient.getBusinessName() != null && !selectedClient.getBusinessName().isEmpty()) {
                clientName = selectedClient.getBusinessName();
            } else if (selectedClient.getFullName() != null && !selectedClient.getFullName().isEmpty()) {
                clientName = selectedClient.getFullName();
            } else {
                String firstName = selectedClient.getFirstName() != null ? selectedClient.getFirstName() : "";
                String lastName = selectedClient.getLastName() != null ? selectedClient.getLastName() : "";
                clientName = (firstName + " " + lastName).trim();
                
                if (clientName.isEmpty()) {
                    clientName = "Cliente ID: " + selectedClient.getId();
                }
            }
            
            tvSelectedClient.setText(clientName);
            tvSelectedClient.setTextColor(getResources().getColor(android.R.color.black));
        } else {
            tvSelectedClient.setText("Seleccionar cliente...");
            tvSelectedClient.setTextColor(getResources().getColor(android.R.color.darker_gray));
            layoutCreditInfo.setVisibility(View.GONE);
        }
    }

    private void onCreditAssessmentReceived(Map<String, Object> creditAssessment) {
        if (creditAssessment != null && selectedClient != null) {
            layoutCreditInfo.setVisibility(View.VISIBLE);
            
            try {
                // Extraer información crediticia directamente de la respuesta
                Map<String, Object> creditInfo = (Map<String, Object>) creditAssessment.get("creditInfo");
                
                if (creditInfo != null) {
                    // Mostrar score y clasificación
                    Object score = creditInfo.get("score");
                    String scoreLabel = (String) creditInfo.get("scoreLabel");
                    String riskClassification = (String) creditInfo.get("riskClassification");
                    String automaticEvaluation = (String) creditInfo.get("automaticEvaluation");
                    String suggestedCreditLimit = (String) creditInfo.get("suggestedCreditLimit");
                    
                    StringBuilder statusText = new StringBuilder();
                    if (score != null) {
                        statusText.append("Score: ").append(score);
                        if (scoreLabel != null) {
                            statusText.append(" (").append(scoreLabel).append(")");
                        }
                    }
                    
                    if (riskClassification != null) {
                        if (statusText.length() > 0) statusText.append("\n");
                        statusText.append("Riesgo: ").append(riskClassification);
                    }
                    
                    if (automaticEvaluation != null) {
                        if (statusText.length() > 0) statusText.append("\n");
                        statusText.append("Evaluación: ").append(automaticEvaluation);
                    }
                    
                    tvCreditStatus.setText(statusText.toString());
                    
                    // Mostrar límite sugerido
                    if (suggestedCreditLimit != null) {
                        try {
                            double limit = Double.parseDouble(suggestedCreditLimit);
                            tvCreditLimit.setText(String.format(Locale.getDefault(), "Límite sugerido: S/ %.2f", limit));
                        } catch (NumberFormatException e) {
                            tvCreditLimit.setText("Límite sugerido: " + suggestedCreditLimit);
                        }
                    } else {
                        tvCreditLimit.setText("Sin límite de crédito");
                    }
                } else {
                    tvCreditStatus.setText("Información crediticia no disponible");
                    tvCreditLimit.setText("Consulte con el área de créditos");
                }
            } catch (Exception e) {
                tvCreditStatus.setText("Error al procesar información crediticia");
                tvCreditLimit.setText("Consulte manualmente el historial crediticio");
            }
        }
    }

    private void updateItemsList() {
        if (quoteItems.isEmpty()) {
            rvQuoteItems.setVisibility(View.GONE);
            layoutEmptyItems.setVisibility(View.VISIBLE);
        } else {
            rvQuoteItems.setVisibility(View.VISIBLE);
            layoutEmptyItems.setVisibility(View.GONE);
            quoteItemsAdapter.updateItems(quoteItems);
        }
    }

    private void updateTotals() {
        if (currentQuote == null) {
            currentQuote = new Quote();
        }

        // Calcular subtotal
        double subtotal = 0.0;
        for (QuoteItem item : quoteItems) {
            subtotal += item.getTotalPrice();
        }

        // Calcular descuento (por ahora 0)
        double discountAmount = 0.0;
        
        // Calcular impuesto
        double taxPercentage = currentQuote.getTaxPercentage() != null ? currentQuote.getTaxPercentage() : 18.0;
        double taxAmount = (subtotal - discountAmount) * (taxPercentage / 100);
        
        // Calcular total
        double total = subtotal - discountAmount + taxAmount;

        // Actualizar modelo
        currentQuote.setSubtotal(subtotal);
        currentQuote.setDiscountAmount(discountAmount);
        currentQuote.setTaxAmount(taxAmount);
        currentQuote.setTotalAmount(total);

        // Actualizar UI
        String currency = spinnerCurrency.getSelectedItem().toString();
        String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
        
        tvSubtotal.setText(symbol + String.format(Locale.getDefault(), "%.2f", subtotal));
        tvDiscount.setText(symbol + String.format(Locale.getDefault(), "%.2f", discountAmount));
        tvTax.setText(symbol + String.format(Locale.getDefault(), "%.2f", taxAmount));
        tvTotal.setText(symbol + String.format(Locale.getDefault(), "%.2f", total));
    }

    private void saveQuote(String status) {
        if (!validateQuote()) {
            return;
        }

        // Actualizar cotización con datos del formulario
        updateQuoteFromForm();
        currentQuote.setStatus(status);

        if (isEditing) {
            quoteViewModel.updateQuote(currentQuote.getId(), currentQuote);
        } else {
            // Verificar si se debe crear con evaluación crediticia
            if (selectedClient != null && "DNI".equals(selectedClient.getDocumentType()) && 
                quoteViewModel.getCreditCheckEnabledValue()) {
                quoteViewModel.createQuoteWithCreditCheck(currentQuote);
            } else {
                quoteViewModel.createQuote(currentQuote);
            }
        }
    }

    private void updateQuoteFromForm() {
        if (currentQuote == null) {
            currentQuote = new Quote();
        }

        // Datos básicos
        if (selectedClient != null) {
            currentQuote.setClientId(selectedClient.getId());
        }
        // TODO: Obtener userId del usuario actual
        currentQuote.setUserId(1); // Por ahora hardcodeado
        
        currentQuote.setTitle(etTitle.getText().toString().trim());
        currentQuote.setDescription(etDescription.getText().toString().trim());
        currentQuote.setProjectName(etProjectName.getText().toString().trim());
        currentQuote.setCurrency(spinnerCurrency.getSelectedItem().toString());
        
        if ("USD".equals(currentQuote.getCurrency())) {
            try {
                double exchangeRate = Double.parseDouble(etExchangeRate.getText().toString());
                currentQuote.setExchangeRate(exchangeRate);
            } catch (NumberFormatException e) {
                currentQuote.setExchangeRate(3.75); // Valor por defecto
            }
        } else {
            currentQuote.setExchangeRate(1.0);
        }
        
        currentQuote.setNotes(etNotes.getText().toString().trim());
        currentQuote.setInternalNotes(etInternalNotes.getText().toString().trim());
        
        // Establecer items
        currentQuote.setQuoteItems(new ArrayList<>(quoteItems));
    }

    private boolean validateQuote() {
        if (selectedClient == null) {
            showError("Debe seleccionar un cliente");
            return false;
        }

        if (etTitle.getText().toString().trim().isEmpty()) {
            etTitle.setError("El título es requerido");
            etTitle.requestFocus();
            return false;
        }

        if (currentQuote == null || currentQuote.getValidUntil() == null || currentQuote.getValidUntil().isEmpty()) {
            showError("Debe seleccionar una fecha de validez");
            return false;
        }

        if (quoteItems.isEmpty()) {
            showError("Debe agregar al menos un item a la cotización");
            return false;
        }

        return true;
    }

    // Implementación de QuoteItemsAdapter.OnQuoteItemListener

    @Override
    public void onEditItem(QuoteItem item, int position) {
        openEditItem(item, position);
    }

    @Override
    public void onDeleteItem(QuoteItem item, int position) {
        new AlertDialog.Builder(this)
                .setTitle("Eliminar item")
                .setMessage("¿Estás seguro de que quieres eliminar este item?")
                .setPositiveButton("Eliminar", (dialog, which) -> {
                    quoteItems.remove(position);
                    updateItemsList();
                    updateTotals();
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    @Override
    public void onDuplicateItem(QuoteItem item, int position) {
        QuoteItem duplicatedItem = new QuoteItem();
        duplicatedItem.setProductId(item.getProductId());
        duplicatedItem.setDescription(item.getDescription());
        duplicatedItem.setQuantity(item.getQuantity());
        duplicatedItem.setUnitPrice(item.getUnitPrice());
        duplicatedItem.setDiscount(item.getDiscount());
        duplicatedItem.setNotes(item.getNotes());
        duplicatedItem.setProduct(item.getProduct());
        duplicatedItem.calculateTotal();
        
        quoteItems.add(position + 1, duplicatedItem);
        updateItemsList();
        updateTotals();
        
        Toast.makeText(this, "Item duplicado", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (resultCode == RESULT_OK) {
            switch (requestCode) {
                case REQUEST_SELECT_CLIENT:
                    if (data != null && data.hasExtra("selected_client_id")) {
                        int clientId = data.getIntExtra("selected_client_id", -1);
                        String clientName = data.getStringExtra("selected_client_name");
                        String documentType = data.getStringExtra("selected_client_document_type");
                        String documentNumber = data.getStringExtra("selected_client_document_number");
                        String clientType = data.getStringExtra("selected_client_type");
                        
                        // Crear cliente temporal con los datos recibidos
                        selectedClient = new Client();
                        selectedClient.setId(clientId);
                        selectedClient.setDocumentType(documentType);
                        selectedClient.setDocumentNumber(documentNumber);
                        selectedClient.setClientType(clientType);
                        
                        // Establecer el nombre completo recibido
                        if (clientName != null && !clientName.isEmpty()) {
                            selectedClient.setFullName(clientName);
                            
                            // También intentar separar en firstName y lastName para compatibilidad
                            if (clientName.contains(" ")) {
                                String[] parts = clientName.split(" ", 2);
                                selectedClient.setFirstName(parts[0]);
                                if (parts.length > 1) {
                                    selectedClient.setLastName(parts[1]);
                                }
                            } else {
                                if ("business".equals(clientType)) {
                                    selectedClient.setBusinessName(clientName);
                                } else {
                                    selectedClient.setFirstName(clientName);
                                }
                            }
                        }
                        
                        updateClientInfo();
                        
                        // Cargar evaluación crediticia si el cliente tiene DNI
                        if ("DNI".equals(documentType)) {
                            quoteViewModel.getCreditAssessment(selectedClient.getId());
                        }
                    }
                    break;
                    
                case REQUEST_ADD_ITEM:
                    if (data != null && data.hasExtra("quote_item")) {
                        QuoteItem newItem = (QuoteItem) data.getSerializableExtra("quote_item");
                        if (newItem != null) {
                            quoteItems.add(newItem);
                            updateItemsList();
                            updateTotals();
                            Toast.makeText(this, "Item agregado exitosamente", Toast.LENGTH_SHORT).show();
                        }
                    }
                    break;
                    
                case REQUEST_EDIT_ITEM:
                    if (data != null && data.hasExtra("item_position") && data.hasExtra("quote_item")) {
                        int position = data.getIntExtra("item_position", -1);
                        QuoteItem editedItem = (QuoteItem) data.getSerializableExtra("quote_item");
                        if (position >= 0 && position < quoteItems.size() && editedItem != null) {
                            quoteItems.set(position, editedItem);
                            updateItemsList();
                            updateTotals();
                            Toast.makeText(this, "Item actualizado exitosamente", Toast.LENGTH_SHORT).show();
                        }
                    }
                    break;
            }
        }
    }

    private void showLoading(Boolean isLoading) {
        // TODO: Mostrar/ocultar loading indicator
        btnSaveDraft.setEnabled(!isLoading);
        btnSaveAndSend.setEnabled(!isLoading);
    }

    private void showError(String message) {
        Toast.makeText(this, "Error: " + message, Toast.LENGTH_LONG).show();
    }

    private void showSuccess(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }

    @Override
    public void onBackPressed() {
        if (hasUnsavedChanges()) {
            new AlertDialog.Builder(this)
                    .setTitle("Cambios sin guardar")
                    .setMessage("¿Estás seguro de que quieres salir sin guardar los cambios?")
                    .setPositiveButton("Salir", (dialog, which) -> super.onBackPressed())
                    .setNegativeButton("Continuar editando", null)
                    .show();
        } else {
            super.onBackPressed();
        }
    }

    private boolean hasUnsavedChanges() {
        // TODO: Implementar lógica para detectar cambios sin guardar
        return !etTitle.getText().toString().trim().isEmpty() || 
               !etDescription.getText().toString().trim().isEmpty() ||
               !quoteItems.isEmpty();
    }
}