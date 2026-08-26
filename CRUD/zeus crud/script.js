// ======================================================
// MovieFlix
// Cadastro de Filmes
// ======================================================

// ========================================
// Variáveis globais
// ========================================

let filmes = [];

const formulario = document.getElementById("formFilme");

const campoTitulo = document.getElementById("titulo");
const campoAno = document.getElementById("ano");
const campoGenero = document.getElementById("genero");
const campoNota = document.getElementById("nota");
const campoAssistido = document.getElementById("assistido");

const listaFilmes = document.getElementById("listaFilmes");
const contador = document.getElementById("contador");

// ========================================
// Inicialização
// ========================================

carregarFilmes();

renderizarFilmes();

// ========================================
// Evento do formulário
// ========================================

formulario.addEventListener("submit", cadastrarFilme);

// ========================================
// Cadastro
// ========================================

function cadastrarFilme(evento) {
  evento.preventDefault();

  const filme = {
    id: Date.now(),

    titulo: campoTitulo.value,

    ano: campoAno.value,

    genero: campoGenero.value,

    nota: campoNota.value,

    assistido: campoAssistido.checked,
  };

  filmes.push(filme);

  salvarFilmes();

  renderizarFilmes();

  limparFormulario();
}

// ========================================
// Salvar no LocalStorage
// ========================================

function salvarFilmes() {
  localStorage.setItem("filmes", JSON.stringify(filmes));
}

// ========================================
// Carregar do LocalStorage
// ========================================

function carregarFilmes() {
  const dados = localStorage.getItem("filmes");

  if (dados != null) {
    filmes = JSON.parse(dados);
  }
}

// ========================================
// Renderizar Cards
// ========================================

function renderizarFilmes() {
  listaFilmes.innerHTML = "";

  for (let i = 0; i < filmes.length; i++) {
    const filme = filmes[i];

    const card = document.createElement("div");

    card.classList.add("card");

    card.innerHTML = `

            <h3>${filme.titulo}</h3>

            <p><strong>Ano:</strong> ${filme.ano}</p>

            <p><strong>Gênero:</strong> ${filme.genero}</p>

            <p><strong>Nota:</strong> ⭐ ${filme.nota}</p>

            <p class="assistido">

                ${filme.assistido ? "✔ Assistido" : "❌ Não assistido"}

            </p>

        `;

    listaFilmes.appendChild(card);
  }

  atualizarContador();
}

// ========================================
// Contador
// ========================================

function atualizarContador() {
  contador.textContent = "Total: " + filmes.length;
}

// ========================================
// Limpar formulário
// ========================================

function limparFormulario() {
  formulario.reset();
}