package com.snns.apartment.dto;

public class VerifyPaymentRequest {
    private boolean approved;
    private String remarks;

    public VerifyPaymentRequest() {}

    public VerifyPaymentRequest(boolean approved, String remarks) {
        this.approved = approved;
        this.remarks = remarks;
    }

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
