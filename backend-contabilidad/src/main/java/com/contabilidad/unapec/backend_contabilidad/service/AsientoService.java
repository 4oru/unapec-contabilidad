package com.contabilidad.unapec.backend_contabilidad.service;

import com.contabilidad.unapec.backend_contabilidad.model.Asiento;
import com.contabilidad.unapec.backend_contabilidad.model.AsientoDetalle;
import com.contabilidad.unapec.backend_contabilidad.repository.AsientoDetalleRepository;
import com.contabilidad.unapec.backend_contabilidad.repository.AsientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AsientoService {

    @Autowired
    private AsientoRepository asientoRepository;

    @Autowired
    private AsientoDetalleRepository detalleRepository;

    public List<Asiento> findAll() {
        return asientoRepository.findAll();
    }

    public Asiento getById(Long id) {
        return asientoRepository.findById(id).orElseThrow(() -> new RuntimeException("Asiento no encontrado"));
    }

    @Transactional
    public Asiento create(Asiento asiento, List<AsientoDetalle> detalles) {
        if (detalles == null || detalles.isEmpty()) {
            throw new IllegalArgumentException("El asiento debe contener al menos un detalle de movimiento.");
        }

        java.math.BigDecimal totalDebitos = java.math.BigDecimal.ZERO;
        java.math.BigDecimal totalCreditos = java.math.BigDecimal.ZERO;

        for (AsientoDetalle det : detalles) {
            if ("Debito".equalsIgnoreCase(det.getTipoMovimiento())) {
                totalDebitos = totalDebitos.add(det.getMonto());
            } else if ("Credito".equalsIgnoreCase(det.getTipoMovimiento())) {
                totalCreditos = totalCreditos.add(det.getMonto());
            } else {
                throw new IllegalArgumentException("El tipo de movimiento debe ser 'Debito' o 'Credito'. Valor recibido: " + det.getTipoMovimiento());
            }
        }

        if (totalDebitos.compareTo(totalCreditos) != 0) {
            throw new IllegalArgumentException("El asiento está descuadrado: Total Débitos (" 
              + totalDebitos + ") no coincide con Total Créditos (" + totalCreditos + ").");
        }

        // Asignamos el monto validado al encabezado
        asiento.setMontoTotal(totalDebitos);

        // Calcular monto en DOP
        java.math.BigDecimal tasa = asiento.getTasaCambio() != null
                ? asiento.getTasaCambio()
                : java.math.BigDecimal.ONE;
        asiento.setMontoTotalDop(totalDebitos.multiply(tasa));
        
        Asiento saved = asientoRepository.save(asiento);
        
        for (AsientoDetalle det : detalles) {
            det.setAsiento(saved);
            detalleRepository.save(det);
        }
        
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        // La eliminación en cascada borrará los detalles (gracias al ON DELETE CASCADE en SQL o JPA)
        asientoRepository.deleteById(id);
    }
}
