# Etapa 1: instalar solo las dependencias de produccion
FROM node:24-alpine AS deps

WORKDIR /app

# Copiamos primero los manifest para aprovechar la cache de Docker:
# si solo cambia el codigo, no se vuelve a correr npm ci
COPY package*.json ./
RUN npm ci --omit=dev

# Etapa 2: imagen final con node_modules + codigo, sin cache de npm
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# No correr como root dentro del contenedor
USER node

EXPOSE 3001

CMD ["node", "server.js"]
