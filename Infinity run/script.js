const player_selecionado = Number(localStorage.getItem("playerSelecionado"))

const player = document.getElementById("player")

const personagens = [

"../sprites/Character 1/sprite10.png",
"../sprites/Character 2/sprite10.png",
"../sprites/Character 3/sprite10.png"

]

player.src = personagens[player_selecionado]

