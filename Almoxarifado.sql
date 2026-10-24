<<<<<<< HEAD
-- ============================================================================
-- BANCO DE DADOS: Almoxarifado SENAI
-- Sistema Integrado de Gestão de Materiais e Ferramentas (Web & Mobile)
-- ============================================================================
=======
SET NAMES utf8mb4;
>>>>>>> 449e082883ed487d46ad571dab8210613b1942f2

DROP DATABASE IF EXISTS almoxarifado;
CREATE DATABASE almoxarifado DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE almoxarifado;

-- ----------------------------------------------------------------------------
-- 1. TABELA DE ITENS (Ferramentas, Equipamentos e Insumos)
-- ----------------------------------------------------------------------------
CREATE TABLE itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
<<<<<<< HEAD
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantidade INT NOT NULL DEFAULT 0,
    estoque_min INT NOT NULL DEFAULT 0,
    categoria VARCHAR(40) NOT NULL DEFAULT 'Geral',
    descricao VARCHAR(255) DEFAULT '',
    imagem VARCHAR(500) DEFAULT '',
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. TABELA DE HISTÓRICO DE MOVIMENTAÇÕES (Entradas e Saídas)
-- ----------------------------------------------------------------------------
CREATE TABLE historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_item INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    pessoa VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    data DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historico_item FOREIGN KEY (id_item) REFERENCES itens(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
=======
    nome VARCHAR(100),
    preco DECIMAL(10,2),
    quantidade INT(3),
    estoque_min INT(3),
    categoria VARCHAR(40),
    descricao VARCHAR(255),
    imagem VARCHAR(500)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO itens (nome, preco, quantidade, estoque_min, categoria, descricao, imagem) VALUES ('Chave de fenda', 8.00, 12, 10, 'Mecânica', 'Apertar e afrouxar parafuso', 'https://palaciodasferramentas.com.br/media/catalog/product/Y/Z/YZYIZKBOGFOLEBSMQEVJ.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=600&width=600&canvas=600:600');
INSERT INTO itens (nome, preco, quantidade, estoque_min, categoria, descricao, imagem) VALUES ('Chave de boca', 10.50, 33, 10, 'Mecânica', 'Girar parafuso', 'https://images.tcdn.com.br/img/img_prod/469103/chave_de_boca_fixa_1_1_8_x_1_1_4_polegada_1001085_1_20160607125649_20160719122959.jpg');
INSERT INTO itens (nome, preco, quantidade, estoque_min, categoria, descricao, imagem) VALUES ('Fita', 5.44, 48, 5, 'Reparos', 'Reforçar itens e superfícies', 'https://images.cws.digital/produtos/gg/80/39/fita-adesiva-de-polipropileno-transparente-48mm-x-45m-embalagem-com-5-unid-9283980-1677881939551.jpg');
INSERT INTO itens (nome, preco, quantidade, estoque_min, categoria, descricao, imagem) VALUES ('Engasga gato', 0.35, 90, 50, 'Reparos', 'Prender itens', 'https://http2.mlstatic.com/D_Q_NP_2X_994821-MLA96708828317_102025-T.webp');
INSERT INTO itens (nome, preco, quantidade, estoque_min, categoria, descricao, imagem) VALUES ('Papel', 10.00, 30, 15, 'Geral', 'Utilitário', 'https://images.tcdn.com.br/img/img_prod/1173379/papel_cartao_ap_40_120_grs_1x50_a4_18170_2_5e035952ca9a7a15cb6df56c8a82803a.jpg');

-- CONTEÚDOS DA PÁGINA DE CONTROLE DE ITENS
CREATE TABLE historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_item INT,
    tipo VARCHAR(50),
    pessoa VARCHAR(255),
    destino VARCHAR(255),
    data DATETIME,
    FOREIGN KEY (id_item) REFERENCES itens(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
>>>>>>> 449e082883ed487d46ad571dab8210613b1942f2

-- ----------------------------------------------------------------------------
-- 3. TABELA DE USUÁRIOS DO SISTEMA
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
<<<<<<< HEAD
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(200) NOT NULL UNIQUE,
    senha VARCHAR(200) NOT NULL,
    tipo ENUM ('admin', 'comum') NOT NULL DEFAULT 'comum',
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- CARGA INICIAL: FERRAMENTAS E MATERIAIS
-- ----------------------------------------------------------------------------
INSERT INTO itens (nome, preco, quantidade, estoque_min, categoria, descricao, imagem) VALUES 
('Chave de Fenda 1/4x6', 8.00, 12, 10, 'Mecânica', 'Apertar e afrouxar parafusos de fenda simples', 'https://palaciodasferramentas.com.br/media/catalog/product/Y/Z/YZYIZKBOGFOLEBSMQEVJ.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=600&width=600&canvas=600:600'),
('Chave de Boca 10x11mm', 10.50, 33, 10, 'Mecânica', 'Girar parafusos e porcas sextavadas', 'https://images.tcdn.com.br/img/img_prod/469103/chave_de_boca_fixa_1_1_8_x_1_1_4_polegada_1001085_1_20160607125649_20160719122959.jpg'),
('Fita Adesiva Transparente', 5.44, 48, 15, 'Reparos', 'Reforçar itens, fechar embalagens e superfícies', 'https://images.cws.digital/produtos/gg/80/39/fita-adesiva-de-polipropileno-transparente-48mm-x-45m-embalagem-com-5-unid-9283980-1677881939551.jpg'),
('Abraçadeira de Nylon (Engasga Gato)', 0.35, 90, 50, 'Reparos', 'Prender e organizar cabos e mangueiras', 'https://http2.mlstatic.com/D_Q_NP_2X_994821-MLA96708828317_102025-T.webp'),
('Resma de Papel Sulfite A4', 28.00, 8, 15, 'Geral', 'Material de escritório para impressão e relatórios', 'https://images.tcdn.com.br/img/img_prod/1173379/papel_cartao_ap_40_120_grs_1x50_a4_18170_2_5e035952ca9a7a15cb6df56c8a82803a.jpg'),
('Multímetro Digital Portátil', 65.00, 6, 8, 'Elétrica', 'Medição de tensão contínua/alternada, corrente e resistência', 'https://images.tcdn.com.br/img/img_prod/469103/multimetro_digital_portatil_md_180l_exbom_1008272_1_20171206103126.jpg'),
('Óculos de Proteção Transparente (EPI)', 7.50, 25, 20, 'Segurança', 'Proteção visual contra impacto de partículas volantes', 'https://images.tcdn.com.br/img/img_prod/469103/oculos_de_seguranca_incolor_ampla_visao_kalipso_1000844_1_20160527144415.jpg');
=======
email VARCHAR (200) NOT NULL UNIQUE,
senha VARCHAR (200) NOT NULL,
tipo ENUM ('admin', 'comum') NOT NULL DEFAULT 'comum'
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
>>>>>>> 449e082883ed487d46ad571dab8210613b1942f2

-- ----------------------------------------------------------------------------
-- CARGA INICIAL: REGISTROS DE HISTÓRICO
-- ----------------------------------------------------------------------------
INSERT INTO historico (id_item, tipo, quantidade, pessoa, destino, data) VALUES
(1, 'Entrada', 12, 'Ednaldo Pereira', 'Estoque Central', NOW() - INTERVAL 5 DAY),
(2, 'Entrada', 35, 'Ednaldo Pereira', 'Estoque Central', NOW() - INTERVAL 5 DAY),
(2, 'Saída', 2, 'Maurício Silva', 'Oficina Mecânica 02', NOW() - INTERVAL 2 DAY),
(5, 'Saída', 7, 'Secretaria SENAI', 'Coordenação Pedagógica', NOW() - INTERVAL 1 DAY);

-- ----------------------------------------------------------------------------
-- CARGA INICIAL: USUÁRIOS PADRÃO (Senha: 123456 via Bcrypt)
-- ednaldo@gmail.com  -> Administrador
-- mauricio@gmail.com -> Operador Comum
-- ----------------------------------------------------------------------------
INSERT INTO usuarios (email, senha, tipo) VALUES 
('ednaldo@gmail.com', '$2a$12$SzNy/xm1UylAEkrJ7NYB5.phFLYgQ8uZfWSYmP2C5L4A1oAUoJZEC', 'admin'),
('mauricio@gmail.com', '$2a$12$zCTDAIf1NqfhS0uB/VZ0UeJAjTRxE2heoQ16WN4U82HKMv27ULtwO', 'comum');
