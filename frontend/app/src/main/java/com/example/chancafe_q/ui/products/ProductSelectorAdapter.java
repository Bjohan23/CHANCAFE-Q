package com.example.chancafe_q.ui.products;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Product;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ProductSelectorAdapter extends RecyclerView.Adapter<ProductSelectorAdapter.ProductViewHolder> {

    private List<Product> products;
    private Context context;
    private OnProductSelectListener listener;

    public interface OnProductSelectListener {
        void onProductSelected(Product product);
    }

    public ProductSelectorAdapter(Context context) {
        this.context = context;
        this.products = new ArrayList<>();
    }

    public void setOnProductSelectListener(OnProductSelectListener listener) {
        this.listener = listener;
    }

    public void updateProducts(List<Product> newProducts) {
        this.products.clear();
        if (newProducts != null) {
            this.products.addAll(newProducts);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ProductViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_product_selector, parent, false);
        return new ProductViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ProductViewHolder holder, int position) {
        Product product = products.get(position);
        holder.bind(product);
    }

    @Override
    public int getItemCount() {
        return products.size();
    }

    class ProductViewHolder extends RecyclerView.ViewHolder {
        private TextView tvProductName;
        private TextView tvProductDescription;
        private TextView tvProductPrice;
        private TextView tvProductStock;

        public ProductViewHolder(@NonNull View itemView) {
            super(itemView);
            tvProductName = itemView.findViewById(R.id.tv_product_name);
            tvProductDescription = itemView.findViewById(R.id.tv_product_description);
            tvProductPrice = itemView.findViewById(R.id.tv_product_price);
            tvProductStock = itemView.findViewById(R.id.tv_product_stock);

            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    int position = getAdapterPosition();
                    if (position != RecyclerView.NO_POSITION) {
                        listener.onProductSelected(products.get(position));
                    }
                }
            });
        }

        public void bind(Product product) {
            tvProductName.setText(product.getName() != null ? product.getName() : "Producto sin nombre");
            tvProductDescription.setText(product.getDescription() != null ? product.getDescription() : "Sin descripción");
            
            // Formatear precio
            if (product.getPrice() != null) {
                tvProductPrice.setText(String.format(Locale.getDefault(), "S/ %.2f", product.getPrice()));
            } else {
                tvProductPrice.setText("S/ 0.00");
            }
            
            // Mostrar stock si está disponible
            if (product.getStock() != null) {
                tvProductStock.setText(String.format(Locale.getDefault(), "Stock: %d", product.getStock()));
                tvProductStock.setVisibility(View.VISIBLE);
            } else {
                tvProductStock.setVisibility(View.GONE);
            }
        }
    }
}