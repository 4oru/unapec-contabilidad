package com.contabilidad.unapec.backend_contabilidad.controller;

import com.contabilidad.unapec.backend_contabilidad.model.Configuracion;
import com.contabilidad.unapec.backend_contabilidad.service.ConfiguracionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/configuracion")
@RequiredArgsConstructor
@Tag(name = "Configuración", description = "Parámetros del sistema")
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    @GetMapping
    public List<Configuracion> listarTodas() {
        return configuracionService.listarTodas();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Configuracion> actualizar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String valor = body.get("valor");
        if (valor == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(configuracionService.actualizar(id, valor));
    }
}