package com.contabilidad.unapec.backend_contabilidad.service;

import com.contabilidad.unapec.backend_contabilidad.exception.ResourceNotFoundException;
import com.contabilidad.unapec.backend_contabilidad.model.CuentaContable;
import com.contabilidad.unapec.backend_contabilidad.repository.CuentaContableRepository;
import com.contabilidad.unapec.backend_contabilidad.repository.TipoCuentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CuentaContableService {

    private final CuentaContableRepository repository;
    private final TipoCuentaRepository tipoRepository;

    public List<CuentaContable> findAll() {
        return repository.findAll();
    }

    public CuentaContable getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta contable", id));
    }

    public CuentaContable create(CuentaContable cuenta) {
        validateTipoCuenta(cuenta);
        validateCuentaMayor(cuenta, null);
        return repository.save(cuenta);
    }

    public CuentaContable update(Long id, CuentaContable data) {
        CuentaContable existing = getById(id);

        validateTipoCuenta(data);
        validateCuentaMayor(data, id);

        existing.setCodigo(data.getCodigo());
        existing.setNombre(data.getNombre());
        existing.setDescripcion(data.getDescripcion());
        existing.setPermiteMovimiento(data.getPermiteMovimiento());
        existing.setTipo(data.getTipo());
        existing.setNivel(data.getNivel());
        existing.setEstado(data.getEstado());
        existing.setCuentaMayor(
                (data.getCuentaMayor() != null && data.getCuentaMayor().getId() != null)
                        ? data.getCuentaMayor()
                        : null
        );

        return repository.save(existing);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Cuenta contable", id);
        }
        repository.deleteById(id);
    }

    // ── Private helpers ─────────────────────────────────────────────────────

    private void validateTipoCuenta(CuentaContable cuenta) {
        if (cuenta.getTipo() == null || cuenta.getTipo().getId() == null) {
            throw new IllegalArgumentException("El tipo de cuenta es obligatorio");
        }
        if (!tipoRepository.existsById(cuenta.getTipo().getId())) {
            throw new IllegalArgumentException(
                    "El tipo de cuenta con ID " + cuenta.getTipo().getId() + " no existe");
        }
    }

    private void validateCuentaMayor(CuentaContable cuenta, Long currentId) {
        if (cuenta.getCuentaMayor() == null || cuenta.getCuentaMayor().getId() == null) {
            return;
        }
        if (currentId != null && currentId.equals(cuenta.getCuentaMayor().getId())) {
            throw new IllegalArgumentException("Una cuenta no puede ser su propia cuenta mayor");
        }
        CuentaContable mayor = getById(cuenta.getCuentaMayor().getId());
        if (Boolean.TRUE.equals(mayor.getPermiteMovimiento())) {
            throw new IllegalArgumentException(
                    "La cuenta superior '" + mayor.getNombre()
                            + "' no puede ser padre porque permite movimientos directos (debe ser de agrupación)");
        }
    }
}
