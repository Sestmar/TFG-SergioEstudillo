# Etapa 1: Compilación
FROM node:20.11.0-alpine as build-step
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine
# Copiamos el resultado de la compilación a la carpeta de Nginx
COPY --from=build-step /app/www /usr/share/nginx/html
# Copiamos una configuración para que las rutas de Angular funcionen
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