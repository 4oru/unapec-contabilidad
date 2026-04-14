package com.contabilidad.unapec.backend_contabilidad.service;

import com.contabilidad.unapec.backend_contabilidad.dto.AsientoResponseDTO;
import com.contabilidad.unapec.backend_contabilidad.exception.ResourceNotFoundException;
import com.contabilidad.unapec.backend_contabilidad.model.Asiento;
import com.contabilidad.unapec.backend_contabilidad.model.AsientoDetalle;
import com.contabilidad.unapec.backend_contabilidad.repository.AsientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AsientoService {

    private final AsientoRepository asientoRepository;

    /** Devuelve todos los asientos como DTOs enriquecidos (incluye auxiliar y moneda). */
    public List<AsientoResponseDTO> findAll() {
        return asientoRepository.findAll()
                .stream()
                .map(AsientoResponseDTO::from)
                .collect(Collectors.toList());
    }

    /** Devuelve un asiento por ID como DTO enriquecido. */
    public AsientoResponseDTO getById(Long id) {
        Asiento asiento = asientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asiento", id));
        return AsientoResponseDTO.from(asiento);
    }

    @Transactional
    public Asiento create(Asiento asiento) {
        if (asiento.getDetalles() == null || asiento.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("El asiento debe contener al menos un detalle.");
        }

        BigDecimal totalDebitos = BigDecimal.ZERO;
        BigDecimal totalCreditos = BigDecimal.ZERO;

        for (AsientoDetalle det : asiento.getDetalles()) {
            det.setAsiento(asiento); // Vinculación manual garantizada
            if ("Debito".equalsIgnoreCase(det.getTipoMovimiento())) {
                totalDebitos = totalDebitos.add(det.getMonto());
            } else if ("Credito".equalsIgnoreCase(det.getTipoMovimiento())) {
                totalCreditos = totalCreditos.add(det.getMonto());
            }
        }

        if (totalDebitos.compareTo(totalCreditos) != 0) {
            throw new IllegalArgumentException("Asiento descuadrado: Debito (" + totalDebitos + ") != Credito (" + totalCreditos + ")");
        }

        asiento.setMontoTotal(totalDebitos);
        BigDecimal tasa = asiento.getTasaCambio() != null ? asiento.getTasaCambio() : BigDecimal.ONE;
        asiento.setMontoTotalDop(totalDebitos.multiply(tasa));

        Asiento saved = asientoRepository.saveAndFlush(asiento);
        
        // Retornar una versión fresca de la base de datos para asegurar que los detalles estén presentes
        return asientoRepository.findById(saved.getId())
                .orElseThrow(() -> new RuntimeException("Error recuperando el asiento recién guardado"));
    }

    @Transactional
    public void delete(Long id) {
        if (!asientoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Asiento", id);
        }
        asientoRepository.deleteById(id);
    }
}
