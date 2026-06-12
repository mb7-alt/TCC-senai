from flask import Flask, render_template, redirect, request
import mysql.connector

app = Flask(__name__)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario_digitado = request.form['username']
        senha_digitada = request.form['password']
        
        conn_login = mysql.connector.connect(
            host='localhost', database='almoxarifado', user='root', password='', port='3306'
        )
        cursor = conn_login.cursor(dictionary=True) 
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario_digitado,))
        usuario_encontrado = cursor.fetchone()
        
        cursor.close()
        conn_login.close()
        if usuario_encontrado and senha_digitada == usuario_encontrado['senha']:
            if usuario_encontrado['tipo'] == 'admin':
                return redirect('/home-admin')
            else:
                return redirect('/home')
        else:
            return "Usuário ou senha incorretos! Tente novamente."
        
    return render_template('index.html', titulo="Login")
            

@app.route('/home')
def home():
    db = mysql.connector.connect (
        host = 'localhost',
        database = 'almoxarifado',
        user = 'root',
        password = '',
        port = '3307'
    )
    cursor = db.cursor()
    cursor.execute("SELECT * FROM itens")
    resultados = cursor.fetchall()
    cursor.close()
    db.close()
    
    return render_template('home.html', active_page='Home', resultados=resultados)

@app.route('/controle-de-itens')
def cont():
    return render_template('cont.html', active_page='Controle dos itens')

@app.route('/lista')
def lista():
    return render_template('lista.html', titulo="Adicionar à lista")

@app.route('/home-admin')
def admin():
    return render_template('admin.html', titulo="Página do administrador")

@app.route('/cadastro-de-usuarios')
def usuarios():
    return render_template('users.html', titulo="Adicionar novos usuários")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")