// ========================================================================
// SELEÇÃO DE ELEMENTOS DO HTML
// document.getElementById busca UM elemento pelo atributo id="..." no HTML.
// document.querySelector busca UM elemento por um seletor CSS (classe, tag, etc).
// Ambos retornam "null" se não encontrarem nada.
// ========================================================================

// Pega o botão/elemento com id="back" (provavelmente o botão de voltar à tela anterior)
const back = document.getElementById("back");

// Cria um elemento <p> (parágrafo) NOVO, do zero, só na memória do JavaScript.
// Ele ainda NÃO aparece na página até ser inserido com appendChild (isso acontece mais abaixo).
const contadorP = document.createElement("p");

// Pega o elemento (uma div, provavelmente) que vai servir de "caixa" para o contador de tempo
const contadorBox = document.getElementById("contadorBox");

// Pega o elemento com classe "tela" — a área visual onde o jogo acontece (o "canvas" do jogo)
const tela = document.querySelector(".tela");

// Pega o elemento com id="player" — a imagem/sprite que representa o personagem jogável
const player = document.getElementById("player");

// localStorage é uma memória do navegador que continua salva mesmo depois de fechar a aba.
// getItem("pokemonEscolhido") lê o texto salvo com essa chave (provavelmente definido em outra
// página, na tela de escolha do Pokémon).
// JSON.parse() converte esse texto (que estava no formato JSON, tipo {"nome": "Pikachu", ...})
// de volta em um objeto JavaScript de verdade, que dá pra acessar com pokemonEscolhido.nome, etc.
const pokemonEscolhido = JSON.parse(localStorage.getItem("pokemonEscolhido"));


// ========================================================================
// VARIÁVEIS DE ESTADO DO JOGO
// "let" cria uma variável que PODE ser reatribuída depois (diferente de "const", que é fixa).
// ========================================================================

// Flag (verdadeiro/falso) que controla se o jogo já foi iniciado.
// Serve para impedir que o jogo comece de novo se o jogador clicar várias vezes.
let jogoIniciado = false

// Contador de tempo de jogo (em "ticks", incrementado a cada 100ms lá na função contador())
let tempo = 0;

// Vai guardar a referência do temporizador (setInterval) do contador.
// Começa como "null" (vazio) porque o temporizador ainda não foi criado.
let intervalo = null;

// Posição vertical atual do personagem. 0 = no chão. Valores negativos = no ar (mais alto).
let playerY = 0;

// Velocidade vertical atual do personagem (quanto ele sobe ou desce por quadro de animação).
let velocidadeY = 0;

// "const" aqui porque esses valores NUNCA mudam durante o jogo — são constantes físicas.
// Gravidade: quanto a velocidade de queda aumenta a cada quadro (puxa o personagem pra baixo).
const gravidade = 0.7;

// Força do pulo: valor NEGATIVO porque, na tela do navegador, o eixo Y cresce PARA BAIXO.
// Ou seja, um número negativo em translateY empurra o elemento PARA CIMA.
const forcaPulo = -14;

// Flag que indica se o personagem está tocando o chão (true) ou está no ar pulando (false).
let noChao = true;


// ========================================================================
// ELEMENTOS DO CENÁRIO (obstáculo, nuvens, chão)
// ========================================================================

// Pega o elemento contêiner da árvore (o obstáculo que o jogador precisa desviar)
const tree = document.querySelector(".tree")

// Dentro do contêiner "tree", pega especificamente a tag <img> (a imagem da árvore).
// Isso é feito separado porque, provavelmente, o contêiner .tree é maior que a imagem em si
// (tem um "padding" invisível), então pra colisão é melhor medir a imagem, não o contêiner.
const treeImg = tree.querySelector("img");

// Posição horizontal inicial da árvore: 600px, ou seja, ela começa fora da tela à direita
let treeX = 600

// Velocidade inicial com que o cenário (árvore, nuvens, chão) se move para a esquerda
let velocidadeCenario = 5

// querySelectorAll (com "All") busca TODOS os elementos que combinam com os seletores,
// não só o primeiro. Aqui pega todas as 6 nuvens diferentes de uma vez, numa lista (NodeList).
const nuvens = document.querySelectorAll(
    ".nuvem, .nuvem2, .nuvem3, .nuvem4, .nuvem5, .nuvem6"
);

// Pega o elemento de fundo com as montanhas (curiosidade: essa variável nunca é usada
// depois no código — é uma "sobra" que não tem efeito nenhum no jogo)
const montanhas = document.querySelector(".montanhas");

// Pega o elemento "floor" (chão) — também nunca é usado depois, outra sobra de código
const floor = document.querySelector(".floor");

// Pega o elemento "grass" (grama) — esse SIM é usado, para simular o chão se movendo
const grass = document.querySelector(".grass");

// Array vazio que vai guardar a posição X de CADA nuvem individualmente (uma posição por nuvem,
// já que elas se movem em velocidades diferentes da árvore)
let nuvensX = [];

// Guarda o deslocamento acumulado da textura do chão (usado pra animação da grama)
let texturaX = 0

// Elemento da tela de "Game Over" (por padrão escondida via CSS, até ganhar a classe "on")
const gameOverScreen = document.getElementById("gameOver");

// Elemento de texto onde a pontuação final será exibida
const pontuacaoFinal = document.getElementById("pontuacaoFinal");

// Botão de "jogar novamente"
const jogarNovamente = document.getElementById("jogarNovamente");

// Flag mestra: quando vira "true", TUDO no jogo para (pulo, contador, física)
let jogoTerminou = false;


// ========================================================================
// INICIALIZAÇÃO DA POSIÇÃO DAS NUVENS
// ========================================================================

// forEach percorre cada item da lista "nuvens", um por um, executando a função para cada um.
nuvens.forEach((nuvem) => {
    // getComputedStyle(nuvem) pega o CSS "de verdade" aplicado ao elemento (já calculado
    // pelo navegador, não só o que está escrito no arquivo .css).
    // .left pega o valor da propriedade "left" desse CSS computado (algo como "320px", um texto).
    // parseFloat() converte esse texto em número (ex: "320px" vira 320).
    // .push() adiciona esse número no final do array nuvensX.
    // Resultado: nuvensX guarda a posição inicial de cada nuvem, lida diretamente do CSS.
    nuvensX.push(parseFloat(getComputedStyle(nuvem).left));
});


// ========================================================================
// FUNÇÃO: iniciarJogo
// Liga os três sistemas do jogo (contador, física, cenário) de uma vez, mas só na primeira vez.
// ========================================================================
function iniciarJogo(){

  // Se o jogo JÁ tiver sido iniciado antes, a função para aqui (return sem valor = sai da função).
  // Isso evita que, se o jogador clicar várias vezes, o jogo reinicie os loops múltiplas vezes.
  if(jogoIniciado) return;

  // Marca que o jogo foi iniciado, pra próxima chamada ser bloqueada pelo "if" acima
  jogoIniciado = true

  // Chama as três funções que colocam o jogo em movimento
  contador()      // liga o cronômetro
  fisica()        // liga o loop de gravidade/pulo
  moverCenario()  // liga o loop de movimento do cenário (árvore, nuvens, chão)
}


// ========================================================================
// FUNÇÃO: moverCenario
// Roda repetidamente (loop de animação) movendo a árvore, as nuvens e o chão.
// ========================================================================
function moverCenario(){

  // Recalcula a velocidade do cenário a cada quadro.
  // Math.min(10, X) retorna o MENOR valor entre 10 e X — ou seja, a velocidade cresce
  // conforme "tempo" aumenta, mas nunca ultrapassa 10 (um teto de dificuldade).
  // "5 + tempo * 0.05" começa em 5 e sobe bem devagar (0.05 por tick de tempo).
  velocidadeCenario = Math.min(10,5 + tempo * 0.05 )

  //ARVORES
  // Subtrai a velocidade da posição X da árvore, ou seja, ela anda para a ESQUERDA
  // (porque em CSS, "left" menor = mais à esquerda na tela)
  treeX-= velocidadeCenario


  // Se a árvore saiu totalmente da tela pela esquerda (passou de -100px)...
  if(treeX <-100){

    // ...ela é teleportada para 100px além da borda direita da tela.
    // tela.offsetWidth pega a largura ATUAL (em pixels) do elemento ".tela" na tela do usuário.
    // Isso cria um ciclo infinito: a árvore sempre volta a aparecer da direita.
    treeX = tela.offsetWidth + 100
  }

  // Aplica de fato a nova posição X calculada acima ao estilo CSS do elemento "tree".
  // Os crases (`` `${treeX}px` ``) formam uma "template string": insere o valor da variável
  // treeX dentro do texto, resultando em algo como "543px".
  tree.style.left = `${treeX}px`

  // A cada quadro em que o cenário se move, verifica se houve colisão com a árvore
  if(verificarColisao()){
    // Se colidiu: encerra o jogo...
    gameOver()
    // ...e "return" sai da função AGORA, sem executar o código abaixo (nuvens, textura,
    // e o próximo requestAnimationFrame). Isso interrompe o loop de movimento do cenário.
    return
  }

  //NUVENS
  // Percorre cada nuvem. "i" é o índice dela na lista (0, 1, 2, 3...), usado para
  // acessar a posição correspondente no array nuvensX.
  nuvens.forEach((nuvem, i) => {

        // Move essa nuvem específica para a esquerda, mas 30% mais devagar que o cenário
        // principal (por isso "* 0.3"). Isso cria um efeito de profundidade: coisas mais
        // "distantes" (nuvens no céu) parecem se mover mais devagar que coisas próximas (árvore).
        // Esse efeito se chama "paralaxe".
        nuvensX[i] -= velocidadeCenario * 0.3;

        // Se essa nuvem saiu bastante da tela pela esquerda...
        if (nuvensX[i] < -150) {
            // ...reaparece do lado direito, além da borda da tela
            nuvensX[i] = tela.offsetWidth + 100;
        }

        // Aplica a nova posição calculada ao CSS real dessa nuvem
        nuvem.style.left = `${nuvensX[i]}px`;

    });

    // Desloca o acumulador da textura do chão, na mesma velocidade do cenário
    texturaX -= velocidadeCenario;

    // background-position controla ONDE a imagem de fundo (definida no CSS) começa a
    // ser desenhada dentro do elemento. Mudando esse valor continuamente, a textura da
    // grama parece estar "andando" para trás, dando a ilusão de que o personagem está correndo.
    grass.style.backgroundPosition =
        `${texturaX}px 0px`;

    // requestAnimationFrame pede ao navegador para chamar moverCenario() DE NOVO,
    // bem antes do próximo quadro ser desenhado na tela (geralmente ~60 vezes por segundo).
    // Isso cria o "loop" de animação: a função chama a si mesma indefinidamente.
    requestAnimationFrame(moverCenario)
}


// ========================================================================
// FUNÇÃO: fisica
// Loop separado que cuida SÓ da gravidade e da posição vertical do personagem.
// ========================================================================
function fisica() {

    // Se o jogo já acabou, não faz nenhum cálculo de física — apenas sai da função.
    // (repare que requestAnimationFrame NÃO é chamado de novo aqui dentro deste if,
    // então esse loop específico realmente para de rodar depois do game over)
    if(jogoTerminou) return

    // A cada quadro, a velocidade vertical aumenta (fica mais positiva/menos negativa),
    // simulando a aceleração da gravidade puxando o personagem pra baixo
    velocidadeY += gravidade;

    // A posição vertical é atualizada somando a velocidade atual
    playerY += velocidadeY;

    // Se o personagem chegou ou passou do nível do chão (playerY >= 0)...
    if (playerY >= 0) {

        // ...trava a posição exatamente em 0 (evita "afundar" no chão por causa da física)
        playerY = 0;
        // zera a velocidade vertical (ele parou de cair)
        velocidadeY = 0;
        // marca que ele está no chão, liberando um novo pulo
        noChao = true;

    }

    // translateY move um elemento verticalmente via CSS, sem alterar o fluxo do layout
    // (diferente de mudar "top", por exemplo). Aqui é aplicado no elemento PAI do player,
    // não no player diretamente — possivelmente porque o pai controla a sombra ou outro efeito.
    player.parentElement.style.transform =
        `translateY(${playerY}px)`;

    // Reagenda essa mesma função para rodar de novo no próximo quadro,
    // mantendo o loop de física rodando continuamente
    requestAnimationFrame(fisica);
}


// ========================================================================
// FUNÇÃO: pular
// Executa o pulo do personagem, se as condições permitirem.
// ========================================================================
function pular(){

  // Se o jogo já terminou, não deixa pular (senão o personagem "reviveria" visualmente)
  if(jogoTerminou){return}

  // Se o personagem NÃO estiver no chão (ou seja, já está pulando), não deixa pular de novo.
  // "!noChao" significa "negação de noChao" — ou seja, "se noChao for false".
  // Isso IMPEDE o pulo duplo no ar.
  if(!noChao){return}

  // Define a velocidade vertical como a força do pulo (um número negativo, empurrando pra cima)
  velocidadeY = forcaPulo;

  // Marca que o personagem não está mais no chão (está no ar)
  noChao = false;

}


// ========================================================================
// FUNÇÃO: verificarColisao
// Verifica se o personagem bateu na árvore, usando geometria de retângulos.
// ========================================================================
function verificarColisao(){

    // Se o personagem estiver no AR (não no chão), a função já retorna "false" (sem colisão)
    // imediatamente, sem nem calcular as posições. Ou seja: colisão SÓ é checada quando
    // o personagem está tocando o chão — pular sempre "passa por cima" sem checagem.
    if(!noChao){return false}

    // getBoundingClientRect() retorna um objeto com a posição e tamanho REAIS do elemento
    // na tela (em pixels), relativos à janela do navegador: contém left, right, top, bottom,
    // width, height, etc. É a forma mais precisa de saber "onde" um elemento está agora.
    const playerRect = player.getBoundingClientRect();
    const treeRect = treeImg.getBoundingClientRect();

    // Cria uma "hitbox" (área de colisão) do jogador, mas ENCOLHIDA em relação ao sprite real.
    // Isso é feito porque sprites de jogos costumam ter espaço vazio/transparente nas bordas,
    // então colidir com o retângulo exato da imagem pareceria "injusto" visualmente.
    const playerHitbox = {
        // Empurra a borda esquerda para dentro em 33.3% da largura da imagem
        left: playerRect.left + playerRect.width * 0.333,
        // Empurra a borda direita para dentro em 33.3% da largura
        right: playerRect.right - playerRect.width * 0.333,
        // Empurra o topo para baixo em 30% da altura
        top: playerRect.top + playerRect.height * 0.3,
        // A base fica igual à base real (não é reduzida)
        bottom: playerRect.bottom
    };

    // O mesmo princípio para a árvore, mas com margens menores (20% nas laterais, 10% no topo)
    const treeHitbox = {
        left: treeRect.left + treeRect.width * 0.2,
        right: treeRect.right - treeRect.width * 0.2,
        top: treeRect.top + treeRect.height * 0.1,
        bottom: treeRect.bottom
    };

    // Esta é a fórmula clássica de detecção de colisão entre dois retângulos (chamada AABB —
    // "Axis-Aligned Bounding Box"). Ela só retorna "true" (colisão) se TODAS as 4 condições
    // abaixo forem verdadeiras ao mesmo tempo (o "&&" significa "E"):
    return(
        // A borda esquerda do jogador está ANTES da borda direita da árvore (eles se sobrepõem
        // horizontalmente por esse lado)
        playerHitbox.left < treeHitbox.right &&
        // A borda direita do jogador está DEPOIS da borda esquerda da árvore
        playerHitbox.right > treeHitbox.left &&
        // O topo do jogador está ACIMA da base da árvore (numericamente "menor", já que Y cresce
        // para baixo na tela)
        playerHitbox.top < treeHitbox.bottom &&
        // A base do jogador está ABAIXO do topo da árvore
        playerHitbox.bottom > treeHitbox.top
    // Se as 4 forem verdadeiras, os dois retângulos necessariamente se sobrepõem no espaço = colisão.
    )}


// ========================================================================
// FUNÇÃO: gameOver
// Encerra o jogo e mostra a tela final com a pontuação.
// ========================================================================
function gameOver() {

    // Marca a flag mestra como verdadeira — isso vai travar fisica() e pular() nas
    // próximas execuções, porque ambas verificam "if(jogoTerminou) return" logo no início
    jogoTerminou = true;

    // clearInterval() PARA definitivamente o temporizador criado com setInterval em contador().
    // Sem isso, o contador continuaria incrementando "tempo" mesmo depois do game over.
    clearInterval(intervalo);

    // Define o texto da pontuação final.
    // tempo.toString() converte o número em texto (ex: 42 vira "42").
    // .padStart(7, "0") completa esse texto com zeros à ESQUERDA até ter 7 caracteres no total
    // (ex: "42" vira "0000042"), dando aquele visual de placar/cronômetro retrô.
    pontuacaoFinal.textContent =
        tempo.toString().padStart(7, "0");

    // classList.add("on") adiciona a classe CSS "on" ao elemento da tela de game over.
    // Provavelmente essa classe, no CSS, muda "display: none" para "display: block" (ou similar),
    // tornando essa tela visível.
    gameOverScreen.classList.add("on")
}


// ========================================================================
// VERIFICAÇÃO INICIAL: existe um Pokémon escolhido?
// Este bloco roda IMEDIATAMENTE quando o script é carregado, fora de qualquer função.
// ========================================================================
if (!pokemonEscolhido) {
    // "!pokemonEscolhido" significa "se pokemonEscolhido for null/vazio/falso".
    // Ou seja: se ninguém escolheu um Pokémon antes de chegar nesta página...

    // alert() abre uma caixa de diálogo nativa do navegador com essa mensagem
    alert("Nenhum Pokémon selecionado!");

    // history.back() equivale a clicar no botão "voltar" do navegador,
    // levando o usuário de volta à página anterior (provavelmente a tela de seleção)
    history.back();

} else {
    // Caso EXISTA um Pokémon escolhido...

    // Define a imagem do elemento "player" como o sprite salvo no objeto pokemonEscolhido
    // (isso assume que o objeto salvo no localStorage tem uma propriedade chamada "sprite",
    // contendo a URL da imagem)
    player.src = pokemonEscolhido.sprite;

    // addEventListener registra uma função que será executada toda vez que o evento
    // acontecer. Aqui: toda vez que o botão "back" for clicado, volta para a página anterior.
    back.addEventListener("click", () => {
        history.back();
    });
}


// ========================================================================
// MONTAGEM DO CONTADOR NA TELA
// (esse bloco também roda imediatamente, fora de função)
// ========================================================================

// Adiciona a classe CSS "contador" ao parágrafo criado lá no topo do arquivo,
// provavelmente para estilizá-lo (fonte, cor, tamanho, etc)
contadorP.classList.add("contador");

// appendChild() insere de fato o elemento contadorP DENTRO do elemento contadorBox no HTML.
// É só agora que o parágrafo passa a existir visualmente na página (antes, existia só na memória).
contadorBox.appendChild(contadorP);

// Define o texto inicial exibido como sete zeros, antes do jogo começar a contar
contadorP.textContent = "0000000";


// ========================================================================
// FUNÇÃO: contador
// Liga um temporizador que incrementa "tempo" e atualiza o texto na tela.
// ========================================================================
function contador() {

    // Se "intervalo" já não for null (ou seja, já existe um temporizador rodando),
    // a função para aqui, evitando criar um SEGUNDO temporizador simultâneo
    // (o que faria o tempo passar em dobro de velocidade)
    if (intervalo) return;

    // setInterval executa a função passada repetidamente, de X em X milissegundos
    // (aqui, a cada 100ms = 10 vezes por segundo). Guarda a referência do temporizador
    // na variável "intervalo", para poder pará-lo depois com clearInterval.
    intervalo = setInterval(() => {

        // Incrementa o tempo em 1 unidade a cada execução (então "tempo" sobe 10 por segundo)
        tempo++;

        // Atualiza o texto exibido, com o mesmo formato de zeros à esquerda usado no game over
        contadorP.textContent =
            tempo.toString().padStart(7, "0");

    }, 100); // 100 = intervalo em milissegundos entre cada execução
}


// ========================================================================
// EVENTO DE CLIQUE NA TELA DE JOGO
// ========================================================================
tela.addEventListener("click", () => {

  // Se o personagem estiver no chão no momento do clique, faz ele pular
  if(noChao){

    pular();

  }
  // Chama iniciarJogo() em TODO clique — mas, como vimos, essa função só tem efeito
  // real na primeira vez (por causa da flag jogoIniciado), então cliques repetidos
  // aqui servem basicamente só para pular.
  iniciarJogo()

});


// ========================================================================
// EVENTO DE TECLADO
// ========================================================================
document.addEventListener("keydown", (e) => {
    // "e" é o objeto do evento, criado automaticamente pelo navegador, contendo
    // informações sobre QUAL tecla foi pressionada e outros detalhes do evento.

    // e.code identifica FISICAMENTE qual tecla foi apertada no teclado (independente
    // do idioma do teclado ou de "Shift" estar pressionado). "Space" é o código da
    // barra de espaço. (É diferente de e.key, que retornaria o CARACTERE gerado,
    // tipo " " — e.code é mais confiável para teclas de ação como espaço/setas).
    if (e.code === "Space") {

        // Por padrão, apertar espaço no navegador rola a página para baixo (como se
        // fosse "Page Down" parcial). e.preventDefault() cancela esse comportamento
        // padrão do navegador para este evento específico, evitando que a tela role
        // toda vez que o jogador tentar pular.
        e.preventDefault();


        // Só pula se o personagem estiver no chão no momento
        if(noChao){
            pular()
        }
    }

    // Assim como no clique, iniciarJogo() é chamado para QUALQUER tecla pressionada,
    // não só espaço — mesmo que outras teclas não façam o personagem pular, elas ainda
    // disparam o início do jogo (efeito colateral provavelmente não muito intencional,
    // mas inofensivo, já que iniciarJogo() se autobloqueia depois da primeira chamada)
    iniciarJogo()

});


// ========================================================================
// EVENTO DO BOTÃO "JOGAR NOVAMENTE"
// ========================================================================
jogarNovamente.addEventListener("click", () => {

    // location.reload() recarrega a página inteira do zero, como se o usuário tivesse
    // apertado F5. Isso reseta automaticamente TODAS as variáveis (tempo, jogoTerminou,
    // posições, etc.), sem precisar escrever uma função de "reset" manual.
    location.reload();

});
