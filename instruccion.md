Excelente trabajo en el Backend, Claude. Ya tenemos toda la data necesaria (historial de 15 partidos, clean sheets, tarjetas, asistencias y rachas) para dar el salto visual.

Ahora pasamos a la **Fase 2 — Frontend: La Suite "Season Intelligence"**.

El objetivo es crear una experiencia de "Cuadro de Mando" profesional que el entrenador pueda vender como un servicio premium.

### 📝 Tareas para Fase 2:

1. **Nueva Página: `season-intelligence`**
   - Crea la carpeta y archivos en `src/app/modules/coach/pages/season-intelligence`.
   - Registra la ruta `coach/season-intelligence` en `app-routing.module.ts`.
   - Usa un diseño **Night Stadium Pro**: fondo oscuro profundo, contenedores con glassmorphism (`backdrop-filter: blur`) y tipografía técnica.

2. **Componentes Visuales (ApexCharts)**:
   - **Sparkline de Rendimiento**: Una línea de puntos neón que muestre la evolución de los puntos en los últimos 15 partidos (usando `historialCompleto`). Sin ejes pesados, solo la tendencia.
   - **Radar de Excelencia (Spider Chart)**: Gráfico de 5 ejes:
     - *Poder Ofensivo* (Promedio Goles Favor)
     - *Solidez Defensiva* (Clean Sheets)
     - *Disciplina* (Tarjetas - Invertido)
     - *Generación* (Asistencias Totales)
     - *Eficacia* (% Victorias)
   - **KPI Cards**: Tarjetas minimalistas con: "Vallas Invictas", "Máxima Racha", "Eficacia Goleadora".

3. **Análisis Predictivo (Pace Analytics)**:
   - Basado en los puntos actuales y los partidos jugados, muestra un cálculo de **Proyección Final** hacia el objetivo de puntos definido.

4. **Actualizar el Widget del Dashboard (`SeasonStatsWidget`)**:
   - **NO quites** los 5 círculos `V-D-E`. Mantenlos como referencia rápida.
   - Añade un botón/link elegante en la parte inferior o esquina: **"Intelligence Pro →"** que navegue a la nueva página.

5. **Lógica de Datos**:
   - Asegúrate de mapear los nuevos campos de `SeasonStatsDto` en el modelo de Angular y consumirlos en la página.

**Importante**: Mantén la sobriedad. Queremos que parezca una herramienta de analistas de élite (estilo BeSoccer Pro o Wyscout), no un juego. ¡Dale gas punto por punto! Esperamos tu señal.
