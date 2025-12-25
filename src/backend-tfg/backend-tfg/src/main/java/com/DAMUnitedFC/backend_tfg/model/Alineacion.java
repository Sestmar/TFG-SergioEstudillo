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
    // Ignoramos la lista inversa para que no vuelva a descargar el partido entero
    @JsonIgnoreProperties({"alineaciones", "equipoLocal", "equipoVisitante", "hibernateLazyInitializer", "handler"})
    private Partido partido;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_jugador", nullable = false)
    // 🔥 CORRECCIÓN CLAVE AQUÍ ABAJO 👇
    // Añadimos "equipoPrincipal" a la lista. Esto es lo que estaba bloqueando tu app.
    // Mantenemos "usuario" accesible porque el frontend lo necesita para la FOTO y NOMBRE.
    @JsonIgnoreProperties({"equipoPrincipal", "alineaciones", "estadisticas", "equipos", "partidos", "hibernateLazyInitializer", "handler"})
    private Jugador jugador;

    // --- DATOS TÉCNICOS ---

    @Column(name = "id_equipo", nullable = false)
    private Long idEquipo;

    @Column(name = "slot_id")
    private String slotId;

    @Column(name = "es_titular")
    private Boolean esTitular;

    // --- DATOS DE RENDIMIENTO ---

    @Column(name = "goles")
    private Integer goles = 0;

    @Column(name = "asistencias")
    private Integer asistencias = 0;

    @Column(name = "minutos_jugados")
    private Integer minutosJugados = 0;

    @Column(name = "tarjeta_amarilla")
    private Boolean tarjetaAmarilla = false;

    @Column(name = "tarjeta_roja")
    private Boolean tarjetaRoja = false;

    public Alineacion() {}
}