package com.example.chancafe_q.ui.quotes;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.QuoteItem;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class QuoteDetailItemsAdapter extends RecyclerView.Adapter<QuoteDetailItemsAdapter.QuoteItemViewHolder> {

    private List<QuoteItem> quoteItems;
    private final Context context;
    private final NumberFormat currencyFormat;

    public QuoteDetailItemsAdapter(Context context) {
        this.context = context;
        this.quoteItems = new ArrayList<>();
        this.currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "PE"));
    }

    public void updateQuoteItems(List<QuoteItem> newQuoteItems) {
        this.quoteItems.clear();
        if (newQuoteItems != null) {
            this.quoteItems.addAll(newQuoteItems);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public QuoteItemViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_quote_detail, parent, false);
        return new QuoteItemViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull QuoteItemViewHolder holder, int position) {
        QuoteItem item = quoteItems.get(position);
        holder.bind(item);
    }

    @Override
    public int getItemCount() {
        return quoteItems.size();
    }

    class QuoteItemViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvProductName;
        private final TextView tvProductCode;
        private final TextView tvUnitPrice;
        private final TextView tvQuantity;
        private final TextView tvItemDiscount;
        private final TextView tvItemSubtotal;
        private final TextView tvItemNotes;
        private final LinearLayout layoutItemDiscount;

        public QuoteItemViewHolder(@NonNull View itemView) {
            super(itemView);
            tvProductName = itemView.findViewById(R.id.tv_product_name);
            tvProductCode = itemView.findViewById(R.id.tv_product_code);
            tvUnitPrice = itemView.findViewById(R.id.tv_unit_price);
            tvQuantity = itemView.findViewById(R.id.tv_quantity);
            tvItemDiscount = itemView.findViewById(R.id.tv_item_discount);
            tvItemSubtotal = itemView.findViewById(R.id.tv_item_subtotal);
            tvItemNotes = itemView.findViewById(R.id.tv_item_notes);
            layoutItemDiscount = itemView.findViewById(R.id.layout_item_discount);
        }

        public void bind(QuoteItem item) {
            // Product information
            if (item.getProduct() != null) {
                tvProductName.setText(item.getProduct().getName());
                tvProductCode.setText("SKU: " + (item.getProduct().getSku() != null ? 
                    item.getProduct().getSku() : "N/A"));
            } else {
                tvProductName.setText(item.getProductName() != null ? 
                    item.getProductName() : "Producto no disponible");
                tvProductCode.setText("SKU: N/A");
            }

            // Unit price
            String currency = item.getCurrency() != null ? item.getCurrency() : "PEN";
            String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
            tvUnitPrice.setText(symbol + String.format(Locale.getDefault(), "%.2f", item.getUnitPriceAsDouble()));

            // Quantity
            tvQuantity.setText(String.format(Locale.getDefault(), "%.0f", item.getQuantityAsDouble()));

            // Discount (if any)
            if (item.getDiscountPercentageAsDouble() > 0) {
                layoutItemDiscount.setVisibility(View.VISIBLE);
                tvItemDiscount.setText(String.format(Locale.getDefault(), "%.1f%%", item.getDiscountPercentageAsDouble()));
            } else if (item.getDiscountAmountAsDouble() > 0) {
                layoutItemDiscount.setVisibility(View.VISIBLE);
                tvItemDiscount.setText(symbol + String.format(Locale.getDefault(), "%.2f", item.getDiscountAmountAsDouble()));
            } else {
                layoutItemDiscount.setVisibility(View.GONE);
            }

            // Calculate subtotal
            double subtotal = calculateItemSubtotal(item);
            tvItemSubtotal.setText(symbol + String.format(Locale.getDefault(), "%.2f", subtotal));

            // Notes (if any)
            if (item.getNotes() != null && !item.getNotes().trim().isEmpty()) {
                tvItemNotes.setVisibility(View.VISIBLE);
                tvItemNotes.setText(item.getNotes());
            } else {
                tvItemNotes.setVisibility(View.GONE);
            }
        }

        private double calculateItemSubtotal(QuoteItem item) {
            // Use the subtotal from API if available, otherwise calculate
            if (item.getSubtotalAsDouble() > 0) {
                return item.getSubtotalAsDouble();
            }
            
            double subtotal = item.getUnitPriceAsDouble() * item.getQuantityAsDouble();
            
            // Apply discount
            if (item.getDiscountPercentageAsDouble() > 0) {
                subtotal = subtotal * (1 - item.getDiscountPercentageAsDouble() / 100);
            } else if (item.getDiscountAmountAsDouble() > 0) {
                subtotal = subtotal - item.getDiscountAmountAsDouble();
            }
            
            return Math.max(0, subtotal); // Ensure non-negative
        }
    }
}