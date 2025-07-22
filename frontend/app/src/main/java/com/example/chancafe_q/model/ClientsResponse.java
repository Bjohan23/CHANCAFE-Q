package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

/**
 * Modelo específico para la respuesta de la API de clientes
 * El backend devuelve los datos en formato: { "success": true, "data": { "clients": [...] } }
 */
public class ClientsResponse {
    @SerializedName("clients")
    private List<Client> clients;

    // Constructor vacío
    public ClientsResponse() {
    }

    // Constructor con parámetros
    public ClientsResponse(List<Client> clients) {
        this.clients = clients;
    }

    // Getters y Setters
    public List<Client> getClients() {
        return clients;
    }

    public void setClients(List<Client> clients) {
        this.clients = clients;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("ClientsResponse{");
        sb.append("clients=");
        if (clients == null) {
            sb.append("null");
        } else {
            sb.append("[size=").append(clients.size()).append(", data=");
            for (int i = 0; i < Math.min(clients.size(), 2); i++) {
                if (i > 0) sb.append(", ");
                Client client = clients.get(i);
                sb.append("{id=").append(client.getId())
                  .append(", firstName='").append(client.getFirstName()).append("'")
                  .append(", lastName='").append(client.getLastName()).append("'")
                  .append(", fullName='").append(client.getFullName()).append("'}");
            }
            if (clients.size() > 2) {
                sb.append("...");
            }
            sb.append("]");
        }
        sb.append('}');
        return sb.toString();
    }
}