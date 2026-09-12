const back = document.getElementById("back");
const contadorP = document.createElement("p");
const contadorBox = document.getElementById("contadorBox");
const tela = document.querySelector(".tela");
const player = document.getElementById("player");
const pokemonEscolhido = JSON.parse(localStorage.getItem("pokemonEscolhido"));

let jogoIniciado = false

let tempo = 0;
let intervalo = null;

let playerY = 0;
let velocidadeY = 0;

const gravidade = 0.7;
const forcaPulo = -14;

let noChao = true;

const tree = document.querySelector(".tree")
const treeImg = tree.querySelector("img");
let treeX = 600
let velocidadeCenario = 5

const nuvens = document.querySelectorAll(
    ".nuvem, .nuvem2, .nuvem3, .nuvem4, .nuvem5, .nuvem6"
);

const montanhas = document.querySelector(".montanhas");
const floor = document.querySelector(".floor");
const grass = document.querySelector(".grass");

let nuvensX = [];
let texturaX = 0

const gameOverScreen = document.getElementById("gameOver");
const pontuacaoFinal = document.getElementById("pontuacaoFinal");
const jogarNovamente = document.getElementById("jogarNovamente");
let jogoTerminou = false;

nuvens.forEach((nuvem) => {
    nuvensX.push(parseFloat(getComputedStyle(nuvem).left));
});


function iniciarJogo(){

  if(jogoIniciado) return;

  jogoIniciado = true

  contador()
  fisica()
  moverCenario()
}

function moverCenario(){

  velocidadeCenario = Math.min(10,5 + tempo * 0.05 )

  //ARVORES
  treeX-= velocidadeCenario
  

  if(treeX <-100){

    treeX = tela.offsetWidth + 100
  }

  tree.style.left = `${treeX}px`
  
  if(verificarColisao()){
    gameOver()
    return
  }

  //NUVENS
  nuvens.forEach((nuvem, i) => {

        nuvensX[i] -= velocidadeCenario * 0.3;

        if (nuvensX[i] < -150) {
            nuvensX[i] = tela.offsetWidth + 100;
        }

        nuvem.style.left = `${nuvensX[i]}px`;

    });

    texturaX -= velocidadeCenario;

    grass.style.backgroundPosition =
        `${texturaX}px 0px`;

    requestAnimationFrame(moverCenario)
}

function fisica() {

    if(jogoTerminou) return

    velocidadeY += gravidade;
    playerY += velocidadeY;

    if (playerY >= 0) {

        playerY = 0;
        velocidadeY = 0;
        noChao = true;

    }

    player.parentElement.style.transform =
        `translateY(${playerY}px)`;

    requestAnimationFrame(fisica);
}

function pular(){

  if(jogoTerminou){return}
  if(!noChao){return}

  velocidadeY = forcaPulo;
  noChao = false;
  
}
function verificarColisao(){


    if(!noChao){return false}

    const playerRect = player.getBoundingClientRect();
    const treeRect = treeImg.getBoundingClientRect();

    const playerHitbox = {
        left: playerRect.left + playerRect.width * 0.333,
        right: playerRect.right - playerRect.width * 0.333,
        top: playerRect.top + playerRect.height * 0.3,
        bottom: playerRect.bottom
    };

    const treeHitbox = {
        left: treeRect.left + treeRect.width * 0.2,
        right: treeRect.right - treeRect.width * 0.2,
        top: treeRect.top + treeRect.height * 0.1,
        bottom: treeRect.bottom
    };

    return(
        playerHitbox.left < treeHitbox.right &&
        playerHitbox.right > treeHitbox.left &&
        playerHitbox.top < treeHitbox.bottom &&
        playerHitbox.bottom > treeHitbox.top
    )}
function gameOver() {

    jogoTerminou = true;

    clearInterval(intervalo);

    pontuacaoFinal.textContent =
        tempo.toString().padStart(7, "0");

    gameOverScreen.classList.add("on")
}
  

if (!pokemonEscolhido) {

    alert("Nenhum Pokémon selecionado!");
    history.back();

} else {

    player.src = pokemonEscolhido.sprite;

    back.addEventListener("click", () => {
        history.back();
    });
}


contadorP.classList.add("contador");
contadorBox.appendChild(contadorP);
contadorP.textContent = "0000000";


function contador() {

    if (intervalo) return;

    intervalo = setInterval(() => {

        tempo++;

        contadorP.textContent =
            tempo.toString().padStart(7, "0");

    }, 100);
}

tela.addEventListener("click", () => {

  if(noChao){
    
    pular();
    
}
iniciarJogo()

});

document.addEventListener("keydown", (e) => {

    if (e.code === "Space") {

        e.preventDefault();

    

    if(noChao){
        pular()
    }}

    iniciarJogo()        
    

});

jogarNovamente.addEventListener("click", () => {

    location.reload();

});