package com.example.chancafe_q.ui.credit;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.InputFilter;
import android.text.Spanned;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Client;
import com.example.chancafe_q.model.CreditRequest;
import com.example.chancafe_q.ui.clients.ClientSelectorActivity;
import com.example.chancafe_q.viewmodel.CreditRequestViewModel;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class AddEditCreditRequestActivity extends AppCompatActivity {

    private CreditRequestViewModel creditRequestViewModel;
    
    // UI Components
    private Toolbar toolbar;
    private TextView tvSelectedClient, tvClientCreditScore, tvSuggestedLimit, tvRequestNumber, tvExpiresAt;
    private Button btnSelectClient, btnSelectDate, btnCancel, btnSave, btnDocuments;
    private TextInputEditText etPurpose, etRequestedAmount, etPaymentTerms, etInternalNotes, etExchangeRate;
    private TextInputLayout layoutExchangeRate;
    private Spinner spinnerCurrency, spinnerPriority;
    private ProgressBar progressBar;
    private View layoutCreditInfo;
    
    // State
    private Client selectedClient;
    private int creditRequestId = -1;
    private boolean isEditMode = false;
    private Date selectedExpirationDate;
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
    
    // Request codes
    private static final int REQUEST_CLIENT_SELECTION = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_edit_credit_request);
        
        // Check if editing existing credit request
        Intent intent = getIntent();
        if (intent.hasExtra("credit_request_id")) {
            creditRequestId = intent.getIntExtra("credit_request_id", -1);
            isEditMode = true;
        }
        
        initViews();
        setupToolbar();
        setupSpinners();
        setupViewModel();
        setupListeners();
        
        if (isEditMode && creditRequestId != -1) {
            loadCreditRequestData();
        } else {
            // Set default expiration date (30 days from now)
            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.DAY_OF_MONTH, 30);
            selectedExpirationDate = calendar.getTime();
            tvExpiresAt.setText(dateFormat.format(selectedExpirationDate));
        }
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        tvSelectedClient = findViewById(R.id.tv_selected_client);
        tvClientCreditScore = findViewById(R.id.tv_client_credit_score);
        tvSuggestedLimit = findViewById(R.id.tv_suggested_limit);
        tvRequestNumber = findViewById(R.id.tv_request_number);
        tvExpiresAt = findViewById(R.id.tv_expires_at);
        btnSelectClient = findViewById(R.id.btn_select_client);
        btnSelectDate = findViewById(R.id.btn_select_date);
        btnCancel = findViewById(R.id.btn_cancel);
        btnSave = findViewById(R.id.btn_save);
        btnDocuments = findViewById(R.id.btn_documents);
        etPurpose = findViewById(R.id.et_purpose);
        etRequestedAmount = findViewById(R.id.et_requested_amount);
        etPaymentTerms = findViewById(R.id.et_payment_terms);
        etInternalNotes = findViewById(R.id.et_internal_notes);
        etExchangeRate = findViewById(R.id.et_exchange_rate);
        layoutExchangeRate = findViewById(R.id.layout_exchange_rate);
        spinnerCurrency = findViewById(R.id.spinner_currency);
        spinnerPriority = findViewById(R.id.spinner_priority);
        progressBar = findViewById(R.id.progress_bar);
        layoutCreditInfo = findViewById(R.id.layout_credit_info);
        
        // Set up numeric filter for payment terms
        etPaymentTerms.setFilters(new InputFilter[]{new InputFilter() {
            @Override
            public CharSequence filter(CharSequence source, int start, int end,
                                       Spanned dest, int dstart, int dend) {
                // Only allow digits
                for (int i = start; i < end; i++) {
                    if (!Character.isDigit(source.charAt(i))) {
                        return "";
                    }
                }
                return null; // Accept the input
            }
        }});
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowHomeEnabled(true);
            getSupportActionBar().setTitle(isEditMode ? "Editar Solicitud" : "Nueva Solicitud");
        }
        
        toolbar.setNavigationOnClickListener(v -> finish());
    }

    private void setupSpinners() {
        // Currency spinner
        String[] currencies = {"PEN", "USD"};
        ArrayAdapter<String> currencyAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, currencies);
        currencyAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerCurrency.setAdapter(currencyAdapter);
        
        // Priority spinner
        String[] priorities = {"low", "medium", "high", "urgent"};
        String[] priorityLabels = {"Baja", "Media", "Alta", "Urgente"};
        ArrayAdapter<String> priorityAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, priorityLabels);
        priorityAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerPriority.setAdapter(priorityAdapter);
        
        // Set default values
        spinnerCurrency.setSelection(0); // PEN
        spinnerPriority.setSelection(1); // Medium
    }

    private void setupViewModel() {
        creditRequestViewModel = new ViewModelProvider(this).get(CreditRequestViewModel.class);
        
        // Observar estado de carga
        creditRequestViewModel.getLoading().observe(this, isLoading -> {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            btnSave.setEnabled(!isLoading);
        });
        
        // Observar errores
        creditRequestViewModel.getError().observe(this, error -> {
            if (error != null && !error.isEmpty()) {
                Toast.makeText(this, error, Toast.LENGTH_LONG).show();
                creditRequestViewModel.clearMessages();
            }
        });
        
        // Observar mensajes de éxito
        creditRequestViewModel.getSuccess().observe(this, success -> {
            if (success != null && !success.isEmpty()) {
                Toast.makeText(this, success, Toast.LENGTH_SHORT).show();
                creditRequestViewModel.clearMessages();
                finish(); // Cerrar actividad al guardar exitosamente
            }
        });
        
        // Observar solicitud cargada (para modo edición)
        creditRequestViewModel.getCreditRequest().observe(this, this::populateFields);
    }

    private void setupListeners() {
        // Client selection
        btnSelectClient.setOnClickListener(v -> openClientSelector());
        
        // Date selection
        btnSelectDate.setOnClickListener(v -> openDatePicker());
        
        // Currency change listener
        spinnerCurrency.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                String currency = (String) parent.getItemAtPosition(position);
                layoutExchangeRate.setVisibility("USD".equals(currency) ? View.VISIBLE : View.GONE);
                if ("PEN".equals(currency)) {
                    etExchangeRate.setText("");
                }
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });
        
        // Action buttons
        btnCancel.setOnClickListener(v -> finish());
        btnSave.setOnClickListener(v -> saveCreditRequest());
        
        // Documents button (disabled for now)
        btnDocuments.setOnClickListener(v -> 
            Toast.makeText(this, "Gestión de documentos disponible próximamente", Toast.LENGTH_SHORT).show()
        );
    }

    private void openClientSelector() {
        Intent intent = new Intent(this, ClientSelectorActivity.class);
        startActivityForResult(intent, REQUEST_CLIENT_SELECTION);
    }

    private void openDatePicker() {
        Calendar calendar = Calendar.getInstance();
        if (selectedExpirationDate != null) {
            calendar.setTime(selectedExpirationDate);
        }
        
        new DatePickerDialog(this, (view, year, month, dayOfMonth) -> {
            Calendar selectedCalendar = Calendar.getInstance();
            selectedCalendar.set(year, month, dayOfMonth);
            selectedExpirationDate = selectedCalendar.getTime();
            tvExpiresAt.setText(dateFormat.format(selectedExpirationDate));
        }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show();
    }

    private void loadCreditRequestData() {
        creditRequestViewModel.loadCreditRequestById(creditRequestId);
    }

    private void populateFields(CreditRequest creditRequest) {
        if (creditRequest == null) return;
        
        // Populate basic fields
        etPurpose.setText(creditRequest.getPurpose());
        etRequestedAmount.setText(creditRequest.getRequestedAmount() != null ? 
            String.valueOf(creditRequest.getRequestedAmount()) : "");
        etPaymentTerms.setText(creditRequest.getPaymentTerms() != null ? 
            String.valueOf(creditRequest.getPaymentTerms()) : "");
        etInternalNotes.setText(creditRequest.getInternalNotes());
        
        // Set currency and exchange rate
        if (creditRequest.getCurrency() != null) {
            String[] currencies = {"PEN", "USD"};
            for (int i = 0; i < currencies.length; i++) {
                if (currencies[i].equals(creditRequest.getCurrency())) {
                    spinnerCurrency.setSelection(i);
                    break;
                }
            }
        }
        
        if (creditRequest.getExchangeRate() != null && creditRequest.getExchangeRate() > 0) {
            etExchangeRate.setText(String.valueOf(creditRequest.getExchangeRate()));
            layoutExchangeRate.setVisibility(View.VISIBLE);
        }
        
        // Set priority
        if (creditRequest.getPriority() != null) {
            String[] priorities = {"low", "medium", "high", "urgent"};
            for (int i = 0; i < priorities.length; i++) {
                if (priorities[i].equals(creditRequest.getPriority())) {
                    spinnerPriority.setSelection(i);
                    break;
                }
            }
        }
        
        // Set request number
        tvRequestNumber.setText(creditRequest.getRequestNumber() != null ? 
            creditRequest.getRequestNumber() : "CR-" + creditRequest.getId());
        
        // Set expiration date
        if (creditRequest.getExpiresAt() != null) {
            selectedExpirationDate = creditRequest.getExpiresAt();
            tvExpiresAt.setText(dateFormat.format(selectedExpirationDate));
        }
        
        // Set client information
        if (creditRequest.getClient() != null) {
            selectedClient = creditRequest.getClient();
            updateClientInfo();
        }
    }

    private void updateClientInfo() {
        if (selectedClient != null) {
            String clientName = selectedClient.getBusinessName() != null 
                ? selectedClient.getBusinessName()
                : (selectedClient.getFirstName() + " " + selectedClient.getLastName()).trim();
            
            tvSelectedClient.setText(clientName);
            
            // Show credit info if available
            if (selectedClient.getCreditScore() != null && selectedClient.getCreditScore() > 0) {
                layoutCreditInfo.setVisibility(View.VISIBLE);
                
                String scoreText = selectedClient.getCreditScore() + " - ";
                if (selectedClient.getCreditScore() >= 750) {
                    scoreText += "Excelente";
                } else if (selectedClient.getCreditScore() >= 650) {
                    scoreText += "Bueno";
                } else if (selectedClient.getCreditScore() >= 550) {
                    scoreText += "Regular";
                } else {
                    scoreText += "Malo";
                }
                
                tvClientCreditScore.setText(scoreText);
                
                // Show suggested limit
                if (selectedClient.getSuggestedCreditLimit() != null) {
                    tvSuggestedLimit.setText("Límite: S/ " + 
                        String.format(Locale.getDefault(), "%.0f", selectedClient.getSuggestedCreditLimit()));
                } else {
                    tvSuggestedLimit.setText("Sin límite definido");
                }
            } else {
                layoutCreditInfo.setVisibility(View.GONE);
            }
        }
    }

    private void saveCreditRequest() {
        if (!validateForm()) {
            return;
        }
        
        try {
            CreditRequest creditRequest = new CreditRequest();
        
        // Set client ID
        if (selectedClient != null) {
            creditRequest.setClientId(selectedClient.getId());
            creditRequest.setClient(selectedClient);
        }
        
        // Set basic fields
        creditRequest.setPurpose(etPurpose.getText().toString().trim());
        creditRequest.setRequestedAmount(Double.parseDouble(etRequestedAmount.getText().toString().trim()));
        
        // Parse payment terms safely (validation already done in validateForm)
        String paymentTermsText = etPaymentTerms.getText().toString().trim();
        creditRequest.setPaymentTerms(Integer.parseInt(paymentTermsText));
        
        creditRequest.setInternalNotes(etInternalNotes.getText().toString().trim());
        
        // Set currency and exchange rate
        String currency = (String) spinnerCurrency.getSelectedItem();
        creditRequest.setCurrency(currency);
        
        if ("USD".equals(currency) && !etExchangeRate.getText().toString().trim().isEmpty()) {
            creditRequest.setExchangeRate(Double.parseDouble(etExchangeRate.getText().toString().trim()));
        }
        
        // Set priority
        String[] priorities = {"low", "medium", "high", "urgent"};
        creditRequest.setPriority(priorities[spinnerPriority.getSelectedItemPosition()]);
        
        // Set expiration date
        creditRequest.setExpiresAt(selectedExpirationDate);
        
        // Set status and user ID (should come from session)
        creditRequest.setStatus("pending");
        creditRequest.setUserId(1); // TODO: Get from user session
        
            // Save or update
            if (isEditMode && creditRequestId != -1) {
                creditRequest.setId(creditRequestId);
                creditRequestViewModel.updateCreditRequest(creditRequestId, creditRequest);
            } else {
                creditRequestViewModel.createCreditRequest(creditRequest);
            }
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Error en el formato de los datos numéricos. Verifique los campos.", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Toast.makeText(this, "Error al procesar la solicitud: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private boolean validateForm() {
        // Validate client selection
        if (selectedClient == null) {
            Toast.makeText(this, "Debe seleccionar un cliente", Toast.LENGTH_SHORT).show();
            return false;
        }
        
        // Validate purpose
        if (etPurpose.getText().toString().trim().isEmpty()) {
            etPurpose.setError("El propósito es requerido");
            etPurpose.requestFocus();
            return false;
        }
        
        // Validate requested amount
        String amountText = etRequestedAmount.getText().toString().trim();
        if (amountText.isEmpty()) {
            etRequestedAmount.setError("El monto es requerido");
            etRequestedAmount.requestFocus();
            return false;
        }
        
        try {
            double amount = Double.parseDouble(amountText);
            if (amount <= 0) {
                etRequestedAmount.setError("El monto debe ser mayor a cero");
                etRequestedAmount.requestFocus();
                return false;
            }
        } catch (NumberFormatException e) {
            etRequestedAmount.setError("Monto inválido");
            etRequestedAmount.requestFocus();
            return false;
        }
        
        // Validate payment terms
        String paymentTermsText = etPaymentTerms.getText().toString().trim();
        if (paymentTermsText.isEmpty()) {
            etPaymentTerms.setError("Los términos de pago son requeridos");
            etPaymentTerms.requestFocus();
            return false;
        }
        
        try {
            int paymentTerms = Integer.parseInt(paymentTermsText);
            if (paymentTerms <= 0) {
                etPaymentTerms.setError("Los términos de pago deben ser mayor a 0 días");
                etPaymentTerms.requestFocus();
                return false;
            }
        } catch (NumberFormatException e) {
            etPaymentTerms.setError("Los términos de pago deben ser un número válido (días)");
            etPaymentTerms.requestFocus();
            return false;
        }
        
        // Validate exchange rate for USD
        String currency = (String) spinnerCurrency.getSelectedItem();
        if ("USD".equals(currency)) {
            String exchangeRateText = etExchangeRate.getText().toString().trim();
            if (exchangeRateText.isEmpty()) {
                etExchangeRate.setError("El tipo de cambio es requerido para USD");
                etExchangeRate.requestFocus();
                return false;
            }
            
            try {
                double exchangeRate = Double.parseDouble(exchangeRateText);
                if (exchangeRate <= 0) {
                    etExchangeRate.setError("El tipo de cambio debe ser mayor a cero");
                    etExchangeRate.requestFocus();
                    return false;
                }
            } catch (NumberFormatException e) {
                etExchangeRate.setError("Tipo de cambio inválido");
                etExchangeRate.requestFocus();
                return false;
            }
        }
        
        // Validate expiration date
        if (selectedExpirationDate == null) {
            Toast.makeText(this, "Debe seleccionar una fecha de expiración", Toast.LENGTH_SHORT).show();
            return false;
        }
        
        if (selectedExpirationDate.before(new Date())) {
            Toast.makeText(this, "La fecha de expiración debe ser futura", Toast.LENGTH_SHORT).show();
            return false;
        }
        
        return true;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == REQUEST_CLIENT_SELECTION && resultCode == RESULT_OK && data != null) {
            int clientId = data.getIntExtra("selected_client_id", -1);
            String clientName = data.getStringExtra("selected_client_name");
            
            if (clientId != -1) {
                // Create client object with basic info
                selectedClient = new Client();
                selectedClient.setId(clientId);
                
                // Parse business name vs personal name
                if (clientName != null) {
                    if (clientName.contains(" ")) {
                        String[] parts = clientName.split(" ", 2);
                        selectedClient.setFirstName(parts[0]);
                        selectedClient.setLastName(parts[1]);
                    } else {
                        selectedClient.setBusinessName(clientName);
                    }
                }
                
                updateClientInfo();
                
                // TODO: Load full client data including credit score
                // This should trigger a call to get client details from the repository
            }
        }
    }
}