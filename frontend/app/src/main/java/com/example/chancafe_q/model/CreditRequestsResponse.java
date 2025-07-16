package com.example.chancafe_q.model;

import java.util.List;

/**
 * Response wrapper for credit requests endpoint
 */
public class CreditRequestsResponse {
    private List<CreditRequest> creditRequests;

    public CreditRequestsResponse() {}

    public List<CreditRequest> getCreditRequests() {
        return creditRequests;
    }

    public void setCreditRequests(List<CreditRequest> creditRequests) {
        this.creditRequests = creditRequests;
    }
}