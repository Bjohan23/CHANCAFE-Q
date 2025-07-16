package com.example.chancafe_q.ui.quotes;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Quote;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class QuotesAdapter extends RecyclerView.Adapter<QuotesAdapter.QuoteViewHolder> {

    private List<Quote> quotes;
    private final Context context;
    private OnQuoteClickListener listener;
    private final NumberFormat currencyFormat;
    private final SimpleDateFormat dateFormat;

    public interface OnQuoteClickListener {
        void onQuoteClick(Quote quote);
        void onEditQuote(Quote quote);
        void onDeleteQuote(Quote quote);
        void onChangeStatus(Quote quote, String newStatus);
        void onViewQuote(Quote quote);
        void onDuplicateQuote(Quote quote);
        void onGeneratePdf(Quote quote);
        void onViewCreditInfo(Quote quote);
    }

    public QuotesAdapter(Context context) {
        this.context = context;
        this.quotes = new ArrayList<>();
        this.currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "PE"));
        this.dateFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
    }

    public void setOnQuoteClickListener(OnQuoteClickListener listener) {
        this.listener = listener;
    }

    public void updateQuotes(List<Quote> newQuotes) {
        this.quotes.clear();
        if (newQuotes != null) {
            this.quotes.addAll(newQuotes);
        }
        notifyDataSetChanged();
    }

    public void addQuote(Quote quote) {
        if (quote != null) {
            quotes.add(0, quote);
            notifyItemInserted(0);
        }
    }

    public void updateQuote(Quote updatedQuote) {
        if (updatedQuote != null) {
            for (int i = 0; i < quotes.size(); i++) {
                if (quotes.get(i).getId() == updatedQuote.getId()) {
                    quotes.set(i, updatedQuote);
                    notifyItemChanged(i);
                    break;
                }
            }
        }
    }

    public void removeQuote(int quoteId) {
        for (int i = 0; i < quotes.size(); i++) {
            if (quotes.get(i).getId() == quoteId) {
                quotes.remove(i);
                notifyItemRemoved(i);
                break;
            }
        }
    }

    @NonNull
    @Override
    public QuoteViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_quote, parent, false);
        return new QuoteViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull QuoteViewHolder holder, int position) {
        Quote quote = quotes.get(position);
        holder.bind(quote);
    }

    @Override
    public int getItemCount() {
        return quotes.size();
    }

    class QuoteViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvQuoteNumber;
        private final TextView tvStatus;
        private final TextView tvClientName;
        private final TextView tvDescription;
        private final TextView tvTotalAmount;
        private final TextView tvValidUntil;
        private final TextView tvCreditScore;
        private final TextView tvCreditRecommendation;
        private final LinearLayout layoutCreditScore;
        private final LinearLayout layoutCreditInfo;
        private final ImageButton btnMenu;

        public QuoteViewHolder(@NonNull View itemView) {
            super(itemView);
            tvQuoteNumber = itemView.findViewById(R.id.tv_quote_number);
            tvStatus = itemView.findViewById(R.id.tv_status);
            tvClientName = itemView.findViewById(R.id.tv_client_name);
            tvDescription = itemView.findViewById(R.id.tv_description);
            tvTotalAmount = itemView.findViewById(R.id.tv_total_amount);
            tvValidUntil = itemView.findViewById(R.id.tv_valid_until);
            tvCreditScore = itemView.findViewById(R.id.tv_credit_score);
            tvCreditRecommendation = itemView.findViewById(R.id.tv_credit_recommendation);
            layoutCreditScore = itemView.findViewById(R.id.layout_credit_score);
            layoutCreditInfo = itemView.findViewById(R.id.layout_credit_info);
            btnMenu = itemView.findViewById(R.id.btn_menu);

            // Click en el item completo
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onQuoteClick(quotes.get(getAdapterPosition()));
                }
            });

            // Click en el menú
            btnMenu.setOnClickListener(v -> showPopupMenu(v, quotes.get(getAdapterPosition())));
        }

        public void bind(Quote quote) {
            // Número de cotización
            tvQuoteNumber.setText(quote.getQuoteNumber() != null ? quote.getQuoteNumber() : "COT-" + quote.getId());

            // Estado
            setupStatusBadge(quote.getStatus());

            // Cliente
            if (quote.getClient() != null) {
                String clientName = quote.getClient().getBusinessName() != null 
                    ? quote.getClient().getBusinessName()
                    : (quote.getClient().getFirstName() + " " + quote.getClient().getLastName()).trim();
                tvClientName.setText(clientName);
                
                // Mostrar score crediticio si está disponible
                setupCreditScore(quote.getClient());
            } else {
                tvClientName.setText("Cliente no disponible");
                layoutCreditScore.setVisibility(View.GONE);
            }

            // Descripción
            tvDescription.setText(quote.getDescription() != null ? quote.getDescription() : "Sin descripción");

            // Monto total
            String currency = quote.getCurrency() != null ? quote.getCurrency() : "PEN";
            String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
            tvTotalAmount.setText(symbol + String.format(Locale.getDefault(), "%.2f", quote.getTotalAmount()));

            // Fecha de validez
            if (quote.getValidUntil() != null && !quote.getValidUntil().isEmpty()) {
                Date validUntilDate = quote.getValidUntilAsDate();
                if (validUntilDate != null) {
                    tvValidUntil.setText(dateFormat.format(validUntilDate));
                    
                    // Verificar si está por expirar (próximos 7 días)
                    long daysDifference = (validUntilDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                if (daysDifference <= 7 && daysDifference >= 0) {
                    tvValidUntil.setTextColor(Color.parseColor("#FF9800")); // Naranja para advertencia
                } else if (daysDifference < 0) {
                    tvValidUntil.setTextColor(Color.parseColor("#F44336")); // Rojo para expiradas
                } else {
                    tvValidUntil.setTextColor(Color.parseColor("#424242")); // Color normal
                }
                } else {
                    tvValidUntil.setText("Sin fecha límite");
                    tvValidUntil.setTextColor(Color.parseColor("#757575"));
                }
            } else {
                tvValidUntil.setText("Sin fecha límite");
                tvValidUntil.setTextColor(Color.parseColor("#757575"));
            }

            // Información crediticia (si está disponible en metadata)
            setupCreditAssessmentInfo(quote);
        }

        private void setupStatusBadge(String status) {
            String statusText;
            String backgroundColor;

            switch (status != null ? status.toLowerCase() : "draft") {
                case "draft":
                    statusText = "Borrador";
                    backgroundColor = "#FF9800"; // Naranja
                    break;
                case "sent":
                    statusText = "Enviada";
                    backgroundColor = "#2196F3"; // Azul
                    break;
                case "approved":
                    statusText = "Aprobada";
                    backgroundColor = "#4CAF50"; // Verde
                    break;
                case "rejected":
                    statusText = "Rechazada";
                    backgroundColor = "#F44336"; // Rojo
                    break;
                case "expired":
                    statusText = "Expirada";
                    backgroundColor = "#9C27B0"; // Morado
                    break;
                default:
                    statusText = status != null ? status : "Borrador";
                    backgroundColor = "#757575"; // Gris
                    break;
            }

            tvStatus.setText(statusText);
            tvStatus.setBackgroundColor(Color.parseColor(backgroundColor));
        }

        private void setupCreditScore(com.example.chancafe_q.model.Client client) {
            // Verificar si el cliente tiene información crediticia
            if (client.getCreditScore() != null && client.getCreditScore() > 0) {
                layoutCreditScore.setVisibility(View.VISIBLE);
                tvCreditScore.setText(String.valueOf(client.getCreditScore()));
                
                // Cambiar color según el score
                if (client.getCreditScore() >= 650) {
                    tvCreditScore.setTextColor(Color.parseColor("#2E7D32")); // Verde
                } else if (client.getCreditScore() >= 550) {
                    tvCreditScore.setTextColor(Color.parseColor("#F57F17")); // Amarillo
                } else {
                    tvCreditScore.setTextColor(Color.parseColor("#D32F2F")); // Rojo
                }
            } else {
                layoutCreditScore.setVisibility(View.GONE);
            }
        }

        private void setupCreditAssessmentInfo(Quote quote) {
            // Esta función mostraría información de evaluación crediticia si está disponible
            // en los metadatos de la cotización (cuando se crea con credit check)
            
            // Por ahora, ocultamos el layout hasta que implementemos la integración completa
            layoutCreditInfo.setVisibility(View.GONE);
            
            // TODO: Implementar cuando tengamos la estructura de respuesta del backend
            // para cotizaciones con evaluación crediticia
        }

        private void showPopupMenu(View view, Quote quote) {
            PopupMenu popup = new PopupMenu(context, view);
            popup.getMenuInflater().inflate(R.menu.menu_quote_options, popup.getMenu());

            // Configurar visibilidad de opciones según el estado
            popup.getMenu().findItem(R.id.action_edit).setVisible(quote.isDraft());
            popup.getMenu().findItem(R.id.action_send).setVisible(quote.isDraft());
            popup.getMenu().findItem(R.id.action_approve).setVisible(quote.isSent());
            popup.getMenu().findItem(R.id.action_reject).setVisible(quote.isSent());
            
            // Mostrar opción de PDF solo si está generado o si la cotización está enviada/aprobada
            popup.getMenu().findItem(R.id.action_generate_pdf).setVisible(
                !quote.isDraft() || quote.isPdfGenerated()
            );

            // Mostrar info crediticia solo si el cliente tiene DNI
            boolean hasClientWithDni = quote.getClient() != null && 
                quote.getClient().getDocumentType() != null && 
                "DNI".equals(quote.getClient().getDocumentType());
            popup.getMenu().findItem(R.id.action_credit_info).setVisible(hasClientWithDni);

            popup.setOnMenuItemClickListener(item -> {
                if (listener == null) return false;

                int itemId = item.getItemId();
                if (itemId == R.id.action_view) {
                    listener.onViewQuote(quote);
                } else if (itemId == R.id.action_edit) {
                    listener.onEditQuote(quote);
                } else if (itemId == R.id.action_duplicate) {
                    listener.onDuplicateQuote(quote);
                } else if (itemId == R.id.action_send) {
                    listener.onChangeStatus(quote, "sent");
                } else if (itemId == R.id.action_approve) {
                    listener.onChangeStatus(quote, "approved");
                } else if (itemId == R.id.action_reject) {
                    listener.onChangeStatus(quote, "rejected");
                } else if (itemId == R.id.action_generate_pdf) {
                    listener.onGeneratePdf(quote);
                } else if (itemId == R.id.action_credit_info) {
                    listener.onViewCreditInfo(quote);
                } else if (itemId == R.id.action_delete) {
                    listener.onDeleteQuote(quote);
                } else {
                    return false;
                }
                return true;
            });

            popup.show();
        }
    }
}