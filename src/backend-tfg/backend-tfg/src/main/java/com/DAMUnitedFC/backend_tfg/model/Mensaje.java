package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensajes")
@Data
@NoArgsConstructor
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remitente_id", nullable = false)
    private Usuario remitente;

    // null = mensaje privado; con valor = chat grupal del equipo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo_id")
    private Equipo equipo;

    // null = grupal; con valor = privado para este destinatario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinatario_id")
    private Usuario destinatario;

    // Null cuando el mensaje es solo un adjunto (imagen, audio, vídeo sin texto)
    @Column(columnDefinition = "TEXT", nullable = true)
    private String contenido;

    @Column(name = "url_adjunto", length = 500)
    private String urlAdjunto;

    @Column(name = "tipo_adjunto", length = 20)
    private String tipoAdjunto;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Column(nullable = false)
    private boolean leido = false;

    // Respuesta a otro mensaje (parent_id) — FK auto-referencial
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Mensaje parent;

    @Column(nullable = false)
    private boolean editado = false;

    @Column(nullable = false)
    private boolean eliminado = false;
}
