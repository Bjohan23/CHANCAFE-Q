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
        return "ClientsResponse{" +
                "clients=" + clients +
                '}';
    }
}