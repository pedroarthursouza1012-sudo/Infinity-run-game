const back = document.getElementById("back")

const player = document.getElementById("player")
const pokemonEscolhido = JSON.parse(localStorage.getItem("pokemonEscolhido"))

if (!pokemonEscolhido) {
  alert("Nenhum Pokémon selecionado!")
  history.back()
} else {
  player.src = pokemonEscolhido.sprite
}

back.addEventListener("click", () => {

  history.back();
})

player_selecionado.src = pokemonEscolhido.sprite

