# Estágio 1: Build
FROM node:18-alpine AS build

# Definimos o argumento que receberá a URL real da Azure no comando de build
ARG VITE_API_URL
# O Vite precisa que a variável esteja no ambiente ANTES do comando 'build'
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Defina a ARG como ENV para que o Vite possa acessá-la durante o build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Estágio 2: Servidor Web (Nginx)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Configuração para SPAs (evita 404 ao atualizar a página)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]