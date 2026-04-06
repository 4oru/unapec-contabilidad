package com.contabilidad.unapec.backend_contabilidad.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name = "auxiliares_t")
@Data
public class Auxiliar {

    @Id
    @Column(name = "id")
    @io.swagger.v3.oas.annotations.media.Schema(description = "ID del auxiliar (ej. 1 para Contabilidad, 2 para Compras)", example = "1")
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(name = "nombre", length = 50)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Nombre del auxiliar/módulo", example = "Cajas")
    private String nombre;

    @Column(name = "descripcion", length = 500)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Descripción para el auxiliar", example = "Módulo de recepción de ingresos")
    private String descripcion;

    @Column(name = "estado")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Estado del auxiliar (true = Activo, false = Inactivo)", example = "true")
    private Boolean estado;

    @PrePersist
    protected void onCreate() {
        if (this.estado == null) {
            this.estado = true;
        }
    }
}
