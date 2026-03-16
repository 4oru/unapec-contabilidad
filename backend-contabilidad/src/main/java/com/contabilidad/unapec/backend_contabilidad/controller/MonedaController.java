package com.contabilidad.unapec.backend_contabilidad.controller;

import com.contabilidad.unapec.backend_contabilidad.model.Moneda;
import com.contabilidad.unapec.backend_contabilidad.service.MonedaService; // Importamos el Servicio
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid; // Para las validaciones
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monedas")
@RequiredArgsConstructor
@Tag(name = "Monedas", description = "Endpoints para la gestión de tipos de moneda y tasas de cambio")
public class MonedaController {

    private final MonedaService monedaService;

    @GetMapping
    @Operation(summary = "Listar todas las monedas")
    public List<Moneda> listarTodas() {
        // 2. Llamamos al método del servicio
        return monedaService.listarTodas();
    }

    @PostMapping
    @Operation(summary = "Registrar nueva moneda")
    // 3. Usamos @Valid para proteger la entrada de datos
    public ResponseEntity<Moneda> crear(@Valid @RequestBody Moneda moneda) {
        Moneda nuevaMoneda = monedaService.guardar(moneda);
        return new ResponseEntity<>(nuevaMoneda, HttpStatus.CREATED);
    }
}