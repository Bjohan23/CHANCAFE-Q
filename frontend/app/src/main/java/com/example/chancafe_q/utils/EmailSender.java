package com.example.chancafe_q.utils;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import com.example.chancafe_q.model.Quote;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class EmailSender {
    
    private final Context context;
    private final ExecutorService executor;
    private final SimpleDateFormat dateFormat;
    
    public interface EmailSendCallback {
        void onSuccess();
        void onError(String error);
    }
    
    public EmailSender(Context context) {
        this.context = context;
        this.executor = Executors.newSingleThreadExecutor();
        this.dateFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
    }
    
    public void sendQuoteEmail(Quote quote, File pdfFile, EmailSendCallback callback) {
        executor.execute(() -> {
            try {
                sendEmailWithIntent(quote, pdfFile);
                callback.onSuccess();
            } catch (Exception e) {
                callback.onError(e.getMessage());
            }
        });
    }
    
    private void sendEmailWithIntent(Quote quote, File pdfFile) throws Exception {
        if (quote.getClient() == null || quote.getClient().getEmail() == null) {
            throw new Exception("El cliente no tiene email registrado");
        }
        
        String clientEmail = quote.getClient().getEmail();
        String quoteNumber = quote.getQuoteNumber() != null ? quote.getQuoteNumber() : "COT-" + quote.getId();
        
        // Create email subject
        String subject = "Cotización " + quoteNumber + " - CHANCAFE Q";
        
        // Create email body
        String body = createEmailBody(quote);
        
        // Create intent for email
        Intent emailIntent = new Intent(Intent.ACTION_SEND);
        emailIntent.setType("message/rfc822");
        
        // Set recipient
        emailIntent.putExtra(Intent.EXTRA_EMAIL, new String[]{clientEmail});
        
        // Set subject and body
        emailIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
        emailIntent.putExtra(Intent.EXTRA_TEXT, body);
        
        // Attach PDF if available
        if (pdfFile != null && pdfFile.exists()) {
            Uri pdfUri = FileProvider.getUriForFile(
                context,
                context.getPackageName() + ".fileprovider",
                pdfFile
            );
            emailIntent.putExtra(Intent.EXTRA_STREAM, pdfUri);
            emailIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        }
        
        // Start email client
        try {
            Intent chooser = Intent.createChooser(emailIntent, "Enviar cotización por email");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(chooser);
        } catch (Exception e) {
            throw new Exception("No se encontró una aplicación de email disponible");
        }
    }
    
    private String createEmailBody(Quote quote) {
        StringBuilder body = new StringBuilder();
        
        // Greeting
        String clientName = getClientName(quote);
        body.append("Estimado/a ").append(clientName).append(",\n\n");
        
        // Introduction
        body.append("Nos complace enviarle la cotización solicitada con el detalle de los productos de su interés.\n\n");
        
        // Quote details
        body.append("DETALLES DE LA COTIZACIÓN:\n");
        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        String quoteNumber = quote.getQuoteNumber() != null ? quote.getQuoteNumber() : "COT-" + quote.getId();
        body.append("• Número: ").append(quoteNumber).append("\n");
        
        if (quote.getTitle() != null && !quote.getTitle().trim().isEmpty()) {
            body.append("• Título: ").append(quote.getTitle()).append("\n");
        }
        
        if (quote.getCreatedAt() != null) {
            body.append("• Fecha: ").append(dateFormat.format(quote.getCreatedAt())).append("\n");
        }
        
        if (quote.getValidUntil() != null) {
            body.append("• Válida hasta: ").append(dateFormat.format(quote.getValidUntil())).append("\n");
        }
        
        // Total amount
        String currency = quote.getCurrency() != null ? quote.getCurrency() : "PEN";
        String symbol = "PEN".equals(currency) ? "S/ " : "$ ";
        body.append("• Monto total: ").append(symbol).append(String.format(Locale.getDefault(), "%.2f", quote.getTotal())).append("\n\n");
        
        // Items summary (if available)
        if (quote.getQuoteItems() != null && !quote.getQuoteItems().isEmpty()) {
            body.append("PRODUCTOS INCLUIDOS:\n");
            body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            
            int itemCount = 0;
            for (com.example.chancafe_q.model.QuoteItem item : quote.getQuoteItems()) {
                if (itemCount >= 5) { // Limit to first 5 items
                    body.append("... y ").append(quote.getQuoteItems().size() - 5).append(" productos más\n");
                    break;
                }
                
                String productName = item.getProduct() != null ? item.getProduct().getName() : 
                    (item.getProductName() != null ? item.getProductName() : "Producto");
                
                body.append("• ").append(productName)
                    .append(" (Cant: ").append(item.getQuantity()).append(")")
                    .append(" - ").append(symbol)
                    .append(String.format(Locale.getDefault(), "%.2f", item.getUnitPrice()))
                    .append("\n");
                
                itemCount++;
            }
            body.append("\n");
        }
        
        // Notes (if any)
        if (quote.getNotes() != null && !quote.getNotes().trim().isEmpty()) {
            body.append("OBSERVACIONES:\n");
            body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            body.append(quote.getNotes()).append("\n\n");
        }
        
        // Terms and conditions
        body.append("TÉRMINOS Y CONDICIONES:\n");
        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        body.append("• Los precios están expresados en ").append(currency.equals("USD") ? "Dólares Americanos" : "Soles Peruanos").append("\n");
        body.append("• Los precios incluyen IGV (18%)\n");
        
        if (quote.getValidUntil() != null) {
            body.append("• Cotización válida hasta el ").append(dateFormat.format(quote.getValidUntil())).append("\n");
        } else {
            body.append("• Cotización válida por 30 días calendario\n");
        }
        
        body.append("• Tiempo de entrega: 5-7 días hábiles (sujeto a disponibilidad)\n");
        body.append("• Forma de pago: Por coordinar\n\n");
        
        // Call to action
        body.append("Esperamos que nuestra propuesta sea de su agrado. Para cualquier consulta o aclaración, no dude en contactarnos.\n\n");
        body.append("Quedamos atentos a su respuesta.\n\n");
        
        // Signature
        body.append("Saludos cordiales,\n\n");
        body.append("Equipo Comercial\n");
        body.append("CHANCAFE Q\n");
        body.append("Sistema de Gestión de Ventas\n\n");
        
        // Footer
        body.append("---\n");
        body.append("Este email fue generado automáticamente por el sistema CHANCAFE Q\n");
        body.append("Fecha de envío: ").append(dateFormat.format(new java.util.Date()));
        
        return body.toString();
    }
    
    private String getClientName(Quote quote) {
        if (quote.getClient() == null) {
            return "Cliente";
        }
        
        if (quote.getClient().getBusinessName() != null && !quote.getClient().getBusinessName().trim().isEmpty()) {
            return quote.getClient().getBusinessName();
        }
        
        StringBuilder name = new StringBuilder();
        if (quote.getClient().getFirstName() != null) {
            name.append(quote.getClient().getFirstName());
        }
        if (quote.getClient().getLastName() != null) {
            if (name.length() > 0) name.append(" ");
            name.append(quote.getClient().getLastName());
        }
        
        return name.length() > 0 ? name.toString() : "Cliente";
    }
    
    // Alternative method for future SMTP implementation
    public void sendQuoteEmailSMTP(Quote quote, File pdfFile, String smtpServer, String smtpPort, 
                                  String senderEmail, String senderPassword, EmailSendCallback callback) {
        // TODO: Implement SMTP email sending for production use
        // This would require adding email libraries like JavaMail API
        // For now, use the intent-based approach above
        
        executor.execute(() -> {
            try {
                // Placeholder for SMTP implementation
                // Would use JavaMail API to send emails directly
                // Properties props = new Properties();
                // props.put("mail.smtp.host", smtpServer);
                // props.put("mail.smtp.port", smtpPort);
                // ... implement SMTP sending
                
                callback.onError("SMTP email sending not implemented yet. Using email intent instead.");
            } catch (Exception e) {
                callback.onError("SMTP Error: " + e.getMessage());
            }
        });
    }
    
    // Method to validate email configuration
    public boolean isEmailConfigurationValid() {
        // Check if device has email apps installed
        Intent emailIntent = new Intent(Intent.ACTION_SEND);
        emailIntent.setType("message/rfc822");
        
        return emailIntent.resolveActivity(context.getPackageManager()) != null;
    }
    
    // Method to send simple text email without PDF
    public void sendSimpleQuoteEmail(Quote quote, EmailSendCallback callback) {
        sendQuoteEmail(quote, null, callback);
    }
}