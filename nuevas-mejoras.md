# Roadmap de Ingeniería: Suite "Season Intelligence Pro" 🏟️📈

Este documento define la estrategia para transformar la analítica básica en un módulo completo de inteligencia deportiva, mediante la creación de una página dedicada y la expansión de la infraestructura de datos en el backend.

---

## 🎯 Visión de Producto
Pasar de un widget básico en el dashboard a una **Página de Inteligencia de Temporada** (`/coach/season-intelligence`) que actúe como el centro de mando del entrenador, ofreciendo análisis predictivo y visualizaciones de alto nivel (ApexCharts).

---

## 🛠️ FASE 1: Infraestructura de Datos (Backend - Spring Boot)

Para alimentar las visualizaciones avanzadas, el `SeasonStatsDto` debe dejar de ser un resumen y pasar a ser un **historial analítico**.

### 1.1. Expansión del DTO
- **`SeasonStatsDto`**: Añadir los siguientes campos:
  - `List<MatchSummaryDto> historialCompleto`: Lista de los últimos N partidos (mínimo 10-15) con datos de goles, tarjetas y asistencias.
  - `Integer cleanSheets`: Contador de porterías a cero.
  - `Double promedioGolesFavor` y `Double promedioGolesContra`.
  - `Integer mayorRachaVictorias`.

### 1.2. Lógica en `EquipoService`
- Refactorizar `getSeasonStats()` para que no solo sume, sino que analice el historial de `Alineacion` (vía `partido`) para extraer:
  - Tarjetas totales del equipo en la temporada.
  - Asistencias totales.
  - Cálculo de Porterías a Cero (partidos donde `golesContra == 0`).

---

## 🎨 FASE 2: La Página "Season Intelligence" (Frontend - Angular/Ionic)

### 2.1. Nueva Ruta y Acceso
- Crear la página `/coach/season-intelligence`.
- El widget actual del dashboard se mantiene como un **"Resumen Ejecutivo"** sobrio, con un botón destacado: **"Explorar Inteligencia de Temporada →"**.

### 2.2. Componentes de la Página Pro
- **Performance Sparkline**: Gráfico de línea neón (ApexCharts) que muestra la evolución de puntos en los últimos 10+ partidos (usando el nuevo `historialCompleto`).
- **Radar de Consistencia (Spider Chart)**: Comparativa visual de 5 ejes:
  1. Poder Ofensivo (Goles).
  2. Solidez Defensiva (Clean Sheets).
  3. Disciplina (Tarjetas - Invertido).
  4. Generación (Asistencias).
  5. Eficacia de Puntos (% de victorias).
- **Métricas de Proyección (Pace Analytics)**:
  - Cuadros de texto sobrios con cálculos basados en el ritmo actual: *"Proyección de ascenso: 52 puntos"*.
  - *"Eficacia actual: 2.1 pts/partido"*.

---

## 📄 FASE 3: Ficha de Prensa y Exportación

### 3.1. Generador de Reporte PDF/Imagen
- Integrar en la nueva página un botón para generar una **Ficha de Temporada** elegante y profesional, reutilizando la lógica de `PdfService`.

---

## ⚠️ PROTOCOLO DE INTEGRIDAD (TESTS)

1. **Backend**: Cualquier cambio en `EquipoService` requiere validar los tests existentes en `src/test/java/.../EquipoServiceTest.java` y añadir nuevos para las métricas de Clean Sheets y Rachas.
2. **Frontend**: La navegación a la nueva página debe ser segura y no afectar al rendimiento de carga del Dashboard principal (Lazy Loading obligatorio).

---
> **Nota de Diseño**: "Menos es más". Usar una paleta Night Stadium coherente, tipografías técnicas y evitar elementos visuales que distraigan del dato puro.
