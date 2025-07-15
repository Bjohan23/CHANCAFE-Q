package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

/**
 * Modelo de datos para la información crediticia del cliente
 */
public class CreditInfo implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Integer score;
    
    @SerializedName("scoreLabel")
    private String scoreLabel;
    
    @SerializedName("riskClassification")
    private String riskClassification;
    
    @SerializedName("totalDebts")
    private String totalDebts;
    
    @SerializedName("activeCredits")
    private Integer activeCredits;
    
    @SerializedName("overdueCredits")
    private Integer overdueCredits;
    
    @SerializedName("automaticEvaluation")
    private String automaticEvaluation;
    
    @SerializedName("evaluationJustification")
    private String evaluationJustification;
    
    @SerializedName("suggestedCreditLimit")
    private String suggestedCreditLimit;
    
    @SerializedName("isBanked")
    private Boolean isBanked;
    
    @SerializedName("lastCreditCheck")
    private String lastCreditCheck;
    
    @SerializedName("bankingHistorySummary")
    private String bankingHistorySummary;

    // Constructor vacío
    public CreditInfo() {}

    // Getters y Setters
    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getScoreLabel() {
        return scoreLabel;
    }

    public void setScoreLabel(String scoreLabel) {
        this.scoreLabel = scoreLabel;
    }

    public String getRiskClassification() {
        return riskClassification;
    }

    public void setRiskClassification(String riskClassification) {
        this.riskClassification = riskClassification;
    }

    public String getTotalDebts() {
        return totalDebts;
    }

    public void setTotalDebts(String totalDebts) {
        this.totalDebts = totalDebts;
    }

    public Integer getActiveCredits() {
        return activeCredits;
    }

    public void setActiveCredits(Integer activeCredits) {
        this.activeCredits = activeCredits;
    }

    public Integer getOverdueCredits() {
        return overdueCredits;
    }

    public void setOverdueCredits(Integer overdueCredits) {
        this.overdueCredits = overdueCredits;
    }

    public String getAutomaticEvaluation() {
        return automaticEvaluation;
    }

    public void setAutomaticEvaluation(String automaticEvaluation) {
        this.automaticEvaluation = automaticEvaluation;
    }

    public String getEvaluationJustification() {
        return evaluationJustification;
    }

    public void setEvaluationJustification(String evaluationJustification) {
        this.evaluationJustification = evaluationJustification;
    }

    public String getSuggestedCreditLimit() {
        return suggestedCreditLimit;
    }

    public void setSuggestedCreditLimit(String suggestedCreditLimit) {
        this.suggestedCreditLimit = suggestedCreditLimit;
    }

    public Boolean getIsBanked() {
        return isBanked;
    }

    public void setIsBanked(Boolean isBanked) {
        this.isBanked = isBanked;
    }

    public String getLastCreditCheck() {
        return lastCreditCheck;
    }

    public void setLastCreditCheck(String lastCreditCheck) {
        this.lastCreditCheck = lastCreditCheck;
    }

    public String getBankingHistorySummary() {
        return bankingHistorySummary;
    }

    public void setBankingHistorySummary(String bankingHistorySummary) {
        this.bankingHistorySummary = bankingHistorySummary;
    }

    @Override
    public String toString() {
        return "CreditInfo{" +
                "score=" + score +
                ", scoreLabel='" + scoreLabel + '\'' +
                ", riskClassification='" + riskClassification + '\'' +
                ", totalDebts='" + totalDebts + '\'' +
                ", activeCredits=" + activeCredits +
                ", overdueCredits=" + overdueCredits +
                ", automaticEvaluation='" + automaticEvaluation + '\'' +
                ", evaluationJustification='" + evaluationJustification + '\'' +
                ", suggestedCreditLimit='" + suggestedCreditLimit + '\'' +
                ", isBanked=" + isBanked +
                ", lastCreditCheck='" + lastCreditCheck + '\'' +
                ", bankingHistorySummary='" + bankingHistorySummary + '\'' +
                '}';
    }
}