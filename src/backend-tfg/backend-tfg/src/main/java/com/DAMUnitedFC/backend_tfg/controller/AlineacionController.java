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

    // Helper para evitar nulos
    private Integer safeInt(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Long) return ((Long) value).intValue();
        if (value instanceof String) {
            try { return Integer.parseInt((String) value); } catch (NumberFormatException e) { return 0; }
        }
        return 0;
    }

    private Integer safeInt(Object value, Integer defaultValue) {
        Integer res = safeInt(value);
        return res != null ? res : defaultValue;
    }

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
                return ResponseEntity.ok(response);
            }

            Partido p = partidoRepo.findById(idPartido).orElseThrow(() -> new RuntimeException("Partido no encontrado"));

            for (AlineacionDto ficha : fichas) {
                if (ficha.getIdJugador() == null) continue;
                Jugador j = jugadorRepo.findById(ficha.getIdJugador()).orElseThrow();

                Alineacion alineacion = new Alineacion();
                alineacion.setPartido(p);
                alineacion.setJugador(j);

                // 🔥 ASIGNACIÓN SEGURA DE EQUIPO
                if (j.getEquipoPrincipal() != null) {
                    alineacion.setIdEquipo(j.getEquipoPrincipal().getIdEquipo().longValue());
                } else if (p.getEquipo() != null) {
                    alineacion.setIdEquipo(p.getEquipo().getIdEquipo().longValue());
                } else {
                    alineacion.setIdEquipo(0L);
                }

                alineacion.setSlotId(ficha.getSlotId());
                alineacion.setEsTitular(true);
                alineacion.setGoles(0);
                alineacion.setAsistencias(0);
                alineacion.setMinutosJugados(0);
                alineacion.setTarjetaAmarilla(false);
                alineacion.setTarjetaRoja(false);
                alineacion.setMinutoEntrada(0);

                alineacionRepo.save(alineacion);
            }
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cerrar")
    @Transactional
    public ResponseEntity<?> cerrarActa(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long idPartido = Long.valueOf(payload.get("idPartido").toString());
            Integer golesFavor = safeInt(payload.get("golesFavor"), 0);
            Integer golesContra = safeInt(payload.get("golesContra"), 0);

            Partido p = partidoRepo.findById(idPartido).orElseThrow();
            p.setGolesFavor(golesFavor);
            p.setGolesContra(golesContra);
            p.setEstado("FINALIZADO");
            partidoRepo.save(p);

            List<Map<String, Object>> stats = (List<Map<String, Object>>) payload.get("estadisticas");

            if (stats != null) {
                for (Map<String, Object> stat : stats) {
                    Integer idJugador = safeInt(stat.get("idJugador"));

                    Optional<Alineacion> fichaOpt = alineacionRepo.findFichaExacta(idPartido, idJugador);

                    Alineacion alineacion;
                    if (fichaOpt.isPresent()) {
                        alineacion = fichaOpt.get();
                    } else {
                        // NUEVO REGISTRO (SUPLENTE)
                        alineacion = new Alineacion();
                        alineacion.setPartido(p);
                        Jugador j = jugadorRepo.findById(idJugador).orElseThrow();
                        alineacion.setJugador(j);

                        // 🔥 ASIGNACIÓN SEGURA DE EQUIPO
                        if (p.getEquipo() != null) {
                            alineacion.setIdEquipo(p.getEquipo().getIdEquipo().longValue());
                        } else {
                            alineacion.setIdEquipo(0L);
                        }

                        alineacion.setEsTitular(false);
                        alineacion.setSlotId("BENCH_" + idJugador);
                    }

                    alineacion.setGoles(safeInt(stat.get("goles"), 0));
                    alineacion.setAsistencias(safeInt(stat.get("asistencias"), 0));
                    alineacion.setMinutosJugados(safeInt(stat.get("minutos"), 0));

                    Object am = stat.get("amarilla");
                    Object ro = stat.get("roja");
                    alineacion.setTarjetaAmarilla(am != null && (Boolean) am);
                    alineacion.setTarjetaRoja(ro != null && (Boolean) ro);

                    alineacion.setMinutoEntrada(safeInt(stat.get("minutoEntrada")));
                    alineacion.setMinutoSalida(safeInt(stat.get("minutoSalida")));

                    alineacionRepo.save(alineacion);
                }
            }

            response.put("success", true);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error cerrando acta: " + e.getMessage()));
        }
    }
}