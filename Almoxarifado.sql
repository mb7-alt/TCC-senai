DROP DATABASE IF EXISTS almoxarifado;
CREATE DATABASE almoxarifado;

USE almoxarifado;
CREATE TABLE itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100),
    preço DECIMAL(10,2),
    quantidade INT(3),
    estoque_min INT(3),
    categoria VARCHAR(40),
    descricao VARCHAR(255),
    imagem VARCHAR(500)
)

SELECT * FROM itens;

INSERT INTO itens (nome, preço, quantidade, estoque_min, categoria, descricao, imagem) VALUES ('Chave de fenda', 8.00, 12, 10, 'Mecânica', 'Apertar e afrouxar parafuso', 'https://palaciodasferramentas.com.br/media/catalog/product/Y/Z/YZYIZKBOGFOLEBSMQEVJ.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=600&width=600&canvas=600:600');
INSERT INTO itens (nome, preço, quantidade, estoque_min, categoria, descricao, imagem) VALUES ('Chave de boca', 10.50, 33, 10, 'Mecânica', 'Girar parafuso', 'https://images.tcdn.com.br/img/img_prod/469103/chave_de_boca_fixa_1_1_8_x_1_1_4_polegada_1001085_1_20160607125649_20160719122959.jpg');
INSERT INTO itens (nome, preço, quantidade, estoque_min, categoria, descricao, imagem) VALUES ('Fita', 5.44, 48, 5, 'Reparos', 'Reforçar itens e superfícies', 'https://images.cws.digital/produtos/gg/80/39/fita-adesiva-de-polipropileno-transparente-48mm-x-45m-embalagem-com-5-unid-9283980-1677881939551.jpg');
INSERT INTO itens (nome, preço, quantidade, estoque_min, categoria, descricao, imagem) VALUES ('Engasga gato', 0.35, 90, 50, 'Reparos', 'Prender itens', 'https://http2.mlstatic.com/D_Q_NP_2X_994821-MLA96708828317_102025-T.webp');
INSERT INTO itens (nome, preço, quantidade, estoque_min, categoria, descricao, imagem) VALUES ('Papel', 10.00, 67, 150, 'Geral', 'Utilitário', 'https://images.tcdn.com.br/img/img_prod/1173379/papel_cartao_ap_40_120_grs_1x50_a4_18170_2_5e035952ca9a7a15cb6df56c8a82803a.jpg');

CREATE TABLE usuarios (
email VARCHAR (200) NOT NULL UNIQUE,
senha VARCHAR (200) NOT NULL,
tipo ENUM ('admin', 'comum') NOT NULL DEFAULT 'comum'
)

SELECT * FROM usuarios;

INSERT INTO usuarios (email, senha, tipo) VALUES ('ednaldo.admin@gmail.com', '1234', 'admin');
INSERT INTO usuarios (email, senha, tipo) VALUES ('mauricio.comum@gmail.com', 'comum', 'comum');