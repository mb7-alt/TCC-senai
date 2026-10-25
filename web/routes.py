from flask import Blueprint, render_template, redirect, request, session, url_for, flash
import bcrypt
from functools import wraps
from database import db_conexao

web_bp = Blueprint('web', __name__)

# Decorator de proteção de rotas para a WEB
def login_required(tipo_permitido=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'usuario_id' not in session:
                return redirect(url_for('web.login'))
            if tipo_permitido and session.get('usuario_tipo') != tipo_permitido:
                flash('Acesso restrito a administradores.', 'danger')
                return redirect(url_for('web.home'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator


# --- PÁGINAS DE LOGIN E SESSÃO ---

@web_bp.route('/login', methods=['GET', 'POST'])
def login():
    if 'usuario_id' in session:
        return redirect(url_for('web.home'))

    erro = None
    if request.method == 'POST':
        usuario_digitado = request.form.get('username', '').strip().lower()
        senha_digitada = request.form.get('password', '').strip()

        if not usuario_digitado or not senha_digitada:
            erro = "Preencha o e-mail e a senha."
            return render_template('index.html', erro=erro)

        try:
            conn = db_conexao()
            cursor = conn.cursor(dictionary=True)
            try:
                cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario_digitado,))
                usuario_encontrado = cursor.fetchone()

                if usuario_encontrado and bcrypt.checkpw(senha_digitada.encode('utf-8'), usuario_encontrado['senha'].encode('utf-8')):
                    session['usuario_id'] = usuario_encontrado.get('id') or usuario_encontrado['email']
                    session['usuario_email'] = usuario_encontrado['email']
                    session['usuario_tipo'] = usuario_encontrado['tipo']

                    return redirect(url_for('web.home'))
                else:
                    return redirect(url_for('web.incorreto'))
            finally:
                cursor.close()
                conn.close()
        except Exception as e:
            erro = f"Erro de conexão com o banco de dados: {str(e)}"
            return render_template('index.html', erro=erro)

    return render_template('index.html', erro=erro)


@web_bp.route('/logout')
def logout():
    """Encerra a sessão do usuário de forma segura."""
    session.clear()
    return redirect(url_for('web.login'))


@web_bp.route('/incorreto')
def incorreto():
    return render_template('login_incorreto.html')


# --- PÁGINAS PRINCIPAIS ---

@web_bp.route('/home')
@login_required()
def home():
    """Painel do Almoxarifado com tabela dinâmica, filtros e métricas."""
    conexao = db_conexao()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM itens ORDER BY nome ASC")
        itens = cursor.fetchall()

        # Calcula métricas para os cards de resumo
        total_itens = len(itens)
        itens_alerta = sum(1 for i in itens if int(i['quantidade']) <= int(i['estoque_min']))
        valor_total = sum(float(i['preco']) * int(i['quantidade']) for i in itens)

        # Categorias para filtro
        categorias = sorted(list({i['categoria'] for i in itens if i.get('categoria')}))

        return render_template(
            'home.html',
            itens=itens,
            total_itens=total_itens,
            itens_alerta=itens_alerta,
            valor_total=valor_total,
            categorias=categorias,
            usuario_tipo=session.get('usuario_tipo', 'comum'),
            usuario_email=session.get('usuario_email')
        )
    finally:
        cursor.close()
        conexao.close()


@web_bp.route('/home-admin')
@login_required(tipo_permitido='admin')
def admin():
    """Redireciona para o painel unificado com recursos de admin habilitados."""
    return redirect(url_for('web.home'))


# --- CONTROLE E MOVIMENTAÇÃO DE ITENS ---

@web_bp.route('/controle-de-itens')
@login_required()
def controle():
    """Página de controle e histórico de movimentações."""
    conexao = db_conexao()
    cursor = conexao.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, nome, quantidade, estoque_min, categoria, imagem FROM itens ORDER BY nome ASC")
        itens = cursor.fetchall()
        return render_template(
            'cont.html',
            itens=itens,
            usuario_tipo=session.get('usuario_tipo', 'comum'),
            usuario_email=session.get('usuario_email')
        )
    finally:
        cursor.close()
        conexao.close()


# --- CADASTRO DE ITENS ---

@web_bp.route('/lista')
@login_required()
def lista():
    """Página para cadastro de novas ferramentas."""
    conexao = db_conexao()
    cursor = conexao.cursor()
    try:
        cursor.execute("SELECT DISTINCT categoria FROM itens WHERE categoria IS NOT NULL AND categoria != '' ORDER BY categoria ASC")
        categorias = [r[0] for r in cursor.fetchall()]
        return render_template('lista.html', categorias=categorias)
    finally:
        cursor.close()
        conexao.close()


@web_bp.route('/lista-sucesso', methods=['GET', 'POST'])
@login_required()
def listaSucesso():
    if request.method == 'POST':
        nome = request.form.get('nome', '').strip()
        preco = request.form.get('preco', '0').strip().replace(',', '.')
        quantidade = request.form.get('quantidade', '0').strip()
        estoque_min = request.form.get('quantidade_min', '0').strip()
        categoria = request.form.get('categoria', 'Geral').strip()
        descricao = request.form.get('descricao', '').strip()
        imagem = request.form.get('imagem', '').strip()

        if not nome:
            flash('O nome do item é obrigatório.', 'danger')
            return redirect(url_for('web.lista'))

        try:
            preco_val = float(preco)
            qtd_val = int(quantidade)
            min_val = int(estoque_min)
        except ValueError:
            flash('Valores numéricos inválidos para preço ou quantidades.', 'danger')
            return redirect(url_for('web.lista'))

        item = (nome, preco_val, qtd_val, min_val, categoria, descricao, imagem)
        query = 'INSERT INTO itens (nome, preco, quantidade, estoque_min, categoria, descricao, imagem) VALUES (%s, %s, %s, %s, %s, %s, %s);'

        con = db_conexao()
        cursor = con.cursor()
        try:
            cursor.execute(query, item)
            con.commit()
        finally:
            cursor.close()
            con.close()

        return render_template('lista_sucesso.html')

    return redirect(url_for('web.lista'))


# --- CADASTRO E GERENCIAMENTO DE USUÁRIOS ---

@web_bp.route('/cadastro-de-usuarios')
@login_required(tipo_permitido='admin')
def users():
    """Página de gerenciamento de usuários (apenas Administradores)."""
    conn = db_conexao()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, email, tipo FROM usuarios ORDER BY email ASC")
        usuarios = cursor.fetchall()
        return render_template('users.html', usuarios=usuarios)
    finally:
        cursor.close()
        conn.close()


@web_bp.route('/user-sucesso', methods=['GET', 'POST'])
@login_required(tipo_permitido='admin')
def userSucesso():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        senha = request.form.get('senha', '').strip()
        tipo = request.form.get('posto', 'comum').strip().lower()

        if not email or not senha:
            flash("Por favor, preencha todos os campos antes de enviar!", "warning")
            return redirect(url_for('web.users'))

        if tipo not in ['admin', 'comum']:
            tipo = 'comum'

        con_user = db_conexao()
        cursor = con_user.cursor(dictionary=True)
        try:
            # Verifica se já existe um usuário com este e-mail
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
            if cursor.fetchone():
                flash(f"O e-mail '{email}' já está cadastrado no sistema!", "danger")
                return redirect(url_for('web.users'))

            senha_bytes = senha.encode('utf-8')
            salt = bcrypt.gensalt(rounds=12)
            senha_hash_bytes = bcrypt.hashpw(senha_bytes, salt)
            senha_criptografada = senha_hash_bytes.decode('utf-8')
            usuario = (email, senha_criptografada, tipo)

            query = 'INSERT INTO usuarios (email, senha, tipo) VALUES (%s, %s, %s);'
            cursor.execute(query, usuario)
            con_user.commit()
        finally:
            cursor.close()
            con_user.close()

        return render_template('user_sucesso.html')

    return redirect(url_for('web.users'))
