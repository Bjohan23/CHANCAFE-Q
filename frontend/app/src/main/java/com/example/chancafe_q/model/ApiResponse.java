package com.example.chancafe_q.model;

/**
 * Modelo para la respuesta del login
 */
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private int code;

    // Constructor vacío
    public ApiResponse() {
    }

    // Constructor con parámetros
    public ApiResponse(boolean success, String message, T data, int code) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.code = code;
    }

    // Getters y Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    // Método de compatibilidad para getStatusCode()
    public int getStatusCode() {
        return code;
    }

    @Override
    public String toString() {
        return "ApiResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", data=" + data +
                ", code=" + code +
                '}';
    }
}