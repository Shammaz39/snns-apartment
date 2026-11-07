package com.snns.apartment.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentSubmitRequest {
    @NotBlank
    private String transactionRef; // UTR or UPI reference number

    public PaymentSubmitRequest() {}

    public PaymentSubmitRequest(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }
}
