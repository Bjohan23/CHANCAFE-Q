package com.example.chancafe_q.ui.products;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.chancafe_q.R;
import com.example.chancafe_q.model.Product;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;

public class ProductsAdapter extends RecyclerView.Adapter<ProductsAdapter.ProductViewHolder> {
    
    private List<Product> products;
    private List<Product> productsFiltered;
    private Context context;
    private OnProductClickListener listener;
    private DecimalFormat decimalFormat;

    public interface OnProductClickListener {
        void onProductClick(Product product);
        void onProductLongClick(Product product);
        void onEditClick(Product product);
        void onDeleteClick(Product product);
        void onStatusClick(Product product);
        void onStockClick(Product product);
    }

    public ProductsAdapter(Context context, OnProductClickListener listener) {
        this.context = context;
        this.listener = listener;
        this.products = new ArrayList<>();
        this.productsFiltered = new ArrayList<>();
        this.decimalFormat = new DecimalFormat("#,##0.00");
    }

    @NonNull
    @Override
    public ProductViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_product, parent, false);
        return new ProductViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ProductViewHolder holder, int position) {
        Product product = productsFiltered.get(position);
        holder.bind(product);
    }

    @Override
    public int getItemCount() {
        return productsFiltered.size();
    }

    public void setProducts(List<Product> products) {
        this.products = products != null ? products : new ArrayList<>();
        this.productsFiltered = new ArrayList<>(this.products);
        notifyDataSetChanged();
    }

    public void filter(String query) {
        productsFiltered.clear();
        if (query.isEmpty()) {
            productsFiltered.addAll(products);
        } else {
            String lowerCaseQuery = query.toLowerCase();
            for (Product product : products) {
                if (product.getName().toLowerCase().contains(lowerCaseQuery) ||
                    product.getDescription().toLowerCase().contains(lowerCaseQuery) ||
                    product.getBrand().toLowerCase().contains(lowerCaseQuery) ||
                    product.getSku().toLowerCase().contains(lowerCaseQuery)) {
                    productsFiltered.add(product);
                }
            }
        }
        notifyDataSetChanged();
    }

    public void filterByCategory(int categoryId) {
        productsFiltered.clear();
        for (Product product : products) {
            if (product.getCategoryId() == categoryId) {
                productsFiltered.add(product);
            }
        }
        notifyDataSetChanged();
    }

    public void filterBySupplier(int supplierId) {
        productsFiltered.clear();
        for (Product product : products) {
            if (product.getSupplierId() == supplierId) {
                productsFiltered.add(product);
            }
        }
        notifyDataSetChanged();
    }

    public void filterByStatus(String status) {
        productsFiltered.clear();
        for (Product product : products) {
            if (product.getStatus().equalsIgnoreCase(status)) {
                productsFiltered.add(product);
            }
        }
        notifyDataSetChanged();
    }

    public void clearFilters() {
        productsFiltered.clear();
        productsFiltered.addAll(products);
        notifyDataSetChanged();
    }

    public void updateProduct(Product updatedProduct) {
        for (int i = 0; i < products.size(); i++) {
            if (products.get(i).getId() == updatedProduct.getId()) {
                products.set(i, updatedProduct);
                break;
            }
        }
        
        for (int i = 0; i < productsFiltered.size(); i++) {
            if (productsFiltered.get(i).getId() == updatedProduct.getId()) {
                productsFiltered.set(i, updatedProduct);
                notifyItemChanged(i);
                break;
            }
        }
    }

    public void removeProduct(int productId) {
        for (int i = 0; i < products.size(); i++) {
            if (products.get(i).getId() == productId) {
                products.remove(i);
                break;
            }
        }
        
        for (int i = 0; i < productsFiltered.size(); i++) {
            if (productsFiltered.get(i).getId() == productId) {
                productsFiltered.remove(i);
                notifyItemRemoved(i);
                break;
            }
        }
    }

    public class ProductViewHolder extends RecyclerView.ViewHolder {
        private TextView tvProductName;
        private TextView tvProductDescription;
        private TextView tvProductPrice;
        private TextView tvProductStock;
        private TextView tvProductBrand;
        private TextView tvProductSku;
        private TextView tvProductStatus;
        private ImageView ivProductImage;
        private ImageView ivEditProduct;
        private ImageView ivDeleteProduct;
        private ImageView ivStatusProduct;
        private ImageView ivStockProduct;
        private View statusIndicator;

        public ProductViewHolder(@NonNull View itemView) {
            super(itemView);
            tvProductName = itemView.findViewById(R.id.tv_product_name);
            tvProductDescription = itemView.findViewById(R.id.tv_product_description);
            tvProductPrice = itemView.findViewById(R.id.tv_product_price);
            tvProductStock = itemView.findViewById(R.id.tv_product_stock);
            tvProductBrand = itemView.findViewById(R.id.tv_product_brand);
            tvProductSku = itemView.findViewById(R.id.tv_product_sku);
            tvProductStatus = itemView.findViewById(R.id.tv_product_status);
            ivProductImage = itemView.findViewById(R.id.iv_product_image);
            ivEditProduct = itemView.findViewById(R.id.iv_edit_product);
            ivDeleteProduct = itemView.findViewById(R.id.iv_delete_product);
            ivStatusProduct = itemView.findViewById(R.id.iv_status_product);
            ivStockProduct = itemView.findViewById(R.id.iv_stock_product);
            statusIndicator = itemView.findViewById(R.id.status_indicator);

            // Click listeners
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onProductClick(products.get(getAdapterPosition()));
                }
            });

            itemView.setOnLongClickListener(v -> {
                if (listener != null) {
                    listener.onProductLongClick(products.get(getAdapterPosition()));
                }
                return true;
            });

            if (ivEditProduct != null) {
                ivEditProduct.setOnClickListener(v -> {
                    if (listener != null) {
                        listener.onEditClick(productsFiltered.get(getAdapterPosition()));
                    }
                });
            }

            if (ivDeleteProduct != null) {
                ivDeleteProduct.setOnClickListener(v -> {
                    if (listener != null) {
                        listener.onDeleteClick(productsFiltered.get(getAdapterPosition()));
                    }
                });
            }

            if (ivStatusProduct != null) {
                ivStatusProduct.setOnClickListener(v -> {
                    if (listener != null) {
                        listener.onStatusClick(productsFiltered.get(getAdapterPosition()));
                    }
                });
            }

            if (ivStockProduct != null) {
                ivStockProduct.setOnClickListener(v -> {
                    if (listener != null) {
                        listener.onStockClick(productsFiltered.get(getAdapterPosition()));
                    }
                });
            }
        }

        public void bind(Product product) {
            tvProductName.setText(product.getName());
            tvProductDescription.setText(product.getDescription());
            tvProductPrice.setText(String.format("S/ %s", decimalFormat.format(product.getPrice())));
            tvProductBrand.setText(product.getBrand());
            tvProductSku.setText(String.format("SKU: %s", product.getSku()));
            tvProductStatus.setText(getStatusText(product.getStatus()));

            // Configurar stock con colores
            int stock = product.getStock();
            tvProductStock.setText(String.format("Stock: %d", stock));
            
            if (stock == 0) {
                tvProductStock.setTextColor(context.getResources().getColor(R.color.red_primary));
                tvProductStock.setText("Sin Stock");
            } else if (stock <= 10) {
                tvProductStock.setTextColor(context.getResources().getColor(R.color.yellow_primary));
                tvProductStock.setText(String.format("Stock: %d (Bajo)", stock));
            } else {
                tvProductStock.setTextColor(context.getResources().getColor(android.R.color.darker_gray));
                tvProductStock.setText(String.format("Stock: %d", stock));
            }

            // Configurar status
            setupStatusIndicator(product.getStatus());

            // Configurar imagen del producto (placeholder por ahora)
            if (ivProductImage != null) {
                ivProductImage.setImageResource(R.drawable.ic_products);
            }

            // Configurar visibilidad de botones según el estado
            if (ivEditProduct != null) {
                ivEditProduct.setVisibility(View.VISIBLE);
            }

            if (ivDeleteProduct != null) {
                ivDeleteProduct.setVisibility(View.VISIBLE);
            }

            if (ivStatusProduct != null) {
                ivStatusProduct.setVisibility(View.VISIBLE);
            }

            if (ivStockProduct != null) {
                ivStockProduct.setVisibility(View.VISIBLE);
            }
        }

        private void setupStatusIndicator(String status) {
            if (statusIndicator != null) {
                int color;
                switch (status.toLowerCase()) {
                    case "active":
                        color = context.getResources().getColor(android.R.color.holo_green_dark);
                        break;
                    case "inactive":
                        color = context.getResources().getColor(android.R.color.holo_red_dark);
                        break;
                    case "discontinued":
                        color = context.getResources().getColor(android.R.color.darker_gray);
                        break;
                    default:
                        color = context.getResources().getColor(android.R.color.darker_gray);
                        break;
                }
                statusIndicator.setBackgroundColor(color);
            }
        }

        private String getStatusText(String status) {
            switch (status.toLowerCase()) {
                case "active":
                    return "Activo";
                case "inactive":
                    return "Inactivo";
                case "discontinued":
                    return "Descontinuado";
                default:
                    return status;
            }
        }
    }
}