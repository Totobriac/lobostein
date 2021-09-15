import Level from "./level.js";
import Rayo from "./rayo.js";
import Player from "./player.js"
import { nivel1 } from "./functions.js"

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var FPS = 50;

var canvasAncho = 500;
var canvasAlto = 500;

var escenario;
var jugador;
 var rayo;

function init() {
  canvas.width = canvasAncho;
  canvas.height = canvasAlto;
  setInterval(principal, 1000 / FPS);
  escenario = new Level(canvas, ctx, nivel1);  
  rayo = new Rayo(ctx, escenario, 100, 100, 0, 0);
  jugador = new Player(ctx, escenario, 100, 100, rayo);
}

document.addEventListener('keydown', function (e) {
  switch (e.key) {
    case "ArrowUp": jugador.arriba();
      break;
    case "ArrowDown": jugador.abajo();
      break;
    case "ArrowLeft": jugador.izquierda();
      break;
    case "ArrowRight": jugador.derecha();
      break;
  }
});

document.addEventListener('keyup', function (e) {
  switch (e.key) {
    case "ArrowUp": jugador.avanzaSuelta();
      break;
    case "ArrowDown": jugador.avanzaSuelta();
      break;
    case "ArrowLeft": jugador.giraSuelta();
      break;
    case "ArrowRight": jugador.giraSuelta();
      break;
  }
});

function principal() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  escenario.dibuja();
  jugador.dibuja();
}

init();