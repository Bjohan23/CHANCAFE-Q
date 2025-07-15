package com.example.chancafe_q.ui.quotes;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.chancafe_q.R;
import com.example.chancafe_q.model.QuoteItem;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class QuoteItemsAdapter extends RecyclerView.Adapter<QuoteItemsAdapter.QuoteItemViewHolder> {

    private List<QuoteItem> items;
    private final Context context;
    private OnQuoteItemListener listener;
    private final NumberFormat currencyFormat;

    public interface OnQuoteItemListener {
        void onEditItem(QuoteItem item, int position);
        void onDeleteItem(QuoteItem item, int position);
        void onDuplicateItem(QuoteItem item, int position);
    }

    public QuoteItemsAdapter(Context context) {
        this.context = context;
        this.items = new ArrayList<>();
        this.currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "PE"));
    }

    public void setOnQuoteItemListener(OnQuoteItemListener listener) {
        this.listener = listener;
    }

    public void updateItems(List<QuoteItem> newItems) {
        this.items.clear();
        if (newItems != null) {
            this.items.addAll(newItems);
        }
        notifyDataSetChanged();
    }

    public void addItem(QuoteItem item) {
        if (item != null) {
            items.add(item);
            notifyItemInserted(items.size() - 1);
        }
    }

    public void updateItem(int position, QuoteItem item) {
        if (position >= 0 && position < items.size() && item != null) {
            items.set(position, item);
            notifyItemChanged(position);
        }
    }

    public void removeItem(int position) {
        if (position >= 0 && position < items.size()) {
            items.remove(position);
            notifyItemRemoved(position);
        }
    }

    @NonNull
    @Override
    public QuoteItemViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_quote_edit, parent, false);
        return new QuoteItemViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull QuoteItemViewHolder holder, int position) {
        QuoteItem item = items.get(position);
        holder.bind(item);
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    class QuoteItemViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvProductName;
        private final TextView tvProductCode;
        private final TextView tvDescription;
        private final TextView tvQuantity;
        private final TextView tvUnitPrice;
        private final TextView tvDiscount;
        private final TextView tvTotalPrice;
        private final TextView tvNotes;
        private final LinearLayout layoutDiscount;
        private final View spacerDiscount;
        private final ImageButton btnItemMenu;

        public QuoteItemViewHolder(@NonNull View itemView) {
            super(itemView);
            tvProductName = itemView.findViewById(R.id.tv_product_name);
            tvProductCode = itemView.findViewById(R.id.tv_product_code);
            tvDescription = itemView.findViewById(R.id.tv_description);
            tvQuantity = itemView.findViewById(R.id.tv_quantity);
            tvUnitPrice = itemView.findViewById(R.id.tv_unit_price);
            tvDiscount = itemView.findViewById(R.id.tv_discount);
            tvTotalPrice = itemView.findViewById(R.id.tv_total_price);
            tvNotes = itemView.findViewById(R.id.tv_notes);
            layoutDiscount = itemView.findViewById(R.id.layout_discount);
            spacerDiscount = itemView.findViewById(R.id.spacer_discount);
            btnItemMenu = itemView.findViewById(R.id.btn_item_menu);

            // Click en el item completo para editar
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onEditItem(items.get(getAdapterPosition()), getAdapterPosition());
                }
            });

            // Click en el menú
            btnItemMenu.setOnClickListener(v -> showPopupMenu(v, items.get(getAdapterPosition()), getAdapterPosition()));
        }

        public void bind(QuoteItem item) {
            // Nombre del producto
            if (item.getProduct() != null && item.getProduct().getName() != null) {
                tvProductName.setText(item.getProduct().getName());
                
                // Código del producto
                if (item.getProduct().getSku() != null && !item.getProduct().getSku().isEmpty()) {
                    tvProductCode.setText("SKU: " + item.getProduct().getSku());
                    tvProductCode.setVisibility(View.VISIBLE);
                } else {
                    tvProductCode.setVisibility(View.GONE);
                }
            } else {
                tvProductName.setText(item.getDescription() != null ? item.getDescription() : "Producto sin nombre");
                tvProductCode.setVisibility(View.GONE);
            }

            // Descripción
            if (item.getDescription() != null && !item.getDescription().isEmpty()) {
                tvDescription.setText(item.getDescription());
                tvDescription.setVisibility(View.VISIBLE);
            } else {
                tvDescription.setVisibility(View.GONE);
            }

            // Cantidad
            tvQuantity.setText(String.valueOf(item.getQuantity()));

            // Precio unitario
            tvUnitPrice.setText(String.format(Locale.getDefault(), "S/ %.2f", item.getUnitPrice()));

            // Descuento
            if (item.getDiscount() != null && item.getDiscount() > 0) {
                tvDiscount.setText(String.format(Locale.getDefault(), "%.1f%%", item.getDiscount()));
                layoutDiscount.setVisibility(View.VISIBLE);
                spacerDiscount.setVisibility(View.VISIBLE);
            } else {
                layoutDiscount.setVisibility(View.GONE);
                spacerDiscount.setVisibility(View.GONE);
            }

            // Precio total
            tvTotalPrice.setText(String.format(Locale.getDefault(), "S/ %.2f", item.getTotalPrice()));

            // Notas
            if (item.getNotes() != null && !item.getNotes().isEmpty()) {
                tvNotes.setText("Nota: " + item.getNotes());
                tvNotes.setVisibility(View.VISIBLE);
            } else {
                tvNotes.setVisibility(View.GONE);
            }
        }

        private void showPopupMenu(View view, QuoteItem item, int position) {
            PopupMenu popup = new PopupMenu(context, view);
            popup.getMenuInflater().inflate(R.menu.menu_quote_item_options, popup.getMenu());

            popup.setOnMenuItemClickListener(menuItem -> {
                if (listener == null) return false;

                int itemId = menuItem.getItemId();
                if (itemId == R.id.action_edit_item) {
                    listener.onEditItem(item, position);
                } else if (itemId == R.id.action_duplicate_item) {
                    listener.onDuplicateItem(item, position);
                } else if (itemId == R.id.action_delete_item) {
                    listener.onDeleteItem(item, position);
                } else {
                    return false;
                }
                return true;
            });

            popup.show();
        }
    }
}