from flask import Blueprint, render_template, redirect, request, session, url_for
import bcrypt
from functools import wraps
from database import db_conexao

web_bp = Blueprint('web', __name__)

# Decorator de login para a WEB
def login_required(tipo_permitido=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'usuario_id' not in session:
                return redirect(url_for('web.login'))
            if tipo_permitido and session.get('usuario_tipo') != tipo_permitido:
                return redirect(url_for('web.home'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# --- PÁGINAS DE LOGIN ---

@web_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario_digitado = request.form['username']
        senha_digitada = request.form['password']
        
        conn_login = db_conexao()
        cursor = conn_login.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario_digitado,))
            usuario_encontrado = cursor.fetchone()
            
            if usuario_encontrado and bcrypt.checkpw(senha_digitada.encode('utf-8'), usuario_encontrado['senha'].encode('utf-8')):
                session['usuario_id'] = usuario_encontrado['id'] if 'id' in usuario_encontrado else usuario_encontrado['email']
                session['usuario_email'] = usuario_encontrado['email']
                session['usuario_tipo'] = usuario_encontrado['tipo']

                if usuario_encontrado['tipo'] == 'admin':
                    return redirect(url_for('web.admin'))
                else:
                    return redirect(url_for('web.home'))
            else:
                return redirect(url_for('web.incorreto'))
        finally:
            cursor.close()
            conn_login.close()
                
    return render_template('index.html')

@web_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('web.login'))

@web_bp.route('/incorreto')
def incorreto():
    return render_template('login_incorreto.html')

# --- PÁGINAS DE NAVEGAÇÃO ---

@web_bp.route('/home')
@login_required()
def home():
    conexao = db_conexao()
    cursor = conexao.cursor()
    try:
        cursor.execute("SELECT * FROM itens")
        resultados = cursor.fetchall()
        return render_template('home.html', resultados=resultados)
    finally:
        cursor.close()
        conexao.close()

@web_bp.route('/home-admin')
@login_required(tipo_permitido='admin')
def admin():
    conexao = db_conexao()
    cursor = conexao.cursor()
    try:
        cursor.execute("SELECT * FROM itens")
        resultados = cursor.fetchall()
        return render_template('admin.html', resultados=resultados)
    finally:
        cursor.close()
        conexao.close()

# --- PÁGINA DE CONTROLE DE ITENS ---

@web_bp.route('/controle-de-itens')
@login_required()
def controle():
    return render_template('cont.html')

# --- PÁGINA DE ADICIONAR ITENS À LISTA ---

@web_bp.route('/lista')
@login_required()
def lista():
    return render_template('lista.html')

@web_bp.route('/lista-sucesso', methods=['GET', 'POST'])
@login_required()
def listaSucesso():
    if request.method == 'POST':
        nome = request.form['nome']
        preco = request.form['preco']
        quantidade = request.form['quantidade']
        estoque_min = request.form['quantidade_min']
        categoria = request.form['categoria']
        descricao = request.form['descricao']
        imagem = request.form['imagem']

        item = (nome, preco, quantidade, estoque_min, categoria, descricao, imagem)
        query = 'INSERT INTO itens (nome, preço, quantidade, estoque_min, categoria, descricao, imagem) VALUES (%s, %s, %s, %s, %s, %s, %s);'
        
        con = db_conexao()
        cursor = con.cursor()
        try:
            cursor.execute(query, item)
            con.commit()
        finally:
            cursor.close()
            con.close()
        
    return render_template('lista_sucesso.html')

# --- PÁGINA DE ADICIONAR USUÁRIOS ---

@web_bp.route('/cadastro-de-usuarios')
@login_required(tipo_permitido='admin')
def users():
    return render_template('users.html')

@web_bp.route('/user-sucesso', methods=['GET', 'POST'])
@login_required(tipo_permitido='admin')
def userSucesso():
    if request.method == 'POST':
        email = request.form['email'].strip()
        senha = request.form['senha'].strip()
        tipo = request.form['posto'].strip().lower()

        if not email or not senha:
            return "Por favor, preencha todos os campos antes de enviar!", 400

        senha_bytes = senha.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        senha_hash_bytes = bcrypt.hashpw(senha_bytes, salt)
        senha_criptografada = senha_hash_bytes.decode('utf-8')
        usuario = (email, senha_criptografada, tipo)

        query = 'INSERT INTO usuarios (email, senha, tipo) VALUES (%s, %s, %s);'
        con_user = db_conexao()
        cursor = con_user.cursor()
        try:
            cursor.execute(query, usuario)
            con_user.commit()
        finally:
            cursor.close()
            con_user.close()
        
    return render_template('user_sucesso.html')