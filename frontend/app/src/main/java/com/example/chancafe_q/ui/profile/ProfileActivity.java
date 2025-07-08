package com.example.chancafe_q.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.User;
import com.example.chancafe_q.ui.login.LoginActivity;
import com.example.chancafe_q.viewmodel.ProfileViewModel;

public class ProfileActivity extends AppCompatActivity {

    private ProfileViewModel profileViewModel;
    
    // Views
    private Toolbar toolbar;
    private TextView tvUserName;
    private TextView tvUserEmail;
    private TextView tvUserRole;
    private Button btnLogout;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);
        
        initViews();
        initViewModel();
        setupObservers();
        setupClickListeners();
        
        // Cargar perfil del usuario
        profileViewModel.loadUserProfile();
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        tvUserName = findViewById(R.id.tv_user_name);
        tvUserEmail = findViewById(R.id.tv_user_email);
        tvUserRole = findViewById(R.id.tv_user_role);
        btnLogout = findViewById(R.id.btn_logout);
        progressBar = findViewById(R.id.progress_bar);

        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Mi Perfil");
        }
    }

    private void initViewModel() {
        profileViewModel = new ViewModelProvider(this).get(ProfileViewModel.class);
    }

    private void setupObservers() {
        // Observar loading state
        profileViewModel.getIsLoading().observe(this, isLoading -> {
            if (isLoading != null) {
                progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
                btnLogout.setEnabled(!isLoading);
            }
        });

        // Observar mensajes de error
        profileViewModel.getErrorMessage().observe(this, errorMessage -> {
            if (errorMessage != null && !errorMessage.isEmpty()) {
                Toast.makeText(this, errorMessage, Toast.LENGTH_LONG).show();
                profileViewModel.clearMessages();
            }
        });

        // Observar mensajes de éxito
        profileViewModel.getSuccessMessage().observe(this, successMessage -> {
            if (successMessage != null && !successMessage.isEmpty()) {
                Toast.makeText(this, successMessage, Toast.LENGTH_SHORT).show();
                profileViewModel.clearMessages();
            }
        });

        // Observar datos del usuario
        profileViewModel.getCurrentUser().observe(this, user -> {
            if (user != null) {
                updateUserUI(user);
            }
        });
    }

    private void setupClickListeners() {
        // Botón cerrar sesión
        btnLogout.setOnClickListener(v -> showLogoutDialog());

        // Navegación back
        toolbar.setNavigationOnClickListener(v -> onBackPressed());

        // Click en opciones (temporalmente mostrar mensaje)
        findViewById(R.id.layout_change_password).setOnClickListener(v -> 
            Toast.makeText(this, "Cambiar contraseña - En desarrollo", Toast.LENGTH_SHORT).show());

        findViewById(R.id.layout_notifications).setOnClickListener(v -> 
            Toast.makeText(this, "Notificaciones - En desarrollo", Toast.LENGTH_SHORT).show());
    }

    /**
     * Actualiza la UI con los datos reales del usuario
     */
    private void updateUserUI(User user) {
        // Nombre completo del usuario
        if (user.getFullName() != null && !user.getFullName().trim().isEmpty()) {
            tvUserName.setText(user.getFullName());
        } else if (user.getFirstName() != null) {
            String name = user.getFirstName();
            if (user.getLastName() != null) {
                name += " " + user.getLastName();
            }
            tvUserName.setText(name);
        } else {
            tvUserName.setText("Usuario");
        }

        // Email del usuario
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            tvUserEmail.setText(user.getEmail());
        } else {
            tvUserEmail.setText("Email no disponible");
        }

        // Rol del usuario (usando el display name)
        if (user.getRoleDisplayName() != null) {
            tvUserRole.setText(user.getRoleDisplayName());
        } else {
            tvUserRole.setText("Rol no definido");
        }
    }

    private void showLogoutDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Cerrar Sesión")
                .setMessage("¿Estás seguro que deseas cerrar sesión?")
                .setPositiveButton("Cerrar Sesión", (dialog, which) -> {
                    performLogout();
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    private void performLogout() {
        profileViewModel.logout().observe(this, response -> {
            if (response != null) {
                // Independientemente del resultado, navegar al login
                navigateToLogin();
            }
        });
    }

    private void navigateToLogin() {
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
