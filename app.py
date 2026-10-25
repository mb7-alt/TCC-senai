import os
from datetime import timedelta
from flask import Flask, redirect, url_for, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Import dos Blueprints e utilitários de banco de dados
from web.routes import web_bp
from api.routes import api_bp
from database import verificar_migracoes

app = Flask(__name__)

# Chave secreta de sessão Flask
app.secret_key = os.environ.get('SECRET_KEY', 'almoxarifado-senai-secret-key-2026')

# Configurações do JWT para uso no Mobile e integrações
app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET_KEY', 'senai-jwt-secret-mobile-key-2026')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

jwt = JWTManager(app)

# Habilita CORS para permitir requisições do React Native / Expo e outros clientes
CORS(app, resources={r"/*": {"origins": "*"}})

# Registro dos Blueprints
app.register_blueprint(web_bp)  # Rotas Web (ex: /login, /home, /controle-de-itens)
app.register_blueprint(api_bp)  # Rotas da API REST (ex: /api/login, /api/itens, /api/movimentar)

# Redirecionamento da raiz / para o login web
@app.route('/')
def index():
    return redirect(url_for('web.login'))

# Tratamento amigável de erro 404 (Não Encontrado)
@app.errorhandler(404)
def nao_encontrado(e):
    if request.path.startswith('/api/'):
        return jsonify({'erro': 'Recurso não encontrado', 'caminho': request.path}), 404
    return redirect(url_for('web.home'))

# Tratamento amigável de erro 500 (Erro Interno)
@app.errorhandler(500)
def erro_interno(e):
    if request.path.startswith('/api/'):
        return jsonify({'erro': 'Erro interno do servidor', 'detalhes': str(e)}), 500
    return "Ocorreu um erro interno no servidor. Verifique os logs.", 500

if __name__ == '__main__':
    # Tenta verificar se há migrações pendentes no banco e criar tabelas se necessário
    verificar_migracoes()
    
    porta = int(os.environ.get('PORT', 5000))
    print(f"[*] Almoxarifado SENAI iniciado com sucesso na porta {porta}!")
    print(f"[*] Acesso Web: http://localhost:{porta}")
    print(f"[*] Acesso API: http://localhost:{porta}/api")
    app.run(host='0.0.0.0', port=porta, debug=True)
