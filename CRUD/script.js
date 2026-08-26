const addBtn = document.getElementById("pokAddBtn");
const input = document.getElementById("name");
let todosPokemons = [];
const favoritoInput = document.getElementById("favorito");
let pokemonsAdicionados = JSON.parse(localStorage.getItem("pokemons")) || [];
const contador = document.querySelector(".contador p");
const nota = document.getElementById("nota");
let modoEdicao = null
let pokemonEditando = null;
let cardEditando = null


// CONTADOR
function atualizarContador(){

    contador.textContent = `Total: ${pokemonsAdicionados.length}`;

}


// CARREGAR SALVOS
function carregarSalvos(){

    const listaPokemon = document.querySelector(".listaPokemon");

    pokemonsAdicionados.forEach((pokemon)=>{

        const card = criarCard(pokemon);

        listaPokemon.appendChild(card);

        adicionarEventoExcluir(card, pokemon.nome);
        adicionarEventoEditar(card, pokemon);

    });

}


// CARREGAR LISTA DE POKÉMONS PARA FILTRO
async function carregarPokemons(){

    const resposta = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=2000"
    );

    const dados = await resposta.json();

    todosPokemons = dados.results.map(
        pokemon => pokemon.name
    );


    input.addEventListener("input",()=>{

        const pesquisa = input.value.toLowerCase();

        const resultados = todosPokemons.filter(
            pokemon => pokemon.includes(pesquisa)
        );

        console.log(resultados);

    });

}


// CRIAR SUGESTÕES DO INPUT
async function criarSugestoes(){

    const resposta = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1025"
    );

    const dados = await resposta.json();

    const lista = document.getElementById("pokemonList");


    dados.results.forEach(pokemon=>{

        const option = document.createElement("option");

        option.value = pokemon.name;

        lista.appendChild(option);

    });

}


// BUSCAR POKÉMON
async function buscarPokemon(nome){

    const resposta = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${nome}`
    );


    if(!resposta.ok){
        throw new Error("Pokemon não encontrado");
    }


    return await resposta.json();

}


// BUSCAR DESCRIÇÃO
async function buscarDescricao(nome){

    const respostaSpecies = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${nome}`
    );


    const species = await respostaSpecies.json();


    const descricao = species.flavor_text_entries.find(

        texto => texto.language.name === "en"

    );


    return descricao.flavor_text
        .replace(/\n/g,"")
        .replace(/\f/g,"");

}


// CRIAR CARD
function criarCard(pokemon){

    const card = document.createElement("div");

    card.classList.add("card")

    card.innerHTML = `
   
    <img src="${pokemon.imagem}">

    <h2>Nome: ${pokemon.nome}</h2>

    <p>Número: ${pokemon.id}</p>

    <p>Tipo: ${pokemon.tipo}</p>

    <p>Descrição: ${pokemon.descricao}</p>

    <p>Nota: ${pokemon.nota}</p>

    <p>Favorito: ${pokemon.favorito ? "✅":"❌"}</p>

    <div class="buttons">
    <button class="excluir">Excluir</button>
    <button class="editar">Editar</button>
    </div>
   
    `;


    return card;

}


// EVENTO DE EXCLUIR
function adicionarEventoExcluir(card, nome){

    const btnExcluir = card.querySelector(".excluir");


    btnExcluir.addEventListener("click",()=>{

        card.remove();


        pokemonsAdicionados = pokemonsAdicionados.filter(
            pokemon => pokemon.nome !== nome
        );


        localStorage.setItem(
            "pokemons",
            JSON.stringify(pokemonsAdicionados)
        );


        atualizarContador();

    });

}


function adicionarEventoEditar(card,pokemon){

const btnEditar = card.querySelector(".editar");

btnEditar.addEventListener("click",()=>{

modoEdicao = true;
pokemonEditando = pokemon;
cardEditando = card;


input.value = pokemon.nome;
nota.value = pokemon.nota   ;
favoritoInput.checked = pokemon.favorito;
addBtn.textContent = "Salvar alterções";

window.scrollTo({
    top: 0,
    behavior: "smooth"
});

})

}

// ADICIONAR POKÉMON
addBtn.addEventListener("click",async ()=>{

    if(modoEdicao){

        pokemonEditando.nota = Number(nota.value);
        pokemonEditando.favorito = favoritoInput.checked

        cardEditando.innerHTML = `

        <img src="${pokemonEditando.imagem}">

        <h2>Nome: ${pokemonEditando.nome}</h2>

        <p>Número: ${pokemonEditando.id}</p>

        <p>Tipo: ${pokemonEditando.tipo}</p>

        <p>Descrição: ${pokemonEditando.descricao}</p>

        <p>Nota: ${pokemonEditando.nota}</p>

        <p>Favorito: ${pokemonEditando.favorito ? "✅":"❌"}</p>

        <div class="buttons">
        <button class="excluir">Excluir</button>
        <button class="editar">Editar</button>
        </div>

        `;


        localStorage.setItem("pokemons",JSON.stringify(pokemonsAdicionados));

        adicionarEventoExcluir(cardEditando, pokemonEditando.nome);
        adicionarEventoEditar(cardEditando, pokemonEditando);

        modoEdicao = false;
        pokemonEditando = null;
        cardEditando = null;

        addBtn.textContent = "Adicionar Pokemon";
        input.value ="";
        nota.value="";
        favoritoInput.checked = false;

        return;

    }


    try{


        const nome = input.value.toLowerCase().trim();


        if(pokemonsAdicionados.some(pokemon => pokemon.nome === nome)){

            alert("Esse pokemon já foi adicionado");
            return;

        }


        const listaPokemon = document.querySelector(".listaPokemon");


        const dados = await buscarPokemon(nome);


        const descricao = await buscarDescricao(nome);


        const favorito = favoritoInput.checked;


        const pokemon = {

            nome: dados.name,
            id: dados.id,
            imagem: dados.sprites.other["official-artwork"].front_default,
            tipo: dados.types[0].type.name,
            descricao: descricao,
            nota: Number(nota.value),
            favorito: favorito

        };


        const card = criarCard(pokemon);


        listaPokemon.appendChild(card);


        pokemonsAdicionados.push(pokemon);


        localStorage.setItem(
            "pokemons",
            JSON.stringify(pokemonsAdicionados)
        );


        atualizarContador();


        adicionarEventoExcluir(card, pokemon.nome);
        adicionarEventoEditar(card, pokemon);
        
        input.value = ""
        nota.value = ""
        favoritoInput.checked = false;

    }


    catch(erro){

        alert("Pokemon não encontrado");

    }

});





// EXECUTAR FUNÇÕES INICIAIS
carregarPokemons();
carregarSalvos();
atualizarContador();
criarSugestoes();

