const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

loadEnvFile();

const port = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'public');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/api/datajud/search') {
    return handleDatajudSearch(req, res);
  }

  if (req.method === 'GET') {
    return serveStaticFile(url.pathname, res);
  }

  sendJson(res, 405, { erro: 'Método não permitido.' });
});

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function handleDatajudSearch(req, res) {
  try {
    const bodyText = await readRequestBody(req);
    const payload = bodyText ? JSON.parse(bodyText) : {};
    const { tribunal, query } = payload;

    if (!tribunal || typeof tribunal !== 'string') {
      return sendJson(res, 400, {
        erro: 'Informe o índice/tribunal da API Datajud (ex.: api_publica_tjsp).'
      });
    }

    const baseUrl = process.env.DATAJUD_BASE_URL;
    if (!baseUrl) {
      return sendJson(res, 500, {
        erro: 'A variável DATAJUD_BASE_URL não está configurada.'
      });
    }

    const apiKey = process.env.DATAJUD_API_KEY;
    if (!apiKey) {
      return sendJson(res, 500, {
        erro: 'A variável DATAJUD_API_KEY não está configurada.'
      });
    }

    const headerName = process.env.DATAJUD_AUTH_HEADER || 'Authorization';
    const authValue =
      headerName.toLowerCase() === 'authorization' ? `ApiKey ${apiKey}` : apiKey;

    const endpoint = `${baseUrl.replace(/\/$/, '')}/${tribunal}/_search`;

    const datajudResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [headerName]: authValue
      },
      body: JSON.stringify(
        query || {
          size: 5,
          query: { match_all: {} }
        }
      )
    });

    const responseBody = await datajudResponse.json();

    if (!datajudResponse.ok) {
      return sendJson(res, datajudResponse.status, {
        erro: 'A API Datajud retornou erro.',
        detalhes: responseBody
      });
    }

    return sendJson(res, 200, responseBody);
  } catch (error) {
    return sendJson(res, 500, {
      erro: 'Falha ao consultar a API Datajud.',
      detalhes: error.message
    });
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function serveStaticFile(pathname, res) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    return sendText(res, 403, 'Acesso negado.');
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return sendText(res, 404, 'Arquivo não encontrado.');
  }

  const extension = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8'
  };

  res.writeHead(200, { 'Content-Type': contentTypes[extension] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}
