package com.contabilidad.unapec.backend_contabilidad.service;

import com.contabilidad.unapec.backend_contabilidad.model.Moneda;
import com.contabilidad.unapec.backend_contabilidad.repository.MonedaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MonedaService {

    private final MonedaRepository monedaRepository;

    public List<Moneda> listarTodas() {
        return monedaRepository.findAll();
    }

    public Moneda guardar(Moneda moneda) {
        if (moneda.getCodigoIso() != null) {
            moneda.setCodigoIso(moneda.getCodigoIso().toUpperCase());
        }
        return monedaRepository.save(moneda);
    }

    public Optional<Moneda> buscarPorId(Long id) {
        return monedaRepository.findById(id);
    }

    public void eliminar(Long id) {
        monedaRepository.deleteById(id);
    }
}
