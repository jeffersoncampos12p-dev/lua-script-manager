# Lua Script Manager

Plataforma web minimalista para gerenciamento, edição e análise de scripts Lua com Monaco Editor integrado.

## 🚀 Características

- **Editor Monaco** - Editor de código profissional com syntax highlighting para Lua
- **Upload de Arquivos** - Faça upload de scripts Lua com drag & drop
- **Integração GitHub** - Faça push de scripts diretamente para repositórios GitHub
- **Ofuscação de Código** - Comprima e ofusque seus scripts automaticamente
- **Verificação de Chaves** - Gere e verifique checksums SHA256
- **Análise de Código** - Obtenha métricas sobre complexidade e estrutura
- **Design Minimalista** - Interface limpa com cantos arredondados
- **Modo Escuro/Claro** - Tema adaptável para preferência do usuário
- **Responsivo** - Interface funcionando em desktop e mobile

## 📋 Requisitos

- Node.js 14+
- npm ou yarn

## 🔧 Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/lua-script-manager.git
cd lua-script-manager

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
PORT=3000
GITHUB_TOKEN=seu_token_github
GITHUB_REPO=usuario/repositorio
GITHUB_BRANCH=main
NODE_ENV=development
```

### GitHub Token

1. Acesse [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Crie um novo token com escopo `repo`
3. Copie o token e adicione ao arquivo `.env`

## 🚀 Execução

### Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### Produção

```bash
npm start
```

## 📁 Estrutura do Projeto

```
.
├── public/
│   ├── index.html          # Página principal
│   ├── styles.css          # Estilos minimalistas
│   └── app.js              # Lógica do frontend
├── routes/
│   ├── auth.js             # Autenticação
│   ├── scripts.js          # Gerenciamento de scripts
│   ├── github.js           # Integração GitHub
│   ├── obfuscation.js      # Ofuscação de código
│   └── verification.js     # Verificação de chaves
├── uploads/                # Arquivos enviados (git-ignored)
├── server.js               # Servidor Express
├── package.json
├── .env.example
└── README.md
```

## 🔌 API Endpoints

### Scripts

- `POST /api/scripts/upload` - Upload de arquivo Lua
- `GET /api/scripts/list` - Listar scripts
- `GET /api/scripts/:filename` - Obter conteúdo do script
- `POST /api/scripts/save` - Salvar script

### GitHub

- `POST /api/github/push` - Fazer push para GitHub
- `GET /api/github/repo` - Informações do repositório

### Ofuscação

- `POST /api/obfuscation/obfuscate` - Ofuscar código
- `POST /api/obfuscation/analyze` - Analisar código

### Verificação

- `POST /api/verification/generate-key` - Gerar chave SHA256
- `POST /api/verification/verify-key` - Verificar chave
- `POST /api/verification/integrity-check` - Verificar integridade

## 🎨 Design

- **Minimalista** - Sem gradientes, design limpo e focado
- **Cantos Arredondados** - Raio padrão de 8px
- **Modo Escuro/Claro** - Sistema de cores adaptável
- **Dados Reais** - Métricas e informações precisas
- **Responsivo** - Funciona em qualquer tamanho de tela

## 🔒 Segurança

- Validação de tokens GitHub
- Filtragem de uploads (apenas .lua)
- Limite de tamanho de arquivo (5MB)
- Checksums SHA256 para integridade
- Path traversal protection

## 📝 Licença

MIT - Veja LICENSE para detalhes

## 👤 Autor

Jefferson Campos - [GitHub](https://github.com/jeffersoncampos12p-dev)
