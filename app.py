from flask import Flask, render_template, redirect, request
import mysql.connector
import bcrypt

app = Flask(__name__)

def db_conexao():
     conexao = mysql.connector.connect (
        host = 'localhost',
        database = 'almoxarifado',
        user = 'root',
        password = '',
        port = '3307'
    )
     return conexao

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario_digitado = request.form['username']
        senha_digitada = request.form['password']
        
        conn_login = db_conexao()
        cursor = conn_login.cursor(dictionary=True) 
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario_digitado,))
        usuario_encontrado = cursor.fetchone()
        
        cursor.close()
        conn_login.close()
        
        if usuario_encontrado and bcrypt.checkpw(senha_digitada.encode('utf-8'), usuario_encontrado['senha'].encode('utf-8')):
            if usuario_encontrado['tipo'] == 'admin':
                return redirect('/home-admin')
            else:
                return redirect('/home')
        else:
            return redirect('/incorreto')
                
    return render_template('index.html')
        
@app.route('/incorreto')
def erroLogin():
    if request.method == 'POST':
        usuario_digitado = request.form['username']
        senha_digitada = request.form['password']
        
        conn_login = db_conexao()
        cursor = conn_login.cursor(dictionary=True) 
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario_digitado,))
        usuario_encontrado = cursor.fetchone()
        
        cursor.close()
        conn_login.close()
        
        if usuario_encontrado and bcrypt.checkpw(senha_digitada.encode('utf-8'), usuario_encontrado['senha'].encode('utf-8')):
            if usuario_encontrado['tipo'] == 'admin':
                return redirect('/home-admin')
            else:
                return redirect('/home')
        else:
            return redirect('/incorreto')
                
    return render_template('login_incorreto.html')

@app.route('/home')
def home():
    conexao = db_conexao()
    cursor = conexao.cursor()
    cursor.execute("SELECT * FROM itens")
    resultados = cursor.fetchall()
    cursor.close()
    conexao.close()
    
    return render_template('home.html', resultados=resultados)

@app.route('/controle-de-itens')
def cont():
    return render_template('cont.html')

@app.route('/lista', methods=['GET', 'POST'])
def lista():
    
    return render_template('lista.html')

@app.route('/sucesso',  methods=['GET', 'POST'])
def sucesso():
    if request.method == 'POST':
        nome = request.form['nome']
        preço = float(request.form['preço'])
        quantidade = int(request.form['quantidade'])
        estoque_min = int(request.form['quantidade_min'])
        categoria = request.form['categoria']
        descriçao = request.form['descriçao']
        imagem = request.form['imagem']
        valores = (nome, preço, quantidade, estoque_min, categoria, descriçao, imagem)

        query = 'INSERT INTO itens (nome, preço, quantidade, estoque_min, categoria, descricao, imagem) VALUES (%s, %s, %s, %s, %s, %s, %s);'
        con_lista = db_conexao()
        cursor = con_lista.cursor()
        cursor.execute(query, valores)
        con_lista.commit()
        cursor.close()
        con_lista.close()
        
    return render_template('lista_sucesso.html')

@app.route('/user-sucesso',  methods=['GET', 'POST'])
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
        cursor.execute(query, usuario)
        con_user.commit()
        cursor.close()
        con_user.close()
        
    return render_template('user_sucesso.html')

@app.route('/home-admin')
def admin():
    conexao = db_conexao()
    cursor = conexao.cursor()
    cursor.execute("SELECT * FROM itens")
    resultados = cursor.fetchall()
    cursor.close()
    conexao.close()
    
    return render_template('admin.html', resultados=resultados)

@app.route('/cadastro-de-usuarios')
def users():
    return render_template('users.html')

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")