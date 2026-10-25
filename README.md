
#  Sistema Integrado de Almoxarifado - SENAI Paraná

> **Trabalho de Conclusão de Curso (TCC) - SENAI / Sistema FIEP**
> 
---

##  Sumário
1. [Visão Geral do Projeto](#-visão-geral-do-projeto)
2. [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
3. [Estrutura do Repositório](#-estrutura-do-repositório)
4. [Contas de Acesso Padrão (Demo)](#-contas-de-acesso-padrão-demo)
5. [Pré-requisitos do Sistema](#-pré-requisitos-do-sistema)
6. [Passo a Passo: Como Rodar o Backend & Web Localmente](#-passo-a-passo-como-rodar-o-backend--web-localmente)
7. [Passo a Passo: Como Rodar via Docker Compose](#-passo-a-passo-como-rodar-via-docker-compose)
8. [Passo a Passo: Como Rodar o Aplicativo Mobile (Expo)](#-passo-a-passo-como-rodar-o-aplicativo-mobile-expo)
9. [Funcionalidades e Telas do Sistema](#-funcionalidades-e-telas-do-sistema)
10. [Documentação Completa da API REST](#-documentação-completa-da-api-rest)
11. [Diagnóstico e Solução de Dúvidas Frequentes](#-diagnóstico-e-solução-de-dúvidas-frequentes)

---

##  Visão Geral do Projeto

O **Almoxarifado SENAI** foi projetado para modernizar o controle de entrada, saída, empréstimo e devolução de ferramentas manuais, elétricas, instrumentos de medição e EPIs utilizados em oficinas e salas de aula práticas.

### Destaques das Melhorias Implementadas:
- **Resolução Completa de Conflitos Git:** Código 100% unificado, limpo e validado.
- **Autenticação Híbrida:** Uma única API atende tanto os navegadores web (cookies de sessão seguros) quanto os dispositivos móveis (tokens JWT com expiração configurável).
- **Auto-Inicialização e Migração do Banco:** O sistema detecta e cria automaticamente tabelas e dados iniciais caso o banco esteja vazio.
- **Modal de Edição de Ferramentas:** Administradores podem atualizar preço, estoque, categoria, descrição e foto diretamente na tabela.
- **Filtros em Tempo Real:** Pesquisa instantânea por nome, categoria ou ferramentas com estoque abaixo do mínimo.
- **Cálculo de Saldo em Tempo Real:** Ao movimentar um item, o sistema prevê o saldo final antes de confirmar e bloqueia retiradas caso o saldo seja insuficiente.
- **Configuração Dinâmica de IP no Mobile:** Permite testar o aplicativo no celular via Wi-Fi apontando para qualquer IP da rede local sem alterar linhas de código.

---

##  Arquitetura e Tecnologias

```
+-------------------------------------------------------------+
|                      CLIENTES DO SISTEMA                     |
|                                                             |
|   [ Navegador Web ]                      [ App Mobile ]     |
|   Bootstrap 5.3 + SweetAlert2            React Native + Expo|
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   BACKEND FLASK (Python 3)                   |
|                                                             |
|   * web/routes.py  -> Páginas Jinja2 e Sessão Web           |
|   * api/routes.py  -> Endpoints RESTful (JSON)              |
|   * database.py    -> Conector inteligente com migração     |
|   * Segurança      -> Criptografia Bcrypt + Tokens JWT      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   BANCO DE DADOS (MySQL 8)                   |
|                                                             |
|   Tabelas: itens | historico | usuarios                     |
+-------------------------------------------------------------+
```

| Camada | Tecnologia | Finalidade |
|---|---|---|
| **Backend** | Python 3.10+, Flask, Flask-CORS, Flask-JWT-Extended | API REST e servidor de páginas web |
| **Segurança** | Bcrypt (Blowfish) | Hash irreversível de senhas com salting |
| **Banco de Dados** | MySQL 8.0 / MariaDB | Armazenamento relacional com suporte a UTF-8mb4 |
| **Frontend Web** | Jinja2, HTML5, Bootstrap 5.3, Bootstrap Icons, SweetAlert2 | Interface web interativa e responsiva |
| **Mobile** | React Native, Expo, React Navigation, AsyncStorage | Aplicativo para smartphones Android/iOS |
| **Containerização** | Docker & Docker Compose | Inicialização isolada e automatizada do ambiente |

---

##  Estrutura do Repositório

```text
TCC-senai/
├── Almoxarifado.sql          # Script SQL para criação do banco e dados iniciais
├── Dockerfile                # Configuração de imagem Docker para o backend Python
├── Docker-compose.yml        # Orquestração da API e do banco MySQL com healthcheck
├── README.md                 # Documentação e tutorial do projeto
├── app.py                    # Ponto de entrada da aplicação Flask
├── database.py               # Gerenciamento de conexão MySQL e migrações automáticas
├── requirements.txt          # Dependências Python do projeto
│
├── api/                      # Módulo da API RESTful
│   ├── __init__.py
│   └── routes.py             # Endpoints JSON protegidos via JWT e Sessão
│
├── web/                      # Módulo das Páginas Web (Templates)
│   ├── __init__.py
│   └── routes.py             # Rotas de navegação do navegador
│
├── templates/                # Arquivos HTML Jinja2
│   ├── base.html             # Layout mestre com navbar SENAI e rodapé institucional
│   ├── index.html            # Tela de login com atalhos de demonstração
│   ├── home.html             # Painel do almoxarifado, tabela dinâmica e modal de edição
│   ├── cont.html             # Tela de movimentação de ferramentas e histórico
│   ├── lista.html            # Formulário de cadastro de nova ferramenta
│   ├── lista_sucesso.html    # Confirmação de cadastro de ferramenta
│   ├── users.html            # Gerenciamento de usuários e permissões (Admin)
│   ├── user_sucesso.html     # Confirmação de cadastro de usuário
│   └── login_incorreto.html  # Tela amigável de erro de credenciais
│
├── static/                   # Recursos estáticos
│   ├── styles.css            # Folha de estilos personalizada com paleta SENAI
│   ├── logo.png              # Logotipo SENAI / FIEP
│   ├── almoxarifado.png      # Ícone do sistema
│   └── fundo.jpg             # Imagem de fundo da tela de login
│
└── mobile/                   # Aplicativo Mobile (React Native / Expo)
    ├── App.js                # Raiz do aplicativo e verificação de sessão
    ├── Api.js                # Camada de comunicação com a API REST
    ├── app.json              # Metadados e configurações do Expo
    ├── package.json          # Dependências e scripts do React Native
    └── Telas/                # Telas do aplicativo
        ├── Login.tsx         # Tela de autenticação e ajuste de IP do servidor
        ├── AppTabs.tsx       # Navegação inferior por abas
        ├── Home.tsx          # Catálogo e métricas no celular
        ├── Movimentar.tsx    # Registro de entrada e saída no celular
        └── Usuarios.tsx      # Gerenciamento de contas no celular
```

---

##  Contas de Acesso Padrão (Demo)

O banco já vem pré-configurado com dois perfis para teste imediato:

| E-mail | Senha | Nível | Permissões no Sistema |
|---|---|---|---|
| **`ednaldo@gmail.com`** | `123456` | **Administrador** | Acesso irrestrito: cadastrar ferramentas, editar itens existentes, excluir itens, registrar movimentações e gerenciar usuários. |
| **`mauricio@gmail.com`** | `123456` | **Comum (Operador)** | Acesso operacional: visualização do catálogo, busca/filtros e registro de entradas/saídas de materiais. |

>  **Facilidade na Tela de Login:** Na tela inicial de login, há botões rápidos que preenchem automaticamente o e-mail e a senha do Administrador ou do Operador com apenas um clique!

---

##  Pré-requisitos do Sistema

1. **Python:** Versão 3.10 ou superior ([Download Python](https://www.python.org/downloads/)).
2. **Banco de Dados:** Qualquer uma das opções abaixo:
   - **MySQL Server 8.0+** instalado nativamente; **OU**
   - **WampServer** / **XAMPP**; **OU**
   - **Docker Desktop** ([Download Docker](https://www.docker.com/products/docker-desktop/)).
3. **Node.js & npm (Opcional, apenas para rodar o Mobile):** Versão 18+ ([Download Node.js](https://nodejs.org/)).

---

##  Passo a Passo: Como Rodar o Backend & Web Localmente

### Passo 1: Abrir o Terminal na Pasta do Projeto
```powershell
cd C:\Users\User\Desktop\TCC-senai
```

### Passo 2: Instalar as Dependências do Python
```powershell
pip install -r requirements.txt
```

### Passo 3: Iniciar o Serviço MySQL
- Se você utiliza o **MySQL Server nativo**: verifique se o serviço está em execução.
- Se utiliza o **WampServer** ou **XAMPP**: certifique-se de que o ícone do MySQL esteja verde/ativo.
- Se for a primeira execução e preferir rodar manualmente o script de criação do banco:
  - Abra o **MySQL Workbench** ou **phpMyAdmin**.
  - Abra o arquivo `Almoxarifado.sql` e execute-o.
  - *(Nota: O arquivo `database.py` já possui um sistema automático que cria as tabelas e dados caso o banco esteja vazio).*

### Passo 4: Executar a Aplicação Flask
```powershell
python app.py
```

### Passo 5: Acessar no Navegador
- **Interface Web:** [http://localhost:5000](http://localhost:5000)
- **Documentação / Raiz da API:** [http://localhost:5000/api](http://localhost:5000/api)

---

##  Passo a Passo: Como Rodar via Docker Compose

Se você possui o **Docker Desktop** instalado, pode rodar o banco de dados MySQL e o backend Flask de forma totalmente isolada em apenas um comando:

```bash
# 1. Navegue até a pasta do projeto
cd C:\Users\User\Desktop\TCC-senai

# 2. Suba todos os containers com build automático
docker compose up --build
```

O Docker Compose irá:
1. Baixar a imagem oficial do `mysql:8.0`.
2. Executar o script `Almoxarifado.sql` para carregar as tabelas e dados iniciais.
3. Aguardar o MySQL ficar 100% pronto via *healthcheck*.
4. Construir e iniciar a aplicação Flask na porta `5000`.

Para encerrar os containers:
```bash
docker compose down
```

---

##  Passo a Passo: Como Rodar o Aplicativo Mobile (Expo)

O aplicativo móvel foi desenvolvido em **React Native** com **Expo**, permitindo testar diretamente no seu smartphone Android/iOS ou em emuladores.

### Passo 1: Acessar a pasta mobile e instalar as dependências
```bash
cd mobile
npm install
```

### Passo 2: Iniciar o servidor do Expo
```bash
npx expo start
```

### Passo 3: Abrir no Dispositivo
- **No celular físico:**
  1. Instale o aplicativo **Expo Go** (disponível na Google Play Store ou Apple App Store).
  2. Garanta que o celular e o computador estejam conectados na **mesma rede Wi-Fi**.
  3. Abra o Expo Go e escaneie o **QR Code** exibido no terminal.
- **No emulador Android:** Pressione a tecla `a` no terminal.
- **No navegador (modo web):** Pressione a tecla `w` no terminal.

###  Conectando o Celular ao Computador (Dica de Ouro):
Para que o celular consiga conversar com a API rodando no computador:
1. Abra o Prompt de Comando e digite `ipconfig` para descobrir o IP local da sua máquina (ex: `192.168.1.105`).
2. Abra o app no celular, vá até a tela de login e toque no botão **"⚙️ Configurar IP do Servidor"**.
3. Digite o endereço completo com a porta:  
   `http://192.168.1.105:5000/api`
4. Salve e faça login! O app salvará essa URL no armazenamento interno do celular e se conectará instantaneamente.

---

##  Funcionalidades e Telas do Sistema

### 1. Tela de Login (`/login`)
- Autenticação com credenciais institucionais e senha com criptografia **Bcrypt**.
- Botão "olho" para alternar a visibilidade da senha.
- Chips de acesso rápido para testes demonstrativos (preenchimento em 1 clique).
- Proteção contra acessos não autorizados em rotas privadas.

### 2. Painel de Estoque (`/home`)
- **Cards de Indicadores:** Total de itens cadastrados, ferramentas com alerta crítico de reposição, valor financeiro total estimado do inventário e botões de atalho.
- **Filtro em Tempo Real:** Campo de pesquisa instantâneo que busca por nome, categoria ou descrição sem precisar recarregar a página.
- **Filtro de Alerta:** Botão que destaca apenas os itens que estão com quantidade menor ou igual ao estoque mínimo.
- **Zoom de Imagens:** Clique na foto da ferramenta para abrir a visualização em alta resolução via modal SweetAlert2.
- **Modal de Edição (Admin):** Permite alterar nome, preço, estoque, estoque mínimo, categoria, descrição e URL da foto com prévia em tempo real.
- **Exclusão Segura (Admin):** Confirmação com modal antes de apagar qualquer ferramenta.

### 3. Controle e Movimentação de Materiais (`/controle-de-itens`)
- Busca de ferramenta por **ID numérico** ou por seleção direta na lista suspensa (*dropdown*).
- Exibição de foto, categoria, quantidade disponível e alerta de status.
- Escolha entre **Entrada** (adicionar novos itens ao almoxarifado) e **Saída** (retirada para aula, manutenção ou empréstimo).
- Botões de incremento rápido (`+1`, `+5`, `+10`).
- **Previsão de Saldo Dinâmica:** O sistema calcula na hora como o estoque ficará antes do envio. Se uma saída for maior do que o estoque existente, o envio é impedido.
- **Histórico Completo:** Tabela com todos os registros de quem pegou o item, quantidade, setor de destino e data/hora.

### 4. Cadastro de Novas Ferramentas (`/lista`)
- Formulário intuitivo para adição de novas ferramentas.
- Sugestão inteligente de categorias já existentes via `<datalist>`.
- Campo de URL de imagem com painel de **pré-visualização instantânea**.
- Confirmação de gravação imediata no catálogo.

### 5. Gestão de Usuários (`/cadastro-de-usuarios` - Restrito a Administradores)
- Lista de todas as contas ativas no almoxarifado.
- Criação de novos usuários definindo nível de acesso (`Administrador` ou `Comum`).
- Criptografia com salt de 12 rounds no armazenamento de senhas.
- Exclusão de contas com proteção contra auto-exclusão acidental.

---

##  Documentação Completa da API REST

A API do Almoxarifado opera sob o prefixo `/api` e retorna respostas em formato **JSON**.

### Formato dos Headers:
- Para requisições do App Mobile autenticadas:  
  `Authorization: Bearer <seu_token_jwt>`
- Para requisições do Navegador Web:  
  A autenticação ocorre automaticamente via cookies de sessão Flask.

---

###  Autenticação

#### 1. Fazer Login
- **Rota:** `POST /api/login`
- **Corpo da Requisição (JSON):**
  ```json
  {
    "email": "ednaldo@gmail.com",
    "senha": "123456"
  }
  ```
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "sucesso": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "email": "ednaldo@gmail.com",
      "tipo": "admin"
    }
  }
  ```

#### 2. Consultar Usuário Atual
- **Rota:** `GET /api/me`
- **Autenticação:** Obrigatória

---

###  Painel e Métricas

#### 3. Obter Indicadores Gerais
- **Rota:** `GET /api/dashboard`
- **Resposta:**
  ```json
  {
    "total_itens": 7,
    "itens_alerta": 3,
    "valor_total_estoque": 2854.42,
    "total_movimentacoes": 4,
    "ultimas_movimentacoes": [...]
  }
  ```

---

###  Gerenciamento de Ferramentas e Estoque

#### 4. Listar Ferramentas
- **Rota:** `GET /api/itens`
- **Parâmetros de Consulta Opcionais:**
  - `?busca=chave`: Busca ferramentas cujo nome, categoria ou descrição contenha a palavra.
  - `?categoria=Mecânica`: Filtra pela categoria especificada.
  - `?alerta=true`: Retorna apenas ferramentas com estoque baixo.

#### 5. Consultar Detalhes e Histórico de um Item
- **Rota:** `GET /api/item/<id>`

#### 6. Cadastrar Nova Ferramenta *(Admin)*
- **Rota:** `POST /api/itens`
- **Corpo (JSON):**
  ```json
  {
    "nome": "Furadeira de Bancada 1/2 HP",
    "preco": 850.00,
    "quantidade": 4,
    "estoque_min": 2,
    "categoria": "Usinagem",
    "descricao": "Furadeira industrial de coluna",
    "imagem": "https://exemplo.com/furadeira.jpg"
  }
  ```

#### 7. Atualizar Dados de uma Ferramenta *(Admin)*
- **Rota:** `PUT /api/itens/<id>`
- **Corpo (JSON):** Campos que deseja atualizar.

#### 8. Excluir Ferramenta *(Admin)*
- **Rota:** `DELETE /api/itens/<id>`

---

###  Movimentações de Estoque

#### 9. Registrar Entrada ou Saída de Material
- **Rota:** `POST /api/movimentar`
- **Corpo (JSON):**
  ```json
  {
    "id": 1,
    "tipo": "Saída",
    "quantidade_movimentada": 2,
    "pessoa": "Carlos Eduardo (Turma Eletrotécnica 2026)",
    "destino": "Bancada de Ensaios 03"
  }
  ```
- **Resposta:**
  ```json
  {
    "sucesso": true,
    "mensagem": "Movimentação de saída registrada com sucesso!",
    "nova_quantidade": 10,
    "quantidade_movimentada": 2,
    "alerta_baixo_estoque": true
  }
  ```

#### 10. Listar Histórico Global
- **Rota:** `GET /api/historico`

#### 11. Listar Categorias Únicas
- **Rota:** `GET /api/categorias`

---

###  Gerenciamento de Usuários

#### 12. Listar Usuários *(Admin)*
- **Rota:** `GET /api/usuarios`

#### 13. Cadastrar Usuário *(Admin)*
- **Rota:** `POST /api/usuarios`
- **Corpo (JSON):**
  ```json
  {
    "email": "professor@senai.br",
    "senha": "senhaSegura123",
    "tipo": "comum"
  }
  ```

#### 14. Remover Usuário *(Admin)*
- **Rota:** `DELETE /api/usuarios/<email>`

---

##  Diagnóstico e Solução de Dúvidas Frequentes

### 1. Erro `ModuleNotFoundError` ao rodar `python app.py`
Execute o comando de instalação para garantir que todas as bibliotecas necessárias estejam no seu ambiente:
```powershell
pip install -r requirements.txt
```

### 2. Erro de Conexão com o Banco de Dados MySQL
- Certifique-se de que o seu servidor MySQL está rodando na porta **3306** ou **3307**.
- Caso utilize uma senha diferente de vazio ou de `mysql_root`, defina a variável de ambiente no seu terminal:
  ```powershell
  $env:DB_PASSWORD="sua_senha_aqui"
  python app.py
  ```

### 3. O aplicativo no celular não encontra o servidor (`Network request failed`)
- Celular e computador **devem estar no mesmo Wi-Fi**.
- No Windows Defender / Firewall, verifique se a porta `5000` está liberada para conexões de rede privada.
- Na tela de login do app, use o botão de configuração para digitar o IP do computador na rede local (ex: `http://192.168.0.10:5000/api`).

---
=======
--USO NORMAL DO SITE NA WEB--

1. Instalação das bibliotecas necessárias no vscode:
pip install -r requirements.txt

2. Iniciar o serviço "wampmysqld64" do Windows
3. Abrir o "mysql workbench" e colar os códigos do arquivo "Almoxarifado.sql"
4. Iniciar o "app.py"
5. Pegar o link e colar no navegador

--USO DO ALMOXARIFADO NO CELULAR--

1. Entrar na pasta "mobile":
cd mobile

2. Instalar o "node_modules" (github n tanka o node modules aparentemente):
npm install expo

3. Expor vulnerabilidades (do expo):
npm audit fix 

4. Iniciar o expo go:
npx expo start

5. Usar o QR CODE ou URL no celular para acessar o site

--USO DO CONTAINER DOCKER (FAÇA ISSO TODO DIA, RODE ESSES COMANDOS TODO SANTO DIA)--

1. Abra o docker desktop
2. Criação da imagem docker:
docker build -t flask-almox:1.0 .

3. Upload da imagem:
docker compose up

--ATENÇÃO--

##Verificar se está na porta correta para uso do site, 3307 ou 3306 (boa sorte, campeão)##
Com o docker, a gente meio que inutilizou o uso do mysql workbench, fazer oq né
>>>>>>> 449e082883ed487d46ad571dab8210613b1942f2
