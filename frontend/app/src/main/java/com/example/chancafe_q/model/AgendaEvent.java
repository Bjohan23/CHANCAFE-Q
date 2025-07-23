package com.example.chancafe_q.model;

import com.google.gson.annotations.SerializedName;
import java.util.Date;

/**
 * Modelo para eventos de agenda
 * Representa citas, reuniones, seguimientos, etc.
 */
public class AgendaEvent {
    private int id;
    
    private String title;
    
    private String description;
    
    private Date startDate;
    
    private Date endDate;
    
    private String location;
    
    private String type; // "meeting", "follow_up", "call", "visit", "presentation"
    
    private String status; // "scheduled", "completed", "cancelled", "rescheduled"
    
    private String priority; // "low", "medium", "high", "urgent"
    
    private int clientId;
    
    private int userId;
    
    private String reminderTime; // Tiempo de recordatorio en minutos antes del evento
    
    private String notes;
    
    private Date createdAt;
    
    private Date updatedAt;
    
    // Relaciones
    private Client client;
    private User user;
    
    // Constructores
    public AgendaEvent() {
        this.status = "scheduled";
        this.priority = "medium";
        this.type = "meeting";
    }
    
    public AgendaEvent(String title, String description, Date startDate, Date endDate, int clientId, int userId) {
        this();
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.clientId = clientId;
        this.userId = userId;
    }
    
    // Getters y Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }
    
    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    
    public int getClientId() { return clientId; }
    public void setClientId(int clientId) { this.clientId = clientId; }
    
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    
    public String getReminderTime() { return reminderTime; }
    public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
    
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    // Métodos de utilidad
    public boolean isToday() {
        if (startDate == null) return false;
        
        long now = System.currentTimeMillis();
        long today = now - (now % 86400000L); // 24 horas en ms
        long tomorrow = today + 86400000L;
        
        long eventTime = startDate.getTime();
        return eventTime >= today && eventTime < tomorrow;
    }
    
    public boolean isUpcoming() {
        return startDate != null && startDate.getTime() > System.currentTimeMillis();
    }
    
    public boolean isOverdue() {
        return startDate != null && startDate.getTime() < System.currentTimeMillis() && !"completed".equals(status);
    }
    
    public boolean isScheduled() {
        return "scheduled".equals(status);
    }
    
    public boolean isCompleted() {
        return "completed".equals(status);
    }
    
    public boolean isCancelled() {
        return "cancelled".equals(status);
    }
    
    public String getFormattedDuration() {
        if (startDate == null || endDate == null) return "";
        
        long durationMs = endDate.getTime() - startDate.getTime();
        long hours = durationMs / 3600000;
        long minutes = (durationMs % 3600000) / 60000;
        
        if (hours > 0) {
            return hours + "h " + minutes + "m";
        } else {
            return minutes + "m";
        }
    }
    
    public int getTypeIcon() {
        switch (type) {
            case "meeting": return android.R.drawable.ic_menu_agenda;
            case "call": return android.R.drawable.stat_sys_phone_call;
            case "visit": return android.R.drawable.ic_menu_mylocation;
            case "follow_up": return android.R.drawable.ic_menu_recent_history;
            case "presentation": return android.R.drawable.ic_menu_slideshow;
            default: return android.R.drawable.ic_menu_agenda;
        }
    }
    
    public int getPriorityColor() {
        switch (priority) {
            case "urgent": return android.R.color.holo_red_dark;
            case "high": return android.R.color.holo_orange_dark;
            case "medium": return android.R.color.holo_blue_dark;
            case "low": return android.R.color.darker_gray;
            default: return android.R.color.darker_gray;
        }
    }
}