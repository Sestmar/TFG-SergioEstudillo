# Tarea: Arreglo Final del Pipeline de Frontend (GitHub Actions)

## Diagnóstico Técnico
El comando `npm ci` en el workflow de GitHub Actions es excesivamente estricto y está fallando debido a conflictos de peer-dependencies que el `.npmrc` no logra resolver por sí solo bajo esa modalidad. Para que el CI sea exitoso, necesitamos que se comporte igual que el entorno local.

## Especificaciones de Implementación

### 1. Refactor del Workflow (`.github/workflows/frontend-ci.yml`)
- Modificar el paso "Instalar dependencias".
- Cambiar: `run: npm ci`
- Por: `run: npm install --legacy-peer-deps`
- Esto garantiza que el robot de GitHub pueda resolver los conflictos de versiones de ESLint exactamente igual que lo haces tú en local.

### 2. Alineación de Estándares en el Workflow
- Asegurarse de que el paso de cache (`actions/setup-node@v4`) use `frontend/package-lock.json` como clave, tal como está configurado actualmente (verificar si la ruta es correcta).

### 3. Verificación de Scripts (`frontend/package.json`)
- Verificar que el script `"lint": "ng lint"` sea el correcto y que no dependa de archivos locales inexistentes.

## Resultado Esperado
- El paso de "Instalar dependencias" en GitHub Actions pasa satisfactoriamente.
- El comando `ng lint` se ejecuta y valida el código sin errores de carga de configuración.
- El semáforo de GitHub Actions se pone en **VERDE** ✅ para el Frontend.
