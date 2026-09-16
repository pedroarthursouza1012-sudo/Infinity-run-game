const back = document.getElementById("back");
const contadorP = document.createElement("p");
const contadorBox = document.getElementById("contadorBox");
const tela = document.querySelector(".tela");
const player = document.getElementById("player");
const pokemonEscolhido = JSON.parse(localStorage.getItem("pokemonEscolhido"));
const sol = document.querySelector(".sol");
const lua = document.querySelector(".lua");
const estrelas = document.querySelector(".estrelas");
const noiteOverlay = document.querySelector(".noite-overlay");

let jogoIniciado = false

let tempo = 0;
let intervalo = null;

let playerY = 0;
let velocidadeY = 0;

const gravidade = 0.65;
const forcaPulo = -15;

let noChao = true;

const obstaculos = document.getElementById("obstaculos");

let arvores = [];

let velocidadeCenario = 5;


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



for (let i = 0; i < 60; i++) {

    const estrela = document.createElement("div");

    estrela.classList.add("estrela");

    estrela.style.left = Math.random() * 100 + "%";
    estrela.style.top = Math.random() * 70 + "%";

    estrela.style.animationDelay =
        Math.random() * 2 + "s";

    estrelas.appendChild(estrela);
}

function atualizarCicloDiaNoite(tempo) {

    if (tempo < 150) {

        // DIA
        tela.classList.remove("noite");

        sol.style.bottom = "25%";

        noiteOverlay.style.opacity = "0";

    }

    else if (tempo <300) {

        // PÔR DO SOL
        tela.classList.remove("noite");

        const progresso = (tempo - 150) / 150;

        // Sol vai de 25% até -5%
        const posicao = 25 - (progresso * 30);

        sol.style.bottom = posicao + "%";

        // Escurece gradualmente
        noiteOverlay.style.opacity = progresso * 0.45;

    }

    else {

        // NOITE
        tela.classList.add("noite");

        sol.style.bottom = "-20%";

        noiteOverlay.style.opacity = "0.7";

    }
}

nuvens.forEach((nuvem) => {
    nuvensX.push(parseFloat(getComputedStyle(nuvem).left));
});

function criarArvore(x) {

    const tree = document.createElement("div");

    tree.classList.add("tree");

    const img = document.createElement("img");

    img.src = "../Infinity run/img/pokemon-fire-red-tree.png";

    img.alt = "";

    tree.appendChild(img);

    obstaculos.appendChild(tree);

    tree.style.left = `${x}px`;

    arvores.push({
        elemento: tree,
        x: x
    });
}

function gerarArvores() {

    // Evita criar árvores demais
    if (arvores.length > 0) {

        const ultima =
            arvores[arvores.length - 1];

        if (
            ultima.x >
            tela.offsetWidth - 500
        ) {
            return;
        }
    }

    // 25% de chance de duas árvores
    const quantidade =
        Math.random() < 0.25 ? 2 : 1;

    // Distância aleatória
    const distancia =
        Math.random() * 250 + 500;

    let x =
        tela.offsetWidth + distancia;

    for (let i = 0; i < quantidade; i++) {

        criarArvore(x);

        // Se forem duas, ficam próximas
        if (quantidade === 2) {
            x += 110;
        }
    }
}



function iniciarJogo() {

    if (jogoIniciado) {
        return;
    }

    jogoIniciado = true;

    // Primeira árvore
    criarArvore(
        tela.offsetWidth + 500
    );

    contador();

    fisica();

    moverCenario();
}


function moverCenario(){

    if (jogoTerminou) {
        return;
    }

    velocidadeCenario =
        Math.min(10, 5 + tempo * 0.05);


    // =========================
    // ÁRVORES
    // =========================

    arvores.forEach((arvore) => {

        arvore.x -= velocidadeCenario;

        arvore.elemento.style.left =
            `${arvore.x}px`;

    });


    // Remove árvores que saíram da tela
    arvores = arvores.filter((arvore) => {

        if (arvore.x < -150) {

            arvore.elemento.remove();

            return false;
        }

        return true;
    });


    // Cria novas árvores
    gerarArvores();


    // =========================
    // COLISÃO
    // =========================

    if (verificarColisao()) {

        gameOver();

        return;
    }


    // =========================
    // NUVENS
    // =========================

    nuvens.forEach((nuvem, i) => {

        nuvensX[i] -=
            velocidadeCenario * 0.3;

        if (nuvensX[i] < -150) {

            nuvensX[i] =
                tela.offsetWidth + 100;
        }

        nuvem.style.left =
            `${nuvensX[i]}px`;

    });


    // =========================
    // GRAMA
    // =========================

    texturaX -= velocidadeCenario;

    grass.style.backgroundPosition =
        `${texturaX}px 0px`;


    requestAnimationFrame(moverCenario);
}


function fisica() {

    if (jogoTerminou) {
        return;
    }

    velocidadeY += gravidade;

    playerY += velocidadeY;


    // Chegou ao chão
    if (playerY >= 0) {

        playerY = 0;

        velocidadeY = 0;

        noChao = true;
    }


    player.parentElement.style.transform =
        `translateY(${playerY}px)`;


    requestAnimationFrame(fisica);
}


function pular() {

    if (jogoTerminou) {
        return;
    }

    if (!noChao) {
        return;
    }

    velocidadeY = forcaPulo;

    noChao = false;
}


function verificarColisao() {

    const playerRect =
        player.getBoundingClientRect();


    // Hitbox do jogador
    const playerHitbox = {

        left:
            playerRect.left +
            playerRect.width * 0.35,

        right:
            playerRect.right -
            playerRect.width * 0.35,

        top:
            playerRect.top +
            playerRect.height * 0.25,

        bottom:
            playerRect.bottom
    };


    // Verifica todas as árvores
    for (const arvore of arvores) {

        const treeImg =
            arvore.elemento.querySelector("img");

        const treeRect =
            treeImg.getBoundingClientRect();


        // Hitbox da árvore
        const treeHitbox = {

            left:
                treeRect.left +
                treeRect.width * 0.25,

            right:
                treeRect.right -
                treeRect.width * 0.25,

            top:
                treeRect.top +
                treeRect.height * 0.25,

            bottom:
                treeRect.bottom
        };


        // Colisão
        if (

            playerHitbox.left <
            treeHitbox.right &&

            playerHitbox.right >
            treeHitbox.left &&

            playerHitbox.top <
            treeHitbox.bottom &&

            playerHitbox.bottom >
            treeHitbox.top

        ) {

            return true;
        }
    }


    return false;
}



function gameOver() {

    jogoTerminou = true;

    clearInterval(intervalo);

    pontuacaoFinal.textContent =
        tempo.toString().padStart(7, "0");

    gameOverScreen.classList.add("on");
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

            atualizarCicloDiaNoite(tempo)

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
