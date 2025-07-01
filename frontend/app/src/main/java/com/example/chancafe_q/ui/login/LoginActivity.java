package com.example.chancafe_q.ui.login;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.chancafe_q.R;
import com.example.chancafe_q.ui.dashboard.DashboardActivity;
import com.example.chancafe_q.viewmodel.LoginViewModel;

/**
 * Activity para la pantalla de Login
 * Implementa la interfaz de usuario y observa el ViewModel
 */
public class LoginActivity extends AppCompatActivity {

    private LoginViewModel loginViewModel;
    
    // Views
    private EditText etUser;
    private EditText etPassword;
    private Button btnLogin;
    private TextView tvForgotPassword;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Verificar si ya está autenticado
        if (isUserAlreadyLoggedIn()) {
            navigateToDashboard();
            return;
        }

        initViews();
        initViewModel();
        setupObservers();
        setupClickListeners();
    }

    /**
     * Verifica si el usuario ya está logueado
     */
    private boolean isUserAlreadyLoggedIn() {
        // TODO: Implementar verificación de sesión persistente
        return false;
    }

    /**
     * Inicializa las vistas
     */
    private void initViews() {
        etUser = findViewById(R.id.et_user);
        etPassword = findViewById(R.id.et_password);
        btnLogin = findViewById(R.id.btn_login);
        tvForgotPassword = findViewById(R.id.tv_forgot_password);
        
        // Crear ProgressBar programáticamente para mostrar loading
        progressBar = new ProgressBar(this);
        progressBar.setVisibility(View.GONE);
    }

    /**
     * Inicializa el ViewModel
     */
    private void initViewModel() {
        loginViewModel = new ViewModelProvider(this).get(LoginViewModel.class);
    }

    /**
     * Configura los observadores del ViewModel
     */
    private void setupObservers() {
        // Observar el resultado del login
        loginViewModel.getLoginResult().observe(this, response -> {
            if (response != null) {
                if (response.isSuccess() && response.getData() != null) {
                    // Login exitoso - navegar al Dashboard
                    navigateToDashboard();
                    
                    // Mostrar mensaje de bienvenida
                    if (response.getData().getUser() != null) {
                        String welcomeMessage = "Bienvenido, " + response.getData().getUser().getName();
                        Toast.makeText(this, welcomeMessage, Toast.LENGTH_SHORT).show();
                    }
                } else {
                    // Login fallido - mostrar error
                    String errorMessage = response.getMessage() != null ? 
                        response.getMessage() : "Error al iniciar sesión";
                    Toast.makeText(this, errorMessage, Toast.LENGTH_LONG).show();
                }
                // Limpiar el resultado para evitar reacciones múltiples
                loginViewModel.clearLoginResult();
            }
        });

        // Observar estado de carga
        loginViewModel.getIsLoading().observe(this, isLoading -> {
            if (isLoading != null) {
                btnLogin.setEnabled(!isLoading);
                if (isLoading) {
                    btnLogin.setText("Iniciando sesión...");
                } else {
                    btnLogin.setText("Iniciar Sesión");
                }
            }
        });

        // Observar errores de validación
        loginViewModel.getUserCodeError().observe(this, error -> {
            if (error != null) {
                etUser.setError(error);
            }
        });

        loginViewModel.getPasswordError().observe(this, error -> {
            if (error != null) {
                etPassword.setError(error);
            }
        });
    }

    /**
     * Configura los listeners de clics
     */
    private void setupClickListeners() {
        btnLogin.setOnClickListener(v -> {
            // Limpiar errores previos
            etUser.setError(null);
            etPassword.setError(null);
            
            // Obtener valores de los campos
            String userCode = etUser.getText().toString();
            String password = etPassword.getText().toString();
            
            // Llamar al ViewModel para hacer login
            loginViewModel.login(userCode, password);
        });

        tvForgotPassword.setOnClickListener(v -> {
            // TODO: Implementar funcionalidad de recuperar contraseña
            Toast.makeText(this, "Funcionalidad en desarrollo", Toast.LENGTH_SHORT).show();
        });
    }

    /**
     * Navega al Dashboard y pasa los datos del usuario
     */
    private void navigateToDashboard() {
        Intent intent = new Intent(LoginActivity.this, DashboardActivity.class);
        
        // Agregar datos del usuario si están disponibles
        if (loginViewModel.getCurrentUser() != null) {
            intent.putExtra("user_name", loginViewModel.getCurrentUser().getName());
            intent.putExtra("user_code", loginViewModel.getCurrentUser().getCode());
            intent.putExtra("user_role", loginViewModel.getCurrentUser().getRole());
            intent.putExtra("user_email", loginViewModel.getCurrentUser().getEmail());
        }
        
        startActivity(intent);
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Limpiar observadores si es necesario
        if (loginViewModel != null) {
            loginViewModel.clearErrors();
        }
    }
}
