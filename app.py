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

@app.route('/lista')
def lista():
    return render_template('lista.html')

@app.route('/home-admin')
def admin():
    return render_template('admin.html')

@app.route('/cadastro-de-usuarios')
def users():
    return render_template('users.html')

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")