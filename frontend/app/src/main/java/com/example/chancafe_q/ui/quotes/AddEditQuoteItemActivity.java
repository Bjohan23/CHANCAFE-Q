package com.example.chancafe_q.ui.quotes;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.chancafe_q.R;

public class AddEditQuoteItemActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_simple);
        
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            
            boolean isEditing = getIntent().getBooleanExtra("is_editing", false);
            getSupportActionBar().setTitle(isEditing ? "Editar Item" : "Agregar Item");
        }
        
        Toast.makeText(this, "Gestión de items de cotización - Próximamente", Toast.LENGTH_LONG).show();
        
        // TODO: Implementar interfaz completa para agregar/editar items
        // Por ahora, simular que se agregó un item
        finish();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}