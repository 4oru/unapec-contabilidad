package com.contabilidad.unapec.backend_contabilidad.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "monedas_t")
@Data 
public class Moneda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @io.swagger.v3.oas.annotations.media.Schema(description = "ID único de la moneda", example = "1", accessMode = io.swagger.v3.oas.annotations.media.Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotBlank(message = "El código ISO es obligatorio")
    @Size(min = 3, max = 3, message = "El código ISO debe tener 3 caracteres")
    @Column(name = "codigo_iso", unique = true)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Código ISO de la moneda (3 caracteres)", example = "USD")
    private String codigoIso;

    @NotBlank(message = "El nombre es obligatorio")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Nombre de la moneda", example = "Dólar")
    private String nombre;

    @NotBlank(message = "El símbolo es obligatorio")
    @Size(max = 10, message = "El símbolo no puede tener más de 10 caracteres")
    @Column(name = "simbolo")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Símbolo de la moneda", example = "RD$")
    private String simbolo;

    // --- EL CAMPO QUE FALTABA ---
    @NotBlank(message = "La descripción es obligatoria")
    @Column(name = "descripcion") 
    @io.swagger.v3.oas.annotations.media.Schema(description = "Descripción detallada de la moneda", example = "Dólar Estadounidense")
    private String descripcion;

    @NotNull(message = "La tasa de cambio es obligatoria")
    @Column(name = "tasa_cambio")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Tasa de cambio respecto a la moneda base", example = "58.50")
    private Double tasaCambio;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Estado de la moneda (true = Activo, false = Inactivo)", example = "true")
    private Boolean estado;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = true; 
        }
    }
}