package com.contabilidad.unapec.backend_contabilidad.service;

import com.contabilidad.unapec.backend_contabilidad.dto.DashboardStatsDTO;
import com.contabilidad.unapec.backend_contabilidad.model.Asiento;
import com.contabilidad.unapec.backend_contabilidad.model.AsientoDetalle;
import com.contabilidad.unapec.backend_contabilidad.repository.AsientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AsientoRepository asientoRepository;

    private static final String[] MESES_ABREV = {"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};

    public List<DashboardStatsDTO> getMonthlyStats() {
        List<Asiento> asientos = asientoRepository.findAll();
        
        // Map to store stats by month index (0-11)
        Map<Integer, DashboardStatsDTO> statsMap = new HashMap<>();
        for (int i = 0; i < 12; i++) {
            statsMap.put(i + 1, new DashboardStatsDTO(MESES_ABREV[i], BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));
        }

        for (Asiento asiento : asientos) {
            // Ignorar asientos anulados
            if (asiento.getEstado() != null && !asiento.getEstado()) continue;

            int month = asiento.getFechaAsiento().getMonthValue();
            DashboardStatsDTO dto = statsMap.get(month);
            
            if (asiento.getDetalles() == null) continue;

            for (AsientoDetalle detalle : asiento.getDetalles()) {
                if (detalle.getCuenta() == null || detalle.getCuenta().getTipo() == null || detalle.getMonto() == null) continue;
                
                String tipoNombre = detalle.getCuenta().getTipo().getNombre().toUpperCase();
                BigDecimal tasa = asiento.getTasaCambio() != null ? asiento.getTasaCambio() : BigDecimal.ONE;
                BigDecimal montoDop = detalle.getMonto().multiply(tasa);

                boolean isDebito = "Debito".equalsIgnoreCase(detalle.getTipoMovimiento());
                boolean isCredito = "Credito".equalsIgnoreCase(detalle.getTipoMovimiento());

                if (tipoNombre.contains("INGRESO")) {
                    if (isCredito) {
                        dto.setIngresos(dto.getIngresos().add(montoDop));
                    } else if (isDebito) {
                        dto.setIngresos(dto.getIngresos().subtract(montoDop));
                    }
                } else if (tipoNombre.contains("GASTO") || tipoNombre.contains("COSTO")) {
                    if (isDebito) {
                        dto.setGastos(dto.getGastos().add(montoDop));
                    } else if (isCredito) {
                        dto.setGastos(dto.getGastos().subtract(montoDop));
                    }
                }
            }
        }

        // Calculate balance for each month
        for (DashboardStatsDTO dto : statsMap.values()) {
            dto.setBalance(dto.getIngresos().subtract(dto.getGastos()));
        }

        return statsMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());
    }
}
