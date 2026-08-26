const players = document.querySelectorAll(".painel > div");   

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");

const play = document.getElementById("jogar")

let current = 1; // player-2 começa com "on"

function update() {
  players.forEach((el, i) => {
    if (i === current) {
      el.classList.remove("off");
      el.classList.add("on");
    } else {
      el.classList.remove("on");
      el.classList.add("off");
    }
  });
}

leftButton.addEventListener("click", () => {
  current = (current - 1 + players.length) % players.length;
  update();
});

rightButton.addEventListener("click", () => {
  current = (current + 1) % players.length;
  update();
}); 

play.addEventListener("click",()=>{

window.open('../../Infinity run/index.html','width=800,height=600');   

})