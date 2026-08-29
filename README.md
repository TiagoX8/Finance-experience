# Finance SaaS — Frontend

React + Vite. Consome a API do [`finance-backend`](https://github.com/TiagoX8/finance-backend) e a lib de autenticação [`auth-lite-react`](https://www.npmjs.com/package/auth-lite-react).

## Como rodar

```bash
npm install
cp .env.example .env   # opcional em dev
npm run dev
```

App: http://localhost:5173

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `VITE_API_URL` | não | `http://127.0.0.1:8000` | Base URL da API do backend. |

Variáveis `VITE_*` são embutidas no bundle em tempo de build — mudar a URL da API exige um novo build/deploy, e nenhum segredo deve ser colocado aqui.

## Deploy

```bash
npm run build     # gera dist/
npm run preview   # serve o build localmente
```

O app é uma SPA: o servidor precisa devolver `index.html` para qualquer rota, senão um refresh em `/transactions` retorna 404. `vercel.json` e `netlify.toml` já fazem isso.

Checklist do provedor:

1. Build command `npm run build`, output `dist`.
2. Definir `VITE_API_URL` com a URL pública do backend (sem barra final) antes do build.
3. No backend, incluir o domínio do frontend em `ALLOWED_ORIGINS`.
