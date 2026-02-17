const form = document.getElementById('form-consulta');
const resultado = document.getElementById('resultado');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const tribunal = document.getElementById('tribunal').value.trim();
  const queryText = document.getElementById('query').value;

  let query;
  try {
    query = JSON.parse(queryText);
  } catch (error) {
    resultado.textContent = `JSON inválido: ${error.message}`;
    return;
  }

  resultado.textContent = 'Consultando...';

  try {
    const response = await fetch('/api/datajud/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tribunal, query })
    });

    const data = await response.json();
    resultado.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    resultado.textContent = `Erro de rede: ${error.message}`;
  }
});
