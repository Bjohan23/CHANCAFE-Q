package com.example.chancafe_q.model;

/**
 * Response wrapper for quote with items endpoint
 */
public class QuoteWithItemsResponse {
    private Quote quote;

    public QuoteWithItemsResponse() {}

    public Quote getQuote() {
        return quote;
    }

    public void setQuote(Quote quote) {
        this.quote = quote;
    }
}