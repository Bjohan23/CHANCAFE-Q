package com.example.chancafe_q.ui.clients;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Client;

import java.util.ArrayList;
import java.util.List;

/**
 * Adapter para la lista de clientes
 */
public class ClientsAdapter extends RecyclerView.Adapter<ClientsAdapter.ClientViewHolder> {

    private List<Client> clients = new ArrayList<>();
    private OnClientClickListener listener;

    public interface OnClientClickListener {
        void onClientClick(Client client);
        void onEditClick(Client client);
        void onDeleteClick(Client client);
    }

    public void setOnClientClickListener(OnClientClickListener listener) {
        this.listener = listener;
    }

    public void updateClients(List<Client> newClients) {
        this.clients.clear();
        if (newClients != null) {
            this.clients.addAll(newClients);
        }
        notifyDataSetChanged();
    }

    public void addClient(Client client) {
        clients.add(0, client);
        notifyItemInserted(0);
    }

    public void updateClient(Client updatedClient) {
        for (int i = 0; i < clients.size(); i++) {
            if (clients.get(i).getId() == updatedClient.getId()) {
                clients.set(i, updatedClient);
                notifyItemChanged(i);
                break;
            }
        }
    }

    public void removeClient(Client clientToRemove) {
        for (int i = 0; i < clients.size(); i++) {
            if (clients.get(i).getId() == clientToRemove.getId()) {
                clients.remove(i);
                notifyItemRemoved(i);
                break;
            }
        }
    }

    @NonNull
    @Override
    public ClientViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_client, parent, false);
        return new ClientViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ClientViewHolder holder, int position) {
        Client client = clients.get(position);
        holder.bind(client, listener);
    }

    @Override
    public int getItemCount() {
        return clients.size();
    }

    public static class ClientViewHolder extends RecyclerView.ViewHolder {
        private TextView tvClientName;
        private TextView tvClientDocument;
        private TextView tvClientEmail;
        private ImageButton btnEdit;
        private ImageButton btnDelete;

        public ClientViewHolder(@NonNull View itemView) {
            super(itemView);
            tvClientName = itemView.findViewById(R.id.tv_client_name);
            tvClientDocument = itemView.findViewById(R.id.tv_client_document);
            tvClientEmail = itemView.findViewById(R.id.tv_client_email);
            btnEdit = itemView.findViewById(R.id.btn_edit);
            btnDelete = itemView.findViewById(R.id.btn_delete);
        }

        public void bind(Client client, OnClientClickListener listener) {
            // Mostrar nombre completo
            String displayName = client.getFullName();
            if (displayName.trim().isEmpty()) {
                displayName = "Cliente sin nombre";
            }
            
            // Agregar indicador de tipo de cliente
            String typeIndicator = client.isBusiness() ? " 🏢" : " 👤"; // 🏢 para empresa, 👤 para persona
            String statusIndicator = "";
            switch (client.getStatus() != null ? client.getStatus() : "active") {
                case "active":
                    statusIndicator = " ✅";
                    break;
                case "inactive":
                    statusIndicator = " ⏸️";
                    break;
                case "suspended":
                    statusIndicator = " ⚠️";
                    break;
                case "blacklisted":
                    statusIndicator = " ❌";
                    break;
            }
            
            tvClientName.setText(displayName + typeIndicator + statusIndicator);

            // Mostrar documento
            String documentType = client.getDocumentType() != null ? client.getDocumentType() : "DOC";
            String documentNumber = client.getDocumentNumber() != null ? client.getDocumentNumber() : "Sin documento";
            String documentText = documentType + ": " + documentNumber;
            tvClientDocument.setText(documentText);

            // Mostrar email o teléfono
            String contactInfo;
            if (client.getEmail() != null && !client.getEmail().isEmpty()) {
                contactInfo = "📧 " + client.getEmail();
            } else if (client.getPhone() != null && !client.getPhone().isEmpty()) {
                contactInfo = "📞 " + client.getPhone();
            } else {
                contactInfo = "Sin información de contacto";
            }
            tvClientEmail.setText(contactInfo);

            // Click en el item completo
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onClientClick(client);
                }
            });

            // Click en editar
            btnEdit.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onEditClick(client);
                }
            });

            // Click en eliminar
            btnDelete.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onDeleteClick(client);
                }
            });
        }
    }
}
