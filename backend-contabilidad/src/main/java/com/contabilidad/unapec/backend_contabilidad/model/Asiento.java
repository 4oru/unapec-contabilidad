package com.contabilidad.unapec.backend_contabilidad.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "asientos_t")
@Data
public class Asiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @io.swagger.v3.oas.annotations.media.Schema(description = "ID único del asiento", example = "1", accessMode = io.swagger.v3.oas.annotations.media.Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotBlank(message = "La descripción es obligatoria")
    @Column(name = "descripcion", length = 255)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Descripción o concepto del asiento contable", example = "Registro de gastos de papelería")
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "auxiliar_id", referencedColumnName = "id")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Auxiliar que registra el asiento")
    private Auxiliar auxiliar;

    @Column(name = "fecha_asiento")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Fecha en que se registra el asiento", example = "2026-03-17")
    private LocalDate fechaAsiento;

    @Column(name = "monto_total", precision = 18, scale = 2)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Suma total de los movimientos (Debe cuadrar Débitos = Créditos)", example = "1500.00")
    private BigDecimal montoTotal;

    @OneToMany(mappedBy = "asiento", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Lista de detalles/movimientos del asiento")
    private java.util.List<AsientoDetalle> detalles = new java.util.ArrayList<>();

    @Column(name = "estado")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Estado del asiento (true = Activo, false = Anulado)", example = "true")
    private Boolean estado;

    @ManyToOne
    @JoinColumn(name = "moneda_id", referencedColumnName = "id")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Moneda del asiento")
    private Moneda moneda;

    @Column(name = "tasa_cambio", precision = 12, scale = 4)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Tasa de cambio al momento del asiento", example = "1.0000")
    private java.math.BigDecimal tasaCambio;

    @Column(name = "monto_total_dop", precision = 18, scale = 2)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Monto total consolidado en DOP", example = "1500.00")
    private java.math.BigDecimal montoTotalDop;

    @PrePersist
    protected void onCreate() {
        if (this.estado == null) {
            this.estado = true;
        }
        if (this.fechaAsiento == null) {
            this.fechaAsiento = LocalDate.now();
        }

        if (this.tasaCambio == null) {
            this.tasaCambio = java.math.BigDecimal.ONE;
        }
    }
}
