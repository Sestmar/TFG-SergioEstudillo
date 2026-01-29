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
import java.util.Map;

@RestController
@RequestMapping("/api/partidos")
@CrossOrigin(origins = "*")
public class PartidoController {

    @Autowired private AlineacionRepository alineacionRepo;
    @Autowired private JugadorRepository jugadorRepo;
    @Autowired private PartidoRepository partidoRepo;

    // 1. Crear Partido (Automáticamente mapea escudoRivalUrl si viene en el JSON)
    @PostMapping
    public Partido createPartido(@RequestBody Partido partido) {
        return partidoRepo.save(partido);
    }

    // 2. Listar partidos
    @GetMapping("/equipo/{idEquipo}")
    public List<Partido> getPartidosPorEquipo(@PathVariable Long idEquipo) {
        return partidoRepo.findByEquipo_IdEquipoOrderByFechaHoraAsc(idEquipo);
    }

    // 3. Obtener detalle
    @GetMapping("/{id}")
    public ResponseEntity<Partido> getPartido(@PathVariable Long id) {
        return partidoRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // EDITAR PARTIDO (PUT)
    // Permite actualizar fecha, rival, ESCUDO, lugar, etc.
    @PutMapping("/{id}")
    public ResponseEntity<Partido> updatePartido(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return partidoRepo.findById(id)
                .map(partido -> {
                    if (updates.containsKey("rival")) partido.setRival((String) updates.get("rival"));
                    if (updates.containsKey("lugar")) partido.setLugar((String) updates.get("lugar"));
                    if (updates.containsKey("competicion")) partido.setCompeticion((String) updates.get("competicion"));

                    // ✅ Actualizar Escudo Rival
                    if (updates.containsKey("escudoRivalUrl")) {
                        partido.setEscudoRivalUrl((String) updates.get("escudoRivalUrl"));
                    }

                    // Nota: Para la fecha, al ser un Map, habría que parsearla si viene como String.
                    // Si usas un DTO específico es más limpio, pero esto funciona para strings simples.

                    return ResponseEntity.ok(partidoRepo.save(partido));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. CERRAR ACTA
    @PostMapping("/cerrar-acta")
    @Transactional
    public ResponseEntity<?> cerrarActa(@RequestBody ActaDto acta) {
        try {
            Partido p = partidoRepo.findById(acta.getIdPartido())
                    .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

            p.setGolesFavor(acta.getGolesFavor());
            p.setGolesContra(acta.getGolesContra());
            p.setEstado("FINALIZADO");
            partidoRepo.save(p);

            for (ActaDto.PlayerStatUpdateDto stat : acta.getEstadisticas()) {
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
            return ResponseEntity.internalServerError().body(java.util.Collections.singletonMap("error", "Error al cerrar acta: " + e.getMessage()));
        }
    }
}