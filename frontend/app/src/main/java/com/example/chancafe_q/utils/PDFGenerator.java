package com.example.chancafe_q.utils;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.pdf.PdfDocument;
import android.os.Environment;

import com.example.chancafe_q.model.Quote;
import com.example.chancafe_q.model.QuoteItem;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class PDFGenerator {
    
    private final Context context;
    private final ExecutorService executor;
    private final SimpleDateFormat dateFormat;
    
    // PDF dimensions and margins
    private static final int PAGE_WIDTH = 595; // A4 width in points
    private static final int PAGE_HEIGHT = 842; // A4 height in points
    private static final int MARGIN = 50;
    private static final int CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);
    
    // Colors
    private static final int COLOR_PRIMARY = Color.parseColor("#D32F2F");
    private static final int COLOR_SECONDARY = Color.parseColor("#424242");
    private static final int COLOR_LIGHT = Color.parseColor("#757575");
    
    public interface PDFGenerationCallback {
        void onSuccess(File pdfFile);
        void onError(String error);
    }
    
    public PDFGenerator(Context context) {
        this.context = context;
        this.executor = Executors.newSingleThreadExecutor();
        this.dateFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
    }
    
    public void generateQuotePDF(Quote quote, PDFGenerationCallback callback) {
        executor.execute(() -> {
            try {
                File pdfFile = createQuotePDF(quote);
                callback.onSuccess(pdfFile);
            } catch (Exception e) {
                callback.onError(e.getMessage());
            }
        });
    }
    
    private File createQuotePDF(Quote quote) throws IOException {
        // Create PDF document
        PdfDocument document = new PdfDocument();
        PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(PAGE_WIDTH, PAGE_HEIGHT, 1).create();
        PdfDocument.Page page = document.startPage(pageInfo);
        Canvas canvas = page.getCanvas();
        
        // Create paints for different text styles
        Paint titlePaint = createPaint(18, Typeface.BOLD, COLOR_PRIMARY);
        Paint headerPaint = createPaint(14, Typeface.BOLD, Color.BLACK);
        Paint normalPaint = createPaint(12, Typeface.NORMAL, COLOR_SECONDARY);
        Paint lightPaint = createPaint(11, Typeface.NORMAL, COLOR_LIGHT);
        Paint tablePaint = createPaint(10, Typeface.NORMAL, Color.BLACK);
        
        int currentY = MARGIN + 20;
        
        // Header section
        currentY = drawHeader(canvas, quote, titlePaint, headerPaint, normalPaint, currentY);
        currentY += 30;
        
        // Client information
        currentY = drawClientInfo(canvas, quote, headerPaint, normalPaint, currentY);
        currentY += 30;
        
        // Quote items table
        currentY = drawItemsTable(canvas, quote.getQuoteItems(), headerPaint, tablePaint, currentY);
        currentY += 30;
        
        // Totals section
        currentY = drawTotals(canvas, quote, headerPaint, normalPaint, currentY);
        currentY += 30;
        
        // Notes section
        if (quote.getNotes() != null && !quote.getNotes().trim().isEmpty()) {
            currentY = drawNotes(canvas, quote.getNotes(), headerPaint, normalPaint, currentY);
        }
        
        // Footer
        drawFooter(canvas, lightPaint);
        
        document.finishPage(page);
        
        // Save PDF file
        File pdfFile = createPDFFile(quote);
        try (FileOutputStream outputStream = new FileOutputStream(pdfFile)) {
            document.writeTo(outputStream);
        }
        document.close();
        
        return pdfFile;
    }
    
    private Paint createPaint(int textSize, int typeface, int color) {
        Paint paint = new Paint();
        paint.setTextSize(textSize);
        paint.setTypeface(Typeface.create(Typeface.DEFAULT, typeface));
        paint.setColor(color);
        paint.setAntiAlias(true);
        return paint;
    }
    
    private int drawHeader(Canvas canvas, Quote quote, Paint titlePaint, Paint headerPaint, Paint normalPaint, int startY) {
        int currentY = startY;
        
        // Company header
        canvas.drawText("CHANCAFE Q", MARGIN, currentY, titlePaint);
        currentY += 25;
        canvas.drawText("Sistema de Gestión de Ventas", MARGIN, currentY, normalPaint);
        currentY += 40;
        
        // Quote title
        String quoteTitle = quote.getQuoteNumber() != null ? quote.getQuoteNumber() : "COT-" + quote.getId();
        canvas.drawText("COTIZACIÓN: " + quoteTitle, MARGIN, currentY, headerPaint);
        
        // Status badge (text only)
        String status = getStatusText(quote.getStatus());
        float statusX = PAGE_WIDTH - MARGIN - normalPaint.measureText("Estado: " + status);
        canvas.drawText("Estado: " + status, statusX, currentY, normalPaint);
        currentY += 30;
        
        // Quote details
        if (quote.getTitle() != null && !quote.getTitle().trim().isEmpty()) {
            canvas.drawText("Título: " + quote.getTitle(), MARGIN, currentY, normalPaint);
            currentY += 20;
        }
        
        try {
            Date createdDate = quote.getCreatedAtAsDate();
            if (createdDate != null) {
                canvas.drawText("Fecha: " + dateFormat.format(createdDate), MARGIN, currentY, normalPaint);
            } else if (quote.getCreatedAt() != null) {
                canvas.drawText("Fecha: " + quote.getCreatedAt(), MARGIN, currentY, normalPaint);
            }
        } catch (Exception e) {
            // Fallback si hay error de formateo
            if (quote.getCreatedAt() != null) {
                canvas.drawText("Fecha: " + quote.getCreatedAt(), MARGIN, currentY, normalPaint);
            }
        }
        
        try {
            Date validDate = quote.getValidUntilAsDate();
            if (validDate != null) {
                String validText = "Válida hasta: " + dateFormat.format(validDate);
                float validX = PAGE_WIDTH - MARGIN - normalPaint.measureText(validText);
                canvas.drawText(validText, validX, currentY, normalPaint);
            } else if (quote.getValidUntil() != null) {
                String validText = "Válida hasta: " + quote.getValidUntil();
                float validX = PAGE_WIDTH - MARGIN - normalPaint.measureText(validText);
                canvas.drawText(validText, validX, currentY, normalPaint);
            }
        } catch (Exception e) {
            // Fallback si hay error de formateo
            if (quote.getValidUntil() != null) {
                String validText = "Válida hasta: " + quote.getValidUntil();
                float validX = PAGE_WIDTH - MARGIN - normalPaint.measureText(validText);
                canvas.drawText(validText, validX, currentY, normalPaint);
            }
        }
        currentY += 20;
        
        // Draw separator line
        canvas.drawLine(MARGIN, currentY, PAGE_WIDTH - MARGIN, currentY, createLinePaint());
        
        return currentY + 10;
    }
    
    private int drawClientInfo(Canvas canvas, Quote quote, Paint headerPaint, Paint normalPaint, int startY) {
        int currentY = startY;
        
        canvas.drawText("INFORMACIÓN DEL CLIENTE", MARGIN, currentY, headerPaint);
        currentY += 25;
        
        if (quote.getClient() != null) {
            String clientName = quote.getClient().getBusinessName() != null 
                ? quote.getClient().getBusinessName()
                : (quote.getClient().getFirstName() + " " + quote.getClient().getLastName()).trim();
            canvas.drawText("Cliente: " + clientName, MARGIN, currentY, normalPaint);
            currentY += 18;
            
            String docType = quote.getClient().getDocumentType() != null ? quote.getClient().getDocumentType() : "DNI";
            String docNumber = quote.getClient().getDocumentNumber() != null ? quote.getClient().getDocumentNumber() : "N/A";
            canvas.drawText(docType + ": " + docNumber, MARGIN, currentY, normalPaint);
            
            if (quote.getClient().getPhone() != null) {
                String phoneText = "Teléfono: " + quote.getClient().getPhone();
                float phoneX = MARGIN + 200;
                canvas.drawText(phoneText, phoneX, currentY, normalPaint);
            }
            currentY += 18;
            
            if (quote.getClient().getEmail() != null) {
                canvas.drawText("Email: " + quote.getClient().getEmail(), MARGIN, currentY, normalPaint);
                currentY += 18;
            }
            
            // Credit score if available
            if (quote.getClient().getCreditScore() != null && quote.getClient().getCreditScore() > 0) {
                String scoreText = "Score Crediticio: " + quote.getClient().getCreditScore();
                canvas.drawText(scoreText, MARGIN, currentY, normalPaint);
                currentY += 18;
            }
        } else {
            canvas.drawText("Cliente: No disponible", MARGIN, currentY, normalPaint);
            currentY += 18;
        }
        
        return currentY;
    }
    
    private int drawItemsTable(Canvas canvas, List<QuoteItem> items, Paint headerPaint, Paint tablePaint, int startY) {
        int currentY = startY;
        
        canvas.drawText("DETALLE DE PRODUCTOS", MARGIN, currentY, headerPaint);
        currentY += 25;
        
        // Table headers
        int col1 = MARGIN;
        int col2 = MARGIN + 250;
        int col3 = MARGIN + 320;
        int col4 = MARGIN + 380;
        int col5 = MARGIN + 450;
        
        Paint headerTablePaint = createPaint(10, Typeface.BOLD, Color.BLACK);
        canvas.drawText("PRODUCTO", col1, currentY, headerTablePaint);
        canvas.drawText("CANT.", col2, currentY, headerTablePaint);
        canvas.drawText("P.UNIT", col3, currentY, headerTablePaint);
        canvas.drawText("DESC.", col4, currentY, headerTablePaint);
        canvas.drawText("SUBTOTAL", col5, currentY, headerTablePaint);
        currentY += 20;
        
        // Draw header line
        canvas.drawLine(MARGIN, currentY - 5, PAGE_WIDTH - MARGIN, currentY - 5, createLinePaint());
        currentY += 5;
        
        // Table content
        if (items != null && !items.isEmpty()) {
            String currency = items.get(0).getCurrency() != null ? items.get(0).getCurrency() : "PEN";
            String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
            
            for (QuoteItem item : items) {
                String productName = item.getProduct() != null ? item.getProduct().getName() : 
                    (item.getProductName() != null ? item.getProductName() : "Producto");
                
                // Truncate long product names
                if (productName.length() > 30) {
                    productName = productName.substring(0, 27) + "...";
                }
                
                canvas.drawText(productName, col1, currentY, tablePaint);
                canvas.drawText(String.valueOf(item.getQuantity()), col2, currentY, tablePaint);
                canvas.drawText(symbol + String.format(Locale.getDefault(), "%.2f", item.getUnitPrice()), col3, currentY, tablePaint);
                
                // Discount
                String discountText = "";
                if (item.getDiscountPercentage() != null && item.getDiscountPercentage() > 0) {
                    discountText = String.format(Locale.getDefault(), "%.1f%%", item.getDiscountPercentage());
                } else if (item.getDiscountAmount() != null && item.getDiscountAmount() > 0) {
                    discountText = symbol + String.format(Locale.getDefault(), "%.2f", item.getDiscountAmount());
                } else {
                    discountText = "-";
                }
                canvas.drawText(discountText, col4, currentY, tablePaint);
                
                // Calculate subtotal
                double subtotal = item.getUnitPriceAsDouble() * item.getQuantityAsDouble();
                if (item.getDiscountPercentage() != null && item.getDiscountPercentage() > 0) {
                    subtotal = subtotal * (1 - item.getDiscountPercentage() / 100);
                } else if (item.getDiscountAmount() != null && item.getDiscountAmount() > 0) {
                    subtotal = subtotal - item.getDiscountAmount();
                }
                
                canvas.drawText(symbol + String.format(Locale.getDefault(), "%.2f", subtotal), col5, currentY, tablePaint);
                currentY += 18;
            }
        } else {
            canvas.drawText("No hay productos en esta cotización", col1, currentY, tablePaint);
            currentY += 18;
        }
        
        // Draw bottom line
        canvas.drawLine(MARGIN, currentY, PAGE_WIDTH - MARGIN, currentY, createLinePaint());
        
        return currentY + 10;
    }
    
    private int drawTotals(Canvas canvas, Quote quote, Paint headerPaint, Paint normalPaint, int startY) {
        int currentY = startY;
        
        String currency = quote.getCurrency() != null ? quote.getCurrency() : "PEN";
        String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
        
        int labelX = PAGE_WIDTH - MARGIN - 150;
        int valueX = PAGE_WIDTH - MARGIN - 50;
        
        // Subtotal
        canvas.drawText("Subtotal:", labelX, currentY, normalPaint);
        canvas.drawText(symbol + String.format(Locale.getDefault(), "%.2f", quote.getSubtotal()), valueX, currentY, normalPaint);
        currentY += 18;
        
        // Discount (if any)
        if (quote.getDiscountAmount() != null && quote.getDiscountAmount() > 0) {
            canvas.drawText("Descuento:", labelX, currentY, normalPaint);
            canvas.drawText("-" + symbol + String.format(Locale.getDefault(), "%.2f", quote.getDiscountAmount()), valueX, currentY, normalPaint);
            currentY += 18;
        }
        
        // Tax
        canvas.drawText("IGV (18%):", labelX, currentY, normalPaint);
        canvas.drawText(symbol + String.format(Locale.getDefault(), "%.2f", quote.getTaxAmount()), valueX, currentY, normalPaint);
        currentY += 18;
        
        // Draw line before total
        canvas.drawLine(labelX - 10, currentY + 5, PAGE_WIDTH - MARGIN, currentY + 5, createLinePaint());
        currentY += 15;
        
        // Total
        canvas.drawText("TOTAL:", labelX, currentY, headerPaint);
        canvas.drawText(symbol + String.format(Locale.getDefault(), "%.2f", quote.getTotal()), valueX, currentY, headerPaint);
        
        return currentY + 10;
    }
    
    private int drawNotes(Canvas canvas, String notes, Paint headerPaint, Paint normalPaint, int startY) {
        int currentY = startY;
        
        canvas.drawText("OBSERVACIONES", MARGIN, currentY, headerPaint);
        currentY += 25;
        
        // Split notes into lines if too long
        String[] words = notes.split(" ");
        StringBuilder currentLine = new StringBuilder();
        
        for (String word : words) {
            String testLine = currentLine.length() > 0 ? currentLine + " " + word : word;
            if (normalPaint.measureText(testLine) > CONTENT_WIDTH - 20) {
                if (currentLine.length() > 0) {
                    canvas.drawText(currentLine.toString(), MARGIN, currentY, normalPaint);
                    currentY += 16;
                    currentLine = new StringBuilder(word);
                } else {
                    canvas.drawText(word, MARGIN, currentY, normalPaint);
                    currentY += 16;
                }
            } else {
                currentLine = new StringBuilder(testLine);
            }
        }
        
        if (currentLine.length() > 0) {
            canvas.drawText(currentLine.toString(), MARGIN, currentY, normalPaint);
            currentY += 16;
        }
        
        return currentY;
    }
    
    private void drawFooter(Canvas canvas, Paint lightPaint) {
        int footerY = PAGE_HEIGHT - MARGIN - 20;
        String footerText = "Generado por CHANCAFE Q - " + dateFormat.format(new java.util.Date());
        float footerX = (PAGE_WIDTH - lightPaint.measureText(footerText)) / 2;
        canvas.drawText(footerText, footerX, footerY, lightPaint);
    }
    
    private Paint createLinePaint() {
        Paint linePaint = new Paint();
        linePaint.setColor(COLOR_LIGHT);
        linePaint.setStrokeWidth(1);
        return linePaint;
    }
    
    private String getStatusText(String status) {
        switch (status != null ? status.toLowerCase() : "draft") {
            case "draft": return "Borrador";
            case "pending": return "Pendiente";
            case "approved": return "Aprobada";
            case "rejected": return "Rechazada";
            case "expired": return "Expirada";
            default: return status != null ? status : "Borrador";
        }
    }
    
    private File createPDFFile(Quote quote) throws IOException {
        // Create directory for PDFs
        File pdfDir = new File(context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), "quotes");
        if (!pdfDir.exists()) {
            pdfDir.mkdirs();
        }
        
        // Generate filename
        String quoteNumber = quote.getQuoteNumber() != null ? quote.getQuoteNumber() : "COT-" + quote.getId();
        String filename = "Cotizacion_" + quoteNumber.replace("/", "-") + "_" + 
                         new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new java.util.Date()) + ".pdf";
        
        return new File(pdfDir, filename);
    }
}