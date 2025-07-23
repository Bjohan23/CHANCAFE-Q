package com.example.chancafe_q.ui.quotes;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Quote;
import com.example.chancafe_q.viewmodel.QuoteViewModel;
import com.google.android.material.chip.Chip;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.List;

public class QuotesActivity extends AppCompatActivity implements QuotesAdapter.OnQuoteClickListener {

    private QuoteViewModel quoteViewModel;
    private QuotesAdapter quotesAdapter;
    
    // UI Components
    private Toolbar toolbar;
    private EditText etSearch;
    private ImageButton btnFilters;
    private FloatingActionButton fabAddQuote;
    private RecyclerView rvQuotes;
    private ProgressBar progressBar;
    private LinearLayout layoutEmpty;
    private LinearLayout layoutCreditAlert;
    private TextView tvCreditMessage;
    private ImageButton btnCloseCreditAlert;
    
    // Filter Chips
    private Chip chipAll, chipDraft, chipSent, chipApproved, chipRejected, chipExpired;
    
    // Current filter state
    private String currentFilter = "all";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_quotes);
        
        initializeViews();
        setupToolbar();
        setupRecyclerView();
        setupViewModel();
        setupListeners();
        setupFilterChips();
        
        // Cargar cotizaciones iniciales
        quoteViewModel.loadQuotes();
    }

    private void initializeViews() {
        toolbar = findViewById(R.id.toolbar);
        etSearch = findViewById(R.id.et_search);
        btnFilters = findViewById(R.id.btn_filters);
        fabAddQuote = findViewById(R.id.fab_add_quote);
        rvQuotes = findViewById(R.id.rv_quotes);
        progressBar = findViewById(R.id.progress_bar);
        layoutEmpty = findViewById(R.id.layout_empty);
        layoutCreditAlert = findViewById(R.id.layout_credit_alert);
        tvCreditMessage = findViewById(R.id.tv_credit_message);
        btnCloseCreditAlert = findViewById(R.id.btn_close_credit_alert);
        
        // Filter chips
        chipAll = findViewById(R.id.chip_all);
        chipDraft = findViewById(R.id.chip_draft);
        chipSent = findViewById(R.id.chip_sent);
        chipApproved = findViewById(R.id.chip_approved);
        chipRejected = findViewById(R.id.chip_rejected);
        chipExpired = findViewById(R.id.chip_expired);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Cotizaciones");
        }
    }

    private void setupRecyclerView() {
        quotesAdapter = new QuotesAdapter(this);
        quotesAdapter.setOnQuoteClickListener(this);
        
        rvQuotes.setLayoutManager(new LinearLayoutManager(this));
        rvQuotes.setAdapter(quotesAdapter);
    }

    private void setupViewModel() {
        quoteViewModel = new ViewModelProvider(this).get(QuoteViewModel.class);
        
        // Observar quotes
        quoteViewModel.getQuotes().observe(this, this::updateQuotesList);
        
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
                // Recargar lista después de operación exitosa
                quoteViewModel.loadQuotes();
            }
        });
        
        // Observar evaluación crediticia
        quoteViewModel.getCreditAssessment().observe(this, creditAssessment -> {
            if (creditAssessment != null) {
                showCreditAssessmentAlert(creditAssessment);
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
                quoteViewModel.setSearchQuery(s.toString().trim());
            }
        });

        // Botón agregar cotización
        fabAddQuote.setOnClickListener(v -> {
            Intent intent = new Intent(this, AddEditQuoteActivity.class);
            startActivity(intent);
        });

        // Botón filtros (por implementar filtros avanzados)
        btnFilters.setOnClickListener(v -> {
            // TODO: Implementar dialog de filtros avanzados
            Toast.makeText(this, "Filtros avanzados - Próximamente", Toast.LENGTH_SHORT).show();
        });

        // Cerrar alerta crediticia
        btnCloseCreditAlert.setOnClickListener(v -> {
            layoutCreditAlert.setVisibility(View.GONE);
        });
    }

    private void setupFilterChips() {
        // Configurar listeners para chips de filtro
        chipAll.setOnClickListener(v -> applyFilter("all"));
        chipDraft.setOnClickListener(v -> applyFilter("draft"));
        chipSent.setOnClickListener(v -> applyFilter("sent"));
        chipApproved.setOnClickListener(v -> applyFilter("approved"));
        chipRejected.setOnClickListener(v -> applyFilter("rejected"));
        chipExpired.setOnClickListener(v -> applyFilter("expired"));
    }

    private void applyFilter(String filter) {
        currentFilter = filter;
        
        // Actualizar estado visual de los chips
        resetChipStates();
        
        switch (filter) {
            case "all":
                chipAll.setChecked(true);
                quoteViewModel.setFilterStatus("all");
                break;
            case "draft":
                chipDraft.setChecked(true);
                quoteViewModel.setFilterStatus("draft");
                break;
            case "sent":
                chipSent.setChecked(true);
                quoteViewModel.setFilterStatus("sent");
                break;
            case "approved":
                chipApproved.setChecked(true);
                quoteViewModel.setFilterStatus("approved");
                break;
            case "rejected":
                chipRejected.setChecked(true);
                quoteViewModel.setFilterStatus("rejected");
                break;
            case "expired":
                chipExpired.setChecked(true);
                quoteViewModel.setFilterStatus("expired");
                break;
        }
    }

    private void resetChipStates() {
        chipAll.setChecked(false);
        chipDraft.setChecked(false);
        chipSent.setChecked(false);
        chipApproved.setChecked(false);
        chipRejected.setChecked(false);
        chipExpired.setChecked(false);
    }

    private void updateQuotesList(List<Quote> quotes) {
        if (quotes != null && !quotes.isEmpty()) {
            quotesAdapter.updateQuotes(quotes);
            rvQuotes.setVisibility(View.VISIBLE);
            layoutEmpty.setVisibility(View.GONE);
        } else {
            rvQuotes.setVisibility(View.GONE);
            layoutEmpty.setVisibility(View.VISIBLE);
        }
    }

    private void showLoading(Boolean isLoading) {
        if (isLoading != null) {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
        }
    }

    private void showError(String message) {
        // Si el mensaje indica sesión expirada, redirigir al login
        if (message != null && message.contains("Sesión expirada")) {
            Toast.makeText(this, message, Toast.LENGTH_LONG).show();
            // Redirigir al login
            Intent intent = new Intent(this, com.example.chancafe_q.ui.login.LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        } else {
            Toast.makeText(this, "Error: " + message, Toast.LENGTH_LONG).show();
        }
    }

    private void showSuccess(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private void showCreditAssessmentAlert(Object creditAssessment) {
        // TODO: Parsear la respuesta de evaluación crediticia y mostrar información relevante
        tvCreditMessage.setText("Evaluación crediticia completada");
        layoutCreditAlert.setVisibility(View.VISIBLE);
    }

    // Implementación de QuotesAdapter.OnQuoteClickListener

    @Override
    public void onQuoteClick(Quote quote) {
        // Abrir detalles de la cotización
        Intent intent = new Intent(this, QuoteDetailActivity.class);
        intent.putExtra("quote_id", quote.getId());
        startActivity(intent);
    }

    @Override
    public void onEditQuote(Quote quote) {
        // Abrir editor de cotización
        Intent intent = new Intent(this, AddEditQuoteActivity.class);
        intent.putExtra("quote_id", quote.getId());
        intent.putExtra("is_editing", true);
        startActivity(intent);
    }

    @Override
    public void onDeleteQuote(Quote quote) {
        new AlertDialog.Builder(this)
                .setTitle("Eliminar cotización")
                .setMessage("¿Estás seguro de que quieres eliminar la cotización " + 
                           (quote.getQuoteNumber() != null ? quote.getQuoteNumber() : ("COT-" + quote.getId())) + "?")
                .setPositiveButton("Eliminar", (dialog, which) -> {
                    quoteViewModel.deleteQuote(quote.getId());
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    @Override
    public void onChangeStatus(Quote quote, String newStatus) {
        android.util.Log.d("QuotesActivity", "onChangeStatus called with newStatus: '" + newStatus + "'");
        String statusMessage = getStatusChangeMessage(newStatus);
        
        new AlertDialog.Builder(this)
                .setTitle("Cambiar estado")
                .setMessage("¿Confirmas cambiar el estado de la cotización a '" + statusMessage + "'?")
                .setPositiveButton("Confirmar", (dialog, which) -> {
                    android.util.Log.d("QuotesActivity", "Calling changeQuoteStatus with ID: " + quote.getId() + ", status: '" + newStatus + "'");
                    quoteViewModel.changeQuoteStatus(quote.getId(), newStatus);
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    @Override
    public void onViewQuote(Quote quote) {
        // Mismo que onQuoteClick
        onQuoteClick(quote);
    }

    @Override
    public void onDuplicateQuote(Quote quote) {
        // Crear una nueva cotización basada en la existente
        Intent intent = new Intent(this, AddEditQuoteActivity.class);
        intent.putExtra("duplicate_from_quote_id", quote.getId());
        startActivity(intent);
    }

    @Override
    public void onGeneratePdf(Quote quote) {
        // TODO: Implementar generación de PDF
        Toast.makeText(this, "Generación de PDF - Próximamente", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onViewCreditInfo(Quote quote) {
        if (quote.getClient() != null) {
            // Cargar información crediticia del cliente
            quoteViewModel.getCreditAssessment(quote.getClientId());
            
            // TODO: Mostrar dialog con información crediticia detallada
            Toast.makeText(this, "Cargando información crediticia...", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(this, "No se puede obtener información crediticia", Toast.LENGTH_SHORT).show();
        }
    }

    private String getStatusChangeMessage(String status) {
        switch (status) {
            case "sent": return "Enviada";
            case "approved": return "Aprobada";
            case "rejected": return "Rechazada";
            case "expired": return "Expirada";
            default: return status;
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Recargar cotizaciones cuando se vuelve a la actividad
        quoteViewModel.refresh();
    }
}
