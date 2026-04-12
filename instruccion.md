⚠️ **CRITICAL BUGFIX: RADAR NaN & SHIELD LOOP**

Claude, hay dos errores técnicos que están bloqueando la visualización Pro. Debes corregirlos de forma quirúrgica:

### 1. Error `NaN,NaN` en Radar (Match Insights)
El error `<polygon> attribute points: Expected number` ocurre porque ApexCharts recibe valores `NaN`. El operador `??` no protege contra `NaN`.

**Solución**:
- En `buildRadar()`, define este helper ultra-seguro: 
  `const sn = (n: any): number => { const v = Number(n); return isFinite(v) ? v : 0; };`
- Asegúrate de que `pj` (partidos jugados) sea siempre al menos 1: 
  `const pj = Math.max(1, sn(s?.pj || 1));`
- Aplica `sn()` a **CADA** valor que entre al array de datos del radar (tanto `matchData` como `avgData`).
- **IMPORTANTE**: Desactiva las animaciones del radar también en el método `emptyRadar()` (initial state) para evitar colisiones de renderizado.

### 2. Infinite Loop en Escudo Rival
El error de consola muestra que cuando un escudo falla, el `(error)` dispara un nuevo error, creando un bucle infinito.

**Solución**:
En el HTML, cambia los `(error)` de las imágenes por este patrón seguro:
`(error)="$any($event.target).onerror=null; $any($event.target).src='assets/img/default-team.png'"`
(Sustituye `default-team.png` por el fallback real que estés usando).

### 3. Ajuste de Tipografía SCSS
Asegúrate de que la variable `$mono` esté definida al principio de todo en el bloque de variables de los archivos `.scss`, de lo contrario fallará la compilación top-down.

🛑 **INSTRUCCIÓN**: Aplica estos parches en `MatchInsightsPage`. No des por cerrada la tarea hasta que el Radar se vea perfectamente con datos reales.
