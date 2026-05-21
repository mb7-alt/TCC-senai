from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html', titulo="Página de login")

@app.route('/home')
def sobre():
    return render_template('home.html', active_page='Home')

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")