package com.contabilidad.unapec.backend_contabilidad.controller;

import com.contabilidad.unapec.backend_contabilidad.dto.DashboardStatsDTO;
import com.contabilidad.unapec.backend_contabilidad.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Endpoints para estadísticas y métricas del dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats/monthly")
    @Operation(summary = "Obtener estadísticas mensuales de ingresos, gastos y balance")
    public List<DashboardStatsDTO> getMonthlyStats() {
        return dashboardService.getMonthlyStats();
    }
}
