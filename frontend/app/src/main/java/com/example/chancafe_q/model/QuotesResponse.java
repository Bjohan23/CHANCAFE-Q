package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

/**
 * Modelo específico para la respuesta de la API de quotes
 * El backend devuelve los datos en formato: { "success": true, "data": { "quotes": [...] } }
 */
public class QuotesResponse {
    @SerializedName("quotes")
    private List<Quote> quotes;

    // Constructor vacío
    public QuotesResponse() {
    }

    // Constructor con parámetros
    public QuotesResponse(List<Quote> quotes) {
        this.quotes = quotes;
    }

    // Getters y Setters
    public List<Quote> getQuotes() {
        return quotes;
    }

    public void setQuotes(List<Quote> quotes) {
        this.quotes = quotes;
    }

    @Override
    public String toString() {
        return "QuotesResponse{" +
                "quotes=" + quotes +
                '}';
    }
}