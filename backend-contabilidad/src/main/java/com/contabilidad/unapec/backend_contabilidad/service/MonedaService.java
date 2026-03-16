package com.contabilidad.unapec.backend_contabilidad.service;

import com.contabilidad.unapec.backend_contabilidad.model.Moneda;
import com.contabilidad.unapec.backend_contabilidad.repository.MonedaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service // Le dice a Spring que esta clase contiene la lógica de negocio
@RequiredArgsConstructor // Crea el constructor para inyectar el repositorio automáticamente
public class MonedaService {

    private final MonedaRepository monedaRepository;

    // 1. Obtener todas las monedas
    public List<Moneda> listarTodas() {
        return monedaRepository.findAll();
    }

    // 2. Guardar una moneda (Aquí podrías poner validaciones)
    public Moneda guardar(Moneda moneda) {
        // Ejemplo de lógica: Asegurar que el código ISO siempre esté en mayúsculas
        if (moneda.getCodigoIso() != null) {
            moneda.setCodigoIso(moneda.getCodigoIso().toUpperCase());
        }
        return monedaRepository.save(moneda);
    }

    // 3. Buscar una moneda por su ID
    public Optional<Moneda> buscarPorId(Long id) {
        return monedaRepository.findById(id);
    }

    // 4. Eliminar una moneda
    public void eliminar(Long id) {
        monedaRepository.deleteById(id);
    }
}