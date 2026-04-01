package com.contabilidad.unapec.backend_contabilidad.service;

import com.contabilidad.unapec.backend_contabilidad.model.Configuracion;
import com.contabilidad.unapec.backend_contabilidad.repository.ConfiguracionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConfiguracionService {

    private final ConfiguracionRepository configuracionRepository;

    public List<Configuracion> listarTodas() {
        return configuracionRepository.findAll();
    }

    public Configuracion actualizar(Long id, String valor) {
        Configuracion config = configuracionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));
        if (!config.getEditable()) {
            throw new IllegalArgumentException("Esta configuración es de solo lectura.");
        }
        config.setValor(valor);
        return configuracionRepository.save(config);
    }

    public String obtenerValor(String clave) {
        return configuracionRepository.findByClave(clave)
                .map(Configuracion::getValor)
                .orElse(null);
    }
}