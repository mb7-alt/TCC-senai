from flask import Flask, render_template, redirect, request, jsonify
import mysql.connector

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
    cursor = db.cursor()
    cursor.execute("SELECT * FROM itens")
    resultados = cursor.fetchall()
    return render_template('home.html', active_page='Home', resultados=resultados)

@app.route('/controle-de-itens')
def cont():
    return render_template('cont.html', active_page='Controle dos itens')

# # ROTA: Buscar item pelo ID e trazer o histórico dele
# @app.route('/buscar_item/<int:item_id>', methods=['GET'])
# def buscar_item(item_id):
#     conexao = db_conexao()
#     cursor = conexao.cursor(dictionary=True)

#     try:
#         # Busca os dados do item
#         cursor.execute("SELECT id, nome, quantidade, categoria, imagem FROM itens WHERE id = %s", (item_id,))
#         item = cursor.fetchone()

#         if not item:
#             return jsonify({"erro": "Item não encontrado no almoxarifado."}), 404
#         cursor.execute("""
#             SELECT tipo, quantidade, pessoa, destino, DATE_FORMAT(data_movimentacao, '%d/%m/%Y %H:%i') as data 
#             FROM historico_movimentacoes 
#             WHERE item_id = %s 
#             ORDER BY data_movimentacao DESC
#         """, (item_id,))
#         historico = cursor.fetchall()

#         return jsonify({
#             "item": item,
#             "historico": historico
#         }), 200

#     except mysql.connector.Error as erro:
#         return jsonify({"erro": str(erro)}), 500
#     finally:
#         cursor.close()
#         conexao.close()

# # ROTA: Registrar a movimentação (Entrada/Saída) e atualizar a tabela 'itens'
# @app.route('/registrar_movimentacao', methods=['POST'])
# def registrar_movimentacao():
#     dados = request.json
#     item_id = dados.get('item_id')
#     tipo = dados.get('tipo') 
#     qtd_movimentada = int(dados.get('quantidade'))
#     pessoa = dados.get('pessoa')    # Recebendo do JS
#     destino = dados.get('destino')  # Recebendo do JS

#     conexao = db_conexao()
#     cursor = conexao.cursor()

#     try:
#         # 1. Salva o registro no histórico salvando pessoa e destino também!
#         cursor.execute(
#             "INSERT INTO historico_movimentacoes (item_id, tipo, quantidade, pessoa, destino) VALUES (%s, %s, %s, %s, %s)",
#             (item_id, tipo, qtd_movimentada, pessoa, destino)
#         )

#         # 2. Atualiza a coluna 'quantidade' da tabela 'itens'
#         if tipo == 'entrada':
#             cursor.execute("UPDATE itens SET quantidade = quantidade + %s WHERE id = %s", (qtd_movimentada, item_id))
#         elif tipo == 'saida':
#             cursor.execute("UPDATE itens SET quantidade = quantidade - %s WHERE id = %s", (qtd_movimentada, item_id))

#         conexao.commit()
#         return jsonify({"mensagem": "Movimentação registrada e estoque atualizado!"}), 200

#     except mysql.connector.Error as erro:
#         conexao.rollback()
#         return jsonify({"erro": str(erro)}), 500
#     finally:
#         cursor.close()
#         conexao.close()

@app.route('/lista', methods=['GET', 'POST'])
def lista():
    return render_template('lista.html', titulo="Adicionar à lista")

@app.route('/home-admin')
def admin():
    return render_template('admin.html', titulo="Página do administrador")

@app.route('/cadastro-de-usuarios')
def usuarios():
    return render_template('users.html', titulo="Adicionar novos usuários")

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