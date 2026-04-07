package com.contabilidad.unapec.backend_contabilidad.service;

import com.contabilidad.unapec.backend_contabilidad.exception.ResourceNotFoundException;
import com.contabilidad.unapec.backend_contabilidad.model.Auxiliar;
import com.contabilidad.unapec.backend_contabilidad.repository.AuxiliarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuxiliarService {

    private final AuxiliarRepository repository;

    public List<Auxiliar> findAll() {
        return repository.findAll();
    }

    public Auxiliar getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auxiliar", id));
    }

    public Auxiliar create(Auxiliar auxiliar) {
        if (auxiliar.getId() == null) {
            auxiliar.setId(repository.findMaxId() + 1);
        }
        return repository.save(auxiliar);
    }

    public Auxiliar update(Long id, Auxiliar data) {
        Auxiliar existing = getById(id);
        existing.setNombre(data.getNombre());
        existing.setDescripcion(data.getDescripcion());
        existing.setEstado(data.getEstado());
        return repository.save(existing);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Auxiliar", id);
        }
        repository.deleteById(id);
    }
}
