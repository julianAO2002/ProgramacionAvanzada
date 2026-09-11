# Imagen base liviana con Node 20
FROM node:20-alpine AS deps

WORKDIR /app

# Copiamos primero los manifest de dependencias para aprovechar la cache de Docker:
# si solo cambia el codigo (no las dependencias), Docker no vuelve a correr npm install
COPY package*.json ./

RUN npm install --omit=dev

# Etapa final: solo lo necesario para correr la app, sin cache de npm ni devDependencies
FROM node:20-alpine

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
