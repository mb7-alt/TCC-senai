# BASE DO PROJETO, TANTO NA WEB QUANTO NO EXPO
from flask import Flask, redirect, url_for # Import do Flask utilizado no "esqueleto" da aplicação
from flask_cors import CORS # Biblioteca que permite gerenciar o CORS (Cross-Origin Resource Sharing) para a API do Expo
from flask_jwt_extended import JWTManager # Biblioteca para emissão de tokens e proteção/autenticação de rotas
from datetime import timedelta # Módulo para controle dos intervalos de tempo e períodos

# Import dos Blueprints
from web.routes import web_bp
from api.routes import api_bp

# Cria a instância("base") do projeto
app = Flask(__name__)
app.secret_key = '12345'

# Configurações do JWT (Usado na API)
app.config["JWT_SECRET_KEY"] = "chave-mobile-123"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7) # Tempo de expiração = 7 dias

jwt = JWTManager(app)
CORS(app)  # Permite chamadas do React Native

# Registo dos Blueprints
app.register_blueprint(web_bp)  # Rotas Web (ex: /login, /home)
app.register_blueprint(api_bp)  # Rotas da API (ex: /api/login, /api/itens)

# Redirecionamento da raiz "/" para o login web
@app.route('/')
def index():
    return redirect(url_for('web.login'))

# Define como o servidor será iniciado
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)