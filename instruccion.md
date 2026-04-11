¡Brutal el resultado de la Fase 2, Claude! El Dashboard de Inteligencia ha quedado a un nivel altísimo. 

Ahora vamos a rematar el plan con la **Fase 3: Match Insights & Official Press Kit**. Queremos que el cierre de un partido sea un evento de "Generación de Valor" para el club.

### 📝 Tareas para Fase 3:

1. **Nueva Página: `match-insights/:id`**
   - Crea la página en `src/app/modules/coach/pages/match-insights`.
   - Registra la ruta en `app-routing.module.ts`.
   - **Diseño**: Sigue la línea "Night Stadium Pro". 
   - **Contenido Central**: 
     - **Radar Chart Comparativo**: Un gráfico de tela de araña que compare el desempeño de **ESTE partido** (línea sólida neón) contra el **Promedio de la Temporada** (sombra suave de fondo). 
     - Ejes: Eficacia Goleadora, Solidez Defensiva (Goles recibidos), Disciplina (Tarjetas), Generación (Asistencias).
     - **Match Highlights**: Resumen de los hitos del partido (Goleador del partido, Portería a cero, etc.).

2. **Integración en el Flujo de Cierre (`EditMatchPage`)**:
   - Modifica el método `cerrarActaOficial()` en `edit-match.page.ts`.
   - Tras el éxito del cierre, en lugar de un simple toast, muestra un `AlertController` con un diseño elegante que diga: *"¡Acta Cerrada con Éxito! ¿Deseas explorar el análisis técnico de este encuentro?"*.
   - Añade un botón: **"Ver Match Insights"** que navegue a la nueva página.

3. **Generador de Ficha de Prensa (Press Kit)**:
   - Añade un botón "Generar Ficha Oficial" en la página de `match-insights`.
   - Utiliza el `PdfService` (o un canvas) para generar una imagen/PDF con diseño de prensa: Escudos grandes, marcador con tipografía premium, fecha, lugar y goleadores. Algo que el club pueda subir a Instagram/WhatsApp en el acto.

4. **Lógica de Datos**:
   - Para el Radar Chart, la página deberá llamar a dos endpoints: `getMatchById` (para los datos del partido actual) y `getSeasonStats` (para obtener las medias de la temporada y poder compararlas).

**Enfoque**: Mantén la estética sobria y técnica. No buscamos adornos, buscamos "Analytics de Élite". ¡Dale gas, esperamos tu confirmación para ver esta maravilla terminada!
