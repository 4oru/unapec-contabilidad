package com.contabilidad.unapec.backend_contabilidad.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Importaciones correctas para la base de datos
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
@Entity 
@Table(name = "monedas_t")
public class Moneda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incremental (1, 2, 3...)
    private Long id;

    private String nombre;
    private String codigoIso; 
    private BigDecimal tasaCambio;
    private boolean estado;
    private LocalDateTime fechaCreacion;

}