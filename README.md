# App didática para consumir a API Datajud (CNJ)

Este projeto foi criado para ser **simples e prático**, com foco em aprendizado.

## O que você vai construir

Uma aplicação web com duas partes:

1. **Front-end** (HTML/CSS/JS): formulário para escrever a consulta.
2. **Back-end** (Node.js puro): rota que recebe a consulta e chama a API Datajud.

> A chave da API fica no servidor (mais seguro), não no navegador.

---

## Passo a passo

### 1) Instalar dependências

```bash
npm install
```

### 2) Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Abra `.env` e preencha:

- `DATAJUD_BASE_URL` → URL base oficial da API.
- `DATAJUD_API_KEY` → sua chave da API.
- `DATAJUD_AUTH_HEADER` → normalmente `Authorization`.

### 3) Rodar o projeto

```bash
npm start
```

Abra no navegador:

- `http://localhost:3000`

### 4) Fazer a primeira consulta

Na tela:

- Informe o índice/tribunal (ex.: `api_publica_tjsp`).
- Ajuste o JSON da query (já vem um exemplo pronto).
- Clique em **Consultar**.

A resposta da API aparecerá no bloco “Resposta”.

---

## Como o fluxo funciona (didático)

1. Você envia o formulário no navegador (`public/app.js`).
2. O front chama `POST /api/datajud/search` no servidor.
3. O servidor (`server.js`) monta a URL:
   - `DATAJUD_BASE_URL` + `/{tribunal}/_search`
4. O servidor envia a query para a API Datajud com autenticação.
5. A resposta volta para o front e é exibida formatada.

---

## Estrutura do projeto

```txt
.
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── .env.example
├── package.json
├── README.md
└── server.js
```

---

## Exemplo de query

```json
{
  "size": 3,
  "query": {
    "match_all": {}
  }
}
```

Se quiser, você pode trocar por filtros mais específicos (classe, assunto, órgão julgador, datas etc.), de acordo com os campos disponíveis no índice escolhido.

---

## Observações importantes

- Se a API retornar `401` ou `403`, geralmente é problema de chave/cabeçalho.
- Se retornar `404`, normalmente o índice/tribunal está incorreto.
- Esta app é base didática: você pode evoluir com paginação, filtros prontos e histórico de consultas.
