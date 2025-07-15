package com.example.chancafe_q.ui.products;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SwitchCompat;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Category;
import com.example.chancafe_q.model.Product;
import com.example.chancafe_q.model.Supplier;
import com.example.chancafe_q.viewmodel.ProductViewModel;

import java.util.ArrayList;
import java.util.List;

/**
 * Activity para crear y editar productos
 */
public class AddEditProductActivity extends AppCompatActivity {

    private ProductViewModel productViewModel;
    private EditText etProductName;
    private EditText etProductDescription;
    private EditText etProductBrand;
    private EditText etProductSku;
    private EditText etProductBarcode;
    private EditText etProductPrice;
    private EditText etProductStock;
    private EditText etProductMinStock;
    private EditText etProductMaxStock;
    private EditText etProductNotes;
    private Spinner spinnerCategory;
    private Spinner spinnerSupplier;
    private Spinner spinnerStatus;
    private SwitchCompat switchFeatured;
    private Button btnCancel;
    private Button btnSave;
    private FrameLayout loadingOverlay;

    // Variables para el modo de edición
    private boolean isEditMode = false;
    private boolean isViewMode = false;
    private int productId = -1;
    private Product currentProduct;

    // Listas para los spinners
    private List<Category> categories = new ArrayList<>();
    private List<Supplier> suppliers = new ArrayList<>();
    private ArrayAdapter<Category> categoryAdapter;
    private ArrayAdapter<Supplier> supplierAdapter;
    private ArrayAdapter<String> statusAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_edit_product);

        initViews();
        setupToolbar();
        setupSpinners();
        setupViewModel();
        setupListeners();
        
        // Determinar el modo de la actividad
        checkActivityMode();
        
        // Cargar datos necesarios
        loadInitialData();
    }

    private void initViews() {
        etProductName = findViewById(R.id.et_product_name);
        etProductDescription = findViewById(R.id.et_product_description);
        etProductBrand = findViewById(R.id.et_product_brand);
        etProductSku = findViewById(R.id.et_product_sku);
        etProductBarcode = findViewById(R.id.et_product_barcode);
        etProductPrice = findViewById(R.id.et_product_price);
        etProductStock = findViewById(R.id.et_product_stock);
        etProductMinStock = findViewById(R.id.et_product_min_stock);
        etProductMaxStock = findViewById(R.id.et_product_max_stock);
        etProductNotes = findViewById(R.id.et_product_notes);
        spinnerCategory = findViewById(R.id.spinner_category);
        spinnerSupplier = findViewById(R.id.spinner_supplier);
        spinnerStatus = findViewById(R.id.spinner_status);
        switchFeatured = findViewById(R.id.switch_featured);
        btnCancel = findViewById(R.id.btn_cancel);
        btnSave = findViewById(R.id.btn_save);
        loadingOverlay = findViewById(R.id.loading_overlay);
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }

    private void setupSpinners() {
        // Adapter para categorías
        categoryAdapter = new ArrayAdapter<Category>(this, android.R.layout.simple_spinner_item, categories) {
            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                TextView textView = (TextView) super.getView(position, convertView, parent);
                textView.setText(categories.get(position).getName());
                return textView;
            }
            
            @Override
            public View getDropDownView(int position, View convertView, ViewGroup parent) {
                TextView textView = (TextView) super.getDropDownView(position, convertView, parent);
                textView.setText(categories.get(position).getName());
                return textView;
            }
        };
        categoryAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerCategory.setAdapter(categoryAdapter);

        // Adapter para proveedores
        supplierAdapter = new ArrayAdapter<Supplier>(this, android.R.layout.simple_spinner_item, suppliers) {
            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                TextView textView = (TextView) super.getView(position, convertView, parent);
                textView.setText(suppliers.get(position).getName());
                return textView;
            }
            
            @Override
            public View getDropDownView(int position, View convertView, ViewGroup parent) {
                TextView textView = (TextView) super.getDropDownView(position, convertView, parent);
                textView.setText(suppliers.get(position).getName());
                return textView;
            }
        };
        supplierAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerSupplier.setAdapter(supplierAdapter);

        // Adapter para estados
        String[] statusOptions = {"Activo", "Inactivo", "Descontinuado"};
        statusAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, statusOptions);
        statusAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerStatus.setAdapter(statusAdapter);
    }

    private void setupViewModel() {
        productViewModel = new ViewModelProvider(this).get(ProductViewModel.class);

        // Observar categorías
        productViewModel.getCategories().observe(this, categoryList -> {
            if (categoryList != null) {
                categories.clear();
                categories.addAll(categoryList);
                categoryAdapter.notifyDataSetChanged();
                
                // Si estamos en modo edición, seleccionar la categoría actual
                if (isEditMode && currentProduct != null) {
                    selectCategoryInSpinner(currentProduct.getCategoryId());
                }
            }
        });

        // Observar proveedores
        productViewModel.getSuppliers().observe(this, supplierList -> {
            if (supplierList != null) {
                suppliers.clear();
                suppliers.addAll(supplierList);
                supplierAdapter.notifyDataSetChanged();
                
                // Si estamos en modo edición, seleccionar el proveedor actual
                if (isEditMode && currentProduct != null) {
                    selectSupplierInSpinner(currentProduct.getSupplierId());
                }
            }
        });

        // Observar producto individual (para modo edición)
        productViewModel.getProduct().observe(this, product -> {
            if (product != null) {
                currentProduct = product;
                populateFields(product);
            }
        });

        // Observar estado de carga
        productViewModel.getLoading().observe(this, isLoading -> {
            if (isLoading != null) {
                loadingOverlay.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            }
        });

        // Observar errores
        productViewModel.getError().observe(this, error -> {
            if (error != null && !error.isEmpty()) {
                Toast.makeText(this, error, Toast.LENGTH_LONG).show();
                productViewModel.clearMessages();
            }
        });

        // Observar éxito
        productViewModel.getSuccess().observe(this, success -> {
            if (success != null && !success.isEmpty()) {
                Toast.makeText(this, success, Toast.LENGTH_SHORT).show();
                productViewModel.clearMessages();
                finish(); // Cerrar la actividad después de guardar
            }
        });
    }

    private void setupListeners() {
        btnCancel.setOnClickListener(v -> finish());
        
        btnSave.setOnClickListener(v -> {
            if (validateFields()) {
                saveProduct();
            }
        });
    }

    private void checkActivityMode() {
        // Obtener datos del intent
        productId = getIntent().getIntExtra("product_id", -1);
        String mode = getIntent().getStringExtra("mode");

        if (productId != -1 && mode != null) {
            switch (mode) {
                case "edit":
                    isEditMode = true;
                    isViewMode = false;
                    setupEditMode();
                    break;
                case "view":
                    isEditMode = false;
                    isViewMode = true;
                    setupViewMode();
                    break;
            }
        } else {
            // Modo crear
            isEditMode = false;
            isViewMode = false;
            setupCreateMode();
        }
    }

    private void setupCreateMode() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Nuevo Producto");
        }
        btnSave.setText("Crear Producto");
    }

    private void setupEditMode() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Editar Producto");
        }
        btnSave.setText("Actualizar Producto");
    }

    private void setupViewMode() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Detalles del Producto");
        }
        
        // Deshabilitar todos los campos
        setFieldsEnabled(false);
        btnSave.setVisibility(View.GONE);
        btnCancel.setText("Cerrar");
    }

    private void setFieldsEnabled(boolean enabled) {
        etProductName.setEnabled(enabled);
        etProductDescription.setEnabled(enabled);
        etProductBrand.setEnabled(enabled);
        etProductSku.setEnabled(enabled);
        etProductBarcode.setEnabled(enabled);
        etProductPrice.setEnabled(enabled);
        etProductStock.setEnabled(enabled);
        etProductMinStock.setEnabled(enabled);
        etProductMaxStock.setEnabled(enabled);
        etProductNotes.setEnabled(enabled);
        spinnerCategory.setEnabled(enabled);
        spinnerSupplier.setEnabled(enabled);
        spinnerStatus.setEnabled(enabled);
        switchFeatured.setEnabled(enabled);
    }

    private void loadInitialData() {
        productViewModel.loadCategories();
        productViewModel.loadSuppliers();
        
        // Si estamos en modo edición o vista, cargar el producto
        if (productId != -1) {
            productViewModel.loadProductById(productId);
        }
    }

    private void populateFields(Product product) {
        etProductName.setText(product.getName());
        etProductDescription.setText(product.getDescription());
        etProductBrand.setText(product.getBrand());
        etProductSku.setText(product.getSku());
        etProductBarcode.setText(product.getBarcode());
        etProductPrice.setText(String.valueOf(product.getPrice()));
        etProductStock.setText(String.valueOf(product.getStock()));
        
        if (product.getMinStock() != null) {
            etProductMinStock.setText(String.valueOf(product.getMinStock()));
        }
        if (product.getMaxStock() != null) {
            etProductMaxStock.setText(String.valueOf(product.getMaxStock()));
        }
        
        etProductNotes.setText(product.getNotes());
        
        // Seleccionar estado en el spinner
        selectStatusInSpinner(product.getStatus());
        
        // Configurar switch de destacado
        switchFeatured.setChecked(product.isFeatured());
        
        // Las categorías y proveedores se seleccionan en sus respectivos observers
    }

    private void selectCategoryInSpinner(int categoryId) {
        for (int i = 0; i < categories.size(); i++) {
            if (categories.get(i).getId() == categoryId) {
                spinnerCategory.setSelection(i);
                break;
            }
        }
    }

    private void selectSupplierInSpinner(int supplierId) {
        for (int i = 0; i < suppliers.size(); i++) {
            if (suppliers.get(i).getId() == supplierId) {
                spinnerSupplier.setSelection(i);
                break;
            }
        }
    }

    private void selectStatusInSpinner(String status) {
        String[] statusValues = {"active", "inactive", "discontinued"};
        for (int i = 0; i < statusValues.length; i++) {
            if (statusValues[i].equals(status)) {
                spinnerStatus.setSelection(i);
                break;
            }
        }
    }

    private boolean validateFields() {
        // Validar nombre
        if (etProductName.getText().toString().trim().isEmpty()) {
            etProductName.setError("El nombre es requerido");
            etProductName.requestFocus();
            return false;
        }

        // Validar descripción
        if (etProductDescription.getText().toString().trim().isEmpty()) {
            etProductDescription.setError("La descripción es requerida");
            etProductDescription.requestFocus();
            return false;
        }

        // Validar marca
        if (etProductBrand.getText().toString().trim().isEmpty()) {
            etProductBrand.setError("La marca es requerida");
            etProductBrand.requestFocus();
            return false;
        }

        // Validar SKU
        if (etProductSku.getText().toString().trim().isEmpty()) {
            etProductSku.setError("El SKU es requerido");
            etProductSku.requestFocus();
            return false;
        }

        // Validar precio
        try {
            double price = Double.parseDouble(etProductPrice.getText().toString());
            if (price <= 0) {
                etProductPrice.setError("El precio debe ser mayor a 0");
                etProductPrice.requestFocus();
                return false;
            }
        } catch (NumberFormatException e) {
            etProductPrice.setError("Precio inválido");
            etProductPrice.requestFocus();
            return false;
        }

        // Validar stock
        try {
            int stock = Integer.parseInt(etProductStock.getText().toString());
            if (stock < 0) {
                etProductStock.setError("El stock no puede ser negativo");
                etProductStock.requestFocus();
                return false;
            }
        } catch (NumberFormatException e) {
            etProductStock.setError("Stock inválido");
            etProductStock.requestFocus();
            return false;
        }

        // Validar categoría
        if (spinnerCategory.getSelectedItemPosition() == -1 || categories.isEmpty()) {
            Toast.makeText(this, "Debe seleccionar una categoría", Toast.LENGTH_SHORT).show();
            return false;
        }

        // Validar proveedor
        if (spinnerSupplier.getSelectedItemPosition() == -1 || suppliers.isEmpty()) {
            Toast.makeText(this, "Debe seleccionar un proveedor", Toast.LENGTH_SHORT).show();
            return false;
        }

        return true;
    }

    private void saveProduct() {
        Product product = new Product();
        
        // Llenar los datos del producto
        product.setName(etProductName.getText().toString().trim());
        product.setDescription(etProductDescription.getText().toString().trim());
        product.setBrand(etProductBrand.getText().toString().trim());
        product.setSku(etProductSku.getText().toString().trim());
        product.setBarcode(etProductBarcode.getText().toString().trim());
        product.setPrice(Double.parseDouble(etProductPrice.getText().toString()));
        product.setStock(Integer.parseInt(etProductStock.getText().toString()));
        
        // Stock mínimo y máximo (opcionales)
        if (!etProductMinStock.getText().toString().trim().isEmpty()) {
            product.setMinStock(Integer.parseInt(etProductMinStock.getText().toString()));
        }
        if (!etProductMaxStock.getText().toString().trim().isEmpty()) {
            product.setMaxStock(Integer.parseInt(etProductMaxStock.getText().toString()));
        }
        
        product.setNotes(etProductNotes.getText().toString().trim());
        
        // Categoría seleccionada
        if (spinnerCategory.getSelectedItemPosition() != -1) {
            Category selectedCategory = categories.get(spinnerCategory.getSelectedItemPosition());
            product.setCategoryId(selectedCategory.getId());
        }
        
        // Proveedor seleccionado
        if (spinnerSupplier.getSelectedItemPosition() != -1) {
            Supplier selectedSupplier = suppliers.get(spinnerSupplier.getSelectedItemPosition());
            product.setSupplierId(selectedSupplier.getId());
        }
        
        // Estado seleccionado
        String[] statusValues = {"active", "inactive", "discontinued"};
        product.setStatus(statusValues[spinnerStatus.getSelectedItemPosition()]);
        
        // Producto destacado
        product.setFeatured(switchFeatured.isChecked());
        
        // Guardar o actualizar
        if (isEditMode) {
            productViewModel.updateProduct(productId, product);
        } else {
            productViewModel.createProduct(product);
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}