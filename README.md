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

2. Instalar o "node_modules" (consequência de um pequeno imprevisto que nos assombrará até o final):
npm install expo

3. Expor vulnerabilidades (do expo):
npm audit fix 

4. Iniciar o expo go:
npx expo start

5. Usar o QR CODE ou URL no celular para acessar o site

--ATENÇÃO--

Verificar se está na porta correta para uso do site, 3307 ou 3306 (boa sorte, campeão)
