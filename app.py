from flask import Flask, render_template, redirect, request, jsonify
import mysql.connector
import bcrypt

app = Flask(__name__)

def db_conexao():
     conexao = mysql.connector.connect (
        host = 'localhost',
        database = 'almoxarifado',
        user = 'root',
        password = '',
        port = '3306'
    )
     return conexao

@app.route('/login', methods=['GET', 'POST'])
def login():
    return render_template('index.html', titulo="Página de login")

@app.route('/home')
def home():
    db = mysql.connector.connect (
        host = 'localhost',
        database = 'almoxarifado',
        user = 'root',
        password = '',
        auth_plugin='mysql_native_password'
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
    
# 1. ROTA PARA BUSCAR O ITEM (GET)
@app.route('/api/item/<int:id_item>', methods=['GET'])
def buscar_item(id_item):
    conexao = db_conexao()
    cursor = conexao.cursor(dictionary=True)
    
    # Busca o nome e quantidade do item baseado no seu ID
    cursor.execute("SELECT nome, quantidade FROM itens WHERE id = %s", (id_item,))
    item = cursor.fetchone()
    
    if not item:
        cursor.close()
        conexao.close()
        return jsonify({'erro': 'Item não encontrado'}), 404
        
    # Busca o histórico de movimentações desse item
    cursor.execute(
        "SELECT tipo, pessoa, destino, DATE_FORMAT(data, '%d/%m/%Y %H:%i') as data FROM historico WHERE id_item = %s ORDER BY data DESC", 
        (id_item,)
    )
    historico = cursor.fetchall()
    
    cursor.close()
    conexao.close()
    
    return jsonify({
        'nome': item['nome'],
        'quantidade': item['quantidade'],
        'historico': historico
    })

# 2. ROTA PARA REGISTRAR A MOVIMENTAÇÃO (POST)
@app.route('/api/movimentar', methods=['POST'])
def movimentar_item():
    dados = request.json
    id_item = dados.get('id')
    quantidade_nova = dados.get('quantidade')
    pessoa = dados.get('pessoa')
    destino = dados.get('destino')
    tipo = dados.get('tipo') # 'Entrada' ou 'Saída'
    
    conexao = db_conexao()
    cursor = conexao.cursor()
    
    try:
        # 1. Atualiza a quantidade atual na sua tabela 'itens'
        cursor.execute("UPDATE itens SET quantidade = %s WHERE id = %s", (quantidade_nova, id_item))
        
        # 2. Registra quem levou/trouxe, para onde e quando na tabela 'historico'
        query_hist = "INSERT INTO historico (id_item, tipo, pessoa, destino, data) VALUES (%s, %s, %s, %s, NOW())"
        cursor.execute(query_hist, (id_item, tipo, pessoa, destino))
        
        conexao.commit()
        resposta = {'sucesso': True}
    except Exception as e:
        conexao.rollback()
        resposta = {'sucesso': False, 'erro': str(e)}
    finally:
        cursor.close()
        conexao.close()
        
    return jsonify(resposta)

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

#ROTAS DE CONEXÃO PARA A PÁGINA DE CONTROLE DE ITENS
@app.route('/buscar_item/<int:item_id>', methods=['GET'])
def buscar_item(item_id):
    try:
        db = mysql.connector.connect(
            host='localhost', database='almoxarifado', user='root', password='', auth_plugin='mysql_native_password'
        )
        cursor = db.cursor(dictionary=True)
        
        # 1. Busca o item
        cursor.execute("SELECT id, nome, quantidade FROM itens WHERE id = %s", (item_id,))
        item = cursor.fetchone()
        
        if not item:
            cursor.close()
            db.close()
            return jsonify({"erro": "Item não encontrado"}), 404
            
        # 2. Busca o histórico usando a tabela 'historico_movimentacoes' que o grupo usou
        cursor.execute("""
            SELECT * FROM historico_movimentacoes 
            WHERE item_id = %s 
        """, (item_id,))
        historico_rows = cursor.fetchall()
        
        item['historico'] = historico_rows
        
        cursor.close()
        db.close()
        return jsonify(item)
        
    except Exception as e:
        print("ERRO REAL AQUI Ó:", str(e))
        return jsonify({"erro": str(e)}), 500


#Rota para salvar a nova movimentação (Entrada/Saída) e atualizar o estoque
@app.route('/api/movimentar', methods=['POST'])
def registrar_movimentacao():
    try:
        dados = request.get_json()
        db = mysql.connector.connect(
            host='localhost', database='almoxarifado', user='root', password='', auth_plugin='mysql_native_password'
        )
        cursor = db.cursor(dictionary=True)
        
        #1. Grava a movimentação no histórico
        sql_historico = "INSERT INTO historico (item_id, tipo, pessoa, destino) VALUES (%s, %s, %s, %s)"
        valores_historico = (dados['itemId'], dados['tipo'], dados['pessoa'], dados['destino'])
        cursor.execute(sql_historico, valores_historico)
        
        #2. Atualiza a tabela 'itens' de vocês com a nova quantidade
        sql_item = "UPDATE itens SET quantidade = %s WHERE id = %s"
        cursor.execute(sql_item, (dados['novaQuantidade'], dados['itemId']))
        
        db.commit() # Salva as alterações de verdade no banco
        
        #3. Pega o histórico atualizado para recarregar a tabela na tela
        cursor.execute("""
            SELECT tipo, pessoa, destino, DATE_FORMAT(data_movimentacao, '%d/%m/%Y') as data 
            FROM historico 
            WHERE item_id = %s 
            ORDER BY data_movimentacao DESC
        """, (dados['itemId'],))
        historico_atualizado = cursor.fetchall()
        
        cursor.close()
        db.close()
        
        return jsonify({"sucesso": True, "historicoAtualizado": historico_atualizado})
        
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")