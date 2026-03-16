package com.contabilidad.unapec.backend_contabilidad.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.contabilidad.unapec.backend_contabilidad.model.Moneda;

@Repository
public interface MonedaRepository extends JpaRepository<Moneda, Long> {

}
