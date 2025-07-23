package com.example.chancafe_q.ui.agenda;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.AgendaEvent;
import com.example.chancafe_q.viewmodel.AgendaViewModel;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.Arrays;
import java.util.List;

public class AgendaActivity extends AppCompatActivity implements AgendaEventsAdapter.OnEventActionListener {

    private AgendaViewModel viewModel;
    private AgendaEventsAdapter adapter;
    
    // Views
    private Toolbar toolbar;
    private Spinner spinnerDateFilter;
    private Spinner spinnerTypeFilter;
    private FloatingActionButton fabAddEvent;
    private RecyclerView rvAgendaEvents;
    private LinearLayout layoutEmptyState;
    private ProgressBar pbLoading;
    
    // Summary views
    private TextView tvScheduledCount;
    private TextView tvCompletedCount;
    private TextView tvPendingCount;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_agenda);
        
        initViews();
        initViewModel();
        setupRecyclerView();
        setupSpinners();
        observeViewModel();
        
        // Cargar datos iniciales
        viewModel.loadEvents();
    }
    
    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        spinnerDateFilter = findViewById(R.id.spinner_date_filter);
        spinnerTypeFilter = findViewById(R.id.spinner_type_filter);
        fabAddEvent = findViewById(R.id.fab_add_event);
        rvAgendaEvents = findViewById(R.id.rv_agenda_events);
        layoutEmptyState = findViewById(R.id.layout_empty_state);
        pbLoading = findViewById(R.id.pb_loading);
        
        tvScheduledCount = findViewById(R.id.tv_scheduled_count);
        tvCompletedCount = findViewById(R.id.tv_completed_count);
        tvPendingCount = findViewById(R.id.tv_pending_count);
        
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
        
        fabAddEvent.setOnClickListener(v -> showAddEventDialog());
    }
    
    private void initViewModel() {
        viewModel = new ViewModelProvider(this).get(AgendaViewModel.class);
    }
    
    private void setupRecyclerView() {
        adapter = new AgendaEventsAdapter(this, this);
        rvAgendaEvents.setLayoutManager(new LinearLayoutManager(this));
        rvAgendaEvents.setAdapter(adapter);
    }
    
    private void setupSpinners() {
        // Configurar filtro de fecha
        List<String> dateOptions = Arrays.asList(
            "Hoy", "Mañana", "Esta semana", "Este mes", "Todos"
        );
        ArrayAdapter<String> dateAdapter = new ArrayAdapter<>(this, 
            android.R.layout.simple_spinner_item, dateOptions);
        dateAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerDateFilter.setAdapter(dateAdapter);
        
        // Configurar filtro de tipo
        List<String> typeOptions = Arrays.asList(
            "Todos", "Reuniones", "Llamadas", "Visitas", "Seguimientos", "Presentaciones"
        );
        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(this, 
            android.R.layout.simple_spinner_item, typeOptions);
        typeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerTypeFilter.setAdapter(typeAdapter);
        
        // Configurar listeners
        spinnerDateFilter.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String[] filters = {"today", "tomorrow", "week", "month", "all"};
                viewModel.setDateFilter(filters[position]);
            }
            
            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
        
        spinnerTypeFilter.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String[] filters = {"all", "meeting", "call", "visit", "follow_up", "presentation"};
                viewModel.setTypeFilter(filters[position]);
            }
            
            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }
    
    private void observeViewModel() {
        viewModel.getEvents().observe(this, events -> {
            if (events != null) {
                adapter.setEvents(events);
                
                if (events.isEmpty()) {
                    layoutEmptyState.setVisibility(View.VISIBLE);
                    rvAgendaEvents.setVisibility(View.GONE);
                } else {
                    layoutEmptyState.setVisibility(View.GONE);
                    rvAgendaEvents.setVisibility(View.VISIBLE);
                }
            }
        });
        
        viewModel.getIsLoading().observe(this, isLoading -> {
            if (isLoading != null) {
                pbLoading.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            }
        });
        
        viewModel.getErrorMessage().observe(this, errorMessage -> {
            if (errorMessage != null && !errorMessage.isEmpty()) {
                Toast.makeText(this, errorMessage, Toast.LENGTH_LONG).show();
            }
        });
        
        viewModel.getStats().observe(this, stats -> {
            if (stats != null) {
                tvScheduledCount.setText(String.valueOf(stats.scheduled));
                tvCompletedCount.setText(String.valueOf(stats.completed));
                tvPendingCount.setText(String.valueOf(stats.overdue));
            }
        });
    }
    
    private void showAddEventDialog() {
        // Mostrar diálogo simple por ahora
        new AlertDialog.Builder(this)
            .setTitle("Nuevo Evento")
            .setMessage("La funcionalidad para agregar eventos estará disponible en la próxima versión.")
            .setPositiveButton("OK", null)
            .show();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
    
    // Implementación de OnEventActionListener
    @Override
    public void onEventClick(AgendaEvent event) {
        Toast.makeText(this, "Evento: " + event.getTitle(), Toast.LENGTH_SHORT).show();
    }
    
    @Override
    public void onEventEdit(AgendaEvent event) {
        Toast.makeText(this, "Editar: " + event.getTitle(), Toast.LENGTH_SHORT).show();
    }
    
    @Override
    public void onEventDelete(AgendaEvent event) {
        new AlertDialog.Builder(this)
            .setTitle("Eliminar Evento")
            .setMessage("¿Estás seguro de que deseas eliminar este evento?")
            .setPositiveButton("Eliminar", (dialog, which) -> {
                viewModel.deleteEvent(event.getId());
                Toast.makeText(this, "Evento eliminado", Toast.LENGTH_SHORT).show();
            })
            .setNegativeButton("Cancelar", null)
            .show();
    }
    
    @Override
    public void onEventComplete(AgendaEvent event) {
        viewModel.completeEvent(event.getId());
        Toast.makeText(this, "Evento marcado como completado", Toast.LENGTH_SHORT).show();
    }
    
    @Override
    public void onEventReschedule(AgendaEvent event) {
        Toast.makeText(this, "Reprogramar: " + event.getTitle(), Toast.LENGTH_SHORT).show();
    }
}
