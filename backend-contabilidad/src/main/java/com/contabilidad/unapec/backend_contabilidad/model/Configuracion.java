package com.contabilidad.unapec.backend_contabilidad.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "configuracion_t")
@Data
public class Configuracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clave", length = 100, unique = true, nullable = false)
    private String clave;

    @Column(name = "valor", length = 500, nullable = false)
    private String valor;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "grupo", length = 50, nullable = false)
    private String grupo;

    @Column(name = "tipo", length = 20)
    private String tipo;

    @Column(name = "editable")
    private Boolean editable;
}