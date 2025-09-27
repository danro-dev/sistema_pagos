# Usa una imagen oficial de Python para tu microservicio
FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia los requisitos e instálalos
COPY ./requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código de la aplicación
COPY ./app /app/app

# Expone el puerto que usa Uvicorn
EXPOSE 8001

# Comando de ejecución se define en docker-compose.yml