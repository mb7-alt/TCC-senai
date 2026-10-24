from flask import Blueprint, request, jsonify, session
from flask_jwt_extended import create_access_token, verify_jwt_in_request, get_jwt
from functools import wraps
import bcrypt
from database import db_conexao

api_bp = Blueprint('api', __name__, url_prefix='/api')

def auth_required(admin_only=False):
    """
    Decorator Híbrido:
    Aceita autenticação tanto via Token JWT (Bearer Token para Mobile)
    quanto via Sessão de Cookies do Flask (para o Navegador Web).
    Resolve completamente conflitos entre web e mobile!
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            usuario_tipo = None
            usuario_email = None

            # 1. Tenta autenticar via JWT (Mobile)
            try:
                verify_jwt_in_request(optional=True)
                claims = get_jwt()
                if claims:
                    usuario_tipo = claims.get("tipo")
                    usuario_email = claims.get("email")
            except Exception:
                pass

            # 2. Se não autenticou via JWT, tenta via Sessão Flask (Navegador Web)
            if not usuario_email and 'usuario_id' in session:
                usuario_tipo = session.get('usuario_tipo')
                usuario_email = session.get('usuario_email')

            # 3. Se nenhum método de autenticação foi encontrado
            if not usuario_email:
                return jsonify({"erro": "Autenticação necessária. Faça login para continuar."}), 401

            # 4. Se a rota exigir privilégios de administrador
            if admin_only and usuario_tipo != "admin":
                return jsonify({"erro": "Acesso restrito a administradores."}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator


# --- AUTENTICAÇÃO ---

@api_bp.route('/login', methods=['POST'])
def api_login():
    """Autenticação de usuários para mobile e API."""
    dados = request.get_json(silent=True) or {}
    email = (dados.get('email') or '').strip()
    senha = (dados.get('senha') or '').strip()

    if not email or not senha:
        return jsonify({'erro': 'E-mail e senha são obrigatórios'}), 400

    conn = db_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        usuario = cursor.fetchone()

        if usuario and bcrypt.checkpw(senha.encode('utf-8'), usuario['senha'].encode('utf-8')):
            token = create_access_token(
                identity=str(usuario['email']),
                additional_claims={'email': usuario['email'], 'tipo': usuario['tipo']}
            )
            return jsonify({
                'sucesso': True,
                'token': token,
                'usuario': {
                    'email': usuario['email'],
                    'tipo': usuario['tipo']
                }
            }), 200

        return jsonify({'erro': 'E-mail ou senha incorretos'}), 401
    finally:
        cursor.close()
        conn.close()


@api_bp.route('/me', methods=['GET'])
@auth_required()
def api_me():
    """Retorna dados do usuário atualmente autenticado."""
    email = session.get('usuario_email')
    tipo = session.get('usuario_tipo')

    try:
        verify_jwt_in_request(optional=True)
        claims = get_jwt()
        if claims:
            email = claims.get('email', email)
            tipo = claims.get('tipo', tipo)
    except Exception:
        pass

    return jsonify({'email': email, 'tipo': tipo}), 200


# --- DASHBOARD & ESTATÍSTICAS ---

@api_bp.route('/dashboard', methods=['GET'])
@auth_required()
def api_dashboard():
    """Retorna indicadores do almoxarifado em tempo real."""
    conn = db_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        # Total de itens cadastrados
        cursor.execute("SELECT COUNT(*) AS total_itens FROM itens")
        total_itens = cursor.fetchone()['total_itens'] or 0

        # Total de itens com estoque baixo (alerta crítico)
        cursor.execute("SELECT COUNT(*) AS itens_alerta FROM itens WHERE quantidade <= estoque_min")
        itens_alerta = cursor.fetchone()['itens_alerta'] or 0

        # Valor financeiro total estimado em estoque
        cursor.execute("SELECT SUM(preco * quantidade) AS valor_total FROM itens")
        res_valor = cursor.fetchone()
        valor_total = float(res_valor['valor_total'] or 0.0)

        # Total de movimentações registradas
        cursor.execute("SELECT COUNT(*) AS total_movimentacoes FROM historico")
        total_movimentacoes = cursor.fetchone()['total_movimentacoes'] or 0

        # Últimas 5 movimentações
        cursor.execute("""
            SELECT h.id, h.id_item, i.nome AS item_nome, h.tipo, h.quantidade, h.pessoa, h.destino,
                   DATE_FORMAT(h.data, '%d/%m/%Y %H:%i') AS data_formatada
            FROM historico h
            LEFT JOIN itens i ON h.id_item = i.id
            ORDER BY h.data DESC
            LIMIT 5
        """)
        ultimas_mov = cursor.fetchall()

        return jsonify({
            'total_itens': total_itens,
            'itens_alerta': itens_alerta,
            'valor_total_estoque': valor_total,
            'total_movimentacoes': total_movimentacoes,
            'ultimas_movimentacoes': ultimas_mov
        }), 200
    finally:
        cursor.close()
        conn.close()


# --- ITENS E ESTOQUE ---

@api_bp.route('/itens', methods=['GET'])
@auth_required()
def api_listar_itens():
    """
    Lista todos os itens com suporte a filtros:
    ?busca=chave -> busca por nome, categoria ou descricao
    ?categoria=Mecânica -> filtra por categoria
    ?alerta=true -> apenas itens com quantidade <= estoque_min
    """
    busca = request.args.get('busca', '').strip()
    categoria = request.args.get('categoria', '').strip()
    alerta = request.args.get('alerta', '').lower() in ['true', '1']

    conn = db_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM itens WHERE 1=1"
        parametros = []

        if busca:
            query += " AND (nome LIKE %s OR categoria LIKE %s OR descricao LIKE %s)"
            termo = f"%{busca}%"
            parametros.extend([termo, termo, termo])

        if categoria:
            query += " AND categoria = %s"
            parametros.append(categoria)

        if alerta:
            query += " AND quantidade <= estoque_min"

        query += " ORDER BY nome ASC"

        cursor.execute(query, tuple(parametros))
        itens = cursor.fetchall()

        for item in itens:
            item['preco'] = float(item['preco'])
            item['estoque_baixo'] = item['quantidade'] <= item['estoque_min']

        return jsonify({'itens': itens, 'total': len(itens)}), 200
    finally:
        cursor.close()
        conn.close()


@api_bp.route('/item/<int:id_item>', methods=['GET'])
@auth_required()
def api_buscar_item(id_item):
    """Busca detalhes de um item específico e seu histórico de movimentações."""
    conn = db_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM itens WHERE id = %s", (id_item,))
        item = cursor.fetchone()

        if not item:
            return jsonify({'erro': 'Item não encontrado'}), 404

        item['preco'] = float(item['preco'])
        item['estoque_baixo'] = item['quantidade'] <= item['estoque_min']

        # Busca histórico do item
        cursor.execute("""
            SELECT id, tipo, quantidade, pessoa, destino, 
                   DATE_FORMAT(data, '%d/%m/%Y %H:%i') as data 
            FROM historico 
            WHERE id_item = %s 
            ORDER BY data DESC
        """, (id_item,))
        historico = cursor.fetchall()

        return jsonify({
            'item': item,
            'nome': item['nome'],
            'quantidade': item['quantidade'],
            'estoque_min': item['estoque_min'],
            'categoria': item['categoria'],
            'preco': item['preco'],
            'imagem': item['imagem'],
            'descricao': item['descricao'],
            'historico': historico
        }), 200
    finally:
        cursor.close()
        conn.close()

<<<<<<< HEAD
=======
# --- MOVIMENTAÇÃO ---

@api_bp.route('/movimentar', methods=['POST'])
@jwt_required()
def api_movimentar_item():
    dados = request.get_json() or {}
    id_item = dados.get('id') or dados.get('itemId')
    quantidade_nova = dados.get('quantidade') or dados.get('novaQuantidade')
    pessoa = dados.get('pessoa')
    destino = dados.get('destino')
    tipo = dados.get('tipo')
>>>>>>> 449e082883ed487d46ad571dab8210613b1942f2

@api_bp.route('/itens', methods=['POST'])
@auth_required(admin_only=True)
def api_cadastrar_item():
    """Cadastra uma nova ferramenta no almoxarifado (Admin)."""
    dados = request.get_json(silent=True) or {}
    nome = (dados.get('nome') or '').strip()
    preco = dados.get('preco')
    quantidade = dados.get('quantidade')
    estoque_min = dados.get('estoque_min') or dados.get('quantidade_min')
    categoria = (dados.get('categoria') or 'Geral').strip()
    descricao = (dados.get('descricao') or '').strip()
    imagem = (dados.get('imagem') or '').strip()

    if not nome or preco is None or quantidade is None or estoque_min is None:
        return jsonify({'erro': 'Nome, preço, quantidade e estoque mínimo são obrigatórios.'}), 400

    try:
<<<<<<< HEAD
        preco = float(str(preco).replace(',', '.'))
        quantidade = int(quantidade)
        estoque_min = int(estoque_min)
    except ValueError:
        return jsonify({'erro': 'Preço e quantidades devem ser valores numéricos válidos.'}), 400

    conn = db_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO itens (nome, preco, quantidade, estoque_min, categoria, descricao, imagem)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (nome, preco, quantidade, estoque_min, categoria, descricao, imagem))
        conn.commit()
        novo_id = cursor.lastrowid
        return jsonify({'sucesso': True, 'mensagem': 'Item cadastrado com sucesso!', 'id': novo_id}), 201
=======
        cursor.execute("UPDATE itens SET quantidade = %s WHERE id = %s", (quantidade_nova, id_item))
        cursor.execute("INSERT INTO historico (id_item, tipo, pessoa, destino, data) VALUES (%s, %s, %s, %s, NOW())", (id_item, tipo, pessoa, destino))
        conexao.commit()
        return jsonify({'sucesso': True}), 200
    except Exception as e:
        conexao.rollback()
        return jsonify({'sucesso': False, 'erro': str(e)}), 500
    finally:
        cursor.close()
        conexao.close()

# --- REGISTRO DE ITENS ---

@api_bp.route('/itens', methods=['POST'])
@jwt_required()
def api_adicionar_item():
    dados = request.get_json() or {}
    nome = dados.get('nome')
    quantidade = dados.get('quantidade')
    estoque_min = dados.get('estoqueMin')
    preco = dados.get('preco')
    categoria = dados.get('categoria')
    descricao = dados.get('descricao')
    imagem = dados.get('imagem')

    conexao = db_conexao()
    cursor = conexao.cursor()

    try:
        cursor.execute("INSERT INTO itens (nome, preco, quantidade, estoque_min, categoria, descricao, imagem) VALUES (%s, %s, %s, %s, %s, %s, %s)", (nome, quantidade, estoque_min, preco, descricao, categoria, imagem))
        conexao.commit()
        return jsonify({'sucesso': True}), 200
>>>>>>> 449e082883ed487d46ad571dab8210613b1942f2
    except Exception as e:
        conn.rollback()
        return jsonify({'erro': f'Erro ao salvar item: {str(e)}'}), 500
    finally:
        cursor.close()
        conn.close()


@api_bp.route('/itens/<int:id_item>', methods=['PUT'])
@auth_required(admin_only=True)
def api_atualizar_item(id_item):
    """Atualiza dados cadastrais de um item (Admin)."""
    dados = request.get_json(silent=True) or {}
    nome = (dados.get('nome') or '').strip()
    preco = dados.get('preco')
    quantidade = dados.get('quantidade')
    estoque_min = dados.get('estoque_min')
    categoria = (dados.get('categoria') or 'Geral').strip()
    descricao = (dados.get('descricao') or '').strip()
    imagem = (dados.get('imagem') or '').strip()

    if not nome:
        return jsonify({'erro': 'Nome é obrigatório.'}), 400

    conn = db_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE itens 
            SET nome=%s, preco=%s, quantidade=%s, estoque_min=%s, categoria=%s, descricao=%s, imagem=%s
            WHERE id=%s
        """, (nome, float(preco), int(quantidade), int(estoque_min), categoria, descricao, imagem, id_item))
        conn.commit()
        return jsonify({'sucesso': True, 'mensagem': 'Item atualizado com sucesso!'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'erro': f'Erro ao atualizar item: {str(e)}'}), 500
    finally:
        cursor.close()
        conn.close()


@api_bp.route('/itens/<int:id_item>', methods=['DELETE'])
@auth_required(admin_only=True)
def api_deletar_item(id_item):
    """Remove um item do almoxarifado (Admin)."""
    conn = db_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM itens WHERE id = %s", (id_item,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'erro': 'Item não encontrado'}), 404
        return jsonify({'sucesso': True, 'mensagem': 'Item excluído com sucesso!'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'erro': f'Erro ao excluir item: {str(e)}'}), 500
    finally:
        cursor.close()
        conn.close()


@api_bp.route('/movimentar', methods=['POST'])
@auth_required()
def api_movimentar_item():
    """
    Movimentação segura de estoque com suporte atômico e validação:
    Suporta:
    1) Delta com quantidade movimentada: {'id': 1, 'tipo': 'Saída', 'quantidade_movimentada': 2, 'pessoa': '...', 'destino': '...'}
    2) Quantidade final direta: {'id': 1, 'tipo': 'Saída', 'quantidade': 10, 'pessoa': '...', 'destino': '...'}
    """
    dados = request.get_json(silent=True) or {}
    id_item = dados.get('id') or dados.get('itemId')
    tipo = (dados.get('tipo') or 'Entrada').strip().capitalize()
    pessoa = (dados.get('pessoa') or '').strip()
    destino = (dados.get('destino') or '').strip()

    if not id_item or not pessoa or not destino:
        return jsonify({'sucesso': False, 'erro': 'Preencha todos os campos obrigatórios (item, pessoa e destino).'}), 400

    conn = db_conexao()
    cursor = conn.cursor(dictionary=True)

    try:
        # Busca o item atual com bloqueio para consistência
        cursor.execute("SELECT id, nome, quantidade, estoque_min FROM itens WHERE id = %s", (id_item,))
        item = cursor.fetchone()

        if not item:
            return jsonify({'sucesso': False, 'erro': 'Item não encontrado no sistema.'}), 404

        qtd_atual = int(item['quantidade'])
        estoque_min = int(item['estoque_min'])

        # Determina a quantidade movimentada e a nova quantidade
        if 'quantidade_movimentada' in dados:
            qtd_mov = int(dados.get('quantidade_movimentada') or 0)
            if qtd_mov <= 0:
                return jsonify({'sucesso': False, 'erro': 'A quantidade a movimentar deve ser maior que zero.'}), 400

            if tipo == 'Saída':
                if qtd_atual < qtd_mov:
                    return jsonify({
                        'sucesso': False, 
                        'erro': f"Estoque insuficiente! Disponível: {qtd_atual}, solicitado: {qtd_mov}."
                    }), 400
                qtd_final = qtd_atual - qtd_mov
            else:
                qtd_final = qtd_atual + qtd_mov
        elif 'quantidade' in dados or 'novaQuantidade' in dados:
            qtd_final = int(dados.get('quantidade') or dados.get('novaQuantidade') or 0)
            qtd_mov = abs(qtd_final - qtd_atual)
            if qtd_mov == 0:
                qtd_mov = 1
        else:
            return jsonify({'sucesso': False, 'erro': 'Informe a quantidade a movimentar.'}), 400

        if qtd_final < 0:
            return jsonify({'sucesso': False, 'erro': 'A quantidade em estoque não pode ser negativa.'}), 400

        # Atualiza a quantidade do item
        cursor.execute("UPDATE itens SET quantidade = %s WHERE id = %s", (qtd_final, id_item))

        # Registra no histórico com a quantidade movimentada
        cursor.execute("""
            INSERT INTO historico (id_item, tipo, quantidade, pessoa, destino, data) 
            VALUES (%s, %s, %s, %s, %s, NOW())
        """, (id_item, tipo, qtd_mov, pessoa, destino))

        conn.commit()

        alerta_baixo_estoque = qtd_final <= estoque_min

        return jsonify({
            'sucesso': True,
            'mensagem': f"Movimentação de {tipo.lower()} registrada com sucesso!",
            'nova_quantidade': qtd_final,
            'quantidade_movimentada': qtd_mov,
            'alerta_baixo_estoque': alerta_baixo_estoque
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'sucesso': False, 'erro': f'Erro ao processar movimentação: {str(e)}'}), 500
    finally:
        cursor.close()
        conn.close()


@api_bp.route('/categorias', methods=['GET'])
@auth_required()
def api_categorias():
    """Retorna lista de categorias distintas existentes no catálogo."""
    conn = db_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT DISTINCT categoria FROM itens WHERE categoria IS NOT NULL AND categoria != '' ORDER BY categoria ASC")
        categorias = [row[0] for row in cursor.fetchall()]
        return jsonify({'categorias': categorias}), 200
    finally:
        cursor.close()
        conn.close()


@api_bp.route('/historico', methods=['GET'])
@auth_required()
def api_historico_geral():
    """Retorna o histórico geral das últimas movimentações com informações do item."""
    conn = db_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT h.id, h.id_item, i.nome AS item_nome, i.categoria, h.tipo, h.quantidade, 
                   h.pessoa, h.destino, DATE_FORMAT(h.data, '%d/%m/%Y %H:%i') AS data_formatada
            FROM historico h
            LEFT JOIN itens i ON h.id_item = i.id
            ORDER BY h.data DESC
            LIMIT 50
        """)
        registros = cursor.fetchall()
        return jsonify({'historico': registros, 'total': len(registros)}), 200
    finally:
        cursor.close()
        conn.close()


# --- GERENCIAMENTO DE USUÁRIOS ---

@api_bp.route('/usuarios', methods=['GET'])
@auth_required(admin_only=True)
def api_listar_usuarios():
    """Lista usuários cadastrados (Admin)."""
    conn = db_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, email, tipo, DATE_FORMAT(data_criacao, '%d/%m/%Y %H:%i') as data_criacao FROM usuarios ORDER BY email ASC")
        usuarios = cursor.fetchall()
        return jsonify({'usuarios': usuarios}), 200
    except Exception:
        # Caso a coluna data_criacao ainda não exista
        cursor.execute("SELECT email, tipo FROM usuarios ORDER BY email ASC")
        usuarios = cursor.fetchall()
        return jsonify({'usuarios': usuarios}), 200
    finally:
        cursor.close()
        conn.close()


@api_bp.route('/usuarios', methods=['POST'])
@auth_required(admin_only=True)
def api_cadastrar_usuario():
    """Cadastra um novo usuário no sistema (Admin)."""
    dados = request.get_json(silent=True) or {}
    email = (dados.get('email') or '').strip().lower()
    senha = (dados.get('senha') or '').strip()
    tipo = (dados.get('tipo') or dados.get('posto') or 'comum').strip().lower()

    if not email or not senha:
        return jsonify({'erro': 'E-mail e senha são obrigatórios.'}), 400

    if tipo not in ['admin', 'comum']:
        tipo = 'comum'

    senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
    conn = db_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO usuarios (email, senha, tipo) VALUES (%s, %s, %s)', (email, senha_hash, tipo))
        conn.commit()
        return jsonify({'sucesso': True, 'mensagem': 'Usuário cadastrado com sucesso!'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'erro': 'E-mail já cadastrado ou erro ao salvar usuário.'}), 400
    finally:
        cursor.close()
        conn.close()


@api_bp.route('/usuarios/<path:email>', methods=['DELETE'])
@auth_required(admin_only=True)
def api_deletar_usuario(email):
    """Remove um usuário do sistema (Admin). Não permite excluir a si mesmo."""
    email = email.strip().lower()
    usuario_atual = session.get('usuario_email')
    try:
        claims = get_jwt()
        if claims:
            usuario_atual = claims.get('email', usuario_atual)
    except Exception:
        pass

    if usuario_atual and usuario_atual.lower() == email:
        return jsonify({'erro': 'Você não pode excluir sua própria conta enquanto estiver logado.'}), 400

    conn = db_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM usuarios WHERE email = %s", (email,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'erro': 'Usuário não encontrado.'}), 404
        return jsonify({'sucesso': True, 'mensagem': 'Usuário removido com sucesso!'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'erro': f'Erro ao excluir usuário: {str(e)}'}), 500
    finally:
        cursor.close()
        conn.close()