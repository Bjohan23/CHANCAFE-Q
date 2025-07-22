package com.example.chancafe_q.ui.clients;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Client;
import com.example.chancafe_q.viewmodel.ClientViewModel;

/**
 * Activity para agregar o editar un cliente
 */
public class AddEditClientActivity extends AppCompatActivity {

    public static final String EXTRA_CLIENT = "extra_client";
    public static final String EXTRA_IS_EDIT_MODE = "extra_is_edit_mode";
    
    private ClientViewModel clientViewModel;
    private Client currentClient;
    private boolean isEditMode = false;

    // Views
    private Toolbar toolbar;
    private TextView tvTitle;
    private EditText etFirstName;
    private EditText etLastName;
    private EditText etBusinessName;
    private Spinner spinnerDocumentType;
    private EditText etDocumentNumber;
    private EditText etEmail;
    private EditText etPhone;
    private EditText etPhoneSecondary;
    private EditText etAddress;
    private EditText etDistrict;
    private EditText etProvince;
    private EditText etDepartment;
    private EditText etPostalCode;
    private Spinner spinnerClientType;
    private Spinner spinnerStatus;
    private EditText etCreditLimit;
    private EditText etPaymentTerms;
    private Spinner spinnerContactMethod;
    private Spinner spinnerContactPreference;
    private EditText etWebsite;
    private EditText etIndustry;
    private Spinner spinnerCompanySize;
    private EditText etTaxId;
    private EditText etNotes;
    private Button btnSave;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_edit_client_simple);

        initViews();
        initViewModel();
        setupSpinners();
        setupToolbar();
        setupObservers();
        setupClickListeners();

        // Verificar si estamos en modo edición
        Intent intent = getIntent();
        if (intent.hasExtra(EXTRA_CLIENT)) {
            currentClient = (Client) intent.getSerializableExtra(EXTRA_CLIENT);
            isEditMode = intent.getBooleanExtra(EXTRA_IS_EDIT_MODE, false);
            populateFields();
        } else {
            currentClient = new Client();
        }

        updateTitle();
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        tvTitle = findViewById(R.id.tv_title);
        etFirstName = findViewById(R.id.et_first_name);
        etLastName = findViewById(R.id.et_last_name);
        etBusinessName = findViewById(R.id.et_business_name);
        spinnerDocumentType = findViewById(R.id.spinner_document_type);
        etDocumentNumber = findViewById(R.id.et_document_number);
        etEmail = findViewById(R.id.et_email);
        etPhone = findViewById(R.id.et_phone);
        etPhoneSecondary = findViewById(R.id.et_phone_secondary);
        etAddress = findViewById(R.id.et_address);
        etDistrict = findViewById(R.id.et_district);
        etProvince = findViewById(R.id.et_province);
        etDepartment = findViewById(R.id.et_department);
        etPostalCode = findViewById(R.id.et_postal_code);
        spinnerClientType = findViewById(R.id.spinner_client_type);
        spinnerStatus = findViewById(R.id.spinner_status);
        etCreditLimit = findViewById(R.id.et_credit_limit);
        etPaymentTerms = findViewById(R.id.et_payment_terms);
        spinnerContactMethod = findViewById(R.id.spinner_contact_method);
        spinnerContactPreference = findViewById(R.id.spinner_contact_preference);
        etWebsite = findViewById(R.id.et_website);
        etIndustry = findViewById(R.id.et_industry);
        spinnerCompanySize = findViewById(R.id.spinner_company_size);
        etTaxId = findViewById(R.id.et_tax_id);
        etNotes = findViewById(R.id.et_notes);
        btnSave = findViewById(R.id.btn_save);
        progressBar = findViewById(R.id.progress_bar);
    }

    private void initViewModel() {
        clientViewModel = new ViewModelProvider(this).get(ClientViewModel.class);
    }

    private void setupSpinners() {
        // Document Type Spinner
        String[] documentTypes = {"DNI", "RUC", "passport", "CE"};
        ArrayAdapter<String> documentAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, documentTypes);
        documentAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerDocumentType.setAdapter(documentAdapter);

        // Client Type Spinner
        String[] clientTypes = {"individual", "business"};
        String[] clientTypeLabels = {"Persona Natural", "Empresa"};
        ArrayAdapter<String> clientTypeAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, clientTypeLabels);
        clientTypeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerClientType.setAdapter(clientTypeAdapter);

        // Status Spinner
        String[] statuses = {"active", "inactive", "suspended", "blacklisted"};
        String[] statusLabels = {"Activo", "Inactivo", "Suspendido", "Lista Negra"};
        ArrayAdapter<String> statusAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, statusLabels);
        statusAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerStatus.setAdapter(statusAdapter);

        // Contact Method Spinner
        String[] contactMethods = {"email", "phone", "whatsapp", "visit"};
        String[] contactMethodLabels = {"Email", "Teléfono", "WhatsApp", "Visita"};
        ArrayAdapter<String> contactMethodAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, contactMethodLabels);
        contactMethodAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerContactMethod.setAdapter(contactMethodAdapter);

        // Contact Preference Spinner
        String[] contactPreferences = {"morning", "afternoon", "evening", "anytime"};
        String[] contactPreferenceLabels = {"Mañana", "Tarde", "Noche", "Cualquier hora"};
        ArrayAdapter<String> contactPreferenceAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, contactPreferenceLabels);
        contactPreferenceAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerContactPreference.setAdapter(contactPreferenceAdapter);

        // Company Size Spinner
        String[] companySizes = {"", "micro", "small", "medium", "large"};
        String[] companySizeLabels = {"No especificado", "Microempresa", "Pequeña", "Mediana", "Grande"};
        ArrayAdapter<String> companySizeAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, companySizeLabels);
        companySizeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerCompanySize.setAdapter(companySizeAdapter);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowHomeEnabled(true);
        }
    }

    private void setupObservers() {
        // Observar loading state
        clientViewModel.getIsLoading().observe(this, isLoading -> {
            if (isLoading != null) {
                progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
                btnSave.setEnabled(!isLoading);
                android.util.Log.d("AddEditClient", "Loading state: " + isLoading);
            }
        });

        // Observar mensajes de error
        clientViewModel.getErrorMessage().observe(this, errorMessage -> {
            if (errorMessage != null && !errorMessage.isEmpty()) {
                android.util.Log.e("AddEditClient", "Error received: " + errorMessage);
                showError("Error al guardar cliente", errorMessage);
                clientViewModel.clearMessages();
            }
        });

        // Observar mensajes de éxito
        clientViewModel.getSuccessMessage().observe(this, successMessage -> {
            if (successMessage != null && !successMessage.isEmpty()) {
                android.util.Log.d("AddEditClient", "Success: " + successMessage);
                Toast.makeText(this, "Cliente guardado exitosamente", Toast.LENGTH_SHORT).show();
                clientViewModel.clearMessages();
                // Regresar a la activity anterior con resultado exitoso
                setResult(RESULT_OK);
                finish();
            }
        });
    }

    private void setupClickListeners() {
        btnSave.setOnClickListener(v -> saveClient());
        toolbar.setNavigationOnClickListener(v -> onBackPressed());
    }

    private void updateTitle() {
        String title = isEditMode ? "Editar Cliente" : "Nuevo Cliente";
        tvTitle.setText(title);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(title);
        }
    }

    private void populateFields() {
        if (currentClient == null) return;

        // Datos básicos
        etFirstName.setText(currentClient.getFirstName());
        etLastName.setText(currentClient.getLastName());
        etBusinessName.setText(currentClient.getBusinessName());
        etDocumentNumber.setText(currentClient.getDocumentNumber());
        etEmail.setText(currentClient.getEmail());
        etPhone.setText(currentClient.getPhone());
        etPhoneSecondary.setText(currentClient.getPhoneSecondary());

        // Dirección
        etAddress.setText(currentClient.getAddress());
        etDistrict.setText(currentClient.getDistrict());
        etProvince.setText(currentClient.getProvince());
        etDepartment.setText(currentClient.getDepartment());
        etPostalCode.setText(currentClient.getPostalCode());

        // Información adicional
        etCreditLimit.setText(String.valueOf(currentClient.getCreditLimit()));
        etPaymentTerms.setText(currentClient.getPaymentTerms() != null ? currentClient.getPaymentTerms().toString() : "");
        etWebsite.setText(currentClient.getWebsite());
        etIndustry.setText(currentClient.getIndustry());
        etTaxId.setText(currentClient.getTaxId());
        etNotes.setText(currentClient.getNotes());

        // Spinners
        setSpinnerSelection(spinnerDocumentType, currentClient.getDocumentType(), new String[]{"DNI", "RUC", "passport", "CE"});
        setSpinnerSelection(spinnerClientType, currentClient.getClientType(), new String[]{"individual", "business"});
        setSpinnerSelection(spinnerStatus, currentClient.getStatus(), new String[]{"active", "inactive", "suspended", "blacklisted"});
        setSpinnerSelection(spinnerContactMethod, currentClient.getContactMethod(), new String[]{"email", "phone", "whatsapp", "visit"});
        setSpinnerSelection(spinnerContactPreference, currentClient.getContactPreference(), new String[]{"morning", "afternoon", "evening", "anytime"});
        setSpinnerSelection(spinnerCompanySize, currentClient.getCompanySize(), new String[]{"", "micro", "small", "medium", "large"});
    }

    private void setSpinnerSelection(Spinner spinner, String value, String[] values) {
        if (value != null) {
            for (int i = 0; i < values.length; i++) {
                if (values[i].equals(value)) {
                    spinner.setSelection(i);
                    break;
                }
            }
        }
    }

    private void saveClient() {
        android.util.Log.d("AddEditClient", "=== SAVE CLIENT START ===");
        
        if (!validateFields()) {
            android.util.Log.e("AddEditClient", "Validation failed");
            return;
        }

        // Recopilar datos del formulario
        collectFormData();

        android.util.Log.d("AddEditClient", "Client data collected: " + currentClient.toString());
        android.util.Log.d("AddEditClient", "Is edit mode: " + isEditMode);

        // Guardar o actualizar cliente
        if (isEditMode) {
            android.util.Log.d("AddEditClient", "Updating client with ID: " + currentClient.getId());
            clientViewModel.updateClient(currentClient.getId(), currentClient);
        } else {
            android.util.Log.d("AddEditClient", "Creating new client");
            clientViewModel.createClient(currentClient);
        }
    }

    private boolean validateFields() {
        android.util.Log.d("AddEditClient", "=== VALIDATION START ===");
        
        // Limpiar errores previos
        clearFieldErrors();
        
        // Validaciones obligatorias: documentType y documentNumber
        String documentType = getSpinnerValue(spinnerDocumentType, new String[]{"DNI", "RUC", "passport", "CE"});
        android.util.Log.d("AddEditClient", "Document type: " + documentType);
        
        if (documentType == null || documentType.trim().isEmpty()) {
            String errorMsg = "Tipo de documento es obligatorio";
            android.util.Log.e("AddEditClient", errorMsg);
            showFieldError("Tipo de documento", errorMsg);
            spinnerDocumentType.requestFocus();
            return false;
        }

        String documentNumber = etDocumentNumber.getText().toString().trim();
        android.util.Log.d("AddEditClient", "Document number: " + documentNumber);
        
        if (documentNumber.isEmpty()) {
            String errorMsg = "Número de documento es obligatorio";
            android.util.Log.e("AddEditClient", errorMsg);
            etDocumentNumber.setError(errorMsg);
            etDocumentNumber.requestFocus();
            return false;
        }

        // Validar formato según tipo de documento
        if (!validateDocumentFormat(documentType, documentNumber)) {
            return false;
        }

        String clientType = getSpinnerValue(spinnerClientType, new String[]{"individual", "business"});
        android.util.Log.d("AddEditClient", "Client type: " + clientType);
        
        if ("individual".equals(clientType)) {
            String firstName = etFirstName.getText().toString().trim();
            if (firstName.isEmpty()) {
                String errorMsg = "Nombre requerido para persona natural";
                android.util.Log.e("AddEditClient", errorMsg);
                etFirstName.setError(errorMsg);
                etFirstName.requestFocus();
                return false;
            }
            
            String lastName = etLastName.getText().toString().trim();
            if (lastName.isEmpty()) {
                String errorMsg = "Apellido requerido para persona natural";
                android.util.Log.e("AddEditClient", errorMsg);
                etLastName.setError(errorMsg);
                etLastName.requestFocus();
                return false;
            }
        } else if ("business".equals(clientType)) {
            String businessName = etBusinessName.getText().toString().trim();
            if (businessName.isEmpty()) {
                String errorMsg = "Razón social requerida para empresa";
                android.util.Log.e("AddEditClient", errorMsg);
                etBusinessName.setError(errorMsg);
                etBusinessName.requestFocus();
                return false;
            }
        }

        // Validar email si se proporciona
        String email = etEmail.getText().toString().trim();
        if (!email.isEmpty() && !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            String errorMsg = "Formato de email inválido";
            android.util.Log.e("AddEditClient", errorMsg + ": " + email);
            etEmail.setError(errorMsg);
            etEmail.requestFocus();
            return false;
        }

        // Validar teléfono si se proporciona
        String phone = etPhone.getText().toString().trim();
        if (!phone.isEmpty() && !isValidPhone(phone)) {
            String errorMsg = "Formato de teléfono inválido (debe tener 9 dígitos)";
            android.util.Log.e("AddEditClient", errorMsg + ": " + phone);
            etPhone.setError(errorMsg);
            etPhone.requestFocus();
            return false;
        }

        android.util.Log.d("AddEditClient", "All validations passed");
        return true;
    }

    private boolean validateDocumentFormat(String documentType, String documentNumber) {
        switch (documentType) {
            case "DNI":
                if (!documentNumber.matches("\\d{8}")) {
                    String errorMsg = "DNI debe tener 8 dígitos";
                    android.util.Log.e("AddEditClient", errorMsg + ": " + documentNumber);
                    etDocumentNumber.setError(errorMsg);
                    etDocumentNumber.requestFocus();
                    return false;
                }
                break;
            case "RUC":
                if (!documentNumber.matches("\\d{11}")) {
                    String errorMsg = "RUC debe tener 11 dígitos";
                    android.util.Log.e("AddEditClient", errorMsg + ": " + documentNumber);
                    etDocumentNumber.setError(errorMsg);
                    etDocumentNumber.requestFocus();
                    return false;
                }
                break;
            case "passport":
                if (documentNumber.length() < 6 || documentNumber.length() > 12) {
                    String errorMsg = "Pasaporte debe tener entre 6 y 12 caracteres";
                    android.util.Log.e("AddEditClient", errorMsg + ": " + documentNumber);
                    etDocumentNumber.setError(errorMsg);
                    etDocumentNumber.requestFocus();
                    return false;
                }
                break;
            case "CE":
                if (documentNumber.length() < 8 || documentNumber.length() > 12) {
                    String errorMsg = "Carné de extranjería debe tener entre 8 y 12 caracteres";
                    android.util.Log.e("AddEditClient", errorMsg + ": " + documentNumber);
                    etDocumentNumber.setError(errorMsg);
                    etDocumentNumber.requestFocus();
                    return false;
                }
                break;
        }
        return true;
    }

    private boolean isValidPhone(String phone) {
        // Remover espacios y caracteres especiales
        String cleanPhone = phone.replaceAll("[\\s\\-\\(\\)]", "");
        // Validar que tenga 9 dígitos (formato peruano)
        return cleanPhone.matches("\\d{9}");
    }

    private void clearFieldErrors() {
        etDocumentNumber.setError(null);
        etFirstName.setError(null);
        etLastName.setError(null);
        etBusinessName.setError(null);
        etEmail.setError(null);
        etPhone.setError(null);
    }

    private void showFieldError(String fieldName, String message) {
        Toast.makeText(this, fieldName + ": " + message, Toast.LENGTH_LONG).show();
    }

    private void showError(String title, String message) {
        android.util.Log.e("AddEditClient", title + ": " + message);
        
        // Crear un diálogo de error más informativo
        new androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setIcon(android.R.drawable.ic_dialog_alert)
            .setPositiveButton("Entendido", (dialog, which) -> dialog.dismiss())
            .setCancelable(true)
            .show();
    }

    private void collectFormData() {
        android.util.Log.d("AddEditClient", "=== COLLECT FORM DATA START ===");
        
        try {
            // Datos básicos
            String firstName = etFirstName.getText().toString().trim();
            String lastName = etLastName.getText().toString().trim();
            String businessName = etBusinessName.getText().toString().trim();
            String documentType = getSpinnerValue(spinnerDocumentType, new String[]{"DNI", "RUC", "passport", "CE"});
            String documentNumber = etDocumentNumber.getText().toString().trim();
            String email = etEmail.getText().toString().trim();
            String phone = etPhone.getText().toString().trim();
            
            currentClient.setFirstName(firstName);
            currentClient.setLastName(lastName);
            currentClient.setBusinessName(businessName);
            currentClient.setDocumentType(documentType);
            currentClient.setDocumentNumber(documentNumber);
            currentClient.setEmail(email);
            currentClient.setPhone(phone);
            currentClient.setPhoneSecondary(etPhoneSecondary.getText().toString().trim());

            android.util.Log.d("AddEditClient", "Basic data - Name: " + firstName + " " + lastName);
            android.util.Log.d("AddEditClient", "Basic data - Business: " + businessName);
            android.util.Log.d("AddEditClient", "Basic data - Document: " + documentType + " " + documentNumber);
            android.util.Log.d("AddEditClient", "Basic data - Contact: " + email + " | " + phone);

            // Dirección
            currentClient.setAddress(etAddress.getText().toString().trim());
            currentClient.setDistrict(etDistrict.getText().toString().trim());
            currentClient.setProvince(etProvince.getText().toString().trim());
            currentClient.setDepartment(etDepartment.getText().toString().trim());
            currentClient.setPostalCode(etPostalCode.getText().toString().trim());

            // Información adicional
            String clientType = getSpinnerValue(spinnerClientType, new String[]{"individual", "business"});
            String status = getSpinnerValue(spinnerStatus, new String[]{"active", "inactive", "suspended", "blacklisted"});
            
            currentClient.setClientType(clientType);
            currentClient.setStatus(status);
            
            android.util.Log.d("AddEditClient", "Additional data - Type: " + clientType + " | Status: " + status);
            
            // Límite de crédito
            try {
                String creditLimitStr = etCreditLimit.getText().toString().trim();
                if (!creditLimitStr.isEmpty()) {
                    double creditLimit = Double.parseDouble(creditLimitStr);
                    currentClient.setCreditLimit(creditLimit);
                    android.util.Log.d("AddEditClient", "Credit limit set: " + creditLimit);
                } else {
                    currentClient.setCreditLimit(0.0);
                    android.util.Log.d("AddEditClient", "Credit limit set to default: 0.0");
                }
            } catch (NumberFormatException e) {
                android.util.Log.e("AddEditClient", "Error parsing credit limit: " + e.getMessage());
                currentClient.setCreditLimit(0.0);
            }
            
            // Términos de pago
            try {
                String paymentTermsStr = etPaymentTerms.getText().toString().trim();
                if (!paymentTermsStr.isEmpty()) {
                    int paymentTerms = Integer.parseInt(paymentTermsStr);
                    currentClient.setPaymentTerms(paymentTerms);
                    android.util.Log.d("AddEditClient", "Payment terms set: " + paymentTerms);
                } else {
                    currentClient.setPaymentTerms(30); // Default
                    android.util.Log.d("AddEditClient", "Payment terms set to default: 30");
                }
            } catch (NumberFormatException e) {
                android.util.Log.e("AddEditClient", "Error parsing payment terms: " + e.getMessage());
                currentClient.setPaymentTerms(30); // Default
            }

            currentClient.setContactMethod(getSpinnerValue(spinnerContactMethod, new String[]{"email", "phone", "whatsapp", "visit"}));
            currentClient.setContactPreference(getSpinnerValue(spinnerContactPreference, new String[]{"morning", "afternoon", "evening", "anytime"}));
            currentClient.setWebsite(etWebsite.getText().toString().trim());
            currentClient.setIndustry(etIndustry.getText().toString().trim());
            currentClient.setCompanySize(getSpinnerValue(spinnerCompanySize, new String[]{"", "micro", "small", "medium", "large"}));
            currentClient.setTaxId(etTaxId.getText().toString().trim());
            currentClient.setNotes(etNotes.getText().toString().trim());
            
            android.util.Log.d("AddEditClient", "=== FORM DATA COLLECTION COMPLETED SUCCESSFULLY ===");
            
        } catch (Exception e) {
            android.util.Log.e("AddEditClient", "Error collecting form data: " + e.getMessage(), e);
            showError("Error en datos", "Error al recopilar los datos del formulario: " + e.getMessage());
        }
    }

    private String getSpinnerValue(Spinner spinner, String[] values) {
        int position = spinner.getSelectedItemPosition();
        return position >= 0 && position < values.length ? values[position] : values[0];
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
