# Roadmap de Ingeniería: Player "Elite Performance Pro" Suite 🚀🏟️

Este documento define la reconstrucción del ecosistema del jugador, dividiéndolo en un **Hub de Acceso Rápido** (Dashboard) y una nueva **Central de Rendimiento Analítico** (Página Pro), siguiendo el estándar de calidad de los módulos de Coach y Admin.

---

## 🎯 Objetivo
Transformar la experiencia del jugador de un simple visualizador de eventos a una herramienta de **autoevaluación y seguimiento profesional**. El jugador debe tener su propio "Centro de Inteligencia" con historial detallado, radar comparativo y alertas de disciplina.

---

## 🛠️ TAREA 1: Refactor del Player Dashboard (The Hub)

### 1.1. Identidad "Cromo FIFA" (Hero Section)
- **Acción**: Rediseñar la cabecera para que parezca una carta de identidad deportiva.
- **Elementos**: Dorsal gigante en el fondo, foto con borde neón (dinámico por estado físico), posición y rol destacados.
- **Acceso Pro**: Añadir un botón destacado: **"Explorar Rendimiento Pro →"** que redirija a la nueva página `/players/performance`.

### 1.2. Reorganización de Eventos y "Matchday Hype"
- **Acción**: Subir la lista de eventos. Si hay un partido hoy, destacarlo con un diseño especial de "Matchday".
- **Botón Match-Insights**: En la lista de eventos, si el partido ha finalizado, añadir un botón directo a `match-insights/:id` (página a la que el jugador ya tiene acceso por routing).

---

## 🛠️ TAREA 2: Nueva Página "Elite Performance Pro" (`/players/performance`)

Esta será una página dedicada (Lazy Loaded) que consuma el historial completo del jugador.

### 2.1. Hero Analítico y KPIs
- **Visual**: Fila de 4 tarjetas grandes (Glassmorphism) con totales históricos: **PJ / Goles / Asistencias / Minutos**.

### 2.2. Radar de Rendimiento (SVG Nativo)
- **Acción**: Implementar el radar personal usando la lógica de **SVG Nativo** (Trigonometría Angular) para evitar fallos de carga.
- **Comparativa**: Mostrar "Mis Stats" vs "Media del Equipo" en el mismo radar.

### 2.3. Módulo de Disciplina Inteligente (Alertas de Sanción)
- **Lógica**: Visualizar las tarjetas amarillas y rojas acumuladas en la temporada.
- **Sistema de Avisos**: 
  - Si el jugador tiene **4 tarjetas amarillas**, mostrar un aviso crítico: *"⚠️ ALERTA: A una tarjeta de la suspensión por acumulación"*.
  - Si tiene **5 o más**, mostrar: *"🚫 SANCIONADO: No elegible para el próximo encuentro"*.
- **Diseño**: Usar iconos de tarjetas con efectos de pulso (`glow`) y colores semánticos.

### 2.4. Historial Detallado de Partidos
- **Acción**: Listado interactivo de todos los partidos jugados.
- **Datos por fila**: Fecha, Rival, Minutos jugados, Goles/Asistencias en ese partido y tarjetas recibidas.
- **Enlace**: Cada fila debe permitir navegar a las **Conclusiones del Partido** (`match-insights`).

---

## 🛠️ TAREA 3: Lógica de Backend y Rutas

### 3.1. Consumo de Endpoints
- Asegurar que la nueva página use el endpoint `GET /jugadores/{id}/history` que ya devuelve el historial completo, incidencias y totales.

### 3.2. Routing
- Registrar la ruta `/players/performance` en `players-routing.module.ts`.

---

## 🎨 TAREA 4: Estética "Night Stadium Pro"

### 4.1. Visuales de Élite
- Usar `backdrop-filter: blur(20px)` en todas las tarjetas de estadísticas.
- Implementar animaciones de entrada (`animate-fade-in-up`) para cada bloque de la página de rendimiento.
- Reutilizar los tokens de color de `match-insights` (Púrpura Neón, Verde Éxito, Rojo Alerta).

---

## ⚠️ PROTOCOLO DE EJECUCIÓN (Para Claude)

1. **Investigación**: Revisa en `models.ts` las interfaces necesarias para el historial del jugador.
2. **Componente Nuevo**: Crea la página de rendimiento como un componente standalone o dentro del módulo de players.
3. **Trade-off Radar**: No uses ApexCharts para el radar; implementa el helper `radarPoints` en el `.ts` y genera el polígono directamente en el HTML como hicimos en `match-insights`.
4. **Limpieza del Hub**: Una vez creada la página Pro, limpia el dashboard original eliminando las estadísticas duplicadas que ahora vivirán en la nueva central.

---
> **Nota**: El jugador ahora es el protagonista de sus propios datos. La interfaz debe invitar a la superación personal.
