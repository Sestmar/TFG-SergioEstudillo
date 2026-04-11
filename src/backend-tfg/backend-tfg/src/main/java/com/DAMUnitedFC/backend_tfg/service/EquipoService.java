package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.EquipoDto;
import com.DAMUnitedFC.backend_tfg.dto.MatchSummaryDto;
import com.DAMUnitedFC.backend_tfg.dto.SeasonStatsDto;
import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Categoria;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.Liga;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.CategoriaRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.LigaRepository;
import com.DAMUnitedFC.backend_tfg.repository.PartidoRepository;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final LigaRepository ligaRepository;
    private final CategoriaRepository categoriaRepository;
    private final PartidoRepository partidoRepository;
    private final AlineacionRepository alineacionRepository;

    public EquipoService(EquipoRepository equipoRepository, LigaRepository ligaRepository,
                         CategoriaRepository categoriaRepository, PartidoRepository partidoRepository,
                         AlineacionRepository alineacionRepository) {
        this.equipoRepository = equipoRepository;
        this.ligaRepository = ligaRepository;
        this.categoriaRepository = categoriaRepository;
        this.partidoRepository = partidoRepository;
        this.alineacionRepository = alineacionRepository;
    }

    public List<Equipo> listar() {
        return equipoRepository.findAll();
    }

    public Equipo obtener(Integer id) {
        return equipoRepository.findById(id).orElse(null);
    }

    public Equipo crear(EquipoDto equipoDto) {
        Liga liga = ligaRepository.findById(equipoDto.getIdLiga())
                .orElseThrow(() -> new RuntimeException("Liga no encontrada"));
        Categoria categoria = categoriaRepository.findById(equipoDto.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Equipo equipo = new Equipo();
        equipo.setNombre(equipoDto.getNombre());
        equipo.setFechaCreacion(Date.valueOf(equipoDto.getFechaCreacion()));
        equipo.setObservaciones(equipoDto.getObservaciones());
        equipo.setEscudoUrl(equipoDto.getEscudoUrl());
        equipo.setLiga(liga);
        equipo.setCategoria(categoria);
        return equipoRepository.save(equipo);
    }

    public Equipo actualizar(Integer id, EquipoDto equipoDto) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
        Liga liga = ligaRepository.findById(equipoDto.getIdLiga())
                .orElseThrow(() -> new RuntimeException("Liga no encontrada"));
        Categoria categoria = categoriaRepository.findById(equipoDto.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        equipo.setNombre(equipoDto.getNombre());
        if (equipoDto.getFechaCreacion() != null) {
            equipo.setFechaCreacion(Date.valueOf(equipoDto.getFechaCreacion()));
        }
        equipo.setObservaciones(equipoDto.getObservaciones());
        if (equipoDto.getEscudoUrl() != null) {
            equipo.setEscudoUrl(equipoDto.getEscudoUrl());
        }
        equipo.setLiga(liga);
        equipo.setCategoria(categoria);
        equipo.setPuntosObjetivo(equipoDto.getPuntosObjetivo());
        return equipoRepository.save(equipo);
    }

    public void borrar(Integer id) {
        equipoRepository.deleteById(id);
    }

    public Equipo setObjetivo(Integer id, Integer puntosObjetivo) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
        equipo.setPuntosObjetivo(puntosObjetivo);
        return equipoRepository.save(equipo);
    }

    // ─── SEASON ANALYTICS ────────────────────────────────────────────────────────

    public SeasonStatsDto getSeasonStats(Integer idEquipo) {
        Equipo equipo = equipoRepository.findById(idEquipo)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

        // Solo partidos competitivos finalizados, ordenados más reciente primero
        List<Partido> partidos = partidoRepository
                .findByEquipo_IdEquipoAndEstadoAndTipoOrderByFechaHoraDesc(idEquipo, "FINALIZADO", "PARTIDO");

        int pj = 0, g = 0, e = 0, p = 0, gf = 0, gc = 0, puntos = 0;
        int cleanSheets = 0, tarjetasAmarillas = 0, tarjetasRojas = 0, asistencias = 0;
        int rachaActual = 0, mayorRacha = 0;
        List<String> rachaDesc = new ArrayList<>();
        List<MatchSummaryDto> historial = new ArrayList<>();

        for (Partido partido : partidos) {
            int favor  = partido.getGolesFavor()  != null ? partido.getGolesFavor()  : 0;
            int contra = partido.getGolesContra() != null ? partido.getGolesContra() : 0;

            pj++;
            gf += favor;
            gc += contra;

            if (contra == 0) cleanSheets++;

            String resultado;
            int ptsPart;
            if (favor > contra) {
                g++;
                puntos += 3;
                ptsPart = 3;
                resultado = "V";
                rachaActual++;
                if (rachaActual > mayorRacha) mayorRacha = rachaActual;
                if (rachaDesc.size() < 5) rachaDesc.add("V");
            } else if (favor == contra) {
                e++;
                puntos += 1;
                ptsPart = 1;
                resultado = "E";
                rachaActual = 0;
                if (rachaDesc.size() < 5) rachaDesc.add("E");
            } else {
                p++;
                ptsPart = 0;
                resultado = "D";
                rachaActual = 0;
                if (rachaDesc.size() < 5) rachaDesc.add("D");
            }

            // Stats por partido desde Alineacion (solo los últimos 15 para el historial)
            if (historial.size() < 15) {
                List<Alineacion> alineaciones = alineacionRepository
                        .findByPartido_IdPartidoAndEquipo_IdEquipo(partido.getIdPartido(), idEquipo);

                int amPart = 0, rojPart = 0, asisPart = 0;
                for (Alineacion a : alineaciones) {
                    if (Boolean.TRUE.equals(a.getTarjetaAmarilla())) amPart++;
                    if (Boolean.TRUE.equals(a.getTarjetaRoja()))    rojPart++;
                    asisPart += a.getAsistencias() != null ? a.getAsistencias() : 0;
                }

                tarjetasAmarillas += amPart;
                tarjetasRojas     += rojPart;
                asistencias       += asisPart;

                MatchSummaryDto summary = new MatchSummaryDto();
                summary.setIdPartido(partido.getIdPartido());
                summary.setRival(partido.getRival());
                summary.setEscudoRivalUrl(partido.getEscudoRivalUrl());
                summary.setFechaHora(partido.getFechaHora());
                summary.setGolesFavor(favor);
                summary.setGolesContra(contra);
                summary.setResultado(resultado);
                summary.setPuntos(ptsPart);
                summary.setTarjetasAmarillas(amPart);
                summary.setTarjetasRojas(rojPart);
                summary.setAsistenciasTotales(asisPart);
                historial.add(summary);
            } else {
                // Para partidos fuera del historial solo acumulamos tarjetas/asistencias globales
                List<Alineacion> alineaciones = alineacionRepository
                        .findByPartido_IdPartidoAndEquipo_IdEquipo(partido.getIdPartido(), idEquipo);
                for (Alineacion a : alineaciones) {
                    if (Boolean.TRUE.equals(a.getTarjetaAmarilla())) tarjetasAmarillas++;
                    if (Boolean.TRUE.equals(a.getTarjetaRoja()))    tarjetasRojas++;
                    asistencias += a.getAsistencias() != null ? a.getAsistencias() : 0;
                }
            }
        }

        // La racha viene en orden DESC (reciente primero); la invertimos → cronológico
        Collections.reverse(rachaDesc);
        // El historial también viene DESC (reciente primero); útil para el sparkline así
        // Los dejamos en orden DESC para que la gráfica muestre lo más reciente a la derecha
        Collections.reverse(historial);

        SeasonStatsDto dto = new SeasonStatsDto();
        dto.setPj(pj);
        dto.setG(g);
        dto.setE(e);
        dto.setP(p);
        dto.setGf(gf);
        dto.setGc(gc);
        dto.setPuntos(puntos);
        dto.setPuntosObjetivo(equipo.getPuntosObjetivo());
        dto.setCategoriaNombre(equipo.getCategoria() != null ? equipo.getCategoria().getNombre() : null);
        dto.setRacha(rachaDesc);
        dto.setHistorialCompleto(historial);
        dto.setCleanSheets(cleanSheets);
        dto.setPromedioGolesFavor(pj > 0  ? Math.round((double) gf / pj * 10.0) / 10.0 : 0.0);
        dto.setPromedioGolesContra(pj > 0 ? Math.round((double) gc / pj * 10.0) / 10.0 : 0.0);
        dto.setMayorRachaVictorias(mayorRacha);
        dto.setTarjetasAmarillasTotal(tarjetasAmarillas);
        dto.setTarjetasRojasTotal(tarjetasRojas);
        dto.setAsistenciasTotal(asistencias);
        return dto;
    }
}
