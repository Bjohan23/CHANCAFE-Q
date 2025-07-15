package com.example.chancafe_q.ui.clients;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Client;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ClientSelectorAdapter extends RecyclerView.Adapter<ClientSelectorAdapter.ClientViewHolder> {

    private List<Client> clients;
    private final Context context;
    private OnClientSelectListener listener;
    private final NumberFormat currencyFormat;

    public interface OnClientSelectListener {
        void onClientSelected(Client client);
    }

    public ClientSelectorAdapter(Context context) {
        this.context = context;
        this.clients = new ArrayList<>();
        this.currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "PE"));
    }

    public void setOnClientSelectListener(OnClientSelectListener listener) {
        this.listener = listener;
    }

    public void updateClients(List<Client> newClients) {
        this.clients.clear();
        if (newClients != null) {
            this.clients.addAll(newClients);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ClientViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_client_selector, parent, false);
        return new ClientViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ClientViewHolder holder, int position) {
        Client client = clients.get(position);
        holder.bind(client);
    }

    @Override
    public int getItemCount() {
        return clients.size();
    }

    class ClientViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvClientName;
        private final TextView tvDocument;
        private final TextView tvEmail;
        private final TextView tvPhone;
        private final TextView tvBusinessName;
        private final TextView tvCreditScore;
        private final TextView tvCreditLimit;
        private final LinearLayout layoutCreditScore;
        private final LinearLayout layoutBusinessInfo;

        public ClientViewHolder(@NonNull View itemView) {
            super(itemView);
            tvClientName = itemView.findViewById(R.id.tv_client_name);
            tvDocument = itemView.findViewById(R.id.tv_document);
            tvEmail = itemView.findViewById(R.id.tv_email);
            tvPhone = itemView.findViewById(R.id.tv_phone);
            tvBusinessName = itemView.findViewById(R.id.tv_business_name);
            tvCreditScore = itemView.findViewById(R.id.tv_credit_score);
            tvCreditLimit = itemView.findViewById(R.id.tv_credit_limit);
            layoutCreditScore = itemView.findViewById(R.id.layout_credit_score);
            layoutBusinessInfo = itemView.findViewById(R.id.layout_business_info);

            // Click en el item completo
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onClientSelected(clients.get(getAdapterPosition()));
                }
            });
        }

        public void bind(Client client) {
            // Nombre del cliente
            String clientName;
            if (client.getBusinessName() != null && !client.getBusinessName().isEmpty()) {
                clientName = client.getBusinessName();
                layoutBusinessInfo.setVisibility(View.VISIBLE);
                tvBusinessName.setText(client.getBusinessName());
            } else if (client.getFullName() != null && !client.getFullName().isEmpty()) {
                clientName = client.getFullName();
                layoutBusinessInfo.setVisibility(View.GONE);
            } else {
                String firstName = client.getFirstName() != null ? client.getFirstName() : "";
                String lastName = client.getLastName() != null ? client.getLastName() : "";
                clientName = (firstName + " " + lastName).trim();
                if (clientName.isEmpty()) {
                    clientName = "Cliente sin nombre";
                }
                layoutBusinessInfo.setVisibility(View.GONE);
            }
            tvClientName.setText(clientName);

            // Documento
            String documentType = client.getDocumentType() != null ? client.getDocumentType() : "DOC";
            String documentNumber = client.getDocumentNumber() != null ? client.getDocumentNumber() : "Sin documento";
            tvDocument.setText(documentType + ": " + documentNumber);

            // Email
            tvEmail.setText(client.getEmail() != null && !client.getEmail().isEmpty() ? client.getEmail() : "Sin email");

            // Teléfono
            tvPhone.setText(client.getPhone() != null && !client.getPhone().isEmpty() ? client.getPhone() : "Sin teléfono");

            // Score crediticio - usar nueva información crediticia
            if (client.getCreditInfo() != null && client.getCreditInfo().getScore() != null) {
                layoutCreditScore.setVisibility(View.VISIBLE);
                int score = client.getCreditInfo().getScore();
                String scoreLabel = client.getCreditInfo().getScoreLabel() != null ? 
                    client.getCreditInfo().getScoreLabel() : "";
                tvCreditScore.setText(score + " (" + scoreLabel + ")");
                
                // Cambiar color según el score
                if (score >= 650) {
                    tvCreditScore.setTextColor(Color.parseColor("#2E7D32")); // Verde
                } else if (score >= 550) {
                    tvCreditScore.setTextColor(Color.parseColor("#F57F17")); // Amarillo
                } else {
                    tvCreditScore.setTextColor(Color.parseColor("#D32F2F")); // Rojo
                }
            } else if (client.getCreditScore() != null && client.getCreditScore() > 0) {
                // Fallback a la información crediticia antigua
                layoutCreditScore.setVisibility(View.VISIBLE);
                tvCreditScore.setText(String.valueOf(client.getCreditScore()));
                
                if (client.getCreditScore() >= 650) {
                    tvCreditScore.setTextColor(Color.parseColor("#2E7D32"));
                } else if (client.getCreditScore() >= 550) {
                    tvCreditScore.setTextColor(Color.parseColor("#F57F17"));
                } else {
                    tvCreditScore.setTextColor(Color.parseColor("#D32F2F"));
                }
            } else {
                layoutCreditScore.setVisibility(View.GONE);
            }

            // Límite de crédito
            if (client.getCreditLimit() != null && client.getCreditLimit() > 0) {
                tvCreditLimit.setText("Límite: " + currencyFormat.format(client.getCreditLimit()));
                tvCreditLimit.setVisibility(View.VISIBLE);
            } else {
                tvCreditLimit.setVisibility(View.GONE);
            }
        }
    }
}