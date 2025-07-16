package com.example.chancafe_q.ui.credit;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.CreditRequest;
import com.example.chancafe_q.viewmodel.CreditRequestViewModel;
import com.google.android.material.chip.Chip;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.textfield.TextInputEditText;

import java.util.Locale;
import java.util.Map;

public class CreditRequestsActivity extends AppCompatActivity implements CreditRequestsAdapter.OnCreditRequestClickListener {

    private CreditRequestViewModel creditRequestViewModel;
    private CreditRequestsAdapter creditRequestsAdapter;
    
    // UI Components
    private Toolbar toolbar;
    private EditText etSearch;
    private ImageButton btnFilters, btnStatistics;
    private FloatingActionButton fabAddCreditRequest;
    private RecyclerView rvCreditRequests;
    private ProgressBar progressBar;
    private LinearLayout layoutEmpty, layoutStatistics;
    
    // Filter chips
    private Chip chipAll, chipPending, chipApproved, chipRejected, chipExpired;
    private Chip chipUrgent, chipHighPriority, chipToday, chipThisWeek;
    
    // Statistics views
    private TextView tvPendingCount, tvApprovedCount, tvRejectedCount, tvTotalAmount;
    
    // State
    private boolean isStatisticsVisible = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_credit_requests);
        
        initViews();
        setupToolbar();
        setupRecyclerView();
        setupViewModel();
        setupListeners();
        
        // Cargar datos iniciales
        creditRequestViewModel.loadCreditRequests();
        creditRequestViewModel.loadStatistics();
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        etSearch = findViewById(R.id.et_search);
        btnFilters = findViewById(R.id.btn_filters);
        btnStatistics = findViewById(R.id.btn_statistics);
        fabAddCreditRequest = findViewById(R.id.fab_add_credit_request);
        rvCreditRequests = findViewById(R.id.rv_credit_requests);
        progressBar = findViewById(R.id.progress_bar);
        layoutEmpty = findViewById(R.id.layout_empty);
        layoutStatistics = findViewById(R.id.layout_statistics);
        
        // Filter chips
        chipAll = findViewById(R.id.chip_all);
        chipPending = findViewById(R.id.chip_pending);
        chipApproved = findViewById(R.id.chip_approved);
        chipRejected = findViewById(R.id.chip_rejected);
        chipExpired = findViewById(R.id.chip_expired);
        chipUrgent = findViewById(R.id.chip_urgent);
        chipHighPriority = findViewById(R.id.chip_high_priority);
        chipToday = findViewById(R.id.chip_today);
        chipThisWeek = findViewById(R.id.chip_this_week);
        
        // Statistics views
        tvPendingCount = findViewById(R.id.tv_pending_count);
        tvApprovedCount = findViewById(R.id.tv_approved_count);
        tvRejectedCount = findViewById(R.id.tv_rejected_count);
        tvTotalAmount = findViewById(R.id.tv_total_amount);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowHomeEnabled(true);
        }
        
        toolbar.setNavigationOnClickListener(v -> finish());
    }

    private void setupRecyclerView() {
        creditRequestsAdapter = new CreditRequestsAdapter(this);
        rvCreditRequests.setLayoutManager(new LinearLayoutManager(this));
        rvCreditRequests.setAdapter(creditRequestsAdapter);
        creditRequestsAdapter.setOnCreditRequestClickListener(this);
    }

    private void setupViewModel() {
        creditRequestViewModel = new ViewModelProvider(this).get(CreditRequestViewModel.class);
        
        // Observar lista de solicitudes
        creditRequestViewModel.getCreditRequests().observe(this, creditRequests -> {
            if (creditRequests != null && !creditRequests.isEmpty()) {
                creditRequestsAdapter.updateCreditRequests(creditRequests);
                layoutEmpty.setVisibility(View.GONE);
                rvCreditRequests.setVisibility(View.VISIBLE);
            } else {
                layoutEmpty.setVisibility(View.VISIBLE);
                rvCreditRequests.setVisibility(View.GONE);
            }
        });
        
        // Observar estado de carga
        creditRequestViewModel.getLoading().observe(this, isLoading -> {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
        });
        
        // Observar errores
        creditRequestViewModel.getError().observe(this, error -> {
            if (error != null && !error.isEmpty()) {
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show();
                creditRequestViewModel.clearMessages();
            }
        });
        
        // Observar mensajes de éxito
        creditRequestViewModel.getSuccess().observe(this, success -> {
            if (success != null && !success.isEmpty()) {
                Toast.makeText(this, success, Toast.LENGTH_SHORT).show();
                creditRequestViewModel.clearMessages();
                // Recargar lista después de operaciones exitosas
                creditRequestViewModel.refresh();
            }
        });
        
        // Observar estadísticas
        creditRequestViewModel.getStatistics().observe(this, this::updateStatistics);
    }

    private void setupListeners() {
        // Búsqueda en tiempo real
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                creditRequestViewModel.setSearchQuery(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
        
        // Botones de acción
        btnFilters.setOnClickListener(v -> showFiltersDialog());
        btnStatistics.setOnClickListener(v -> toggleStatistics());
        fabAddCreditRequest.setOnClickListener(v -> {
            Intent intent = new Intent(this, AddEditCreditRequestActivity.class);
            startActivity(intent);
        });
        
        // Filter chips - Estado
        chipAll.setOnClickListener(v -> {
            clearStatusChips();
            chipAll.setChecked(true);
            creditRequestViewModel.applyQuickFilter("all");
        });
        
        chipPending.setOnClickListener(v -> {
            clearStatusChips();
            chipPending.setChecked(true);
            creditRequestViewModel.applyQuickFilter("pending");
        });
        
        chipApproved.setOnClickListener(v -> {
            clearStatusChips();
            chipApproved.setChecked(true);
            creditRequestViewModel.applyQuickFilter("approved");
        });
        
        chipRejected.setOnClickListener(v -> {
            clearStatusChips();
            chipRejected.setChecked(true);
            creditRequestViewModel.applyQuickFilter("rejected");
        });
        
        chipExpired.setOnClickListener(v -> {
            clearStatusChips();
            chipExpired.setChecked(true);
            creditRequestViewModel.applyQuickFilter("expired");
        });
        
        // Filter chips - Prioridad y tiempo
        chipUrgent.setOnClickListener(v -> {
            clearPriorityChips();
            chipUrgent.setChecked(true);
            creditRequestViewModel.applyQuickFilter("urgent");
        });
        
        chipHighPriority.setOnClickListener(v -> {
            clearPriorityChips();
            chipHighPriority.setChecked(true);
            creditRequestViewModel.applyQuickFilter("high_priority");
        });
        
        chipToday.setOnClickListener(v -> {
            clearTimeChips();
            chipToday.setChecked(true);
            creditRequestViewModel.applyQuickFilter("today");
        });
        
        chipThisWeek.setOnClickListener(v -> {
            clearTimeChips();
            chipThisWeek.setChecked(true);
            creditRequestViewModel.applyQuickFilter("this_week");
        });
    }

    private void clearStatusChips() {
        chipAll.setChecked(false);
        chipPending.setChecked(false);
        chipApproved.setChecked(false);
        chipRejected.setChecked(false);
        chipExpired.setChecked(false);
    }

    private void clearPriorityChips() {
        chipUrgent.setChecked(false);
        chipHighPriority.setChecked(false);
    }

    private void clearTimeChips() {
        chipToday.setChecked(false);
        chipThisWeek.setChecked(false);
    }

    private void toggleStatistics() {
        isStatisticsVisible = !isStatisticsVisible;
        layoutStatistics.setVisibility(isStatisticsVisible ? View.VISIBLE : View.GONE);
        
        if (isStatisticsVisible) {
            creditRequestViewModel.loadStatistics();
        }
    }

    private void updateStatistics(Map<String, Object> statistics) {
        if (statistics != null) {
            // Actualizar contadores
            Object pending = statistics.get("pending");
            Object approved = statistics.get("approved");
            Object rejected = statistics.get("rejected");
            Object totalAmount = statistics.get("totalAmount");
            
            tvPendingCount.setText(pending != null ? pending.toString() : "0");
            tvApprovedCount.setText(approved != null ? approved.toString() : "0");
            tvRejectedCount.setText(rejected != null ? rejected.toString() : "0");
            
            if (totalAmount != null) {
                try {
                    double amount = Double.parseDouble(totalAmount.toString());
                    if (amount >= 1000000) {
                        tvTotalAmount.setText(String.format("S/ %.1fM", amount / 1000000));
                    } else if (amount >= 1000) {
                        tvTotalAmount.setText(String.format("S/ %.0fK", amount / 1000));
                    } else {
                        tvTotalAmount.setText(String.format("S/ %.0f", amount));
                    }
                } catch (NumberFormatException e) {
                    tvTotalAmount.setText("S/ 0");
                }
            } else {
                tvTotalAmount.setText("S/ 0");
            }
        }
    }

    private void showFiltersDialog() {
        // TODO: Implementar diálogo de filtros avanzados
        Toast.makeText(this, "Filtros avanzados - Pendiente de implementación", Toast.LENGTH_SHORT).show();
    }

    // Implementación de CreditRequestsAdapter.OnCreditRequestClickListener
    @Override
    public void onCreditRequestClick(CreditRequest creditRequest) {
        // Navegar a vista detallada
        Intent intent = new Intent(this, CreditRequestDetailActivity.class);
        intent.putExtra("credit_request_id", creditRequest.getId());
        startActivity(intent);
    }

    @Override
    public void onEditCreditRequest(CreditRequest creditRequest) {
        Intent intent = new Intent(this, AddEditCreditRequestActivity.class);
        intent.putExtra("credit_request_id", creditRequest.getId());
        intent.putExtra("mode", "edit");
        startActivity(intent);
    }

    @Override
    public void onDeleteCreditRequest(CreditRequest creditRequest) {
        new AlertDialog.Builder(this)
            .setTitle("Confirmar eliminación")
            .setMessage("¿Está seguro de que desea eliminar esta solicitud de crédito?")
            .setPositiveButton("Eliminar", (dialog, which) -> {
                creditRequestViewModel.deleteCreditRequest(creditRequest.getId());
            })
            .setNegativeButton("Cancelar", null)
            .show();
    }

    @Override
    public void onApproveCreditRequest(CreditRequest creditRequest) {
        showApprovalDialog(creditRequest);
    }

    @Override
    public void onRejectCreditRequest(CreditRequest creditRequest) {
        showRejectionDialog(creditRequest);
    }

    @Override
    public void onViewCreditRequest(CreditRequest creditRequest) {
        onCreditRequestClick(creditRequest);
    }

    @Override
    public void onUpdateRiskAssessment(CreditRequest creditRequest) {
        showRiskAssessmentDialog(creditRequest);
    }

    private void showApprovalDialog(CreditRequest creditRequest) {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_approve_credit_request, null);
        
        // Initialize dialog views
        TextView tvRequestInfo = dialogView.findViewById(R.id.tv_request_info);
        TextInputEditText etApprovedAmount = dialogView.findViewById(R.id.et_approved_amount);
        TextInputEditText etApprovedTerms = dialogView.findViewById(R.id.et_approved_terms);
        TextInputEditText etApprovalConditions = dialogView.findViewById(R.id.et_approval_conditions);
        Button btn50Percent = dialogView.findViewById(R.id.btn_50_percent);
        Button btn75Percent = dialogView.findViewById(R.id.btn_75_percent);
        Button btn100Percent = dialogView.findViewById(R.id.btn_100_percent);
        
        // Set request info
        String clientName = creditRequest.getClient() != null 
            ? (creditRequest.getClient().getBusinessName() != null 
                ? creditRequest.getClient().getBusinessName()
                : creditRequest.getClient().getFirstName() + " " + creditRequest.getClient().getLastName())
            : "Cliente no disponible";
        
        String requestInfo = (creditRequest.getRequestNumber() != null ? creditRequest.getRequestNumber() : "CR-" + creditRequest.getId())
            + " - " + clientName + "\nMonto solicitado: S/ " + String.format(Locale.getDefault(), "%.0f", creditRequest.getRequestedAmount());
        tvRequestInfo.setText(requestInfo);
        
        // Set default values
        etApprovedAmount.setText(String.valueOf(creditRequest.getRequestedAmount()));
        etApprovedTerms.setText(creditRequest.getPaymentTerms() != null ? 
            String.valueOf(creditRequest.getPaymentTerms()) : "");
        
        // Quick amount buttons
        btn50Percent.setOnClickListener(v -> {
            double amount = creditRequest.getRequestedAmount() * 0.5;
            etApprovedAmount.setText(String.format(Locale.getDefault(), "%.0f", amount));
        });
        
        btn75Percent.setOnClickListener(v -> {
            double amount = creditRequest.getRequestedAmount() * 0.75;
            etApprovedAmount.setText(String.format(Locale.getDefault(), "%.0f", amount));
        });
        
        btn100Percent.setOnClickListener(v -> {
            etApprovedAmount.setText(String.format(Locale.getDefault(), "%.0f", creditRequest.getRequestedAmount()));
        });
        
        AlertDialog dialog = new AlertDialog.Builder(this)
            .setView(dialogView)
            .create();
        
        // Action buttons
        Button btnCancel = dialogView.findViewById(R.id.btn_cancel);
        Button btnApprove = dialogView.findViewById(R.id.btn_approve);
        
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        
        btnApprove.setOnClickListener(v -> {
            String amountText = etApprovedAmount.getText().toString().trim();
            String terms = etApprovedTerms.getText().toString().trim();
            String conditions = etApprovalConditions.getText().toString().trim();
            
            if (amountText.isEmpty()) {
                etApprovedAmount.setError("Monto requerido");
                return;
            }
            
            if (terms.isEmpty()) {
                etApprovedTerms.setError("Términos requeridos");
                return;
            }
            
            try {
                double approvedAmount = Double.parseDouble(amountText);
                if (approvedAmount <= 0) {
                    etApprovedAmount.setError("Monto debe ser mayor a cero");
                    return;
                }
                
                creditRequestViewModel.approveCreditRequest(creditRequest.getId(), approvedAmount, terms, conditions);
                dialog.dismiss();
                
            } catch (NumberFormatException e) {
                etApprovedAmount.setError("Monto inválido");
            }
        });
        
        dialog.show();
    }

    private void showRejectionDialog(CreditRequest creditRequest) {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_reject_credit_request, null);
        
        // Initialize dialog views
        TextView tvRequestInfo = dialogView.findViewById(R.id.tv_request_info);
        TextInputEditText etRejectionReason = dialogView.findViewById(R.id.et_rejection_reason);
        Button btnInsufficientIncome = dialogView.findViewById(R.id.btn_insufficient_income);
        Button btnPoorCreditHistory = dialogView.findViewById(R.id.btn_poor_credit_history);
        Button btnIncompleteDocumentation = dialogView.findViewById(R.id.btn_incomplete_documentation);
        Button btnExcessiveDebtRatio = dialogView.findViewById(R.id.btn_excessive_debt_ratio);
        
        // Set request info
        String clientName = creditRequest.getClient() != null 
            ? (creditRequest.getClient().getBusinessName() != null 
                ? creditRequest.getClient().getBusinessName()
                : creditRequest.getClient().getFirstName() + " " + creditRequest.getClient().getLastName())
            : "Cliente no disponible";
        
        String requestInfo = (creditRequest.getRequestNumber() != null ? creditRequest.getRequestNumber() : "CR-" + creditRequest.getId())
            + " - " + clientName + "\nMonto solicitado: S/ " + String.format(Locale.getDefault(), "%.0f", creditRequest.getRequestedAmount());
        tvRequestInfo.setText(requestInfo);
        
        // Quick rejection reason buttons
        btnInsufficientIncome.setOnClickListener(v -> 
            etRejectionReason.setText("Ingresos insuficientes para el monto solicitado. Se requiere incrementar los ingresos demostrables o reducir el monto solicitado."));
        
        btnPoorCreditHistory.setOnClickListener(v -> 
            etRejectionReason.setText("Historial crediticio deficiente. Se detectaron reportes negativos en centrales de riesgo que impiden la aprobación del crédito."));
        
        btnIncompleteDocumentation.setOnClickListener(v -> 
            etRejectionReason.setText("Documentación incompleta o insuficiente. Se requiere presentar documentación adicional para sustentar la solicitud."));
        
        btnExcessiveDebtRatio.setOnClickListener(v -> 
            etRejectionReason.setText("Relación deuda-ingreso excesiva. El ratio de endeudamiento supera los límites permitidos por la política crediticia."));
        
        AlertDialog dialog = new AlertDialog.Builder(this)
            .setView(dialogView)
            .create();
        
        // Action buttons
        Button btnCancel = dialogView.findViewById(R.id.btn_cancel);
        Button btnReject = dialogView.findViewById(R.id.btn_reject);
        
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        
        btnReject.setOnClickListener(v -> {
            String reason = etRejectionReason.getText().toString().trim();
            
            if (reason.isEmpty()) {
                etRejectionReason.setError("Motivo de rechazo requerido");
                return;
            }
            
            creditRequestViewModel.rejectCreditRequest(creditRequest.getId(), reason);
            dialog.dismiss();
        });
        
        dialog.show();
    }

    private void showRiskAssessmentDialog(CreditRequest creditRequest) {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_risk_assessment, null);
        
        // Initialize dialog views
        TextView tvRequestInfo = dialogView.findViewById(R.id.tv_request_info);
        TextView tvCurrentRisk = dialogView.findViewById(R.id.tv_current_risk);
        RadioGroup rgRiskLevel = dialogView.findViewById(R.id.rg_risk_level);
        RadioButton rbLowRisk = dialogView.findViewById(R.id.rb_low_risk);
        RadioButton rbMediumRisk = dialogView.findViewById(R.id.rb_medium_risk);
        RadioButton rbHighRisk = dialogView.findViewById(R.id.rb_high_risk);
        TextInputEditText etRiskNotes = dialogView.findViewById(R.id.et_risk_notes);
        View layoutCreditScoreInfo = dialogView.findViewById(R.id.layout_credit_score_info);
        TextView tvCreditScoreInfo = dialogView.findViewById(R.id.tv_credit_score_info);
        
        // Set request info
        String clientName = creditRequest.getClient() != null 
            ? (creditRequest.getClient().getBusinessName() != null 
                ? creditRequest.getClient().getBusinessName()
                : creditRequest.getClient().getFirstName() + " " + creditRequest.getClient().getLastName())
            : "Cliente no disponible";
        
        String requestInfo = (creditRequest.getRequestNumber() != null ? creditRequest.getRequestNumber() : "CR-" + creditRequest.getId())
            + " - " + clientName + "\nMonto solicitado: S/ " + String.format(Locale.getDefault(), "%.0f", creditRequest.getRequestedAmount());
        tvRequestInfo.setText(requestInfo);
        
        // Set current risk level
        String currentRisk = creditRequest.getRiskAssessment() != null ? creditRequest.getRiskAssessment() : "No evaluado";
        tvCurrentRisk.setText(currentRisk);
        
        // Set current risk selection
        if (creditRequest.getRiskAssessment() != null) {
            if (creditRequest.getRiskAssessment().toLowerCase().contains("bajo")) {
                rbLowRisk.setChecked(true);
            } else if (creditRequest.getRiskAssessment().toLowerCase().contains("alto")) {
                rbHighRisk.setChecked(true);
            } else {
                rbMediumRisk.setChecked(true);
            }
        }
        
        // Show credit score info if available
        if (creditRequest.getClient() != null && creditRequest.getClient().getCreditScore() != null && creditRequest.getClient().getCreditScore() > 0) {
            layoutCreditScoreInfo.setVisibility(View.VISIBLE);
            
            String scoreInfo = "Score: " + creditRequest.getClient().getCreditScore();
            if (creditRequest.getClient().getCreditScore() >= 750) {
                scoreInfo += " - Excelente";
            } else if (creditRequest.getClient().getCreditScore() >= 650) {
                scoreInfo += " - Bueno";
            } else if (creditRequest.getClient().getCreditScore() >= 550) {
                scoreInfo += " - Regular";
            } else {
                scoreInfo += " - Malo";
            }
            
            if (creditRequest.getClient().getTotalDebts() != null) {
                scoreInfo += "\nDeudas actuales: S/ " + String.format(Locale.getDefault(), "%.0f", creditRequest.getClient().getTotalDebts());
            }
            
            tvCreditScoreInfo.setText(scoreInfo);
        }
        
        AlertDialog dialog = new AlertDialog.Builder(this)
            .setView(dialogView)
            .create();
        
        // Action buttons
        Button btnCancel = dialogView.findViewById(R.id.btn_cancel);
        Button btnUpdateRisk = dialogView.findViewById(R.id.btn_update_risk);
        
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        
        btnUpdateRisk.setOnClickListener(v -> {
            int selectedId = rgRiskLevel.getCheckedRadioButtonId();
            if (selectedId == -1) {
                Toast.makeText(this, "Seleccione un nivel de riesgo", Toast.LENGTH_SHORT).show();
                return;
            }
            
            String riskLevel;
            if (selectedId == R.id.rb_low_risk) {
                riskLevel = "Bajo - Cliente confiable, historial crediticio excelente";
            } else if (selectedId == R.id.rb_high_risk) {
                riskLevel = "Alto - Cliente riesgoso, requiere garantías adicionales";
            } else {
                riskLevel = "Medio - Cliente aceptable, requiere seguimiento";
            }
            
            String notes = etRiskNotes.getText().toString().trim();
            if (!notes.isEmpty()) {
                riskLevel += ". " + notes;
            }
            
            creditRequestViewModel.updateRiskAssessment(creditRequest.getId(), riskLevel);
            dialog.dismiss();
        });
        
        dialog.show();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Recargar datos cuando se regrese a la actividad
        creditRequestViewModel.refresh();
    }
}