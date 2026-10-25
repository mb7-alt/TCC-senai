import os
import mysql.connector
from mysql.connector import Error

# Permite configurar via variáveis de ambiente, com fallbacks para Docker e Local (WAMP/XAMPP/MySQL)
DB_NAME = os.environ.get('DB_NAME', 'almoxarifado')
DB_PORT = int(os.environ.get('DB_PORT', 3306))
DB_USER = os.environ.get('DB_USER', 'root')

def db_conexao():
    """
    Estabelece conexão com o MySQL com suporte híbrido:
    Funciona no Docker (host 'db'), no WAMP/XAMPP/MySQL Local ('localhost' ou '127.0.0.1'),
    e com portas 3306 / 3307 e senhas comuns.
    """
    hosts_para_tentar = [
        os.environ.get('DB_HOST'),
        'localhost',
        '127.0.0.1',
        'db'
    ]
    hosts_para_tentar = [h for h in dict.fromkeys(hosts_para_tentar) if h]

    portas_para_tentar = [
        DB_PORT,
        3306,
        3307
    ]
    portas_para_tentar = list(dict.fromkeys(portas_para_tentar))

    senhas_para_tentar = [
        os.environ.get('DB_PASSWORD'),
        '',            # WAMP / XAMPP padrão geralmente não tem senha
        'root',
        'mysql_root'
    ]
    senhas_para_tentar = [s for s in dict.fromkeys(senhas_para_tentar) if s is not None]

    ultimo_erro = None

    for host in hosts_para_tentar:
        for port in portas_para_tentar:
            for password in senhas_para_tentar:
                try:
                    conn = mysql.connector.connect(
                        host=host,
                        database=DB_NAME,
                        user=DB_USER,
                        password=password,
                        port=port,
                        charset='utf8mb4',
                        autocommit=False
                    )
                    if conn.is_connected():
                        return conn
                except Error as e:
                    ultimo_erro = e
                    continue

    raise Exception(
        f"Falha ao conectar ao banco de dados MySQL '{DB_NAME}'. "
        f"Verifique se o serviço MySQL está ativo (Portas 3306/3307). Último erro: {ultimo_erro}"
    )


def verificar_migracoes():
    """
    Verifica e inicializa automaticamente as tabelas e dados essenciais caso ainda não existam.
    Garante que o sistema rode sem erros em qualquer ambiente.
    """
    try:
        conn = db_conexao()
        cursor = conn.cursor()

        # 1. Garante que a tabela 'itens' existe
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS itens (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nome VARCHAR(100) NOT NULL,
                preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                quantidade INT NOT NULL DEFAULT 0,
                estoque_min INT NOT NULL DEFAULT 0,
                categoria VARCHAR(40) NOT NULL DEFAULT 'Geral',
                descricao VARCHAR(255) DEFAULT '',
                imagem VARCHAR(500) DEFAULT '',
                data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 2. Garante que a tabela 'historico' existe
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS historico (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_item INT NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                quantidade INT NOT NULL DEFAULT 1,
                pessoa VARCHAR(255) NOT NULL,
                destino VARCHAR(255) NOT NULL,
                data DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_historico_item FOREIGN KEY (id_item) REFERENCES itens(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 3. Garante que a tabela 'usuarios' existe
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(200) NOT NULL UNIQUE,
                senha VARCHAR(200) NOT NULL,
                tipo ENUM ('admin', 'comum') NOT NULL DEFAULT 'comum',
                data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 4. Verifica se a coluna 'quantidade' existe na tabela 'historico'
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'historico' AND COLUMN_NAME = 'quantidade';
        """, (DB_NAME,))
        resultado = cursor.fetchone()
        if resultado and resultado[0] == 0:
            cursor.execute("ALTER TABLE historico ADD COLUMN quantidade INT DEFAULT 1 AFTER tipo;")
            conn.commit()
            print("[INFO] Coluna 'quantidade' adicionada na tabela historico.")

        # 5. Garante que existam usuários padrão para login imediato
        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE email IN ('ednaldo@gmail.com', 'mauricio@gmail.com');")
        qtd_usuarios = cursor.fetchone()[0]
        if qtd_usuarios == 0:
            cursor.execute("""
                INSERT INTO usuarios (email, senha, tipo) VALUES 
                ('ednaldo@gmail.com', '$2a$12$SzNy/xm1UylAEkrJ7NYB5.phFLYgQ8uZfWSYmP2C5L4A1oAUoJZEC', 'admin'),
                ('mauricio@gmail.com', '$2a$12$zCTDAIf1NqfhS0uB/VZ0UeJAjTRxE2heoQ16WN4U82HKMv27ULtwO', 'comum');
            """)
            conn.commit()
            print("[INFO] Usuários padrão inseridos com sucesso.")

        # 6. Se a tabela itens estiver vazia, adiciona os itens iniciais
        cursor.execute("SELECT COUNT(*) FROM itens;")
        qtd_itens = cursor.fetchone()[0]
        if qtd_itens == 0:
            cursor.execute("""
                INSERT INTO itens (nome, preco, quantidade, estoque_min, categoria, descricao, imagem) VALUES 
                ('Chave de Fenda 1/4x6', 8.00, 12, 10, 'Mecânica', 'Apertar e afrouxar parafusos de fenda simples', 'https://palaciodasferramentas.com.br/media/catalog/product/Y/Z/YZYIZKBOGFOLEBSMQEVJ.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=600&width=600&canvas=600:600'),
                ('Chave de Boca 10x11mm', 10.50, 33, 10, 'Mecânica', 'Girar parafusos e porcas sextavadas', 'https://images.tcdn.com.br/img/img_prod/469103/chave_de_boca_fixa_1_1_8_x_1_1_4_polegada_1001085_1_20160607125649_20160719122959.jpg'),
                ('Fita Adesiva Transparente', 5.44, 48, 15, 'Reparos', 'Reforçar itens, fechar embalagens e superfícies', 'https://images.cws.digital/produtos/gg/80/39/fita-adesiva-de-polipropileno-transparente-48mm-x-45m-embalagem-com-5-unid-9283980-1677881939551.jpg'),
                ('Abraçadeira de Nylon (Engasga Gato)', 0.35, 90, 50, 'Reparos', 'Prender e organizar cabos e mangueiras', 'https://http2.mlstatic.com/D_Q_NP_2X_994821-MLA96708828317_102025-T.webp'),
                ('Resma de Papel Sulfite A4', 28.00, 8, 15, 'Geral', 'Material de escritório para impressão e relatórios', 'https://images.tcdn.com.br/img/img_prod/1173379/papel_cartao_ap_40_120_grs_1x50_a4_18170_2_5e035952ca9a7a15cb6df56c8a82803a.jpg'),
                ('Multímetro Digital Portátil', 65.00, 6, 8, 'Elétrica', 'Medição de tensão contínua/alternada, corrente e resistência', 'https://images.tcdn.com.br/img/img_prod/469103/multimetro_digital_portatil_md_180l_exbom_1008272_1_20171206103126.jpg'),
                ('Óculos de Proteção Transparente (EPI)', 7.50, 25, 20, 'Segurança', 'Proteção visual contra impacto de partículas volantes', 'https://images.tcdn.com.br/img/img_prod/469103/oculos_de_seguranca_incolor_ampla_visao_kalipso_1000844_1_20160527144415.jpg');
            """)
            conn.commit()
            print("[INFO] Catálogo inicial de ferramentas populado com sucesso.")

        conn.commit()
        cursor.close()
        conn.close()
        print("[INFO] Migrações e verificação de banco concluídas com sucesso.")
    except Exception as e:
        print(f"[AVISO] Não foi possível verificar migrações do banco (MySQL pode ainda não estar rodando): {e}")
