# 🚀 MarketSUP.AI — Deploy Produção (Vercel + Next.js)

## Arquitetura

```
[Navegador] ←HTTPS→ [Vercel (Next.js)] ←HTTP→ [API SG Sistemas]
  Frontend            API Routes (Proxy)        177.73.209.174:8059
```

O proxy resolve CORS e mixed content. Credenciais ficam seguras no servidor.

---

## Estrutura dos Arquivos

```
marketsup-prod/
├── app/
│   ├── layout.js            ← Layout HTML
│   ├── page.js              ← Página principal
│   └── api/
│       ├── auth/route.js    ← POST /api/auth (autenticação JWT)
│       ├── proxy/route.js   ← POST /api/proxy (proxy genérico)
│       └── sync/route.js    ← POST /api/sync (sincronização completa)
├── components/
│   └── Dashboard.jsx        ← Dashboard completo (frontend)
├── lib/
│   ├── api-client.js        ← Cliente API do frontend
│   └── transform.js         ← Transformação de dados SG → Dashboard
├── package.json
├── next.config.js
└── .gitignore
```

---

## Passo a Passo — Deploy na Vercel

### 1. Criar conta no GitHub
- Acesse **github.com** → Sign up

### 2. Criar repositório
- Clique **+** → **New repository**
- Nome: `marketsup-ai`
- Public → **Create repository**

### 3. Subir os arquivos
- Descompacte `marketsup-prod.zip`
- Na página do repositório, clique **"uploading an existing file"**
- Arraste TODOS os arquivos e pastas
- **IMPORTANTE:** Mantenha a estrutura de pastas (`app/`, `lib/`, `components/`)
- Clique **Commit changes**

### 4. Deploy na Vercel
1. Acesse **vercel.com** → Sign up com GitHub
2. Clique **Add New → Project**
3. Selecione `marketsup-ai` → **Import**
4. Framework: **Next.js** (detecta automático)
5. Clique **Deploy**
6. Aguarde 1-2 minutos
7. ✅ URL pronta: `marketsup-ai.vercel.app`

---

## Como Usar

1. Abra sua URL da Vercel
2. Vai aparecer **"API Desconectada"** no topo — clique ou vá em ⚙️ Config
3. Na aba API:
   - **URL Base:** `http://177.73.209.174:8059/integracao/sgsistemas/v1`
   - **Usuário:** seu usuário do SG Sistemas
   - **Senha:** sua senha do SG Sistemas
4. Clique **Conectar**
5. O sistema vai:
   - Chamar `/autorizacao` → gerar token JWT
   - Sincronizar todos os 17 endpoints em paralelo
   - Transformar os dados para o dashboard
6. Vá para **Performance** — dados REAIS!

---

## Endpoints Sincronizados

| Categoria   | Endpoints                                              |
|-------------|-------------------------------------------------------|
| Produtos    | /produtos, /estoque, /precos, /grupos, /subgrupos, /marcas |
| Vendas      | /vendas, /vendas/hoje                                  |
| Compras     | /entradas, /entradas/produtos                          |
| Financeiro  | /contas/receber, /contas/pagar, /despesas              |
| Cadastros   | /fornecedores, /clientes, /usuarios, /condicoespagamento |

---

## Solução de Problemas

**"Falha na autenticação"**
→ Verifique usuário/senha do SG Sistemas
→ Confirme que a API está online: `http://177.73.209.174:8059`

**"Erro de conexão"**
→ A API precisa estar acessível pela internet (não só rede local)
→ Se está atrás de firewall, a porta 8059 precisa estar liberada

**Dados aparecem zerados**
→ Verifique no log de sync quais endpoints retornaram dados
→ A API pode usar nomes de campo diferentes — o transform.js tenta várias variações

**Build failed na Vercel**
→ Certifique-se de que a estrutura de pastas está correta
→ `app/api/auth/route.js` deve existir (não apenas `api/auth/route.js`)
