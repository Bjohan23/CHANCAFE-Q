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
        if (!validateFields()) {
            return;
        }

        // Recopilar datos del formulario
        collectFormData();

        // Guardar o actualizar cliente
        if (isEditMode) {
            clientViewModel.updateClient(currentClient.getId(), currentClient);
        } else {
            clientViewModel.createClient(currentClient);
        }
    }

    private boolean validateFields() {
        // Validaciones básicas
        if (etDocumentNumber.getText().toString().trim().isEmpty()) {
            etDocumentNumber.setError("Número de documento requerido");
            etDocumentNumber.requestFocus();
            return false;
        }

        String clientType = getSpinnerValue(spinnerClientType, new String[]{"individual", "business"});
        
        if ("individual".equals(clientType)) {
            if (etFirstName.getText().toString().trim().isEmpty()) {
                etFirstName.setError("Nombre requerido para persona natural");
                etFirstName.requestFocus();
                return false;
            }
            if (etLastName.getText().toString().trim().isEmpty()) {
                etLastName.setError("Apellido requerido para persona natural");
                etLastName.requestFocus();
                return false;
            }
        } else if ("business".equals(clientType)) {
            if (etBusinessName.getText().toString().trim().isEmpty()) {
                etBusinessName.setError("Razón social requerida para empresa");
                etBusinessName.requestFocus();
                return false;
            }
        }

        // Validar email si se proporciona
        String email = etEmail.getText().toString().trim();
        if (!email.isEmpty() && !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.setError("Email inválido");
            etEmail.requestFocus();
            return false;
        }

        return true;
    }

    private void collectFormData() {
        // Datos básicos
        currentClient.setFirstName(etFirstName.getText().toString().trim());
        currentClient.setLastName(etLastName.getText().toString().trim());
        currentClient.setBusinessName(etBusinessName.getText().toString().trim());
        currentClient.setDocumentType(getSpinnerValue(spinnerDocumentType, new String[]{"DNI", "RUC", "passport", "CE"}));
        currentClient.setDocumentNumber(etDocumentNumber.getText().toString().trim());
        currentClient.setEmail(etEmail.getText().toString().trim());
        currentClient.setPhone(etPhone.getText().toString().trim());
        currentClient.setPhoneSecondary(etPhoneSecondary.getText().toString().trim());

        // Dirección
        currentClient.setAddress(etAddress.getText().toString().trim());
        currentClient.setDistrict(etDistrict.getText().toString().trim());
        currentClient.setProvince(etProvince.getText().toString().trim());
        currentClient.setDepartment(etDepartment.getText().toString().trim());
        currentClient.setPostalCode(etPostalCode.getText().toString().trim());

        // Información adicional
        currentClient.setClientType(getSpinnerValue(spinnerClientType, new String[]{"individual", "business"}));
        currentClient.setStatus(getSpinnerValue(spinnerStatus, new String[]{"active", "inactive", "suspended", "blacklisted"}));
        
        try {
            currentClient.setCreditLimit(Double.parseDouble(etCreditLimit.getText().toString().trim()));
        } catch (NumberFormatException e) {
            currentClient.setCreditLimit(0.0);
        }
        
        try {
            String paymentTermsStr = etPaymentTerms.getText().toString().trim();
            if (!paymentTermsStr.isEmpty()) {
                currentClient.setPaymentTerms(Integer.parseInt(paymentTermsStr));
            }
        } catch (NumberFormatException e) {
            currentClient.setPaymentTerms(30); // Default
        }

        currentClient.setContactMethod(getSpinnerValue(spinnerContactMethod, new String[]{"email", "phone", "whatsapp", "visit"}));
        currentClient.setContactPreference(getSpinnerValue(spinnerContactPreference, new String[]{"morning", "afternoon", "evening", "anytime"}));
        currentClient.setWebsite(etWebsite.getText().toString().trim());
        currentClient.setIndustry(etIndustry.getText().toString().trim());
        currentClient.setCompanySize(getSpinnerValue(spinnerCompanySize, new String[]{"", "micro", "small", "medium", "large"}));
        currentClient.setTaxId(etTaxId.getText().toString().trim());
        currentClient.setNotes(etNotes.getText().toString().trim());
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
