package com.example.chancafe_q.ui.products;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Product;
import com.example.chancafe_q.viewmodel.ProductViewModel;

import java.util.List;

public class ProductSelectorActivity extends AppCompatActivity implements ProductSelectorAdapter.OnProductSelectListener {

    private ProductViewModel productViewModel;
    private ProductSelectorAdapter productAdapter;
    
    // UI Components
    private Toolbar toolbar;
    private EditText etSearch;
    private RecyclerView rvProducts;
    private ProgressBar progressBar;
    private LinearLayout layoutEmpty;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_product_selector);
        
        initializeViews();
        setupToolbar();
        setupRecyclerView();
        setupViewModel();
        setupListeners();
        
        // Cargar productos activos
        productViewModel.loadActiveProducts();
    }

    private void initializeViews() {
        toolbar = findViewById(R.id.toolbar);
        etSearch = findViewById(R.id.et_search);
        rvProducts = findViewById(R.id.rv_products);
        progressBar = findViewById(R.id.progress_bar);
        layoutEmpty = findViewById(R.id.layout_empty);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Seleccionar Producto");
        }
    }

    private void setupRecyclerView() {
        productAdapter = new ProductSelectorAdapter(this);
        productAdapter.setOnProductSelectListener(this);
        
        rvProducts.setLayoutManager(new LinearLayoutManager(this));
        rvProducts.setAdapter(productAdapter);
    }

    private void setupViewModel() {
        productViewModel = new ViewModelProvider(this).get(ProductViewModel.class);
        
        // Observar productos
        productViewModel.getProducts().observe(this, this::updateProductsList);
        
        // Observar loading
        productViewModel.getLoading().observe(this, this::showLoading);
        
        // Observar errores
        productViewModel.getError().observe(this, error -> {
            if (error != null && !error.isEmpty()) {
                // Si es error de sesión expirada, redirigir al login
                if (error.contains("Sesión expirada")) {
                    handleSessionExpired();
                } else {
                    showError(error);
                }
                productViewModel.clearMessages();
            }
        });
    }

    private void setupListeners() {
        // Búsqueda
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(Editable s) {
                productViewModel.setSearchQuery(s.toString().trim());
            }
        });
    }

    private void updateProductsList(List<Product> products) {
        if (products != null && !products.isEmpty()) {
            productAdapter.updateProducts(products);
            rvProducts.setVisibility(View.VISIBLE);
            layoutEmpty.setVisibility(View.GONE);
        } else {
            rvProducts.setVisibility(View.GONE);
            layoutEmpty.setVisibility(View.VISIBLE);
        }
    }

    private void showLoading(Boolean isLoading) {
        if (isLoading != null) {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
        }
    }

    private void showError(String message) {
        Toast.makeText(this, "Error: " + message, Toast.LENGTH_LONG).show();
    }

    private void handleSessionExpired() {
        Toast.makeText(this, "Sesión expirada. Por favor, inicia sesión nuevamente.", Toast.LENGTH_LONG).show();
        
        // Redirigir al login
        Intent loginIntent = new Intent(this, com.example.chancafe_q.ui.login.LoginActivity.class);
        loginIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(loginIntent);
        finish();
    }

    // Implementación de OnProductSelectListener

    @Override
    public void onProductSelected(Product product) {
        Intent resultIntent = new Intent();
        resultIntent.putExtra("selected_product_id", product.getId());
        resultIntent.putExtra("selected_product_name", product.getName());
        resultIntent.putExtra("selected_product_price", product.getPrice());
        resultIntent.putExtra("selected_product_description", product.getDescription());
        setResult(RESULT_OK, resultIntent);
        finish();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}