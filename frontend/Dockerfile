# Etapa 1: Compilación (Usamos Node 20 LTS para máxima estabilidad)
FROM node:20.11.0-alpine as build-step
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos todo el código (incluyendo tu tsconfig.json que ya funciona)
COPY . .

# Ejecutamos el build de producción
RUN npx ng build --configuration production

# Etapa 2: Servidor Web (Nginx) para servir los archivos estáticos
FROM nginx:alpine

# ✅ CORRECCIÓN CRUCIAL: Copiamos desde 'dist/club-futbol-ionic' (según tu angular.json)
COPY --from=build-step /app/dist/club-futbol-ionic /usr/share/nginx/html

# Configuración de Nginx para manejar rutas de Angular (evita el 404 al refrescar)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]