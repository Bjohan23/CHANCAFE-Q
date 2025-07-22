package com.example.chancafe_q.ui.quotes;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Product;
import com.example.chancafe_q.model.QuoteItem;
import com.example.chancafe_q.ui.products.ProductSelectorActivity;
import com.google.android.material.textfield.TextInputEditText;

import java.util.Locale;

public class AddEditQuoteItemActivity extends AppCompatActivity {

    private TextView tvSelectedProduct;
    private ImageButton btnClearProduct;
    private TextInputEditText etDescription;
    private TextInputEditText etQuantity;
    private TextInputEditText etUnitPrice;
    private TextInputEditText etDiscount;
    private TextInputEditText etNotes;
    private TextView tvTotal;
    private Button btnCancel;
    private Button btnSave;
    
    private boolean isEditing = false;
    private int itemPosition = -1;
    private QuoteItem currentItem;
    private Product selectedProduct;
    
    // Constants
    private static final int REQUEST_SELECT_PRODUCT = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_edit_quote_item);
        
        initializeViews();
        setupToolbar();
        setupListeners();
        handleIntent();
    }

    private void initializeViews() {
        tvSelectedProduct = findViewById(R.id.tv_selected_product);
        btnClearProduct = findViewById(R.id.btn_clear_product);
        etDescription = findViewById(R.id.et_description);
        etQuantity = findViewById(R.id.et_quantity);
        etUnitPrice = findViewById(R.id.et_unit_price);
        etDiscount = findViewById(R.id.et_discount);
        etNotes = findViewById(R.id.et_notes);
        tvTotal = findViewById(R.id.tv_total);
        btnCancel = findViewById(R.id.btn_cancel);
        btnSave = findViewById(R.id.btn_save);
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(isEditing ? "Editar Item" : "Agregar Item");
        }
    }

    private void setupListeners() {
        // Selección de producto
        tvSelectedProduct.setOnClickListener(v -> openProductSelector());
        
        // Limpiar producto seleccionado
        btnClearProduct.setOnClickListener(v -> clearProductSelection());
        
        // Listener para calcular total automáticamente
        TextWatcher calculationWatcher = new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(Editable s) {
                calculateTotal();
            }
        };

        etQuantity.addTextChangedListener(calculationWatcher);
        etUnitPrice.addTextChangedListener(calculationWatcher);
        etDiscount.addTextChangedListener(calculationWatcher);

        btnCancel.setOnClickListener(v -> {
            setResult(RESULT_CANCELED);
            finish();
        });

        btnSave.setOnClickListener(v -> saveItem());
    }

    private void handleIntent() {
        Intent intent = getIntent();
        isEditing = intent.getBooleanExtra("is_editing", false);
        itemPosition = intent.getIntExtra("item_position", -1);
        
        if (isEditing && intent.hasExtra("quote_item")) {
            currentItem = (QuoteItem) intent.getSerializableExtra("quote_item");
            if (currentItem != null) {
                loadItemData();
            } else {
                currentItem = new QuoteItem();
                setDefaultValues();
            }
        } else {
            currentItem = new QuoteItem();
            setDefaultValues();
        }
        
        calculateTotal();
    }

    private void setDefaultValues() {
        etQuantity.setText("1");
        etUnitPrice.setText("0.00");
        etDiscount.setText("0");
    }

    private void loadItemData() {
        if (currentItem != null) {
            // Cargar producto si existe
            if (currentItem.getProductId() != null) {
                // Crear producto temporal con ID para mostrar información
                selectedProduct = new Product();
                selectedProduct.setId(currentItem.getProductId());
                selectedProduct.setName("Producto ID: " + currentItem.getProductId());
                selectedProduct.setPrice(currentItem.getUnitPriceAsDouble());
                selectedProduct.setDescription(currentItem.getDescription());
                updateProductSelection();
            }
            
            etDescription.setText(currentItem.getDescription() != null ? currentItem.getDescription() : "");
            etQuantity.setText(String.valueOf(currentItem.getQuantity()));
            etUnitPrice.setText(String.valueOf(currentItem.getUnitPrice()));
            etDiscount.setText(String.valueOf(currentItem.getDiscount() != null ? currentItem.getDiscount() : 0));
            etNotes.setText(currentItem.getNotes() != null ? currentItem.getNotes() : "");
        } else {
            setDefaultValues();
        }
    }

    private void calculateTotal() {
        try {
            double quantity = Double.parseDouble(etQuantity.getText().toString().trim());
            double unitPrice = Double.parseDouble(etUnitPrice.getText().toString().trim());
            double discount = Double.parseDouble(etDiscount.getText().toString().trim());
            
            double subtotal = quantity * unitPrice;
            double discountAmount = subtotal * (discount / 100);
            double total = subtotal - discountAmount;
            
            tvTotal.setText(String.format(Locale.getDefault(), "S/ %.2f", total));
        } catch (NumberFormatException e) {
            tvTotal.setText("S/ 0.00");
        }
    }

    private void saveItem() {
        android.util.Log.d("AddEditQuoteItem", "=== SAVE ITEM START ===");
        
        if (!validateForm()) {
            android.util.Log.e("AddEditQuoteItem", "Form validation failed");
            return;
        }

        // Crear o actualizar item
        if (currentItem == null) {
            currentItem = new QuoteItem();
            android.util.Log.d("AddEditQuoteItem", "Created new QuoteItem");
        }

        try {
            android.util.Log.d("AddEditQuoteItem", "Setting item data...");
            
            // Establecer producto seleccionado
            if (selectedProduct != null) {
                currentItem.setProductId(selectedProduct.getId());
                android.util.Log.d("AddEditQuoteItem", "Set product ID: " + selectedProduct.getId());
                // No establecer el objeto Product completo para evitar problemas de serialización
                // currentItem.setProduct(selectedProduct);
            }
            
            String description = etDescription.getText().toString().trim();
            String quantity = etQuantity.getText().toString().trim();
            String unitPrice = etUnitPrice.getText().toString().trim();
            String discountText = etDiscount.getText().toString().trim();
            String notes = etNotes.getText().toString().trim();
            
            android.util.Log.d("AddEditQuoteItem", "Item data - Description: " + description);
            android.util.Log.d("AddEditQuoteItem", "Item data - Quantity: " + quantity);
            android.util.Log.d("AddEditQuoteItem", "Item data - Unit Price: " + unitPrice);
            android.util.Log.d("AddEditQuoteItem", "Item data - Discount: " + discountText);
            
            currentItem.setDescription(description);
            currentItem.setQuantity(quantity);
            currentItem.setUnitPrice(unitPrice);
            currentItem.setDiscount(Double.parseDouble(discountText));
            currentItem.setNotes(notes);
            
            android.util.Log.d("AddEditQuoteItem", "Calculating total...");
            // Calcular total
            currentItem.calculateTotal();
            android.util.Log.d("AddEditQuoteItem", "Total calculated: " + currentItem.getTotalPrice());

            android.util.Log.d("AddEditQuoteItem", "Preparing result intent...");
            // Devolver resultado
            Intent resultIntent = new Intent();
            resultIntent.putExtra("quote_item", currentItem);
            if (isEditing) {
                resultIntent.putExtra("item_position", itemPosition);
                android.util.Log.d("AddEditQuoteItem", "Added item position: " + itemPosition);
            }
            
            android.util.Log.d("AddEditQuoteItem", "Setting result and finishing...");
            setResult(RESULT_OK, resultIntent);
            
            // Mostrar mensaje de éxito antes de cerrar
            Toast.makeText(this, "Item guardado correctamente", Toast.LENGTH_SHORT).show();
            
            android.util.Log.d("AddEditQuoteItem", "Calling finish()...");
            finish();
            android.util.Log.d("AddEditQuoteItem", "=== SAVE ITEM END ===");
            
        } catch (NumberFormatException e) {
            android.util.Log.e("AddEditQuoteItem", "Number format error: " + e.getMessage());
            Toast.makeText(this, "Error en los valores numéricos: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            android.util.Log.e("AddEditQuoteItem", "Unexpected error in saveItem: " + e.getMessage(), e);
            Toast.makeText(this, "Error inesperado: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private boolean validateForm() {
        if (etDescription.getText().toString().trim().isEmpty()) {
            etDescription.setError("La descripción es requerida");
            etDescription.requestFocus();
            return false;
        }

        try {
            int quantity = Integer.parseInt(etQuantity.getText().toString().trim());
            if (quantity <= 0) {
                etQuantity.setError("La cantidad debe ser mayor a 0");
                etQuantity.requestFocus();
                return false;
            }
        } catch (NumberFormatException e) {
            etQuantity.setError("Cantidad inválida");
            etQuantity.requestFocus();
            return false;
        }

        try {
            double unitPrice = Double.parseDouble(etUnitPrice.getText().toString().trim());
            if (unitPrice <= 0) {
                etUnitPrice.setError("El precio debe ser mayor a 0");
                etUnitPrice.requestFocus();
                return false;
            }
        } catch (NumberFormatException e) {
            etUnitPrice.setError("Precio inválido");
            etUnitPrice.requestFocus();
            return false;
        }

        try {
            double discount = Double.parseDouble(etDiscount.getText().toString().trim());
            if (discount < 0 || discount > 100) {
                etDiscount.setError("El descuento debe estar entre 0 y 100%");
                etDiscount.requestFocus();
                return false;
            }
        } catch (NumberFormatException e) {
            etDiscount.setError("Descuento inválido");
            etDiscount.requestFocus();
            return false;
        }

        return true;
    }

    private void openProductSelector() {
        Intent intent = new Intent(this, ProductSelectorActivity.class);
        startActivityForResult(intent, REQUEST_SELECT_PRODUCT);
    }

    private void clearProductSelection() {
        selectedProduct = null;
        updateProductSelection();
    }

    private void updateProductSelection() {
        if (selectedProduct != null) {
            tvSelectedProduct.setText(selectedProduct.getName());
            tvSelectedProduct.setTextColor(getResources().getColor(android.R.color.black));
            btnClearProduct.setVisibility(View.VISIBLE);
            
            // Auto-completar campos si el producto tiene información
            if (selectedProduct.getDescription() != null && etDescription.getText().toString().trim().isEmpty()) {
                etDescription.setText(selectedProduct.getDescription());
            }
            if (selectedProduct.getPrice() != null) {
                etUnitPrice.setText(String.valueOf(selectedProduct.getPrice()));
            }
        } else {
            tvSelectedProduct.setText("Seleccionar producto...");
            tvSelectedProduct.setTextColor(getResources().getColor(android.R.color.darker_gray));
            btnClearProduct.setVisibility(View.GONE);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == REQUEST_SELECT_PRODUCT && resultCode == RESULT_OK && data != null) {
            int productId = data.getIntExtra("selected_product_id", -1);
            String productName = data.getStringExtra("selected_product_name");
            String productDescription = data.getStringExtra("selected_product_description");
            double productPrice = data.getDoubleExtra("selected_product_price", 0.0);
            
            // Crear producto temporal con los datos recibidos
            selectedProduct = new Product();
            selectedProduct.setId(productId);
            selectedProduct.setName(productName);
            selectedProduct.setDescription(productDescription);
            selectedProduct.setPrice(productPrice);
            
            updateProductSelection();
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}