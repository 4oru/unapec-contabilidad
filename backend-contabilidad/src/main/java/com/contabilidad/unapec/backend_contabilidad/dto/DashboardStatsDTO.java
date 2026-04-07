package com.contabilidad.unapec.backend_contabilidad.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {
    private String mes;
    private BigDecimal ingresos;
    private BigDecimal gastos;
    private BigDecimal balance;
}
