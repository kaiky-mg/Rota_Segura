# Build stage
FROM node:slim AS build

WORKDIR /usr/local/app

# Copia apenas os arquivos de dependência primeiro (melhor uso de cache)
COPY package*.json ./
RUN npm ci

# --- INJEÇÃO DE VARIÁVEIS DE AMBIENTE ---
# Definimos o ARG para receber o valor da Pipeline e o ENV para o processo de build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# ---------------------------------------

# Copia o restante do código
COPY . .

# Gera build de produção (agora com a variável injetada)
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copia os arquivos do build para o diretório de publicação do Nginx
COPY --from=build /usr/local/app/dist /usr/share/nginx/html

# Copia configuração customizada do Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Define volume opcional para cache
VOLUME /var/cache/nginx

# Ajusta permissões dos arquivos
RUN chown -R nginx:nginx /var/cache/nginx /usr/share/nginx/html

# Usa o usuário root para ajustes finais, mas o Nginx rodará conforme config
USER root

# Expõe a porta padrão
EXPOSE 80

# Comando para manter o Nginx rodando em foreground
CMD ["nginx", "-g", "daemon off;"]