# Build stage
FROM node:slim AS build

WORKDIR /usr/local/app

# Copia apenas os arquivos de dependência primeiro (melhor uso de cache)
COPY package*.json ./
RUN npm ci

# Copia o restante do código, incluindo .env se necessário
COPY . .

# Gera build de produção
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copia os arquivos do build para o diretório de publicação do Nginx
COPY --from=build /usr/local/app/dist /usr/share/nginx/html

# Copia configuração customizada do Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Define volume opcional para cache
VOLUME /var/cache/nginx

# Ajusta permissões dos arquivos (caso necessário)
RUN chown -R nginx:nginx /var/cache/nginx /usr/share/nginx/html

# Usa o usuário já existente nginx
USER root

# Expõe a porta padrão
EXPOSE 80

# Comando para manter o Nginx rodando em foreground
CMD ["nginx", "-g", "daemon off;"]
