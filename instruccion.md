 Read 1 file (ctrl+o to expand)

● Claro. Antes de escribir una línea leo el service y el
  repositorio existente:

  Searched for 1 pattern, read 2 files (ctrl+o to expand)

● Tengo todo claro. Dos archivos a tocar: PartidoRepository
  (nueva query) y EquipoService (lógica + inyección).
  También aprovecho para que actualizar() persista
  puntosObjetivo.

  Paso 1 — nueva query en el repositorio:

● Update(/c/Users/Usuario/Documents/2DAM/TFG-SergioEstudillo
        /TFG-SergioEstudillo/src/backend-tfg/backend-tfg/src
        /main/java/com/DAMUnitedFC/backend_tfg/repository/Pa
        rtidoRepository.java)
  ⎿  Added 3 lines
      13
      14      // Para el scheduler de recordatorios:
          partidos cuya fecha cae en una ventana de t
          iempo
      15      List<Partido> findByFechaHoraBetween(Lo
          calDateTime desde, LocalDateTime hasta);
      16 +
      17 +    // Para Season Analytics: partidos comp
         +etitivos finalizados, más reciente primero
      18 +    List<Partido> findByEquipo_IdEquipoAndE
         +stadoAndTipoOrderByFechaHoraDesc(Integer id
         +Equipo, String estado, String tipo);
      19  }
      20   No newline at end of file

● Paso 2 — lógica completa en EquipoService:

● Update(/c/Users/Usuario/Documents/2DAM/TFG-SergioEstudillo
        /TFG-SergioEstudillo/src/backend-tfg/backend-tfg/src
        /main/java/com/DAMUnitedFC/backend_tfg/service/Equip
        oService.java)
  ⎿  Added 5 lines
       1  package com.DAMUnitedFC.backend_tfg.service
          ;
       2
       3  import com.DAMUnitedFC.backend_tfg.dto.Equi
          poDto;
       4 +import com.DAMUnitedFC.backend_tfg.dto.Seas
         +onStatsDto;
       5  import com.DAMUnitedFC.backend_tfg.model.Ca
          tegoria;
       6  import com.DAMUnitedFC.backend_tfg.model.Eq
          uipo;
       7  import com.DAMUnitedFC.backend_tfg.model.Li
          ga;
       8 +import com.DAMUnitedFC.backend_tfg.model.Pa
         +rtido;
       9  import com.DAMUnitedFC.backend_tfg.reposito
          ry.CategoriaRepository;
      10  import com.DAMUnitedFC.backend_tfg.reposito
          ry.EquipoRepository;
      11  import com.DAMUnitedFC.backend_tfg.reposito
          ry.LigaRepository;
      12 +import com.DAMUnitedFC.backend_tfg.reposito
         +ry.PartidoRepository;
      13  import org.springframework.stereotype.Servi
          ce;
      14
      15  import java.sql.Date;
      16 +import java.util.ArrayList;
      17 +import java.util.Collections;
      18  import java.util.List;
      19
      20  @Service

● Update(/c/Users/Usuario/Documents/2DAM/TFG-SergioEstudillo
        /TFG-SergioEstudillo/src/backend-tfg/backend-tfg/src
        /main/java/com/DAMUnitedFC/backend_tfg/service/Equip
        oService.java)
  ⎿  Added 4 lines, removed 1 line
      23      private final EquipoRepository equipoRe
          pository;
      24      private final LigaRepository ligaReposi
          tory;
      25      private final CategoriaRepository categ
          oriaRepository;
      26 +    private final PartidoRepository partido
         +Repository;
      27
      27 -    public EquipoService(EquipoRepository e
         -quipoRepository, LigaRepository ligaReposit
         -ory, CategoriaRepository categoriaRepositor
         -y) {
      28 +    public EquipoService(EquipoRepository e
         +quipoRepository, LigaRepository ligaReposit
         +ory,
      29 +                         CategoriaRepositor
         +y categoriaRepository, PartidoRepository pa
         +rtidoRepository) {
      30          this.equipoRepository = equipoRepos
          itory;
      31          this.ligaRepository = ligaRepositor
          y;
      32          this.categoriaRepository = categori
          aRepository;
      33 +        this.partidoRepository = partidoRep
         +ository;
      34      }
      35
      36      public List<Equipo> listar() {

● Ahora el actualizar() para que persista puntosObjetivo, y
  el método getSeasonStats():

● Update(/c/Users/Usuario/Documents/2DAM/TFG-SergioEstudillo
        /TFG-SergioEstudillo/src/backend-tfg/backend-tfg/src
        /main/java/com/DAMUnitedFC/backend_tfg/service/Equip
        oService.java)
  ⎿  Added 53 lines
       75          }
       76          equipo.setLiga(liga);
       77          equipo.setCategoria(categoria);
       78 +        equipo.setPuntosObjetivo(equipoDto
          +.getPuntosObjetivo());
       79          return equipoRepository.save(equip
           o);
       80      }
       81
       82      public void borrar(Integer id) {
       83          equipoRepository.deleteById(id);
       84      }
       85 +
       86 +    // ─── SEASON ANALYTICS ──────────────
          +──────────────────────────────────────────
       87 +
       88 +    public SeasonStatsDto getSeasonStats(I
          +nteger idEquipo) {
       89 +        Equipo equipo = equipoRepository.f
          +indById(idEquipo)
       90 +                .orElseThrow(() -> new Run
          +timeException("Equipo no encontrado"));
       91 +
       92 +        // Solo partidos competitivos fina
          +lizados, ordenados más reciente primero
       93 +        List<Partido> partidos = partidoRe
          +pository
       94 +                .findByEquipo_IdEquipoAndE
          +stadoAndTipoOrderByFechaHoraDesc(idEquipo,
          + "FINALIZADO", "PARTIDO");
       95 +
       96 +        int pj = 0, g = 0, e = 0, p = 0, g
          +f = 0, gc = 0, puntos = 0;
       97 +        List<String> rachaDesc = new Array
          +List<>();
       98 +
       99 +        for (Partido partido : partidos) {
      100 +            int favor  = partido.getGolesF
          +avor()  != null ? partido.getGolesFavor()
          + : 0;
      101 +            int contra = partido.getGolesC
          +ontra() != null ? partido.getGolesContra()
          + : 0;
      102 +
      103 +            pj++;
      104 +            gf += favor;
      105 +            gc += contra;
      106 +
      107 +            if (favor > contra) {
      108 +                g++;
      109 +                puntos += 3;
      110 +                if (rachaDesc.size() < 5)
          +rachaDesc.add("V");
      111 +            } else if (favor == contra) {
      112 +                e++;
      113 +                puntos += 1;
      114 +                if (rachaDesc.size() < 5)
          +rachaDesc.add("E");
      115 +            } else {
      116 +                p++;
      117 +                if (rachaDesc.size() < 5)
          +rachaDesc.add("D");
      118 +            }
      119 +        }
      120 +
      121 +        // La racha viene en orden DESC (r
          +eciente primero); la invertimos → cronológ
          +ico
      122 +        Collections.reverse(rachaDesc);
      123 +
      124 +        SeasonStatsDto dto = new SeasonSta
          +tsDto();
      125 +        dto.setPj(pj);
      126 +        dto.setG(g);
      127 +        dto.setE(e);
      128 +        dto.setP(p);
      129 +        dto.setGf(gf);
      130 +        dto.setGc(gc);
      131 +        dto.setPuntos(puntos);
      132 +        dto.setPuntosObjetivo(equipo.getPu
          +ntosObjetivo());
      133 +        dto.setCategoriaNombre(equipo.getC
          +ategoria() != null ? equipo.getCategoria()
          +.getNombre() : null);
      134 +        dto.setRacha(rachaDesc);
      135 +        return dto;
      136 +    }
      137  }

● Paso 2 ✅ — Lógica de negocio

  Lo que hace getSeasonStats():

  1. Busca solo partidos con estado=FINALIZADO y
  tipo=PARTIDO — excluye entrenamientos automáticamente
  2. Itera una sola vez calculando en paralelo: PJ, G, E, P,
   GF, GC, puntos y los últimos 5 resultados
  3. La racha llega en DESC (reciente primero) →
  Collections.reverse() → cronológico (viejo→nuevo), como
  una forma de fútbol real
  4. Devuelve categoriaNombre directo del objeto Categoria
  ya cargado en el equipo — cero query extra

  Corrección respecto al plan de Gemini: filtra
  tipo='PARTIDO' que Gemini no contempló, y no hay lógica
  local/visitante porque el modelo ya guarda
  golesFavor/golesContra desde nuestra perspectiva.

  ---
  ¿OK para el Paso 3 — endpoint REST?