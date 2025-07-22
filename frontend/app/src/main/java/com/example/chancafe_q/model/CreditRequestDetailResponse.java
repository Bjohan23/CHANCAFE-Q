package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;

/**
 * Wrapper class for the nested credit request detail API response
 * Handles the structure: {"success":true,"data":{"creditRequest":{...}}}
 */
public class CreditRequestDetailResponse {
    @SerializedName("creditRequest")
    private CreditRequest creditRequest;

    public CreditRequestDetailResponse() {
    }

    public CreditRequestDetailResponse(CreditRequest creditRequest) {
        this.creditRequest = creditRequest;
    }

    public CreditRequest getCreditRequest() {
        return creditRequest;
    }

    public void setCreditRequest(CreditRequest creditRequest) {
        this.creditRequest = creditRequest;
    }

    @Override
    public String toString() {
        return "CreditRequestDetailResponse{" +
                "creditRequest=" + creditRequest +
                '}';
    }
}