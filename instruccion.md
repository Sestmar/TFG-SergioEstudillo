Bien, vamos a dejar esto blindado de una vez. Déjame ver el .gitignore primero.

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Perfecto. La arquitectura ya es correcta — application-local.properties ya está en el .gitignore. El problema es que
  le faltan las credenciales de la BD. Solo hay que completarlo.

  El flujo es este:
  - application.properties → placeholders, se commitea, nunca tiene credenciales
  - application-local.properties → credenciales reales, gitignored, nunca se commitea

  Spring Boot con perfil local mergea ambos automáticamente. Es exactamente lo que necesitás.

● Update(src\backend-tfg\backend-tfg\src\main\resources\application-local.properties)
  ⎿  Added 6 lines
       3  # Ya esta excluido en .gitignore
       4  # ============================================================
       5
       6 +# Base de datos local
       7 +DB_URL=jdbc:postgresql://localhost:5432/damunitedfc_local
       8 +DB_USERNAME=postgres
       9 +DB_PASSWORD=postgres
      10 +DDL_AUTO=update
      11 +
      12  # Gmail
      13  MAIL_USERNAME=sergio.estudilloo7@gmail.com
      14  MAIL_PASSWORD=khtbwtqgloxjbkgu

● Listo. Ahora levantás el backend exactamente igual que antes:

  $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
  $env:SPRING_PROFILES_ACTIVE = "local"
  ./mvnw spring-boot:run

  Lo que cambió: DB_URL, DB_USERNAME, DB_PASSWORD y DDL_AUTO=update ahora están en el archivo local. Spring los resuelve
   y no los ve como literales.

  La arquitectura queda así:

  ┌──────────────────────────────┬───────────────────────┬───────────────────────────────┐
  │           Archivo            │     ¿Se commitea?     │          ¿Qué tiene?          │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ application.properties       │ ✅ Sí                 │ Solo placeholders ${VAR}      │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────┤
  │ application-local.properties │ ❌ Nunca (gitignored) │ Todas las credenciales reales │
  └──────────────────────────────┴───────────────────────┴───────────────────────────────┘

  Probá levantarlo y me decís.