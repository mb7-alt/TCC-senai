DROP DATABASE IF EXISTS almoxarifado;
CREATE DATABASE almoxarifado;

USE almoxarifado;
CREATE TABLE itens (
id INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(100),
quantidade VARCHAR(3),
categoria VARCHAR(40),
descricao VARCHAR(255),
imagem VARCHAR(500)
);

-- 1. Corrige o tipo da quantidade de texto (VARCHAR) para número (INT)
ALTER TABLE itens MODIFY COLUMN quantidade INT NOT NULL DEFAULT 0;

-- 2. Cria a tabela de histórico
CREATE TABLE IF NOT EXISTS historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    tipo ENUM('entrada', 'saida') NOT NULL,
    pessoa VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE CASCADE
);

SELECT * FROM itens;

INSERT INTO itens (nome, quantidade, categoria, descricao, imagem) VALUES ('Chave de fenda', '12', 'Reparos', 'Apertar e afrouxar parafuso', 'https://palaciodasferramentas.com.br/media/catalog/product/Y/Z/YZYIZKBOGFOLEBSMQEVJ.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=600&width=600&canvas=600:600');
INSERT INTO itens (nome, quantidade, categoria, descricao, imagem) VALUES ('Chave de boca', '33', 'Reparos', 'Girar parafuso', 'https://images.tcdn.com.br/img/img_prod/469103/chave_de_boca_fixa_1_1_8_x_1_1_4_polegada_1001085_1_20160607125649_20160719122959.jpg');
INSERT INTO itens (nome, quantidade, categoria, descricao, imagem) VALUES ('Fita', '48', 'Reparos', 'Reforçar itens e superfícies', 'https://images.cws.digital/produtos/gg/80/39/fita-adesiva-de-polipropileno-transparente-48mm-x-45m-embalagem-com-5-unid-9283980-1677881939551.jpg');
INSERT INTO itens (nome, quantidade, categoria, descricao, imagem) VALUES ('Engasga gato', '90', 'Reparos', 'Prender itens', 'https://http2.mlstatic.com/D_Q_NP_2X_994821-MLA96708828317_102025-T.webp');
INSERT INTO itens (nome, quantidade, categoria, descricao, imagem) VALUES ('Papel', '67', 'Geral', 'Utilitário', 'https://images.tcdn.com.br/img/img_prod/1173379/papel_cartao_ap_40_120_grs_1x50_a4_18170_2_5e035952ca9a7a15cb6df56c8a82803a.jpg');

DROP DATABASE IF EXISTS login;
CREATE DATABASE login;
USE login;

CREATE TABLE usuarios (
email VARCHAR (191) NOT NULL UNIQUE,
senha VARCHAR (255) NOT NULL,
tipo ENUM ('admin', 'comum') NOT NULL DEFAULT 'comum'
)

SELECT * FROM usuarios;

INSERT INTO usuarios (email, senha) VALUES ('ednaldo.admin@gmail.com', 'admin');
INSERT INTO usuarios (email, senha) VALUES ('ednaldo.comum@gmail.com', 'comum');