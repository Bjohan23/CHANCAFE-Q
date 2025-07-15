package com.example.chancafe_q.ui.credit;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.chancafe_q.R;

public class CreditRequestDetailActivity extends AppCompatActivity {

    private int creditRequestId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_simple);
        
        // Get credit request ID from intent
        Intent intent = getIntent();
        creditRequestId = intent.getIntExtra("credit_request_id", -1);
        
        setupToolbar();
        
        // TODO: Implement full credit request detail view
        Toast.makeText(this, "Vista detallada de solicitud CR-" + creditRequestId + " - Próximamente", Toast.LENGTH_LONG).show();
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Detalle de Solicitud");
        }
        
        toolbar.setNavigationOnClickListener(v -> finish());
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}