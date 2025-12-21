package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;

@Entity
@Table(name = "alineacion")
public class Alineacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_equipo")
    private Long idEquipo;

    @Column(name = "id_jugador")
    private Long idJugador;

    @Column(name = "slot_id")
    private String slotId;

    // ✅ Campo clave para vincular con el partido
    @Column(name = "id_partido")
    private Long idPartido;

    // --- Constructores ---
    public Alineacion() {}

    public Alineacion(Long idEquipo, Long idJugador, String slotId, Long idPartido) {
        this.idEquipo = idEquipo;
        this.idJugador = idJugador;
        this.slotId = slotId;
        this.idPartido = idPartido;
    }

    // --- Getters y Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdEquipo() { return idEquipo; }
    public void setIdEquipo(Long idEquipo) { this.idEquipo = idEquipo; }

    public Long getIdJugador() { return idJugador; }
    public void setIdJugador(Long idJugador) { this.idJugador = idJugador; }

    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }

    public Long getIdPartido() { return idPartido; }
    public void setIdPartido(Long idPartido) { this.idPartido = idPartido; }
}