package com.example.chancafe_q.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.chancafe_q.model.AgendaEvent;
import com.example.chancafe_q.model.Client;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class AgendaViewModel extends AndroidViewModel {

    private MutableLiveData<List<AgendaEvent>> eventsLiveData;
    private MutableLiveData<Boolean> isLoadingLiveData;
    private MutableLiveData<String> errorMessageLiveData;
    private MutableLiveData<AgendaStats> statsLiveData;

    // Filtros
    private MutableLiveData<String> dateFilterLiveData;
    private MutableLiveData<String> typeFilterLiveData;

    private List<AgendaEvent> allEvents;

    public AgendaViewModel(@NonNull Application application) {
        super(application);
        eventsLiveData = new MutableLiveData<>();
        isLoadingLiveData = new MutableLiveData<>();
        errorMessageLiveData = new MutableLiveData<>();
        statsLiveData = new MutableLiveData<>();
        dateFilterLiveData = new MutableLiveData<>();
        typeFilterLiveData = new MutableLiveData<>();
        
        allEvents = new ArrayList<>();
        
        // Valores por defecto
        dateFilterLiveData.setValue("today");
        typeFilterLiveData.setValue("all");
        
        // Cargar datos de prueba
        loadSampleData();
    }

    // Getters para LiveData
    public LiveData<List<AgendaEvent>> getEvents() {
        return eventsLiveData;
    }

    public LiveData<Boolean> getIsLoading() {
        return isLoadingLiveData;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessageLiveData;
    }

    public LiveData<AgendaStats> getStats() {
        return statsLiveData;
    }

    public LiveData<String> getDateFilter() {
        return dateFilterLiveData;
    }

    public LiveData<String> getTypeFilter() {
        return typeFilterLiveData;
    }

    // Métodos públicos
    public void loadEvents() {
        isLoadingLiveData.setValue(true);
        
        // Simular carga de datos (en una implementación real, esto sería una llamada a API)
        new Thread(() -> {
            try {
                Thread.sleep(1000); // Simular delay de red
                
                // En una implementación real, aquí cargarías desde API
                List<AgendaEvent> events = generateSampleEvents();
                allEvents.clear();
                allEvents.addAll(events);
                
                // Aplicar filtros
                List<AgendaEvent> filteredEvents = applyFilters(allEvents);
                
                // Actualizar UI en el hilo principal
                eventsLiveData.postValue(filteredEvents);
                updateStatsAsync(allEvents);
                isLoadingLiveData.postValue(false);
                
            } catch (InterruptedException e) {
                errorMessageLiveData.postValue("Error al cargar eventos");
                isLoadingLiveData.postValue(false);
            }
        }).start();
    }

    public void refreshEvents() {
        loadEvents();
    }

    public void setDateFilter(String filter) {
        dateFilterLiveData.setValue(filter);
        applyFiltersAndUpdate();
    }

    public void setTypeFilter(String filter) {
        typeFilterLiveData.setValue(filter);
        applyFiltersAndUpdate();
    }

    public void addEvent(AgendaEvent event) {
        allEvents.add(0, event);
        applyFiltersAndUpdate();
        updateStats(allEvents);
    }

    public void updateEvent(AgendaEvent updatedEvent) {
        for (int i = 0; i < allEvents.size(); i++) {
            if (allEvents.get(i).getId() == updatedEvent.getId()) {
                allEvents.set(i, updatedEvent);
                break;
            }
        }
        applyFiltersAndUpdate();
        updateStats(allEvents);
    }

    public void deleteEvent(int eventId) {
        allEvents.removeIf(event -> event.getId() == eventId);
        applyFiltersAndUpdate();
        updateStats(allEvents);
    }

    public void completeEvent(int eventId) {
        for (AgendaEvent event : allEvents) {
            if (event.getId() == eventId) {
                event.setStatus("completed");
                break;
            }
        }
        applyFiltersAndUpdate();
        updateStats(allEvents);
    }

    // Métodos privados
    private void loadSampleData() {
        allEvents = generateSampleEvents();
        List<AgendaEvent> filteredEvents = applyFilters(allEvents);
        eventsLiveData.setValue(filteredEvents);
        updateStats(allEvents);
    }

    private void applyFiltersAndUpdate() {
        List<AgendaEvent> filteredEvents = applyFilters(allEvents);
        eventsLiveData.setValue(filteredEvents);
    }

    private List<AgendaEvent> applyFilters(List<AgendaEvent> events) {
        if (events.isEmpty()) return new ArrayList<>();
        
        String dateFilter = dateFilterLiveData.getValue();
        String typeFilter = typeFilterLiveData.getValue();
        
        return events.stream()
                .filter(event -> matchesDateFilter(event, dateFilter))
                .filter(event -> matchesTypeFilter(event, typeFilter))
                .collect(Collectors.toList());
    }

    private boolean matchesDateFilter(AgendaEvent event, String filter) {
        if (filter == null || "all".equals(filter)) return true;
        if (event.getStartDate() == null) return false;
        
        Calendar today = Calendar.getInstance();
        Calendar eventCal = Calendar.getInstance();
        eventCal.setTime(event.getStartDate());
        
        switch (filter) {
            case "today":
                return isSameDay(today, eventCal);
            case "tomorrow":
                today.add(Calendar.DAY_OF_MONTH, 1);
                return isSameDay(today, eventCal);
            case "week":
                Calendar weekEnd = Calendar.getInstance();
                weekEnd.add(Calendar.DAY_OF_MONTH, 7);
                return event.getStartDate().after(today.getTime()) && 
                       event.getStartDate().before(weekEnd.getTime());
            case "month":
                return today.get(Calendar.MONTH) == eventCal.get(Calendar.MONTH) &&
                       today.get(Calendar.YEAR) == eventCal.get(Calendar.YEAR);
            default:
                return true;
        }
    }

    private boolean matchesTypeFilter(AgendaEvent event, String filter) {
        if (filter == null || "all".equals(filter)) return true;
        return filter.equals(event.getType());
    }

    private boolean isSameDay(Calendar cal1, Calendar cal2) {
        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
               cal1.get(Calendar.MONTH) == cal2.get(Calendar.MONTH) &&
               cal1.get(Calendar.DAY_OF_MONTH) == cal2.get(Calendar.DAY_OF_MONTH);
    }

    private void updateStats(List<AgendaEvent> events) {
        if (events.isEmpty()) {
            statsLiveData.setValue(new AgendaStats(0, 0, 0, 0));
            return;
        }

        long scheduled = events.stream().filter(e -> "scheduled".equals(e.getStatus())).count();
        long completed = events.stream().filter(e -> "completed".equals(e.getStatus())).count();
        long cancelled = events.stream().filter(e -> "cancelled".equals(e.getStatus())).count();
        long overdue = events.stream().filter(AgendaEvent::isOverdue).count();

        statsLiveData.postValue(new AgendaStats((int)scheduled, (int)completed, (int)cancelled, (int)overdue));
    }
    
    private void updateStatsAsync(List<AgendaEvent> events) {
        if (events.isEmpty()) {
            statsLiveData.postValue(new AgendaStats(0, 0, 0, 0));
            return;
        }

        long scheduled = events.stream().filter(e -> "scheduled".equals(e.getStatus())).count();
        long completed = events.stream().filter(e -> "completed".equals(e.getStatus())).count();
        long cancelled = events.stream().filter(e -> "cancelled".equals(e.getStatus())).count();
        long overdue = events.stream().filter(AgendaEvent::isOverdue).count();

        statsLiveData.postValue(new AgendaStats((int)scheduled, (int)completed, (int)cancelled, (int)overdue));
    }

    private List<AgendaEvent> generateSampleEvents() {
        List<AgendaEvent> events = new ArrayList<>();
        
        // Crear algunos eventos de ejemplo
        Calendar cal = Calendar.getInstance();
        
        // Evento de hoy - mañana
        cal.set(Calendar.HOUR_OF_DAY, 9);
        cal.set(Calendar.MINUTE, 30);
        AgendaEvent event1 = new AgendaEvent();
        event1.setId(1);
        event1.setTitle("Reunión con cliente");
        event1.setDescription("Presentación de nueva línea de electrodomésticos");
        event1.setStartDate(cal.getTime());
        cal.add(Calendar.HOUR_OF_DAY, 2);
        event1.setEndDate(cal.getTime());
        event1.setType("meeting");
        event1.setStatus("scheduled");
        event1.setPriority("high");
        event1.setLocation("Oficina central");
        event1.setClientId(1);
        event1.setUserId(1);
        
        // Crear cliente de ejemplo
        Client client1 = new Client();
        client1.setId(1);
        client1.setName("María González");
        client1.setFirstName("María");
        client1.setLastName("González");
        event1.setClient(client1);
        
        events.add(event1);
        
        // Evento de hoy - tarde
        cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 14);
        cal.set(Calendar.MINUTE, 0);
        AgendaEvent event2 = new AgendaEvent();
        event2.setId(2);
        event2.setTitle("Seguimiento de cotización");
        event2.setDescription("Revisar propuesta enviada la semana pasada");
        event2.setStartDate(cal.getTime());
        cal.add(Calendar.HOUR_OF_DAY, 1);
        event2.setEndDate(cal.getTime());
        event2.setType("follow_up");
        event2.setStatus("scheduled");
        event2.setPriority("medium");
        event2.setClientId(2);
        event2.setUserId(1);
        
        Client client2 = new Client();
        client2.setId(2);
        client2.setName("Carlos Ruiz");
        client2.setFirstName("Carlos");
        client2.setLastName("Ruiz");
        event2.setClient(client2);
        
        events.add(event2);
        
        // Evento completado de ayer
        cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, -1);
        cal.set(Calendar.HOUR_OF_DAY, 11);
        cal.set(Calendar.MINUTE, 0);
        AgendaEvent event3 = new AgendaEvent();
        event3.setId(3);
        event3.setTitle("Llamada de seguimiento");
        event3.setDescription("Confirmar entrega de pedido");
        event3.setStartDate(cal.getTime());
        cal.add(Calendar.MINUTE, 30);
        event3.setEndDate(cal.getTime());
        event3.setType("call");
        event3.setStatus("completed");
        event3.setPriority("low");
        event3.setClientId(3);
        event3.setUserId(1);
        
        Client client3 = new Client();
        client3.setId(3);
        client3.setName("Ana López");
        client3.setFirstName("Ana");
        client3.setLastName("López");
        event3.setClient(client3);
        
        events.add(event3);
        
        return events;
    }

    // Clase para estadísticas de agenda
    public static class AgendaStats {
        public final int scheduled;
        public final int completed;
        public final int cancelled;
        public final int overdue;

        public AgendaStats(int scheduled, int completed, int cancelled, int overdue) {
            this.scheduled = scheduled;
            this.completed = completed;
            this.cancelled = cancelled;
            this.overdue = overdue;
        }
    }
}