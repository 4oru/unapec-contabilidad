package com.contabilidad.unapec.backend_contabilidad.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.ToString;
import java.math.BigDecimal;

@Entity
@Table(name = "cuentas_contables_t")
@Data
public class CuentaContable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @io.swagger.v3.oas.annotations.media.Schema(description = "ID único de la cuenta contable", example = "1", accessMode = io.swagger.v3.oas.annotations.media.Schema.AccessMode.READ_ONLY)
    private Long id;

    @Column(name = "codigo", length = 50)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Código o número de cuenta", example = "1101-01")
    private String codigo;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(name = "nombre", length = 100)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Nombre de la cuenta contable", example = "Caja General")
    private String nombre;

    @Column(name = "descripcion", length = 100)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Descripción detallada de la cuenta", example = "Registra el efectivo en caja")
    private String descripcion;

    @Column(name = "permite_movimiento")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Indica si la cuenta acepta transacciones directas", example = "true")
    private Boolean permiteMovimiento;

    @ManyToOne
    @JoinColumn(name = "tipo_id", referencedColumnName = "id")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Tipo de cuenta (Activo, Pasivo, etc.)")
    private TipoCuenta tipo;

    @Column(name = "nivel")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Nivel de la cuenta en el árbol (1, 2, 3...)", example = "1")
    private Integer nivel;

    @Column(name = "balance", precision = 12, scale = 4)
    @io.swagger.v3.oas.annotations.media.Schema(description = "Balance actual de la cuenta", example = "5000.00", accessMode = io.swagger.v3.oas.annotations.media.Schema.AccessMode.READ_ONLY)
    private BigDecimal balance;

    @ManyToOne
    @JoinColumn(name = "cuenta_mayor_id", referencedColumnName = "id")
    @JsonIgnoreProperties({"cuentaMayor", "subCuentas"})
    @ToString.Exclude
    @io.swagger.v3.oas.annotations.media.Schema(description = "Cuenta superior de mayor (si aplica)")
    private CuentaContable cuentaMayor;

    @Column(name = "estado")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Estado de la cuenta (true = Activo, false = Inactivo)", example = "true")
    private Boolean estado;

    @PrePersist
    protected void onCreate() {
        if (this.estado == null) {
            this.estado = true;
        }
        if (this.permiteMovimiento == null) {
            this.permiteMovimiento = true;
        }
        if (this.balance == null) {
            this.balance = BigDecimal.ZERO;
        }
    }
}
