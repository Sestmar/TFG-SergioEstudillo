# Etapa 1: Compilación
FROM node:20.11.0-alpine as build-step
WORKDIR /app

COPY package*.json .npmrc ./
RUN npm install

COPY . .

# Ejecutamos el build de producción
RUN npm run build

# Etapa 2: Servidor Web
FROM nginx:alpine

# ✅ CORRECCIÓN CRÍTICA: Copiamos desde 'www' (donde Ionic guarda el build)
COPY --from=build-step /app/www /usr/share/nginx/html

# Configuración de Nginx para SPA (Single Page Application)
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