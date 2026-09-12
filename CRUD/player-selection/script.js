const play = document.getElementById("jogar")
const back = document.getElementById("back")
const painel = document.querySelector(".painel")
let pokemonSelecionado = null
const pokemonsIds = [151,4,7,25,650,725,731,105,
  133,143,156,214,197,258]

async function buscarPokemon(ids){

  const pokemons = []

  for(const id of ids){

    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const dados =  await resposta.json()

    pokemons.push({
      id:dados.id,
      sprite:dados.sprites.front_default,
      nome:dados.name
    })
  }
  return pokemons
}

async function iniciarJogo(){

  const pokemons = await buscarPokemon(pokemonsIds)

  pokemons.forEach(pokemon=>{

    const card = document.createElement("div")
    card.className = "card-pokemon"
    card.dataset.id = pokemon.id
    card.dataset.nome = pokemon.nome
    card.dataset.sprite = pokemon.sprite


    const img = document.createElement("img")
    img.src = pokemon.sprite
    img.alt = pokemon.nome

    const nome = document.createElement("p")
    nome.textContent = pokemon.nome
    

    card.appendChild(img)
    card.appendChild(nome)

    card.addEventListener("click",()=>selecionarPokemon(card))

    painel.appendChild(card)

  })}

function selecionarPokemon(card){

  document.querySelectorAll(".card-pokemon").forEach(c=>{
    c.classList.remove("selecionado")
  })

  card.classList.add("selecionado")

  pokemonSelecionado = {

    id:card.dataset.id,
    nome:card.dataset.nome,
    sprite:card.dataset.sprite
  }

}

back.addEventListener("click", () => {

  history.back();
})



play.addEventListener("click", () => {
  if (!pokemonSelecionado) {
    alert("Escolha um Pokémon antes de jogar!")
    return
  }

  localStorage.setItem("pokemonEscolhido", JSON.stringify(pokemonSelecionado))

})

iniciarJogo()