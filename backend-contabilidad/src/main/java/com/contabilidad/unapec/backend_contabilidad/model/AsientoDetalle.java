package com.contabilidad.unapec.backend_contabilidad.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "asientos_detalle_t")
@Data
public class AsientoDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID único del detalle del asiento", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "asiento_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    private Asiento asiento;

    @NotNull(message = "La cuenta contable es obligatoria")
    @ManyToOne
    @JoinColumn(name = "cuenta_id", referencedColumnName = "id")
    @Schema(description = "Cuenta contable asociada al detalle")
    private CuentaContable cuenta;

    @Column(name = "tipo_movimiento", length = 10)
    @Schema(description = "Tipo de movimiento (Debito o Credito)", allowableValues = {"Debito", "Credito"}, example = "Debito")
    private String tipoMovimiento;

    @NotNull(message = "El monto es obligatorio")
    @Column(name = "monto", precision = 18, scale = 2)
    @Schema(description = "Monto del movimiento", example = "1500.00")
    private BigDecimal monto;
}
