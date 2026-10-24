FROM python:3.11-slim
<<<<<<< HEAD

WORKDIR /app

# Instala dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia a aplicação
COPY . .

EXPOSE 5000

=======
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
>>>>>>> 449e082883ed487d46ad571dab8210613b1942f2
CMD ["python", "app.py"]
