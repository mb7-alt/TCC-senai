from flask import Flask, redirect, url_for
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

# Import dos Blueprints
from web.routes import web_bp
from api.routes import api_bp

app = Flask(__name__)
app.secret_key = '12345'

# Configurações do JWT (Usado na API)
app.config["JWT_SECRET_KEY"] = "sua-chave-secreta-mobile-123"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

jwt = JWTManager(app)
CORS(app)  # Permite chamadas do React Native

# Registo dos Blueprints
app.register_blueprint(web_bp)  # Rotas Web (ex: /login, /home)
app.register_blueprint(api_bp)  # Rotas da API (ex: /api/login, /api/itens)

# Redirecionamento da raiz / para o login web
@app.route('/')
def index():
    return redirect(url_for('web.login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)