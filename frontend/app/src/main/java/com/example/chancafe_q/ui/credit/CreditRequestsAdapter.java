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
            android.util.Log.d("CreditRequestsAdapter", "=== BINDING CREDIT REQUEST ===");
            android.util.Log.d("CreditRequestsAdapter", "Credit Request ID: " + creditRequest.getId());
            android.util.Log.d("CreditRequestsAdapter", "Request Number: " + creditRequest.getRequestNumber());
            android.util.Log.d("CreditRequestsAdapter", "Status: " + creditRequest.getStatus());
            android.util.Log.d("CreditRequestsAdapter", "Requested Amount: " + creditRequest.getRequestedAmount());
            android.util.Log.d("CreditRequestsAdapter", "Currency: " + creditRequest.getCurrency());
            android.util.Log.d("CreditRequestsAdapter", "Payment Terms: " + creditRequest.getPaymentTerms());
            android.util.Log.d("CreditRequestsAdapter", "Created At: " + creditRequest.getCreatedAt());
            android.util.Log.d("CreditRequestsAdapter", "Expires At: " + creditRequest.getExpiresAt());
            android.util.Log.d("CreditRequestsAdapter", "Client: " + (creditRequest.getClient() != null ? "Present" : "Null"));
            if (creditRequest.getClient() != null) {
                android.util.Log.d("CreditRequestsAdapter", "Client Name: " + creditRequest.getClient().getName());
                android.util.Log.d("CreditRequestsAdapter", "Client Business Name: " + creditRequest.getClient().getBusinessName());
                android.util.Log.d("CreditRequestsAdapter", "Client First Name: " + creditRequest.getClient().getFirstName());
                android.util.Log.d("CreditRequestsAdapter", "Client Last Name: " + creditRequest.getClient().getLastName());
            }
            
            // Número de solicitud
            tvRequestNumber.setText(creditRequest.getRequestNumber() != null ? 
                creditRequest.getRequestNumber() : "CR-" + creditRequest.getId());

            // Prioridad
            setupPriorityBadge(creditRequest.getPriority());

            // Estado
            setupStatusBadge(creditRequest.getStatus());

            // Cliente con manejo mejorado de nombres
            if (creditRequest.getClient() != null) {
                String clientName = getClientDisplayName(creditRequest.getClient(), creditRequest.getClientId());
                tvClientName.setText(clientName);
                android.util.Log.d("CreditRequestsAdapter", "Final client name displayed: '" + clientName + "'");
                
                // Mostrar score crediticio si está disponible
                setupCreditScore(creditRequest.getClient());
            } else {
                tvClientName.setText("Cliente no disponible");
                layoutCreditScore.setVisibility(View.GONE);
                android.util.Log.d("CreditRequestsAdapter", "Client object is null");
            }

            // Propósito
            tvPurpose.setText(creditRequest.getPurpose() != null ? creditRequest.getPurpose() : "Sin propósito especificado");

            // Monto solicitado con mejor formato
            String currency = creditRequest.getCurrency() != null ? creditRequest.getCurrency() : "PEN";
            String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
            if (creditRequest.getRequestedAmount() != null && creditRequest.getRequestedAmount() > 0) {
                tvRequestedAmount.setText(String.format(Locale.getDefault(), "%s%.0f", symbol, creditRequest.getRequestedAmount()));
            } else {
                tvRequestedAmount.setText(symbol + "0");
            }

            // Términos de pago con mejor formato
            if (creditRequest.getPaymentTerms() != null && creditRequest.getPaymentTerms() > 0) {
                tvPaymentTerms.setText(creditRequest.getPaymentTerms() + " días");
            } else {
                tvPaymentTerms.setText("No especificado");
            }

            // Información específica según el estado
            setupStatusSpecificInfo(creditRequest);

            // Fechas con mejor manejo de nulos
            if (creditRequest.getCreatedAt() != null) {
                try {
                    tvCreatedDate.setText("Creada: " + dateFormat.format(creditRequest.getCreatedAt()));
                } catch (Exception e) {
                    tvCreatedDate.setText("Creada: Fecha inválida");
                }
            } else {
                tvCreatedDate.setText("Fecha de creación no disponible");
            }

            // Fecha de expiración con mejor manejo
            if (creditRequest.getExpiresAt() != null) {
                try {
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
                } catch (Exception e) {
                    tvExpiresDate.setText("Expira: Fecha inválida");
                    tvExpiresDate.setVisibility(View.VISIBLE);
                    tvExpiresDate.setTextColor(Color.parseColor("#F44336"));
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
            try {
                // Verificar si el cliente tiene información crediticia válida
                if (client != null && client.getCreditScore() != null && client.getCreditScore() > 0) {
                    layoutCreditScore.setVisibility(View.VISIBLE);
                    tvCreditScore.setText(String.valueOf(client.getCreditScore()));
                    
                    android.util.Log.d("CreditRequestsAdapter", "Credit score: " + client.getCreditScore());
                    
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
                    android.util.Log.d("CreditRequestsAdapter", "No credit score available");
                }
            } catch (Exception e) {
                layoutCreditScore.setVisibility(View.GONE);
                android.util.Log.e("CreditRequestsAdapter", "Error setting up credit score: " + e.getMessage());
            }
        }

        private void setupStatusSpecificInfo(CreditRequest creditRequest) {
            // Ocultar todos los layouts primero
            layoutApprovedInfo.setVisibility(View.GONE);
            layoutRejectionInfo.setVisibility(View.GONE);
            layoutRiskAssessment.setVisibility(View.GONE);

            switch (creditRequest.getStatus() != null ? creditRequest.getStatus().toLowerCase() : "pending") {
                case "approved":
                    if (creditRequest.getApprovedAmount() != null && creditRequest.getApprovedAmount() > 0) {
                        layoutApprovedInfo.setVisibility(View.VISIBLE);
                        String currency = creditRequest.getCurrency() != null ? creditRequest.getCurrency() : "PEN";
                        String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
                        tvApprovedAmount.setText(String.format(Locale.getDefault(), "%s%.0f", symbol, creditRequest.getApprovedAmount()));
                        
                        // Formatear términos aprobados
                        if (creditRequest.getApprovedTerms() != null && !creditRequest.getApprovedTerms().trim().isEmpty()) {
                            String approvedTermsText = creditRequest.getApprovedTerms();
                            try {
                                // Si es un número, agregar "días"
                                int terms = Integer.parseInt(approvedTermsText.trim());
                                tvApprovedTerms.setText(terms + " días");
                            } catch (NumberFormatException e) {
                                // Si no es un número, mostrar tal como viene
                                tvApprovedTerms.setText(approvedTermsText);
                            }
                        } else {
                            tvApprovedTerms.setText("Términos no especificados");
                        }
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
        
        /**
         * Helper method to get the best available client display name
         */
        private String getClientDisplayName(com.example.chancafe_q.model.Client client, int clientId) {
            android.util.Log.d("CreditRequestsAdapter", "Getting display name for client ID: " + clientId);
            
            // Prioridad 1: Campo "name" del backend (formato completo)
            if (client.getName() != null && !client.getName().trim().isEmpty()) {
                android.util.Log.d("CreditRequestsAdapter", "Using 'name' field: " + client.getName());
                return client.getName().trim();
            }
            
            // Prioridad 2: Business name para empresas
            if (client.getBusinessName() != null && !client.getBusinessName().trim().isEmpty()) {
                android.util.Log.d("CreditRequestsAdapter", "Using business name: " + client.getBusinessName());
                return client.getBusinessName().trim();
            }
            
            // Prioridad 3: Concatenar firstName + lastName
            String firstName = client.getFirstName() != null ? client.getFirstName().trim() : "";
            String lastName = client.getLastName() != null ? client.getLastName().trim() : "";
            
            if (!firstName.isEmpty() || !lastName.isEmpty()) {
                String fullName = (firstName + " " + lastName).trim();
                android.util.Log.d("CreditRequestsAdapter", "Using firstName + lastName: " + fullName);
                return fullName;
            }
            
            // Prioridad 4: FullName field (respaldo)
            if (client.getFullName() != null && !client.getFullName().trim().isEmpty()) {
                android.util.Log.d("CreditRequestsAdapter", "Using fullName field: " + client.getFullName());
                return client.getFullName().trim();
            }
            
            // Fallback: Usar ID del cliente
            String fallbackName = "Cliente ID: " + clientId;
            android.util.Log.d("CreditRequestsAdapter", "Using fallback name: " + fallbackName);
            return fallbackName;
        }
    }
}