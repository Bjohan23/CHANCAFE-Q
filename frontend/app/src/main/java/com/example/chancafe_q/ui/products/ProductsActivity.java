package com.example.chancafe_q.ui.products;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Product;
import com.example.chancafe_q.viewmodel.ProductViewModel;
import com.google.android.material.chip.Chip;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.List;

/**
 * Activity para gestión de productos
 */
public class ProductsActivity extends AppCompatActivity implements ProductsAdapter.OnProductClickListener {

    private ProductViewModel productViewModel;
    private ProductsAdapter productsAdapter;
    private RecyclerView recyclerView;
    private EditText etSearch;
    private LinearLayout loadingLayout;
    private LinearLayout errorLayout;
    private LinearLayout emptyLayout;
    private TextView tvErrorMessage;
    private Button btnRetry;
    private FloatingActionButton fabAddProduct;
    private ImageView ivFilter;
    
    // Chips de filtros
    private Chip chipAll;
    private Chip chipFeatured;
    private Chip chipLowStock;
    private Chip chipOutOfStock;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_products);
        
        initViews();
        setupToolbar();
        setupRecyclerView();
        setupViewModel();
        setupListeners();
        
        // Cargar datos iniciales
        productViewModel.loadProducts();
        productViewModel.loadCategories();
        productViewModel.loadSuppliers();
    }

    private void initViews() {
        recyclerView = findViewById(R.id.rv_products);
        etSearch = findViewById(R.id.et_search);
        loadingLayout = findViewById(R.id.loading_layout);
        errorLayout = findViewById(R.id.error_layout);
        emptyLayout = findViewById(R.id.empty_layout);
        tvErrorMessage = findViewById(R.id.tv_error_message);
        btnRetry = findViewById(R.id.btn_retry);
        fabAddProduct = findViewById(R.id.fab_add_product);
        ivFilter = findViewById(R.id.iv_filter);
        
        chipAll = findViewById(R.id.chip_all);
        chipFeatured = findViewById(R.id.chip_featured);
        chipLowStock = findViewById(R.id.chip_low_stock);
        chipOutOfStock = findViewById(R.id.chip_out_of_stock);
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Productos");
        }
    }

    private void setupRecyclerView() {
        productsAdapter = new ProductsAdapter(this, this);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(productsAdapter);
    }

    private void setupViewModel() {
        productViewModel = new ViewModelProvider(this).get(ProductViewModel.class);
        
        // Observar productos
        productViewModel.getProducts().observe(this, products -> {
            if (products != null) {
                productsAdapter.setProducts(products);
                updateUI(products);
            }
        });

        // Observar estado de carga
        productViewModel.getLoading().observe(this, isLoading -> {
            if (isLoading != null) {
                showLoading(isLoading);
            }
        });

        // Observar errores
        productViewModel.getError().observe(this, error -> {
            if (error != null && !error.isEmpty()) {
                showError(error);
            }
        });

        // Observar mensajes de éxito
        productViewModel.getSuccess().observe(this, success -> {
            if (success != null && !success.isEmpty()) {
                Toast.makeText(this, success, Toast.LENGTH_SHORT).show();
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
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                productViewModel.setSearchQuery(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Botón de filtro
        ivFilter.setOnClickListener(v -> showFilterDialog());

        // Botón agregar producto
        fabAddProduct.setOnClickListener(v -> {
            Intent intent = new Intent(this, AddEditProductActivity.class);
            startActivity(intent);
        });

        // Botón reintentar
        btnRetry.setOnClickListener(v -> {
            productViewModel.refresh();
        });

        // Chips de filtros rápidos
        chipAll.setOnClickListener(v -> {
            clearChipSelection();
            chipAll.setChecked(true);
            productViewModel.applyQuickFilter("all");
        });

        chipFeatured.setOnClickListener(v -> {
            clearChipSelection();
            chipFeatured.setChecked(true);
            productViewModel.applyQuickFilter("featured");
        });

        chipLowStock.setOnClickListener(v -> {
            clearChipSelection();
            chipLowStock.setChecked(true);
            productViewModel.applyQuickFilter("low_stock");
        });

        chipOutOfStock.setOnClickListener(v -> {
            clearChipSelection();
            chipOutOfStock.setChecked(true);
            productViewModel.applyQuickFilter("out_of_stock");
        });
    }

    private void clearChipSelection() {
        chipAll.setChecked(false);
        chipFeatured.setChecked(false);
        chipLowStock.setChecked(false);
        chipOutOfStock.setChecked(false);
    }

    private void showFilterDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Filtrar productos");
        
        String[] options = {"Todos", "Activos", "Inactivos", "Descontinuados", "Poco Stock", "Sin Stock"};
        builder.setItems(options, (dialog, which) -> {
            switch (which) {
                case 0:
                    productViewModel.clearFilters();
                    break;
                case 1:
                    productViewModel.setFilterStatus("active");
                    break;
                case 2:
                    productViewModel.setFilterStatus("inactive");
                    break;
                case 3:
                    productViewModel.setFilterStatus("discontinued");
                    break;
                case 4:
                    productViewModel.loadLowStockProducts();
                    break;
                case 5:
                    productViewModel.loadOutOfStockProducts();
                    break;
            }
        });
        
        builder.show();
    }

    private void showLoading(boolean isLoading) {
        if (isLoading) {
            loadingLayout.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
            errorLayout.setVisibility(View.GONE);
            emptyLayout.setVisibility(View.GONE);
        } else {
            loadingLayout.setVisibility(View.GONE);
        }
    }

    private void showError(String error) {
        tvErrorMessage.setText(error);
        errorLayout.setVisibility(View.VISIBLE);
        recyclerView.setVisibility(View.GONE);
        loadingLayout.setVisibility(View.GONE);
        emptyLayout.setVisibility(View.GONE);
        productViewModel.clearMessages();
    }

    private void updateUI(List<Product> products) {
        if (products.isEmpty()) {
            emptyLayout.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
            errorLayout.setVisibility(View.GONE);
        } else {
            recyclerView.setVisibility(View.VISIBLE);
            emptyLayout.setVisibility(View.GONE);
            errorLayout.setVisibility(View.GONE);
        }
        loadingLayout.setVisibility(View.GONE);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_products, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        
        if (id == R.id.action_refresh) {
            productViewModel.refresh();
            return true;
        } else if (id == R.id.action_filter) {
            showFilterDialog();
            return true;
        } else if (id == R.id.action_stats) {
            // TODO: Mostrar estadísticas
            Toast.makeText(this, "Estadísticas en desarrollo", Toast.LENGTH_SHORT).show();
            return true;
        }
        
        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }

    // Implementación de ProductsAdapter.OnProductClickListener
    @Override
    public void onProductClick(Product product) {
        Intent intent = new Intent(this, AddEditProductActivity.class);
        intent.putExtra("product_id", product.getId());
        intent.putExtra("mode", "view");
        startActivity(intent);
    }

    @Override
    public void onProductLongClick(Product product) {
        showProductOptionsDialog(product);
    }

    @Override
    public void onEditClick(Product product) {
        Intent intent = new Intent(this, AddEditProductActivity.class);
        intent.putExtra("product_id", product.getId());
        intent.putExtra("mode", "edit");
        startActivity(intent);
    }

    @Override
    public void onDeleteClick(Product product) {
        new AlertDialog.Builder(this)
                .setTitle("Confirmar eliminación")
                .setMessage("¿Estás seguro de que deseas eliminar el producto '" + product.getName() + "'?")
                .setPositiveButton("Eliminar", (dialog, which) -> {
                    productViewModel.deleteProduct(product.getId());
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    @Override
    public void onStatusClick(Product product) {
        showChangeStatusDialog(product);
    }

    @Override
    public void onStockClick(Product product) {
        showUpdateStockDialog(product);
    }

    private void showProductOptionsDialog(Product product) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(product.getName());
        
        String[] options = {"Ver detalles", "Editar", "Cambiar estado", "Actualizar stock", "Eliminar"};
        builder.setItems(options, (dialog, which) -> {
            switch (which) {
                case 0:
                    onProductClick(product);
                    break;
                case 1:
                    onEditClick(product);
                    break;
                case 2:
                    onStatusClick(product);
                    break;
                case 3:
                    onStockClick(product);
                    break;
                case 4:
                    onDeleteClick(product);
                    break;
            }
        });
        
        builder.show();
    }

    private void showChangeStatusDialog(Product product) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Cambiar estado");
        
        String[] statuses = {"Activo", "Inactivo", "Descontinuado"};
        String[] statusValues = {"active", "inactive", "discontinued"};
        
        builder.setItems(statuses, (dialog, which) -> {
            productViewModel.changeProductStatus(product.getId(), statusValues[which]);
        });
        
        builder.show();
    }

    private void showUpdateStockDialog(Product product) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Actualizar stock");
        
        EditText editText = new EditText(this);
        editText.setHint("Cantidad de stock");
        editText.setText(String.valueOf(product.getStock()));
        builder.setView(editText);
        
        builder.setPositiveButton("Actualizar", (dialog, which) -> {
            try {
                int newStock = Integer.parseInt(editText.getText().toString());
                productViewModel.updateProductStock(product.getId(), newStock);
            } catch (NumberFormatException e) {
                Toast.makeText(this, "Por favor ingrese un número válido", Toast.LENGTH_SHORT).show();
            }
        });
        
        builder.setNegativeButton("Cancelar", null);
        builder.show();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Refrescar datos cuando se vuelve a la actividad
        productViewModel.loadProducts();
    }
}
