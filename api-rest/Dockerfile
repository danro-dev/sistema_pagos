FROM node:20-alpine

WORKDIR /usr/src/app

# Copia los archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instala dependencias
RUN npm install

# Copia el código fuente
COPY src/ ./src/

# Compila TypeScript a JavaScript
RUN npm run build

EXPOSE 3000

# El comando de inicio
CMD ["npm", "start"]