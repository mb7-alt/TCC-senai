from flask import Flask, render_template

app = Flask(__name__)

@app.route('/login')
def login():
    return render_template('index.html', titulo="Página de login")

@app.route('/home')
def home():
    return render_template('home.html', active_page='Home')

@app.route('/controle-de-itens')
def cont():
    return render_template('cont.html', active_page='Controle dos itens')

@app.route('/lista')
def lista():
    return render_template('lista.html', titulo="Adicionar à lista")

@app.route('/home-admin')
def admin():
    return render_template('admin.html', titulo="Página do administrador")

@app.route('/cadastro-de-usuários')
def usuarios():
    return render_template('users.html', titulo="Adicionar novos usuários")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")