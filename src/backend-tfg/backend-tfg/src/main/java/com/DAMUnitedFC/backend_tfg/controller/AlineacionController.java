package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.AlineacionDto;
import com.DAMUnitedFC.backend_tfg.dto.AlineacionResponseDto;
import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.PartidoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/alineaciones")
@CrossOrigin(origins = "*")
public class AlineacionController {

    @Autowired
    private AlineacionRepository alineacionRepo;
    @Autowired
    private PartidoRepository partidoRepo;
    @Autowired
    private JugadorRepository jugadorRepo;

    @GetMapping("/partido/{idPartido}")
    public ResponseEntity<List<AlineacionResponseDto>> getAlineacion(@PathVariable Long idPartido) {
        List<Alineacion> alineaciones = alineacionRepo.findByPartidoIdPartido(idPartido);
        List<AlineacionResponseDto> response = new ArrayList<>();

        for (Alineacion a : alineaciones) {
            AlineacionResponseDto dto = new AlineacionResponseDto();
            dto.setId(a.getId());
            dto.setIdPartido(a.getPartido().getIdPartido());

            if (a.getJugador() != null) {
                Jugador j = a.getJugador();
                dto.setIdJugador(j.getIdJugador());
                dto.setDorsal(j.getDorsal());
                dto.setPosicion(j.getPosicion());
                dto.setFotoUrl(j.getFotoUrl());

                if (j.getUsuario() != null) {
                    dto.setNombre(j.getUsuario().getNombre());
                    dto.setApellidos(j.getUsuario().getApellidos());
                    if (dto.getFotoUrl() == null) dto.setFotoUrl(j.getUsuario().getFotoUrl());
                }
            }

            dto.setSlotId(a.getSlotId());
            dto.setEsTitular(a.getEsTitular());
            dto.setGoles(a.getGoles());
            dto.setAsistencias(a.getAsistencias());
            dto.setMinutosJugados(a.getMinutosJugados());
            dto.setTarjetaAmarilla(a.getTarjetaAmarilla());
            dto.setTarjetaRoja(a.getTarjetaRoja());

            // 🔥 MAPEO DE SUSTITUCIONES
            dto.setMinutoEntrada(a.getMinutoEntrada());
            dto.setMinutoSalida(a.getMinutoSalida());

            response.add(dto);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/guardar/{idPartido}")
    @Transactional
    public ResponseEntity<?> guardarAlineacion(@PathVariable Long idPartido, @RequestBody List<AlineacionDto> fichas) {
        Map<String, Object> response = new HashMap<>();
        try {
            alineacionRepo.deleteByPartidoIdPartido(idPartido);
            alineacionRepo.flush();

            if (fichas == null || fichas.isEmpty()) {
                response.put("success", true);
                response.put("mensaje", "Pizarra limpiada correctamente");
                return ResponseEntity.ok(response);
            }

            Partido p = partidoRepo.findById(idPartido)
                    .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

            for (AlineacionDto ficha : fichas) {
                if (ficha.getIdJugador() == null) continue;

                Jugador j = jugadorRepo.findById(ficha.getIdJugador())
                        .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));

                Alineacion alineacion = new Alineacion();
                alineacion.setPartido(p);
                alineacion.setJugador(j);

                if (j.getEquipoPrincipal() != null) {
                    alineacion.setIdEquipo(j.getEquipoPrincipal().getIdEquipo().longValue());
                } else {
                    alineacion.setIdEquipo(p.getIdEquipo());
                }

                alineacion.setSlotId(ficha.getSlotId());
                alineacion.setEsTitular(true);

                // Inicializar
                alineacion.setGoles(0);
                alineacion.setAsistencias(0);
                alineacion.setMinutosJugados(0);
                alineacion.setTarjetaAmarilla(false);
                alineacion.setTarjetaRoja(false);
                alineacion.setMinutoEntrada(0); // Titulares entran en min 0

                alineacionRepo.save(alineacion);
            }

            response.put("success", true);
            response.put("mensaje", "Alineación guardada correctamente");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("error", "Error interno: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/cerrar")
    @Transactional
    public ResponseEntity<?> cerrarActa(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long idPartido = Long.valueOf(payload.get("idPartido").toString());
            Integer golesFavor = (Integer) payload.get("golesFavor");
            Integer golesContra = (Integer) payload.get("golesContra");

            Partido p = partidoRepo.findById(idPartido)
                    .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

            p.setGolesFavor(golesFavor);
            p.setGolesContra(golesContra);
            p.setEstado("FINALIZADO");
            partidoRepo.save(p);

            List<Map<String, Object>> stats = (List<Map<String, Object>>) payload.get("estadisticas");

            if (stats != null) {
                for (Map<String, Object> stat : stats) {
                    Integer idJugador = (Integer) stat.get("idJugador");
                    Optional<Alineacion> fichaOpt = alineacionRepo.findFichaExacta(idPartido, idJugador);

                    Alineacion alineacion;
                    if (fichaOpt.isPresent()) {
                        alineacion = fichaOpt.get();
                    } else {
                        alineacion = new Alineacion();
                        alineacion.setPartido(p);
                        Jugador j = jugadorRepo.findById(idJugador)
                                .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));
                        alineacion.setJugador(j);
                        alineacion.setIdEquipo(p.getIdEquipo());
                        alineacion.setEsTitular(false);
                        alineacion.setSlotId("BENCH");
                    }

                    alineacion.setGoles((Integer) stat.get("goles"));
                    alineacion.setAsistencias((Integer) stat.get("asistencias"));
                    alineacion.setMinutosJugados((Integer) stat.get("minutos"));
                    alineacion.setTarjetaAmarilla((Boolean) stat.get("amarilla"));
                    alineacion.setTarjetaRoja((Boolean) stat.get("roja"));

                    // 🔥 GUARDAR SUSTITUCIONES
                    Object minEntrada = stat.get("minutoEntrada");
                    Object minSalida = stat.get("minutoSalida");

                    alineacion.setMinutoEntrada(minEntrada != null ? (Integer) minEntrada : 0);
                    alineacion.setMinutoSalida(minSalida != null ? (Integer) minSalida : null);

                    alineacionRepo.save(alineacion);
                }
            }

            response.put("success", true);
            response.put("mensaje", "Acta cerrada y estadísticas guardadas");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}