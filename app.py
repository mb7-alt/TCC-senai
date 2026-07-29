from flask import Flask, render_template, redirect, request, jsonify, session, url_for
import mysql.connector
import bcrypt

app = Flask(__name__)
# Chave secreta necessária para usar session
app.secret_key = '1234'

def db_conexao():
    return mysql.connector.connect(
        host='localhost',
        database='almoxarifado',
        user='root',
        password='',
        port='3306'
    )

def verificar_acesso(tipo_permitido=None):
    # 1. Verifica se o utilizador está logado
    if 'usuario_id' not in session:
        return redirect(url_for('login'))
    
    # 2. Se for exigido um tipo específico (ex: 'admin') e o utilizador não tiver, redireciona para a home
    if tipo_permitido and session.get('usuario_tipo') != tipo_permitido:
        return redirect(url_for('home'))
    
    # Se estiver tudo certo, não retorna nada (None)
    return None


@app.route('/login', methods=['GET', 'POST'])
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
                # Guarda os dados do utilizador na sessão
                session['usuario_id'] = usuario_encontrado['id'] if 'id' in usuario_encontrado else usuario_encontrado['email']
                session['usuario_email'] = usuario_encontrado['email']
                session['usuario_tipo'] = usuario_encontrado['tipo']

                if usuario_encontrado['tipo'] == 'admin':
                    return redirect(url_for('admin'))
                else:
                    return redirect(url_for('home'))
            else:
                return redirect(url_for('incorreto'))
        finally:
            cursor.close()
            conn_login.close()
                
    return render_template('index.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/incorreto')
def incorreto():
    return render_template('login_incorreto.html')


@app.route('/home')
def home():
    # Validação de acesso manual
    bloqueio = verificar_acesso()
    if bloqueio:
        return bloqueio

    conexao = db_conexao()
    cursor = conexao.cursor()
    try:
        cursor.execute("SELECT * FROM itens")
        resultados = cursor.fetchall()
        return render_template('home.html', resultados=resultados)
    finally:
        cursor.close()
        conexao.close()


@app.route('/home-admin')
def admin():
    # Validação de acesso manual para admin
    bloqueio = verificar_acesso(tipo_permitido='admin')
    if bloqueio:
        return bloqueio

    conexao = db_conexao()
    cursor = conexao.cursor()
    try:
        cursor.execute("SELECT * FROM itens")
        resultados = cursor.fetchall()
        return render_template('admin.html', resultados=resultados)
    finally:
        cursor.close()
        conexao.close()


@app.route('/lista')
def lista():
    bloqueio = verificar_acesso()
    if bloqueio:
        return bloqueio

    return render_template('lista.html')


@app.route('/lista-sucesso', methods=['GET', 'POST'])
def listaSucesso():
    bloqueio = verificar_acesso()
    if bloqueio:
        return bloqueio

    if request.method == 'POST':
        ferramenta = request.form['ferramenta']
        preco = request.form['preco']
        quantidade = request.form['quantidade']
        quantidade_min = request.form['quantidade_min']
        categoria = request.form['categoria']
        descricao = request.form['descricao']
        imagem = request.form['imagem']

        item = (ferramenta, preco, quantidade, quantidade_min, categoria, descricao, imagem)
        query = 'INSERT INTO itens (ferramenta, preco, quantidade, quantidade_min, categoria, descricao, imagem) VALUES (%s, %s, %s, %s, %s, %s, %s);'
        
        con = db_conexao()
        cursor = con.cursor()
        try:
            cursor.execute(query, item)
            con.commit()
        finally:
            cursor.close()
            con.close()
        
    return render_template('lista_sucesso.html')


@app.route('/cadastro-de-usuarios')
def users():
    bloqueio = verificar_acesso(tipo_permitido='admin')
    if bloqueio:
        return bloqueio

    return render_template('users.html')


@app.route('/user-sucesso', methods=['GET', 'POST'])
def userSucesso():
    bloqueio = verificar_acesso(tipo_permitido='admin')
    if bloqueio:
        return bloqueio

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


@app.route('/controle-de-itens')
def controle():
    bloqueio = verificar_acesso()
    if bloqueio:
        return bloqueio

    return render_template('cont.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)