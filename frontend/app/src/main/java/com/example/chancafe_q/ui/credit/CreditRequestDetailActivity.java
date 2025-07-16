package com.example.chancafe_q.ui.credit;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.cardview.widget.CardView;
import androidx.core.widget.NestedScrollView;
import androidx.lifecycle.ViewModelProvider;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.CreditRequest;
import com.example.chancafe_q.viewmodel.CreditRequestViewModel;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Locale;

public class CreditRequestDetailActivity extends AppCompatActivity {

    private int creditRequestId;
    private CreditRequestViewModel creditRequestViewModel;
    private SimpleDateFormat dateFormat;
    private NumberFormat currencyFormat;

    // UI Components
    private ProgressBar progressBar;
    private NestedScrollView scrollView;
    private LinearLayout layoutError;
    private TextView tvErrorMessage;
    private Button btnRetry;

    // Header Components
    private TextView tvRequestNumber;
    private TextView tvStatus;
    private TextView tvPriority;
    private TextView tvRequestedAmount;

    // Client Information
    private TextView tvClientName;
    private TextView tvClientEmail;
    private TextView tvClientPhone;
    private TextView tvCreditScore;
    private LinearLayout layoutCreditScore;

    // Request Details
    private TextView tvPurpose;
    private TextView tvDescription;
    private TextView tvPaymentTerms;
    private TextView tvCurrency;
    private TextView tvExchangeRate;
    private TextView labelDescription;
    private TextView labelExchangeRate;

    // Decision Information
    private CardView cardDecisionInfo;
    private TextView tvDecisionTitle;
    private LinearLayout layoutApprovedInfo;
    private LinearLayout layoutRejectionInfo;
    private TextView tvApprovedAmount;
    private TextView tvApprovedTerms;
    private TextView tvRejectionReason;

    // Dates
    private TextView tvCreatedDate;
    private TextView tvUpdatedDate;
    private TextView tvExpiresDate;
    private LinearLayout layoutExpiresDate;

    // User Information
    private CardView cardUserInfo;
    private TextView tvUserName;
    private TextView tvUserEmail;

    // Notes
    private CardView cardNotes;
    private TextView tvNotes;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_credit_request_detail);
        
        // Get credit request ID from intent
        Intent intent = getIntent();
        creditRequestId = intent.getIntExtra("credit_request_id", -1);
        
        if (creditRequestId == -1) {
            Toast.makeText(this, "Error: ID de solicitud no válido", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        // Initialize formatters
        dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault());
        currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "PE"));

        setupToolbar();
        initializeViews();
        setupViewModel();
        loadCreditRequestDetail();
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Detalle de Solicitud");
        }
        
        toolbar.setNavigationOnClickListener(v -> finish());
    }

    private void initializeViews() {
        // Main layout components
        progressBar = findViewById(R.id.progress_bar);
        scrollView = findViewById(R.id.scroll_view);
        layoutError = findViewById(R.id.layout_error);
        tvErrorMessage = findViewById(R.id.tv_error_message);
        btnRetry = findViewById(R.id.btn_retry);

        // Header components
        tvRequestNumber = findViewById(R.id.tv_request_number);
        tvStatus = findViewById(R.id.tv_status);
        tvPriority = findViewById(R.id.tv_priority);
        tvRequestedAmount = findViewById(R.id.tv_requested_amount);

        // Client information
        tvClientName = findViewById(R.id.tv_client_name);
        tvClientEmail = findViewById(R.id.tv_client_email);
        tvClientPhone = findViewById(R.id.tv_client_phone);
        tvCreditScore = findViewById(R.id.tv_credit_score);
        layoutCreditScore = findViewById(R.id.layout_credit_score);

        // Request details
        tvPurpose = findViewById(R.id.tv_purpose);
        tvDescription = findViewById(R.id.tv_description);
        tvPaymentTerms = findViewById(R.id.tv_payment_terms);
        tvCurrency = findViewById(R.id.tv_currency);
        tvExchangeRate = findViewById(R.id.tv_exchange_rate);
        labelDescription = findViewById(R.id.label_description);
        labelExchangeRate = findViewById(R.id.label_exchange_rate);

        // Decision information
        cardDecisionInfo = findViewById(R.id.card_decision_info);
        tvDecisionTitle = findViewById(R.id.tv_decision_title);
        layoutApprovedInfo = findViewById(R.id.layout_approved_info);
        layoutRejectionInfo = findViewById(R.id.layout_rejection_info);
        tvApprovedAmount = findViewById(R.id.tv_approved_amount);
        tvApprovedTerms = findViewById(R.id.tv_approved_terms);
        tvRejectionReason = findViewById(R.id.tv_rejection_reason);

        // Dates
        tvCreatedDate = findViewById(R.id.tv_created_date);
        tvUpdatedDate = findViewById(R.id.tv_updated_date);
        tvExpiresDate = findViewById(R.id.tv_expires_date);
        layoutExpiresDate = findViewById(R.id.layout_expires_date);

        // User information
        cardUserInfo = findViewById(R.id.card_user_info);
        tvUserName = findViewById(R.id.tv_user_name);
        tvUserEmail = findViewById(R.id.tv_user_email);

        // Notes
        cardNotes = findViewById(R.id.card_notes);
        tvNotes = findViewById(R.id.tv_notes);

        // Setup retry button
        btnRetry.setOnClickListener(v -> loadCreditRequestDetail());
    }

    private void setupViewModel() {
        creditRequestViewModel = new ViewModelProvider(this).get(CreditRequestViewModel.class);
        
        creditRequestViewModel.getCreditRequest().observe(this, creditRequest -> {
            if (creditRequest != null) {
                populateViews(creditRequest);
                showContent();
            }
        });

        creditRequestViewModel.getLoading().observe(this, isLoading -> {
            if (isLoading) {
                showLoading();
            }
        });

        creditRequestViewModel.getError().observe(this, error -> {
            if (error != null && !error.isEmpty()) {
                showError(error);
            }
        });
    }

    private void loadCreditRequestDetail() {
        creditRequestViewModel.loadCreditRequestById(creditRequestId);
    }

    private void populateViews(CreditRequest creditRequest) {
        // Header information
        tvRequestNumber.setText(creditRequest.getRequestNumber() != null ? 
            creditRequest.getRequestNumber() : "CR-" + creditRequest.getId());
        
        setupStatusBadge(creditRequest.getStatus());
        setupPriorityBadge(creditRequest.getPriority());
        
        // Requested amount
        String currency = creditRequest.getCurrency() != null ? creditRequest.getCurrency() : "PEN";
        String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
        tvRequestedAmount.setText(symbol + String.format(Locale.getDefault(), "%.0f", creditRequest.getRequestedAmount()));

        // Client information
        populateClientInfo(creditRequest);

        // Request details
        tvPurpose.setText(creditRequest.getPurpose() != null ? creditRequest.getPurpose() : "No especificado");
        
        if (creditRequest.getDescription() != null && !creditRequest.getDescription().trim().isEmpty()) {
            tvDescription.setText(creditRequest.getDescription());
            tvDescription.setVisibility(View.VISIBLE);
            labelDescription.setVisibility(View.VISIBLE);
        } else {
            tvDescription.setVisibility(View.GONE);
            labelDescription.setVisibility(View.GONE);
        }

        tvPaymentTerms.setText(creditRequest.getPaymentTerms() != null ? 
            creditRequest.getPaymentTerms() + " días" : "No especificado");
        
        tvCurrency.setText(currency);
        
        if (creditRequest.getExchangeRate() != null && creditRequest.getExchangeRate() != 1.0) {
            tvExchangeRate.setText(String.format(Locale.getDefault(), "%.4f", creditRequest.getExchangeRate()));
            tvExchangeRate.setVisibility(View.VISIBLE);
            labelExchangeRate.setVisibility(View.VISIBLE);
        } else {
            tvExchangeRate.setVisibility(View.GONE);
            labelExchangeRate.setVisibility(View.GONE);
        }

        // Decision information
        setupDecisionInfo(creditRequest);

        // Dates
        if (creditRequest.getCreatedAt() != null) {
            tvCreatedDate.setText(dateFormat.format(creditRequest.getCreatedAt()));
        } else {
            tvCreatedDate.setText("No disponible");
        }

        if (creditRequest.getUpdatedAt() != null) {
            tvUpdatedDate.setText(dateFormat.format(creditRequest.getUpdatedAt()));
        } else {
            tvUpdatedDate.setText("No disponible");
        }

        if (creditRequest.getExpiresAt() != null) {
            tvExpiresDate.setText(dateFormat.format(creditRequest.getExpiresAt()));
            layoutExpiresDate.setVisibility(View.VISIBLE);
        } else {
            layoutExpiresDate.setVisibility(View.GONE);
        }

        // User information
        populateUserInfo(creditRequest);

        // Notes
        if (creditRequest.getNotes() != null && !creditRequest.getNotes().trim().isEmpty()) {
            tvNotes.setText(creditRequest.getNotes());
            cardNotes.setVisibility(View.VISIBLE);
        } else {
            cardNotes.setVisibility(View.GONE);
        }
    }

    private void populateClientInfo(CreditRequest creditRequest) {
        if (creditRequest.getClient() != null) {
            // Client name
            String clientName = null;
            if (creditRequest.getClient().getName() != null && !creditRequest.getClient().getName().trim().isEmpty()) {
                clientName = creditRequest.getClient().getName();
            } else if (creditRequest.getClient().getBusinessName() != null && !creditRequest.getClient().getBusinessName().trim().isEmpty()) {
                clientName = creditRequest.getClient().getBusinessName();
            } else if (creditRequest.getClient().getFirstName() != null || creditRequest.getClient().getLastName() != null) {
                clientName = (creditRequest.getClient().getFirstName() + " " + creditRequest.getClient().getLastName()).trim();
            } else {
                clientName = "Cliente ID: " + creditRequest.getClientId();
            }
            tvClientName.setText(clientName);

            // Client email and phone
            tvClientEmail.setText(creditRequest.getClient().getEmail() != null ? creditRequest.getClient().getEmail() : "No disponible");
            tvClientPhone.setText(creditRequest.getClient().getPhone() != null ? creditRequest.getClient().getPhone() : "No disponible");

            // Credit score
            if (creditRequest.getClient().getCreditScore() != null && creditRequest.getClient().getCreditScore() > 0) {
                tvCreditScore.setText(String.valueOf(creditRequest.getClient().getCreditScore()));
                layoutCreditScore.setVisibility(View.VISIBLE);
                
                // Color based on score
                if (creditRequest.getClient().getCreditScore() >= 650) {
                    tvCreditScore.setTextColor(Color.parseColor("#2E7D32")); // Green
                } else if (creditRequest.getClient().getCreditScore() >= 550) {
                    tvCreditScore.setTextColor(Color.parseColor("#F57F17")); // Yellow
                } else {
                    tvCreditScore.setTextColor(Color.parseColor("#D32F2F")); // Red
                }
            } else {
                layoutCreditScore.setVisibility(View.GONE);
            }
        } else {
            tvClientName.setText("Cliente no disponible");
            tvClientEmail.setText("No disponible");
            tvClientPhone.setText("No disponible");
            layoutCreditScore.setVisibility(View.GONE);
        }
    }

    private void populateUserInfo(CreditRequest creditRequest) {
        if (creditRequest.getUser() != null) {
            tvUserName.setText(creditRequest.getUser().getName() != null ? creditRequest.getUser().getName() : "Usuario ID: " + creditRequest.getUserId());
            tvUserEmail.setText(creditRequest.getUser().getEmail() != null ? creditRequest.getUser().getEmail() : "No disponible");
            cardUserInfo.setVisibility(View.VISIBLE);
        } else {
            cardUserInfo.setVisibility(View.GONE);
        }
    }

    private void setupStatusBadge(String status) {
        String statusText;
        String backgroundColor;

        switch (status != null ? status.toLowerCase() : "pending") {
            case "pending":
                statusText = "Pendiente";
                backgroundColor = "#FF9800"; // Orange
                break;
            case "approved":
                statusText = "Aprobada";
                backgroundColor = "#4CAF50"; // Green
                break;
            case "rejected":
                statusText = "Rechazada";
                backgroundColor = "#F44336"; // Red
                break;
            case "expired":
                statusText = "Expirada";
                backgroundColor = "#9C27B0"; // Purple
                break;
            default:
                statusText = status != null ? status : "Pendiente";
                backgroundColor = "#757575"; // Gray
                break;
        }

        tvStatus.setText(statusText);
        tvStatus.setBackgroundColor(Color.parseColor(backgroundColor));
    }

    private void setupPriorityBadge(String priority) {
        String priorityText;
        String backgroundColor;

        switch (priority != null ? priority.toLowerCase() : "medium") {
            case "urgent":
                priorityText = "🔥 Urgente";
                backgroundColor = "#F44336"; // Red
                break;
            case "high":
                priorityText = "⚡ Alta";
                backgroundColor = "#FF9800"; // Orange
                break;
            case "medium":
                priorityText = "Media";
                backgroundColor = "#2196F3"; // Blue
                break;
            case "low":
                priorityText = "Baja";
                backgroundColor = "#4CAF50"; // Green
                break;
            default:
                priorityText = priority != null ? priority : "Media";
                backgroundColor = "#757575"; // Gray
                break;
        }

        tvPriority.setText(priorityText);
        tvPriority.setBackgroundColor(Color.parseColor(backgroundColor));
    }

    private void setupDecisionInfo(CreditRequest creditRequest) {
        String status = creditRequest.getStatus() != null ? creditRequest.getStatus().toLowerCase() : "pending";
        
        switch (status) {
            case "approved":
                if (creditRequest.getApprovedAmount() != null) {
                    tvDecisionTitle.setText("Información de Aprobación");
                    
                    String currency = creditRequest.getCurrency() != null ? creditRequest.getCurrency() : "PEN";
                    String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
                    tvApprovedAmount.setText(symbol + String.format(Locale.getDefault(), "%.0f", creditRequest.getApprovedAmount()));
                    tvApprovedTerms.setText(creditRequest.getApprovedTerms() != null ? creditRequest.getApprovedTerms() : "No especificado");
                    
                    layoutApprovedInfo.setVisibility(View.VISIBLE);
                    layoutRejectionInfo.setVisibility(View.GONE);
                    cardDecisionInfo.setVisibility(View.VISIBLE);
                } else {
                    cardDecisionInfo.setVisibility(View.GONE);
                }
                break;
                
            case "rejected":
                if (creditRequest.getRejectionReason() != null && !creditRequest.getRejectionReason().trim().isEmpty()) {
                    tvDecisionTitle.setText("Información de Rechazo");
                    tvRejectionReason.setText(creditRequest.getRejectionReason());
                    
                    layoutApprovedInfo.setVisibility(View.GONE);
                    layoutRejectionInfo.setVisibility(View.VISIBLE);
                    cardDecisionInfo.setVisibility(View.VISIBLE);
                } else {
                    cardDecisionInfo.setVisibility(View.GONE);
                }
                break;
                
            default:
                cardDecisionInfo.setVisibility(View.GONE);
                break;
        }
    }

    private void showLoading() {
        progressBar.setVisibility(View.VISIBLE);
        scrollView.setVisibility(View.GONE);
        layoutError.setVisibility(View.GONE);
    }

    private void showContent() {
        progressBar.setVisibility(View.GONE);
        scrollView.setVisibility(View.VISIBLE);
        layoutError.setVisibility(View.GONE);
    }

    private void showError(String errorMessage) {
        progressBar.setVisibility(View.GONE);
        scrollView.setVisibility(View.GONE);
        layoutError.setVisibility(View.VISIBLE);
        tvErrorMessage.setText(errorMessage);
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}