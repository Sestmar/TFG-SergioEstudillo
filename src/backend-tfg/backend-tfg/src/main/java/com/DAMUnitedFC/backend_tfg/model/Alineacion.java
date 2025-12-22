package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "alineacion")
@Data
public class Alineacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- RELACIONES ---

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_partido", nullable = false)
    @JsonIgnoreProperties({"alineaciones", "hibernateLazyInitializer", "handler"})
    private Partido partido;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_jugador", nullable = false)
    @JsonIgnoreProperties({"alineaciones", "equipos", "hibernateLazyInitializer", "handler"})
    private Jugador jugador;

    // --- DATOS PROPIOS ---

    // ✅ FIX: Añadimos este campo OBLIGATORIO en tu base de datos
    @Column(name = "id_equipo", nullable = false)
    private Long idEquipo;

    @Column(name = "slot_id")
    private String slotId;

    @Column(name = "es_titular")
    private Boolean esTitular;

    public Alineacion() {}
}