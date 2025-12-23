package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.ActaDto;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.PartidoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partidos")
@CrossOrigin(origins = "*")
public class PartidoController {

    @Autowired private AlineacionRepository alineacionRepo;
    @Autowired private JugadorRepository jugadorRepo; // Por si acaso
    @Autowired private PartidoRepository partidoRepo;

    // 1. Crear un Partido (Desde el modal "Nueva Convocatoria")
    @PostMapping
    public Partido createPartido(@RequestBody Partido partido) {
        return partidoRepo.save(partido);
    }

    // 2. Listar partidos de un equipo (Para el Dashboard)
    @GetMapping("/equipo/{idEquipo}")
    public List<Partido> getPartidosPorEquipo(@PathVariable Long idEquipo) {
        return partidoRepo.findByIdEquipoOrderByFechaHoraAsc(idEquipo);
    }

    // 3. Obtener detalle de UN partido (Para entrar a la Pizarra)
    @GetMapping("/{id}")
    public ResponseEntity<Partido> getPartido(@PathVariable Long id) {
        return partidoRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. CERRAR ACTA (Actualización Masiva)
    @PostMapping("/cerrar-acta")
    @Transactional // ¡Importante! Si falla algo, hace rollback de todo
    public ResponseEntity<?> cerrarActa(@RequestBody ActaDto acta) {
        try {
            // 1. Actualizar el Partido (Resultado y Estado)
            Partido p = partidoRepo.findById(acta.getIdPartido())
                    .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

            p.setGolesFavor(acta.getGolesFavor());
            p.setGolesContra(acta.getGolesContra());
            p.setEstado("FINALIZADO");
            partidoRepo.save(p);

            // 2. Actualizar Estadísticas de Jugadores
            for (ActaDto.PlayerStatUpdateDto stat : acta.getEstadisticas()) {
                // Buscamos la alineación específica de ese jugador en ese partido
                // Usamos el método que creamos antes o uno nuevo findBy...
                alineacionRepo.findFichaExacta(acta.getIdPartido(), Math.toIntExact(stat.getIdJugador()))
                        .ifPresent(ficha -> {
                            ficha.setGoles(stat.getGoles() != null ? stat.getGoles() : 0);
                            ficha.setAsistencias(stat.getAsistencias() != null ? stat.getAsistencias() : 0);
                            ficha.setMinutosJugados(stat.getMinutos() != null ? stat.getMinutos() : 0);
                            ficha.setTarjetaAmarilla(stat.getAmarilla() != null ? stat.getAmarilla() : false);
                            ficha.setTarjetaRoja(stat.getRoja() != null ? stat.getRoja() : false);

                            alineacionRepo.save(ficha);
                        });
            }

            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Acta cerrada correctamente"));

        } catch (Exception e) {
            e.printStackTrace();
            // Aquí también es bueno devolver JSON en el error
            return ResponseEntity.internalServerError().body(java.util.Collections.singletonMap("error", "Error al cerrar acta: " + e.getMessage()));
        }
    }
}
