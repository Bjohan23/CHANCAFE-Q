package com.example.chancafe_q.ui.credit;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.CreditRequest;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class CreditRequestsAdapter extends RecyclerView.Adapter<CreditRequestsAdapter.CreditRequestViewHolder> {

    private List<CreditRequest> creditRequests;
    private final Context context;
    private OnCreditRequestClickListener listener;
    private final NumberFormat currencyFormat;
    private final SimpleDateFormat dateFormat;

    public interface OnCreditRequestClickListener {
        void onCreditRequestClick(CreditRequest creditRequest);
        void onEditCreditRequest(CreditRequest creditRequest);
        void onDeleteCreditRequest(CreditRequest creditRequest);
        void onApproveCreditRequest(CreditRequest creditRequest);
        void onRejectCreditRequest(CreditRequest creditRequest);
        void onViewCreditRequest(CreditRequest creditRequest);
        void onUpdateRiskAssessment(CreditRequest creditRequest);
    }

    public CreditRequestsAdapter(Context context) {
        this.context = context;
        this.creditRequests = new ArrayList<>();
        this.currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "PE"));
        this.dateFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
    }

    public void setOnCreditRequestClickListener(OnCreditRequestClickListener listener) {
        this.listener = listener;
    }

    public void updateCreditRequests(List<CreditRequest> newCreditRequests) {
        this.creditRequests.clear();
        if (newCreditRequests != null) {
            this.creditRequests.addAll(newCreditRequests);
        }
        notifyDataSetChanged();
    }

    public void addCreditRequest(CreditRequest creditRequest) {
        if (creditRequest != null) {
            creditRequests.add(0, creditRequest);
            notifyItemInserted(0);
        }
    }

    public void updateCreditRequest(CreditRequest updatedCreditRequest) {
        if (updatedCreditRequest != null) {
            for (int i = 0; i < creditRequests.size(); i++) {
                if (creditRequests.get(i).getId() == updatedCreditRequest.getId()) {
                    creditRequests.set(i, updatedCreditRequest);
                    notifyItemChanged(i);
                    break;
                }
            }
        }
    }

    public void removeCreditRequest(int creditRequestId) {
        for (int i = 0; i < creditRequests.size(); i++) {
            if (creditRequests.get(i).getId() == creditRequestId) {
                creditRequests.remove(i);
                notifyItemRemoved(i);
                break;
            }
        }
    }

    @NonNull
    @Override
    public CreditRequestViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_credit_request, parent, false);
        return new CreditRequestViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CreditRequestViewHolder holder, int position) {
        CreditRequest creditRequest = creditRequests.get(position);
        holder.bind(creditRequest);
    }

    @Override
    public int getItemCount() {
        return creditRequests.size();
    }

    class CreditRequestViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvRequestNumber;
        private final TextView tvPriority;
        private final TextView tvStatus;
        private final TextView tvClientName;
        private final TextView tvPurpose;
        private final TextView tvRequestedAmount;
        private final TextView tvPaymentTerms;
        private final TextView tvApprovedAmount;
        private final TextView tvApprovedTerms;
        private final TextView tvRejectionReason;
        private final TextView tvRiskLevel;
        private final TextView tvCreditScore;
        private final TextView tvCreatedDate;
        private final TextView tvExpiresDate;
        private final LinearLayout layoutCreditScore;
        private final LinearLayout layoutApprovedInfo;
        private final LinearLayout layoutRejectionInfo;
        private final LinearLayout layoutRiskAssessment;
        private final ImageButton btnMenu;

        public CreditRequestViewHolder(@NonNull View itemView) {
            super(itemView);
            tvRequestNumber = itemView.findViewById(R.id.tv_request_number);
            tvPriority = itemView.findViewById(R.id.tv_priority);
            tvStatus = itemView.findViewById(R.id.tv_status);
            tvClientName = itemView.findViewById(R.id.tv_client_name);
            tvPurpose = itemView.findViewById(R.id.tv_purpose);
            tvRequestedAmount = itemView.findViewById(R.id.tv_requested_amount);
            tvPaymentTerms = itemView.findViewById(R.id.tv_payment_terms);
            tvApprovedAmount = itemView.findViewById(R.id.tv_approved_amount);
            tvApprovedTerms = itemView.findViewById(R.id.tv_approved_terms);
            tvRejectionReason = itemView.findViewById(R.id.tv_rejection_reason);
            tvRiskLevel = itemView.findViewById(R.id.tv_risk_level);
            tvCreditScore = itemView.findViewById(R.id.tv_credit_score);
            tvCreatedDate = itemView.findViewById(R.id.tv_created_date);
            tvExpiresDate = itemView.findViewById(R.id.tv_expires_date);
            layoutCreditScore = itemView.findViewById(R.id.layout_credit_score);
            layoutApprovedInfo = itemView.findViewById(R.id.layout_approved_info);
            layoutRejectionInfo = itemView.findViewById(R.id.layout_rejection_info);
            layoutRiskAssessment = itemView.findViewById(R.id.layout_risk_assessment);
            btnMenu = itemView.findViewById(R.id.btn_menu);

            // Click en el item completo
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onCreditRequestClick(creditRequests.get(getAdapterPosition()));
                }
            });

            // Click en el menú
            btnMenu.setOnClickListener(v -> showPopupMenu(v, creditRequests.get(getAdapterPosition())));
        }

        public void bind(CreditRequest creditRequest) {
            // Número de solicitud
            tvRequestNumber.setText(creditRequest.getRequestNumber() != null ? 
                creditRequest.getRequestNumber() : "CR-" + creditRequest.getId());

            // Prioridad
            setupPriorityBadge(creditRequest.getPriority());

            // Estado
            setupStatusBadge(creditRequest.getStatus());

            // Cliente
            if (creditRequest.getClient() != null) {
                String clientName = null;
                
                // Priorizar el campo name del backend
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
                
                // Mostrar score crediticio si está disponible
                setupCreditScore(creditRequest.getClient());
            } else {
                tvClientName.setText("Cliente no disponible");
                layoutCreditScore.setVisibility(View.GONE);
            }

            // Propósito
            tvPurpose.setText(creditRequest.getPurpose() != null ? creditRequest.getPurpose() : "Sin propósito especificado");

            // Monto solicitado
            String currency = creditRequest.getCurrency() != null ? creditRequest.getCurrency() : "PEN";
            String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
            tvRequestedAmount.setText(symbol + String.format(Locale.getDefault(), "%.0f", creditRequest.getRequestedAmount()));

            // Términos de pago
            tvPaymentTerms.setText(creditRequest.getPaymentTerms() != null ? 
                String.valueOf(creditRequest.getPaymentTerms()) + " días" : "No especificado");

            // Información específica según el estado
            setupStatusSpecificInfo(creditRequest);

            // Fechas
            if (creditRequest.getCreatedAt() != null) {
                tvCreatedDate.setText("Creada: " + dateFormat.format(creditRequest.getCreatedAt()));
            } else {
                tvCreatedDate.setText("Fecha de creación no disponible");
            }

            // Fecha de expiración
            if (creditRequest.getExpiresAt() != null) {
                tvExpiresDate.setText("Expira: " + dateFormat.format(creditRequest.getExpiresAt()));
                tvExpiresDate.setVisibility(View.VISIBLE);
                
                // Verificar si está por expirar
                long daysDifference = (creditRequest.getExpiresAt().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                if (daysDifference <= 3 && daysDifference >= 0) {
                    tvExpiresDate.setTextColor(Color.parseColor("#FF9800")); // Naranja para advertencia
                } else if (daysDifference < 0) {
                    tvExpiresDate.setTextColor(Color.parseColor("#F44336")); // Rojo para expiradas
                } else {
                    tvExpiresDate.setTextColor(Color.parseColor("#999999")); // Color normal
                }
            } else {
                tvExpiresDate.setVisibility(View.GONE);
            }
        }

        private void setupPriorityBadge(String priority) {
            String priorityText;
            String backgroundColor;

            switch (priority != null ? priority.toLowerCase() : "medium") {
                case "urgent":
                    priorityText = "🔥 Urgente";
                    backgroundColor = "#F44336"; // Rojo
                    break;
                case "high":
                    priorityText = "⚡ Alta";
                    backgroundColor = "#FF9800"; // Naranja
                    break;
                case "medium":
                    priorityText = "Media";
                    backgroundColor = "#2196F3"; // Azul
                    break;
                case "low":
                    priorityText = "Baja";
                    backgroundColor = "#4CAF50"; // Verde
                    break;
                default:
                    priorityText = priority != null ? priority : "Media";
                    backgroundColor = "#757575"; // Gris
                    break;
            }

            tvPriority.setText(priorityText);
            tvPriority.setBackgroundColor(Color.parseColor(backgroundColor));
        }

        private void setupStatusBadge(String status) {
            String statusText;
            String backgroundColor;

            switch (status != null ? status.toLowerCase() : "pending") {
                case "pending":
                    statusText = "Pendiente";
                    backgroundColor = "#FF9800"; // Naranja
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
                    statusText = status != null ? status : "Pendiente";
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

        private void setupStatusSpecificInfo(CreditRequest creditRequest) {
            // Ocultar todos los layouts primero
            layoutApprovedInfo.setVisibility(View.GONE);
            layoutRejectionInfo.setVisibility(View.GONE);
            layoutRiskAssessment.setVisibility(View.GONE);

            switch (creditRequest.getStatus() != null ? creditRequest.getStatus().toLowerCase() : "pending") {
                case "approved":
                    if (creditRequest.getApprovedAmount() != null) {
                        layoutApprovedInfo.setVisibility(View.VISIBLE);
                        String currency = creditRequest.getCurrency() != null ? creditRequest.getCurrency() : "PEN";
                        String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
                        tvApprovedAmount.setText(symbol + String.format(Locale.getDefault(), "%.0f", creditRequest.getApprovedAmount()));
                        tvApprovedTerms.setText(creditRequest.getApprovedTerms() != null ? creditRequest.getApprovedTerms() : "");
                    }
                    break;
                    
                case "rejected":
                    if (creditRequest.getRejectionReason() != null && !creditRequest.getRejectionReason().isEmpty()) {
                        layoutRejectionInfo.setVisibility(View.VISIBLE);
                        tvRejectionReason.setText(creditRequest.getRejectionReason());
                    }
                    break;
                    
                case "pending":
                    if (creditRequest.getRiskAssessment() != null && !creditRequest.getRiskAssessment().isEmpty()) {
                        layoutRiskAssessment.setVisibility(View.VISIBLE);
                        tvRiskLevel.setText(creditRequest.getRiskAssessment());
                    }
                    break;
            }
        }

        private void showPopupMenu(View view, CreditRequest creditRequest) {
            PopupMenu popup = new PopupMenu(context, view);
            popup.getMenuInflater().inflate(R.menu.menu_credit_request_options, popup.getMenu());

            // Configurar visibilidad de opciones según el estado y permisos
            boolean isPending = creditRequest.isPending();
            boolean isApproved = creditRequest.isApproved();
            boolean isRejected = creditRequest.isRejected();

            popup.getMenu().findItem(R.id.action_edit).setVisible(isPending);
            popup.getMenu().findItem(R.id.action_approve).setVisible(isPending);
            popup.getMenu().findItem(R.id.action_reject).setVisible(isPending);
            popup.getMenu().findItem(R.id.action_update_risk).setVisible(isPending);
            popup.getMenu().findItem(R.id.action_delete).setVisible(isPending || isRejected);

            popup.setOnMenuItemClickListener(item -> {
                if (listener == null) return false;

                int itemId = item.getItemId();
                if (itemId == R.id.action_view) {
                    listener.onViewCreditRequest(creditRequest);
                } else if (itemId == R.id.action_edit) {
                    listener.onEditCreditRequest(creditRequest);
                } else if (itemId == R.id.action_approve) {
                    listener.onApproveCreditRequest(creditRequest);
                } else if (itemId == R.id.action_reject) {
                    listener.onRejectCreditRequest(creditRequest);
                } else if (itemId == R.id.action_update_risk) {
                    listener.onUpdateRiskAssessment(creditRequest);
                } else if (itemId == R.id.action_delete) {
                    listener.onDeleteCreditRequest(creditRequest);
                } else {
                    return false;
                }
                return true;
            });

            popup.show();
        }
    }
}