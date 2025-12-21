package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "partido")
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_partido")
    private Long idPartido;

    @Column(name = "id_equipo")
    private Long idEquipo; // El equipo propio (Alevín A)

    private String rival;

    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;

    private String lugar;

    private String tipo; // LIGA, AMISTOSO, ENTRENAMIENTO

    // Constructores
    public Partido() {}

    public Partido(Long idEquipo, String rival, LocalDateTime fechaHora, String lugar, String tipo) {
        this.idEquipo = idEquipo;
        this.rival = rival;
        this.fechaHora = fechaHora;
        this.lugar = lugar;
        this.tipo = tipo;
    }

    // Getters y Setters
    public Long getIdPartido() { return idPartido; }
    public void setIdPartido(Long idPartido) { this.idPartido = idPartido; }

    public Long getIdEquipo() { return idEquipo; }
    public void setIdEquipo(Long idEquipo) { this.idEquipo = idEquipo; }

    public String getRival() { return rival; }
    public void setRival(String rival) { this.rival = rival; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
}
