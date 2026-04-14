package com.contabilidad.unapec.backend_contabilidad.dto;

import com.contabilidad.unapec.backend_contabilidad.model.Asiento;
import com.contabilidad.unapec.backend_contabilidad.model.AsientoDetalle;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO de respuesta para Asiento.
 * Incluye resúmenes de Auxiliar y Moneda para evitar referencias circulares
 * y enriquecer la tabla del frontend sin exponer toda la entidad.
 */
@Data
public class AsientoResponseDTO {

    private Long id;
    private String descripcion;
    private LocalDate fechaAsiento;
    private BigDecimal montoTotal;
    private BigDecimal montoTotalDop;
    private BigDecimal tasaCambio;
    private Boolean estado;

    // ── Resumen Auxiliar ──────────────────────────────────────────────────────
    private AuxiliarResumen auxiliar;

    // ── Resumen Moneda ────────────────────────────────────────────────────────
    private MonedaResumen moneda;

    // ── Detalles del asiento ──────────────────────────────────────────────────
    private List<DetalleResumen> detalles;

    // ─────────────────────────────────────────────────────────────────────────
    // Inner summary classes (sin relaciones JPA, 100% serialización segura)
    // ─────────────────────────────────────────────────────────────────────────

    @Data
    public static class AuxiliarResumen {
        private Long id;
        private String nombre;
        private String descripcion;
    }

    @Data
    public static class MonedaResumen {
        private Long id;
        private String codigoIso;
        private String nombre;
        private String simbolo;
        private Double tasaCambio;
    }

    @Data
    public static class DetalleResumen {
        private Long id;
        private String cuentaCodigo;
        private String cuentaNombre;
        private String tipoMovimiento;
        private BigDecimal monto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Static factory / mapper
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Mapea una entidad {@link Asiento} a su DTO de respuesta.
     * Todos los campos nullable se manejan con Optional-style checks.
     */
    public static AsientoResponseDTO from(Asiento a) {
        AsientoResponseDTO dto = new AsientoResponseDTO();
        dto.setId(a.getId());
        dto.setDescripcion(a.getDescripcion());
        dto.setFechaAsiento(a.getFechaAsiento());
        dto.setMontoTotal(a.getMontoTotal());
        dto.setMontoTotalDop(a.getMontoTotalDop());
        dto.setTasaCambio(a.getTasaCambio());
        dto.setEstado(a.getEstado());

        // Auxiliar (puede ser null si el asiento no está asociado a uno)
        if (a.getAuxiliar() != null) {
            AuxiliarResumen aux = new AuxiliarResumen();
            aux.setId(a.getAuxiliar().getId());
            aux.setNombre(a.getAuxiliar().getNombre());
            aux.setDescripcion(a.getAuxiliar().getDescripcion());
            dto.setAuxiliar(aux);
        }

        // Moneda (puede ser null)
        if (a.getMoneda() != null) {
            MonedaResumen mon = new MonedaResumen();
            mon.setId(a.getMoneda().getId());
            mon.setCodigoIso(a.getMoneda().getCodigoIso());
            mon.setNombre(a.getMoneda().getNombre());
            mon.setSimbolo(a.getMoneda().getSimbolo());
            mon.setTasaCambio(a.getMoneda().getTasaCambio());
            dto.setMoneda(mon);
        }

        // Detalles
        if (a.getDetalles() != null) {
            List<DetalleResumen> detalles = a.getDetalles().stream().map(d -> {
                DetalleResumen det = new DetalleResumen();
                det.setId(d.getId());
                det.setTipoMovimiento(d.getTipoMovimiento());
                det.setMonto(d.getMonto());
                if (d.getCuenta() != null) {
                    det.setCuentaCodigo(d.getCuenta().getCodigo());
                    det.setCuentaNombre(d.getCuenta().getNombre());
                }
                return det;
            }).collect(Collectors.toList());
            dto.setDetalles(detalles);
        }

        return dto;
    }
}
