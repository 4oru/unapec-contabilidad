package com.contabilidad.unapec.backend_contabilidad.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " con ID " + id + " no fue encontrado");
    }
}
