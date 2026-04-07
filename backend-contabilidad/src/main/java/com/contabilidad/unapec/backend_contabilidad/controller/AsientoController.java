package com.contabilidad.unapec.backend_contabilidad.controller;

import com.contabilidad.unapec.backend_contabilidad.model.Asiento;
import com.contabilidad.unapec.backend_contabilidad.service.AsientoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asientos")
@RequiredArgsConstructor
@Tag(name = "Asientos Contables", description = "Endpoints para registrar transacciones y asientos contables")
public class AsientoController {

    private final AsientoService service;

    @GetMapping(produces = "application/json")
    @Operation(operationId = "listarAsientos", summary = "Listar todos los asientos")
    public List<Asiento> listarTodos() {
        return service.findAll();
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    @Operation(operationId = "obtenerAsientoPorId", summary = "Obtener un asiento por ID")
    public ResponseEntity<Asiento> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping(produces = "application/json")
    @Operation(operationId = "registrarAsiento", summary = "Registrar un nuevo asiento con sus detalles")
    @ApiResponse(responseCode = "201", description = "Asiento creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    public ResponseEntity<Asiento> crear(@Valid @RequestBody Asiento asiento) {
        return new ResponseEntity<>(service.create(asiento), HttpStatus.CREATED);
    }

    @DeleteMapping(value = "/{id}", produces = "application/json")
    @Operation(operationId = "eliminarAsiento", summary = "Eliminar/Anular un asiento")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
