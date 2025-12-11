# Imagen base de Python
FROM python:3.11-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivo de dependencias
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código del backend
COPY . .

# Exponer el puerto 8000
EXPOSE 8000

# Comando para iniciar la aplicación (limpiar cache antes de iniciar)
CMD ["sh", "-c", "find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"]

