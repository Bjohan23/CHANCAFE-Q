package com.example.chancafe_q.ui.quotes;

import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.cardview.widget.CardView;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Quote;
import com.example.chancafe_q.model.QuoteItem;
import com.example.chancafe_q.utils.PDFGenerator;
import com.example.chancafe_q.utils.EmailSender;
import com.example.chancafe_q.viewmodel.QuoteViewModel;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class QuoteDetailActivity extends AppCompatActivity {

    private QuoteViewModel quoteViewModel;
    private QuoteDetailItemsAdapter itemsAdapter;
    private PDFGenerator pdfGenerator;
    private EmailSender emailSender;
    
    // UI Components
    private Toolbar toolbar;
    private TextView tvQuoteNumber, tvQuoteStatus, tvQuoteTitle;
    private TextView tvCreatedDate, tvValidUntil;
    private TextView tvClientName, tvClientDocument, tvClientPhone, tvClientEmail, tvCreditScore;
    private TextView tvItemsCount, tvSubtotal, tvDiscount, tvTax, tvTotal;
    private TextView tvNotes;
    private RecyclerView rvQuoteItems;
    private Button btnEdit, btnGeneratePdf, btnSendEmail, btnMoreOptions;
    private ProgressBar progressBar;
    private LinearLayout layoutCreditInfo, layoutDiscount;
    private CardView cardNotes;
    
    // State
    private int quoteId;
    private Quote currentQuote;
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_quote_detail);
        
        // Get quote ID from intent
        quoteId = getIntent().getIntExtra("quote_id", -1);
        if (quoteId == -1) {
            Toast.makeText(this, "Error: ID de cotización no válido", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        
        initViews();
        setupToolbar();
        setupRecyclerView();
        setupViewModel();
        setupListeners();
        
        // Initialize utilities
        pdfGenerator = new PDFGenerator(this);
        emailSender = new EmailSender(this);
        
        // Load quote data
        loadQuoteDetails();
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        tvQuoteNumber = findViewById(R.id.tv_quote_number);
        tvQuoteStatus = findViewById(R.id.tv_quote_status);
        tvQuoteTitle = findViewById(R.id.tv_quote_title);
        tvCreatedDate = findViewById(R.id.tv_created_date);
        tvValidUntil = findViewById(R.id.tv_valid_until);
        tvClientName = findViewById(R.id.tv_client_name);
        tvClientDocument = findViewById(R.id.tv_client_document);
        tvClientPhone = findViewById(R.id.tv_client_phone);
        tvClientEmail = findViewById(R.id.tv_client_email);
        tvCreditScore = findViewById(R.id.tv_credit_score);
        tvItemsCount = findViewById(R.id.tv_items_count);
        tvSubtotal = findViewById(R.id.tv_subtotal);
        tvDiscount = findViewById(R.id.tv_discount);
        tvTax = findViewById(R.id.tv_tax);
        tvTotal = findViewById(R.id.tv_total);
        tvNotes = findViewById(R.id.tv_notes);
        rvQuoteItems = findViewById(R.id.rv_quote_items);
        btnEdit = findViewById(R.id.btn_edit);
        btnGeneratePdf = findViewById(R.id.btn_generate_pdf);
        btnSendEmail = findViewById(R.id.btn_send_email);
        btnMoreOptions = findViewById(R.id.btn_more_options);
        progressBar = findViewById(R.id.progress_bar);
        layoutCreditInfo = findViewById(R.id.layout_credit_info);
        layoutDiscount = findViewById(R.id.layout_discount);
        cardNotes = findViewById(R.id.card_notes);
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
        itemsAdapter = new QuoteDetailItemsAdapter(this);
        rvQuoteItems.setLayoutManager(new LinearLayoutManager(this));
        rvQuoteItems.setAdapter(itemsAdapter);
    }

    private void setupViewModel() {
        quoteViewModel = new ViewModelProvider(this).get(QuoteViewModel.class);
        
        // Observar quote cargada
        quoteViewModel.getQuote().observe(this, this::displayQuoteDetails);
        
        // Observar quote items
        quoteViewModel.getQuoteItems().observe(this, this::displayQuoteItems);
        
        // Observar estado de carga
        quoteViewModel.getLoading().observe(this, isLoading -> {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
        });
        
        // Observar errores
        quoteViewModel.getError().observe(this, error -> {
            if (error != null && !error.isEmpty()) {
                Toast.makeText(this, error, Toast.LENGTH_LONG).show();
                quoteViewModel.clearMessages();
            }
        });
        
        // Observar mensajes de éxito
        quoteViewModel.getSuccess().observe(this, success -> {
            if (success != null && !success.isEmpty()) {
                Toast.makeText(this, success, Toast.LENGTH_SHORT).show();
                quoteViewModel.clearMessages();
            }
        });
    }

    private void setupListeners() {
        btnEdit.setOnClickListener(v -> editQuote());
        btnGeneratePdf.setOnClickListener(v -> generatePDF());
        btnSendEmail.setOnClickListener(v -> sendEmailDialog());
        btnMoreOptions.setOnClickListener(v -> showMoreOptionsDialog());
    }

    private void loadQuoteDetails() {
        // The loadQuoteItems now returns both quote and items data
        quoteViewModel.loadQuoteItems(quoteId);
    }

    private void displayQuoteDetails(Quote quote) {
        if (quote == null) return;
        
        currentQuote = quote;
        
        // Quote header
        String quoteNumber = quote.getQuoteNumber();
        if (quoteNumber != null && !quoteNumber.trim().isEmpty()) {
            tvQuoteNumber.setText(quoteNumber);
        } else {
            tvQuoteNumber.setText("COT-" + quote.getId());
        }
        
        // Status with color
        setupStatusBadge(quote.getStatus());
        
        // Title
        String title = quote.getTitle();
        if (title != null && !title.trim().isEmpty()) {
            tvQuoteTitle.setText(title);
        } else {
            tvQuoteTitle.setText("Cotización sin título");
        }
        
        // Dates
        if (quote.getCreatedAt() != null && !quote.getCreatedAt().isEmpty()) {
            Date createdAtDate = quote.getCreatedAtAsDate();
            if (createdAtDate != null) {
                tvCreatedDate.setText(dateFormat.format(createdAtDate));
            }
        }
        
        if (quote.getValidUntil() != null && !quote.getValidUntil().isEmpty()) {
            Date validUntilDate = quote.getValidUntilAsDate();
            if (validUntilDate != null) {
                tvValidUntil.setText(dateFormat.format(validUntilDate));
                
                // Check if expired
                if (validUntilDate.before(new java.util.Date())) {
                tvValidUntil.setTextColor(Color.parseColor("#F44336"));
            } else {
                tvValidUntil.setTextColor(Color.parseColor("#424242"));
            }
            } else {
                tvValidUntil.setText("Sin fecha límite");
            }
        } else {
            tvValidUntil.setText("Sin fecha límite");
        }
        
        // Client information
        if (quote.getClient() != null) {
            // Client name - handle business name or full name
            String clientName;
            if (quote.getClient().getBusinessName() != null && !quote.getClient().getBusinessName().trim().isEmpty()) {
                clientName = quote.getClient().getBusinessName();
            } else {
                String firstName = quote.getClient().getFirstName() != null ? quote.getClient().getFirstName() : "";
                String lastName = quote.getClient().getLastName() != null ? quote.getClient().getLastName() : "";
                clientName = (firstName + " " + lastName).trim();
                if (clientName.isEmpty()) {
                    clientName = "Cliente sin nombre";
                }
            }
            tvClientName.setText(clientName);
            
            // Client details
            String documentType = quote.getClient().getDocumentType() != null ? quote.getClient().getDocumentType() : "DNI";
            String documentNumber = quote.getClient().getDocumentNumber() != null ? quote.getClient().getDocumentNumber() : "N/A";
            tvClientDocument.setText(documentType + ": " + documentNumber);
            
            String phoneText = quote.getClient().getPhone() != null && !quote.getClient().getPhone().trim().isEmpty() 
                ? quote.getClient().getPhone() 
                : "No registrado";
            tvClientPhone.setText("Teléfono: " + phoneText);
            
            String emailText = quote.getClient().getEmail() != null && !quote.getClient().getEmail().trim().isEmpty() 
                ? quote.getClient().getEmail() 
                : "Sin email";
            tvClientEmail.setText(emailText);
            
            // Credit score info
            if (quote.getClient().getCreditScore() != null && quote.getClient().getCreditScore() > 0) {
                layoutCreditInfo.setVisibility(View.VISIBLE);
                String scoreText = quote.getClient().getCreditScore() + " - ";
                if (quote.getClient().getCreditScore() >= 750) {
                    scoreText += "Excelente";
                } else if (quote.getClient().getCreditScore() >= 650) {
                    scoreText += "Bueno";
                } else if (quote.getClient().getCreditScore() >= 550) {
                    scoreText += "Regular";
                } else {
                    scoreText += "Malo";
                }
                tvCreditScore.setText(scoreText);
            } else {
                layoutCreditInfo.setVisibility(View.GONE);
            }
        } else {
            // Handle case where client is null
            tvClientName.setText("Cliente no disponible");
            tvClientDocument.setText("DNI: N/A");
            tvClientPhone.setText("Teléfono: No registrado");
            tvClientEmail.setText("Sin email");
            layoutCreditInfo.setVisibility(View.GONE);
        }
        
        // Totals
        String currency = quote.getCurrency() != null ? quote.getCurrency() : "PEN";
        String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
        
        // Ensure we have valid totals to display
        double subtotal = quote.getSubtotal();
        double taxAmount = quote.getTaxAmount();
        double totalAmount = quote.getTotalAmountSafe();
        double discountAmount = quote.getDiscountAmountSafe();
        
        tvSubtotal.setText(symbol + String.format(Locale.getDefault(), "%.2f", subtotal));
        
        // Discount (if any)
        if (discountAmount > 0) {
            layoutDiscount.setVisibility(View.VISIBLE);
            tvDiscount.setText("-" + symbol + String.format(Locale.getDefault(), "%.2f", discountAmount));
        } else {
            layoutDiscount.setVisibility(View.GONE);
        }
        
        tvTax.setText(symbol + String.format(Locale.getDefault(), "%.2f", taxAmount));
        tvTotal.setText(symbol + String.format(Locale.getDefault(), "%.2f", totalAmount));
        
        // Notes
        if (quote.getNotes() != null && !quote.getNotes().trim().isEmpty()) {
            cardNotes.setVisibility(View.VISIBLE);
            tvNotes.setText(quote.getNotes());
        } else {
            cardNotes.setVisibility(View.GONE);
        }
    }

    private void displayQuoteItems(List<QuoteItem> items) {
        if (items != null) {
            itemsAdapter.updateQuoteItems(items);
            tvItemsCount.setText(items.size() + " item" + (items.size() != 1 ? "s" : ""));
        } else {
            tvItemsCount.setText("0 items");
        }
    }

    private void setupStatusBadge(String status) {
        String statusText;
        String backgroundColor;

        switch (status != null ? status.toLowerCase() : "draft") {
            case "draft":
                statusText = "Borrador";
                backgroundColor = "#757575";
                break;
            case "pending":
                statusText = "Pendiente";
                backgroundColor = "#FF9800";
                break;
            case "sent":
                statusText = "Enviada";
                backgroundColor = "#2196F3";
                break;
            case "approved":
                statusText = "Aprobada";
                backgroundColor = "#4CAF50";
                break;
            case "rejected":
                statusText = "Rechazada";
                backgroundColor = "#F44336";
                break;
            case "expired":
                statusText = "Expirada";
                backgroundColor = "#9C27B0";
                break;
            case "converted":
                statusText = "Convertida";
                backgroundColor = "#00BCD4";
                break;
            default:
                statusText = status != null ? status.substring(0, 1).toUpperCase() + status.substring(1) : "Borrador";
                backgroundColor = "#757575";
                break;
        }

        tvQuoteStatus.setText(statusText);
        tvQuoteStatus.setBackgroundColor(Color.parseColor(backgroundColor));
    }

    private void editQuote() {
        Intent intent = new Intent(this, AddEditQuoteActivity.class);
        intent.putExtra("quote_id", quoteId);
        intent.putExtra("mode", "edit");
        startActivity(intent);
    }

    private void generatePDF() {
        if (currentQuote == null) {
            Toast.makeText(this, "No se puede generar PDF: datos de cotización no disponibles", Toast.LENGTH_SHORT).show();
            return;
        }
        
        progressBar.setVisibility(View.VISIBLE);
        btnGeneratePdf.setEnabled(false);
        
        pdfGenerator.generateQuotePDF(currentQuote, new PDFGenerator.PDFGenerationCallback() {
            @Override
            public void onSuccess(File pdfFile) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnGeneratePdf.setEnabled(true);
                    
                    // Show success and open PDF
                    Toast.makeText(QuoteDetailActivity.this, "PDF generado exitosamente", Toast.LENGTH_SHORT).show();
                    openPDF(pdfFile);
                });
            }
            
            @Override
            public void onError(String error) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnGeneratePdf.setEnabled(true);
                    Toast.makeText(QuoteDetailActivity.this, "Error al generar PDF: " + error, Toast.LENGTH_LONG).show();
                });
            }
        });
    }

    private void openPDF(File pdfFile) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            Uri pdfUri = androidx.core.content.FileProvider.getUriForFile(
                this, 
                getPackageName() + ".fileprovider", 
                pdfFile
            );
            intent.setDataAndType(pdfUri, "application/pdf");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(this, "No se puede abrir el PDF. Archivo guardado en: " + pdfFile.getAbsolutePath(), Toast.LENGTH_LONG).show();
        }
    }

    private void sendEmailDialog() {
        if (currentQuote == null || currentQuote.getClient() == null) {
            Toast.makeText(this, "No se puede enviar email: información de cliente no disponible", Toast.LENGTH_SHORT).show();
            return;
        }
        
        String clientEmail = currentQuote.getClient().getEmail();
        if (clientEmail == null || clientEmail.trim().isEmpty()) {
            Toast.makeText(this, "El cliente no tiene email registrado", Toast.LENGTH_SHORT).show();
            return;
        }
        
        new AlertDialog.Builder(this)
            .setTitle("Enviar Cotización por Email")
            .setMessage("¿Enviar la cotización a " + clientEmail + "?")
            .setPositiveButton("Enviar", (dialog, which) -> sendEmail())
            .setNegativeButton("Cancelar", null)
            .show();
    }

    private void sendEmail() {
        progressBar.setVisibility(View.VISIBLE);
        btnSendEmail.setEnabled(false);
        
        // First generate PDF, then send email
        pdfGenerator.generateQuotePDF(currentQuote, new PDFGenerator.PDFGenerationCallback() {
            @Override
            public void onSuccess(File pdfFile) {
                // Now send email with PDF attachment
                emailSender.sendQuoteEmail(currentQuote, pdfFile, new EmailSender.EmailSendCallback() {
                    @Override
                    public void onSuccess() {
                        runOnUiThread(() -> {
                            progressBar.setVisibility(View.GONE);
                            btnSendEmail.setEnabled(true);
                            Toast.makeText(QuoteDetailActivity.this, "Email enviado exitosamente", Toast.LENGTH_SHORT).show();
                        });
                    }
                    
                    @Override
                    public void onError(String error) {
                        runOnUiThread(() -> {
                            progressBar.setVisibility(View.GONE);
                            btnSendEmail.setEnabled(true);
                            Toast.makeText(QuoteDetailActivity.this, "Error al enviar email: " + error, Toast.LENGTH_LONG).show();
                        });
                    }
                });
            }
            
            @Override
            public void onError(String error) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnSendEmail.setEnabled(true);
                    Toast.makeText(QuoteDetailActivity.this, "Error al generar PDF para email: " + error, Toast.LENGTH_LONG).show();
                });
            }
        });
    }

    private void showMoreOptionsDialog() {
        String[] options = {"Cambiar Estado", "Duplicar Cotización", "Eliminar", "Compartir"};
        
        new AlertDialog.Builder(this)
            .setTitle("Más Opciones")
            .setItems(options, (dialog, which) -> {
                switch (which) {
                    case 0:
                        showStatusChangeDialog();
                        break;
                    case 1:
                        duplicateQuote();
                        break;
                    case 2:
                        showDeleteConfirmation();
                        break;
                    case 3:
                        shareQuote();
                        break;
                }
            })
            .show();
    }

    private void showStatusChangeDialog() {
        String[] statuses = {"Borrador", "Pendiente", "Aprobada", "Rechazada"};
        String[] statusValues = {"draft", "pending", "approved", "rejected"};
        
        new AlertDialog.Builder(this)
            .setTitle("Cambiar Estado")
            .setItems(statuses, (dialog, which) -> {
                quoteViewModel.changeQuoteStatus(quoteId, statusValues[which]);
                loadQuoteDetails(); // Reload to show updated status
            })
            .show();
    }

    private void duplicateQuote() {
        // TODO: Implement quote duplication
        Toast.makeText(this, "Duplicar cotización - Próximamente", Toast.LENGTH_SHORT).show();
    }

    private void showDeleteConfirmation() {
        new AlertDialog.Builder(this)
            .setTitle("Confirmar Eliminación")
            .setMessage("¿Está seguro de que desea eliminar esta cotización?")
            .setPositiveButton("Eliminar", (dialog, which) -> {
                quoteViewModel.deleteQuote(quoteId);
                finish();
            })
            .setNegativeButton("Cancelar", null)
            .show();
    }

    private void shareQuote() {
        if (currentQuote == null) return;
        
        String shareText = "Cotización " + (currentQuote.getQuoteNumber() != null ? currentQuote.getQuoteNumber() : "COT-" + currentQuote.getId()) +
                          "\nTotal: " + (currentQuote.getCurrency() != null && "USD".equals(currentQuote.getCurrency()) ? "$ " : "S/ ") +
                          String.format(Locale.getDefault(), "%.2f", currentQuote.getTotal());
        
        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, shareText);
        startActivity(Intent.createChooser(shareIntent, "Compartir Cotización"));
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Reload data when returning to activity
        loadQuoteDetails();
    }
}