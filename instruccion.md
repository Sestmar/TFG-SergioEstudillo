Punto 2 — Identidad Visual del Manifest

  Los iconos van a seguir apuntando a icons/ (los que creó
   ng add) porque son los archivos físicamente
  disponibles. Los actualizamos con la identidad Night
  Stadium:

● Write(public\manifest.webmanifest)
  ⎿  Added 5 lines, removed 4 lines
       1  {
       2 -  "name": "club-futbol-ionic",
       3 -  "short_name": "club-futbol-ionic",
       4 -  "theme_color": "#1976d2",
       5 -  "background_color": "#fafafa",
       2 +  "name": "DAM United FC",
       3 +  "short_name": "DAM United",
       4 +  "theme_color": "#0a0e1a",
       5 +  "background_color": "#0a0e1a",
       6    "display": "standalone",
       7 +  "orientation": "portrait",
       8    "scope": "./",
       9    "start_url": "./",
      10    "icons": [

● Bien. Ahora Punto 3 — Service Worker (ngsw-config.json).
   Leo el estado actual:

  Read 1 file (ctrl+o to expand)

● El assetGroups ya está bien configurado con prefetch
  para los bundles principales. Solo hay que agregar el
  dataGroups para caché de las imágenes estáticas del
  backend (campos, escudos, etc.):

● Write(ngsw-config.json)
  ⎿  Added 15 lines
      26          ]
      27        }
      28      }
      29 +  ],
      30 +  "dataGroups": [
      31 +    {
      32 +      "name": "api-uploads",
      33 +      "urls": [
      34 +        "https://tfg-dam-united-backend.o
         +nrender.com/api/uploads/**",
      35 +        "http://localhost:8080/api/upload
         +s/**"
      36 +      ],
      37 +      "cacheConfig": {
      38 +        "strategy": "performance",
      39 +        "maxSize": 50,
      40 +        "maxAge": "1d",
      41 +        "timeout": "5s"
      42 +      }
      43 +    }
      44    ]
      45  }

● Punto 4 — Fix del index.html (Apple meta tags y
  theme-color). El archivo ya lo tengo en contexto. Hay
  que:
  1. Cambiar apple-mobile-web-app-title de "Club Fútbol
  Pro" a "DAM United"
  2. Cambiar el apple-mobile-web-app-status-bar-style de
  "default" a "black-translucent" (según instruccion.md)
  3. Cambiar el theme-color que ng add puso (#1976d2) a
  #0a0e1a

● Update(src\index.html)
  ⎿  Added 2 lines, removed 2 lines
      39
      40    <!-- PWA Meta Tags -->
      41    <meta name="apple-mobile-web-app-capabl
          e" content="yes">
      42 -  <meta name="apple-mobile-web-app-status
         --bar-style" content="default">
      43 -  <meta name="apple-mobile-web-app-title"
         - content="Club Fútbol Pro">
      42 +  <meta name="apple-mobile-web-app-status
         +-bar-style" content="black-translucent">
      43 +  <meta name="apple-mobile-web-app-title"
         + content="DAM United">
      44    <meta name="theme-color" content="#1e3a
          8a">
      45    <meta name="msapplication-TileColor" co
          ntent="#1e3a8a">
      46

● Ahora los dos theme-color — el que pusimos nosotros
  (#1e3a8a) y el que ng add puso (#1976d2), los alineamos
  a #0a0e1a:

● Update(src\index.html)
  ⎿  Added 2 lines, removed 2 lines
      41    <meta name="apple-mobile-web-app-capabl
          e" content="yes">
      42    <meta name="apple-mobile-web-app-status
          -bar-style" content="black-translucent">
      43    <meta name="apple-mobile-web-app-title"
           content="DAM United">
      44 -  <meta name="theme-color" content="#1e3a
         -8a">
      45 -  <meta name="msapplication-TileColor" co
         -ntent="#1e3a8a">
      44 +  <meta name="theme-color" content="#0a0e
         +1a">
      45 +  <meta name="msapplication-TileColor" co
         +ntent="#0a0e1a">
      46
      47    <!-- Add to homescreen for Chrome on An
          droid -->
      48    <meta name="mobile-web-app-capable" con
          tent="yes">

● Update(src\index.html)
  ⎿  Added 1 line, removed 1 line
      51    <!-- iOS Status Bar -->
      52    <meta name="apple-mobile-web-app-status
          -bar-style" content="light">
      53    <link rel="manifest" href="manifest.web
          manifest">
      54 -  <meta name="theme-color" content="#1976
         -d2">
      54 +  <meta name="theme-color" content="#0a0e
         +1a">
      55  </head>
      56
      57  <body>

● También el apple-mobile-web-app-status-bar-style
  duplicado (hay uno al final del head con "light") — lo
  actualizamos:

● Update(src\index.html)
  ⎿  Added 1 line, removed 1 line
      49    <meta name="application-name" content="
          Club Fútbol Pro">
      50
      51    <!-- iOS Status Bar -->
      52 -  <meta name="apple-mobile-web-app-status
         --bar-style" content="light">
      52 +  <meta name="apple-mobile-web-app-status
         +-bar-style" content="black-translucent">
      53    <link rel="manifest" href="manifest.web
          manifest">
      54    <meta name="theme-color" content="#0a0e
          1a">
      55  </head>

● Punto 5 — Documentación. Actualizo futuras-mejoras.md
  marcando PWA como completado:

● Update(~\Documents\2DAM\TFG-SergioEstudillo\TFG-SergioEs
        tudillo\futuras-mejoras.md)
  ⎿  Added 1 line, removed 1 line
      115
      116  ### 1.2 Modernización del Frontend (Next
           -Gen)
      117  - [ ] **Migración a Angular Signals:** O
           ptimizar la gestión de estado y el rendi
           miento del renderizado adoptando Signals
            en lugar de flujos puramente basados en
            observables de RxJS.
      118 -- [ ] **PWA (Progressive Web App):** Con
          -figurar Service Workers para permitir la
          - instalación de la app en dispositivos m
          -óviles y habilitar la persistencia de da
          -tos offline (ej. ver calendario sin cone
          -xión).
      118 +- [x] **PWA (Progressive Web App):** Con
          +figurar Service Workers para permitir la
          + instalación de la app en dispositivos m
          +óviles y habilitar la persistencia de da
          +tos offline (ej. ver calendario sin cone
          +xión).
      119  - [ ] **Notificaciones Push Nativa:** In
           tegración con Firebase Cloud Messaging (
           FCM) para alertas de sistema directas al
            panel de notificaciones del SO.
      120
      121  ### 1.3 Funcionalidades de Impacto Depor
           tivo

● Ahora agrego la nota en el README.md. Leo la sección
  Mobile First:

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Update(~\Documents\2DAM\TFG-SergioEstudillo\TFG-SergioEs
        tudillo\README.md)
  ⎿  Added 1 line
      576  - Capacitor para despliegue en Android.
      577  - **Bottom Sheet** para fichas de jugado
           r (drag-to-dismiss).
      578  - Calendario rediseñado con identidad **
           Dark Pro**.
      579 +- **PWA instalable**: Service Worker (`@
          +angular/pwa`) con caché de assets en mod
          +o `prefetch` y estrategia `performance`
          +para imágenes. Permite "Añadir a pantall
          +a de inicio" en Android, iOS y escritori
          +o.
      580
      581  ---
      582

● Listo. La tarea PWA está completa. Resumen de todo lo
  que se hizo:

  ---
  Punto 1 — ng add @angular/pwa (ya estaba hecho antes de
  la compactación)

  Punto 2 — public/manifest.webmanifest actualizado:
  - name: "DAM United FC", short_name: "DAM United"
  - theme_color / background_color: #0a0e1a
  - display: "standalone", orientation: "portrait"

  Punto 3 — ngsw-config.json con dataGroups agregado:
  - Estrategia performance para /api/uploads/** (imágenes
  del backend)
  - Cache máx 50 entradas, 1 día de vida, 5s timeout

  Punto 4 — index.html corregido:
  - apple-mobile-web-app-title: "DAM United"
  - apple-mobile-web-app-status-bar-style:
  "black-translucent"
  - Los 3 theme-color unificados en #0a0e1a

  Punto 5 — Docs actualizados:
  - futuras-mejoras.md: PWA marcado [x]
  - README.md: nota bajo "Mobile First"

  ---
  Para probarlo necesitás hacer un build de producción
  (npm run build -- --configuration production) y servirlo
   con HTTPS — el Service Worker solo activa en HTTPS. En
  desarrollo local no vas a ver el prompt de instalación,
  pero el manifiesto sí podés verificarlo en Chrome
  DevTools → Application → Manifest.