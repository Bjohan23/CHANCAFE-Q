package com.example.chancafe_q.ui.agenda;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.PopupMenu;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.AgendaEvent;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class AgendaEventsAdapter extends RecyclerView.Adapter<AgendaEventsAdapter.EventViewHolder> {

    private Context context;
    private List<AgendaEvent> events;
    private OnEventActionListener listener;
    
    private SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
    private SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());

    public interface OnEventActionListener {
        void onEventClick(AgendaEvent event);
        void onEventEdit(AgendaEvent event);
        void onEventDelete(AgendaEvent event);
        void onEventComplete(AgendaEvent event);
        void onEventReschedule(AgendaEvent event);
    }

    public AgendaEventsAdapter(Context context, OnEventActionListener listener) {
        this.context = context;
        this.events = new ArrayList<>();
        this.listener = listener;
    }

    @NonNull
    @Override
    public EventViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_agenda_event, parent, false);
        return new EventViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull EventViewHolder holder, int position) {
        AgendaEvent event = events.get(position);
        holder.bind(event);
    }

    @Override
    public int getItemCount() {
        return events.size();
    }

    public void setEvents(List<AgendaEvent> events) {
        this.events = events != null ? events : new ArrayList<>();
        notifyDataSetChanged();
    }

    public void addEvent(AgendaEvent event) {
        events.add(0, event);
        notifyItemInserted(0);
    }

    public void updateEvent(AgendaEvent updatedEvent) {
        for (int i = 0; i < events.size(); i++) {
            if (events.get(i).getId() == updatedEvent.getId()) {
                events.set(i, updatedEvent);
                notifyItemChanged(i);
                break;
            }
        }
    }

    public void removeEvent(int eventId) {
        for (int i = 0; i < events.size(); i++) {
            if (events.get(i).getId() == eventId) {
                events.remove(i);
                notifyItemRemoved(i);
                break;
            }
        }
    }

    class EventViewHolder extends RecyclerView.ViewHolder {
        
        private ImageView ivEventType;
        private View viewPriorityIndicator;
        private TextView tvEventTime;
        private TextView tvEventTitle;
        private TextView tvEventClient;
        private TextView tvEventDescription;
        private TextView tvEventStatus;
        private TextView tvEventDuration;
        private ImageView ivReminder;
        private ImageButton btnEventMenu;

        public EventViewHolder(@NonNull View itemView) {
            super(itemView);
            
            ivEventType = itemView.findViewById(R.id.iv_event_type);
            viewPriorityIndicator = itemView.findViewById(R.id.view_priority_indicator);
            tvEventTime = itemView.findViewById(R.id.tv_event_time);
            tvEventTitle = itemView.findViewById(R.id.tv_event_title);
            tvEventClient = itemView.findViewById(R.id.tv_event_client);
            tvEventDescription = itemView.findViewById(R.id.tv_event_description);
            tvEventStatus = itemView.findViewById(R.id.tv_event_status);
            tvEventDuration = itemView.findViewById(R.id.tv_event_duration);
            ivReminder = itemView.findViewById(R.id.iv_reminder);
            btnEventMenu = itemView.findViewById(R.id.btn_event_menu);

            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onEventClick(events.get(getAdapterPosition()));
                }
            });

            btnEventMenu.setOnClickListener(v -> showPopupMenu(v, events.get(getAdapterPosition())));
        }

        public void bind(AgendaEvent event) {
            android.util.Log.d("AgendaEventsAdapter", "=== BINDING AGENDA EVENT ===");
            android.util.Log.d("AgendaEventsAdapter", "Event ID: " + event.getId());
            android.util.Log.d("AgendaEventsAdapter", "Title: " + event.getTitle());
            android.util.Log.d("AgendaEventsAdapter", "Type: " + event.getType());
            android.util.Log.d("AgendaEventsAdapter", "Status: " + event.getStatus());
            android.util.Log.d("AgendaEventsAdapter", "Priority: " + event.getPriority());

            // Configurar icono de tipo de evento
            ivEventType.setImageResource(event.getTypeIcon());

            // Configurar indicador de prioridad
            int priorityColor = ContextCompat.getColor(context, event.getPriorityColor());
            viewPriorityIndicator.setBackgroundColor(priorityColor);

            // Configurar hora
            if (event.getStartDate() != null) {
                tvEventTime.setText(timeFormat.format(event.getStartDate()));
            } else {
                tvEventTime.setText("--:--");
            }

            // Configurar título
            tvEventTitle.setText(event.getTitle());

            // Configurar cliente
            if (event.getClient() != null) {
                tvEventClient.setText(event.getClient().getName());
                tvEventClient.setVisibility(View.VISIBLE);
            } else {
                tvEventClient.setVisibility(View.GONE);
            }

            // Configurar descripción
            if (event.getDescription() != null && !event.getDescription().trim().isEmpty()) {
                tvEventDescription.setText(event.getDescription());
                tvEventDescription.setVisibility(View.VISIBLE);
            } else {
                tvEventDescription.setVisibility(View.GONE);
            }

            // Configurar estado
            configureStatus(event);

            // Configurar duración
            String duration = event.getFormattedDuration();
            if (!duration.isEmpty()) {
                tvEventDuration.setText(duration);
                tvEventDuration.setVisibility(View.VISIBLE);
            } else {
                tvEventDuration.setVisibility(View.GONE);
            }

            // Configurar recordatorio
            if (event.getReminderTime() != null && !event.getReminderTime().isEmpty()) {
                ivReminder.setVisibility(View.VISIBLE);
            } else {
                ivReminder.setVisibility(View.GONE);
            }

            // Aplicar estilos según estado
            applyStateStyles(event);
        }

        private void configureStatus(AgendaEvent event) {
            String statusText;
            int statusBackground;
            
            switch (event.getStatus()) {
                case "scheduled":
                    statusText = "Programado";
                    statusBackground = R.drawable.bg_status_pending;
                    break;
                case "completed":
                    statusText = "Completado";
                    statusBackground = R.drawable.bg_status_approved;
                    break;
                case "cancelled":
                    statusText = "Cancelado";
                    statusBackground = R.drawable.bg_status_rejected;
                    break;
                case "rescheduled":
                    statusText = "Reprogramado";
                    statusBackground = R.drawable.bg_status_pending;
                    break;
                default:
                    statusText = "Desconocido";
                    statusBackground = R.drawable.bg_status_pending;
                    break;
            }
            
            tvEventStatus.setText(statusText);
            tvEventStatus.setBackgroundResource(statusBackground);
        }

        private void applyStateStyles(AgendaEvent event) {
            // Aplicar estilos diferentes según el estado del evento
            if (event.isOverdue()) {
                // Evento vencido - aplicar estilo de alerta
                itemView.setAlpha(0.7f);
                tvEventTitle.setTextColor(ContextCompat.getColor(context, android.R.color.holo_red_dark));
            } else if (event.isCompleted()) {
                // Evento completado - aplicar estilo deshabilitado
                itemView.setAlpha(0.8f);
                tvEventTitle.setTextColor(ContextCompat.getColor(context, R.color.text_secondary));
            } else {
                // Evento normal
                itemView.setAlpha(1.0f);
                tvEventTitle.setTextColor(ContextCompat.getColor(context, R.color.text_primary));
            }
        }

        private void showPopupMenu(View view, AgendaEvent event) {
            PopupMenu popup = new PopupMenu(context, view);
            popup.getMenuInflater().inflate(R.menu.menu_agenda_event_options, popup.getMenu());
            
            // Configurar visibilidad de opciones según el estado
            if (event.isCompleted()) {
                popup.getMenu().findItem(R.id.action_complete_event).setVisible(false);
            } else {
                popup.getMenu().findItem(R.id.action_complete_event).setVisible(true);
            }
            
            popup.setOnMenuItemClickListener(item -> {
                int itemId = item.getItemId();
                if (itemId == R.id.action_edit_event) {
                    if (listener != null) listener.onEventEdit(event);
                    return true;
                } else if (itemId == R.id.action_complete_event) {
                    if (listener != null) listener.onEventComplete(event);
                    return true;
                } else if (itemId == R.id.action_reschedule_event) {
                    if (listener != null) listener.onEventReschedule(event);
                    return true;
                } else if (itemId == R.id.action_delete_event) {
                    if (listener != null) listener.onEventDelete(event);
                    return true;
                }
                return false;
            });
            
            popup.show();
        }
    }
}