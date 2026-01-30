# Etapa 1: Compilación (Usamos Node 20 LTS para máxima estabilidad)
FROM node:20.11.0-alpine as build-step
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos todo el código
COPY . .

# Ejecutamos el build de producción usando el script de tu package.json
RUN npm run build

# Etapa 2: Servidor Web (Nginx) para servir los archivos estáticos
FROM nginx:alpine

# Copiamos desde la ruta real definida en tu angular.json
COPY --from=build-step /app/dist/club-futbol-ionic /usr/share/nginx/html

# Configuración de Nginx para manejar rutas de Angular
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