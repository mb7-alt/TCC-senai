from flask import Flask, render_template, jsonify, request
import mysql.connector

app = Flask(__name__)

@app.route('/login')
def login():
    return render_template('index.html', titulo="Página de login")

@app.route('/home')
def home():
    db = mysql.connector.connect (
        host = 'localhost',
        database = 'almoxarifado',
        user = 'root',
        password = '1234',
        auth_plugin='mysql_native_password'
    )
    cursor = db.cursor()
    cursor.execute("SELECT * FROM itens")
    resultados = cursor.fetchall()
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

#ROTAS DE CONEXÃO PARA A PÁGINA DE CONTROLE DE ITENS
@app.route('/api/item/<int:id_item>', methods=['GET'])
def buscar_item(id_item):
    try:
        db = mysql.connector.connect(
            host='localhost', database='almoxarifado', user='root', password='1234', auth_plugin='mysql_native_password'
        )
        cursor = db.cursor(dictionary=True) #dictionary=True ajuda o JS a entender as colunas
        
        #Busca o item
        cursor.execute("SELECT id, nome, quantidade FROM itens WHERE id = %s", (id_item,))
        item = cursor.fetchone()
        
        if not item:
            cursor.close()
            db.close()
            return jsonify({"erro": "Item não encontrado"}), 404
            
        #Busca o histórico desse item
        cursor.execute("""
            SELECT tipo, pessoa, destino, DATE_FORMAT(data_movimentacao, '%d/%m/%Y') as data 
            FROM historico 
            WHERE item_id = %s 
            ORDER BY data_movimentacao DESC
        """, (id_item,))
        historico_rows = cursor.fetchall()
        
        item['historico'] = historico_rows
        
        cursor.close()
        db.close()
        return jsonify(item)
        
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


#Rota para salvar a nova movimentação (Entrada/Saída) e atualizar o estoque
@app.route('/api/movimentar', methods=['POST'])
def registrar_movimentacao():
    try:
        dados = request.get_json()
        db = mysql.connector.connect(
            host='localhost', database='almoxarifado', user='root', password='1234', auth_plugin='mysql_native_password'
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