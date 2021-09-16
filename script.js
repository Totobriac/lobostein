var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var FPS = 50;

var canvasAncho = 500;
var canvasAlto = 500;
var tamTile = 50;

var escenario;
var jugador;

var tiles;

const FOV = 60;
const medioFOV = FOV / 2;

//var paredColor = "black";
//var sueloColor = "grey";
//var jugadorColor = "red";


function init() {
  canvas.width = canvasAncho;
  canvas.height = canvasAlto;

  reescalaCanvas();

  setInterval(principal, 1000 / FPS);
  escenario = new Level(canvas, ctx, nivel1);
  jugador = new Player(ctx, escenario, 100, 100);

  tiles = new Image();
  tiles.src = "./wolf.png"
}


var nivel1 = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 0, 1],
  [3, 0, 0, 2, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 3, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 2, 2, 1, 1, 1, 1, 1],
]

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

function normalizaAngulo(angulo) {
  angulo = angulo % (2 * Math.PI);

  if (angulo < 0) {
    angulo = angulo + (2 * Math.PI);
  }
  return angulo;
}

function distanciaEntrePuntos(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}

function convierteRadianes(angulo) {
  angulo = angulo * (Math.PI / 180);
  return angulo;
}

function reescalaCanvas() {
  canvas.style.width = "400px";
  canvas.style.height = "400px";
}

function sueloTecho() {
  ctx.fillStyle = "#666666";
  ctx.fillRect(0, 0, 500, 250);

  ctx.fillStyle = "#752300";
  ctx.fillRect(0, 250, 500, 500);
}

class Rayo {
  constructor(con, escenario, x, y, anguloJugador, incrementoAngulo, columna) {
    this.ctx = con;
    this.escenario = escenario;
    this.x = x;
    this.y = y;

    this.incrementoAngulo = incrementoAngulo;

    this.anguloJugador = anguloJugador;
    this.angulo = anguloJugador + incrementoAngulo;

    this.columna = columna;
    this.distencia = 0;

    this.wallHitX = 0;
    this.wallHitY = 0;

    this.wallHitXHorizontal = 0;
    this.wallHitYHorizontal = 0;

    this.wallHitXVertical = 0;
    this.wallHitYVertical = 0;

    this.pixelTextura = 0;
    this.idTextura = 0;
  }
  setAngulo(angulo) {
    this.anguloJugador = angulo;
    this.angulo = normalizaAngulo(angulo + this.incrementoAngulo);
  }
  cast() {
    this.xIntercept = 0;
    this.yIntercept = 0;

    this.xStep = 0;
    this.yStep = 0;

    this.abajo = false;
    this.izquierda = false;

    if (this.angulo < Math.PI) {
      this.abajo = true;
    }
    if (this.angulo > Math.PI / 2 && this.angulo < 3 * Math.PI / 2)
      this.izquierda = true;

    var choqueHorizontal = false;

    this.yIntercept = Math.floor(this.y / tamTile) * tamTile;

    if (this.abajo) this.yIntercept += tamTile;

    var adyacente = (this.yIntercept - this.y) / Math.tan(this.angulo);
    this.xIntercept = this.x + adyacente;

    this.yStep = tamTile;
    this.xStep = this.yStep / Math.tan(this.angulo);

    if (!this.abajo) this.yStep = -this.yStep;

    if ((this.izquierda && this.xStep > 0) || (!this.izquierda && this.xStep < 0)) {
      this.xStep = -this.xStep;
    }

    var siguienteXHorizontal = this.xIntercept;
    var siguienteYHorizontal = this.yIntercept;

    if (!this.abajo) siguienteYHorizontal--;

    while (!choqueHorizontal) {
      var casillaX = parseInt(siguienteXHorizontal / tamTile);
      var casillaY = parseInt(siguienteYHorizontal / tamTile);

      if (this.escenario.colision(casillaX, casillaY)) {
        choqueHorizontal = true;
        this.wallHitXHorizontal = siguienteXHorizontal;
        this.wallHitYHorizontal = siguienteYHorizontal;
      }
      else {
        siguienteXHorizontal += this.xStep;
        siguienteYHorizontal += this.yStep;
      }
    }

    ///////////////////////////////////////////////

    var choqueVertical = false;

    this.xIntercept = Math.floor(this.x / tamTile) * tamTile;

    if (!this.izquierda) this.xIntercept += tamTile;

    var opuesto = (this.xIntercept - this.x) * Math.tan(this.angulo);
    this.yIntercept = this.y + opuesto;

    this.xStep = tamTile;
    this.yStep = this.xStep * Math.tan(this.angulo);

    if (this.izquierda) this.xStep = -this.xStep;

    if ((!this.abajo && this.yStep > 0) || (this.abajo && this.yStep < 0)) {
      this.yStep = -this.yStep;
    }

    var siguienteXVertical = this.xIntercept;
    var siguienteYVertical = this.yIntercept;

    if (this.izquierda) siguienteXVertical--;

    while (!choqueVertical && (siguienteXVertical >= 0 && siguienteYVertical >= 0 && siguienteXVertical < canvasAncho && siguienteYVertical < canvasAlto)) {
      var casillaX = parseInt(siguienteXVertical / tamTile);
      var casillaY = parseInt(siguienteYVertical / tamTile);

      if (this.escenario.colision(casillaX, casillaY)) {
        choqueVertical = true;
        this.wallHitXVertical = siguienteXVertical;
        this.wallHitYVertical = siguienteYVertical;
      }
      else {
        siguienteXVertical += this.xStep;
        siguienteYVertical += this.yStep;
      }
    }

    var distanciaHorizontal = 9999;
    var distanciaVertical = 9999;

    if (choqueHorizontal) {
      distanciaHorizontal = distanciaEntrePuntos(this.x, this.y, this.wallHitXHorizontal, this.wallHitYHorizontal);
    }

    if (choqueVertical) {
      distanciaVertical = distanciaEntrePuntos(this.x, this.y, this.wallHitXVertical, this.wallHitYVertical);
    }

    if (distanciaHorizontal < distanciaVertical) {
      this.wallHitX = this.wallHitXHorizontal;
      this.wallHitY = this.wallHitYHorizontal;
      this.distencia = distanciaHorizontal;

      var casilla = parseInt(this.wallHitX / tamTile);
      this.pixelTextura = this.wallHitX - (casilla * tamTile);
    }
    else {
      this.wallHitX = this.wallHitXVertical;
      this.wallHitY = this.wallHitYVertical;
      this.distencia = distanciaVertical;

      var casilla = parseInt(this.wallHitY / tamTile);
      this.pixelTextura = this.wallHitY - (casilla * tamTile);


    }
    this.idTextura = this.escenario.tile(this.wallHitX, this.wallHitY);
    this.distencia = this.distencia * Math.cos(this.anguloJugador - this.angulo);
  }

  renderPared() {
    this.cast();
    var altoTile = 500;
    var distenciaPlanoProyeccion = (canvasAncho / 2) / Math.tan(medioFOV);
    var alturaMuro = (altoTile / this.distencia) * distenciaPlanoProyeccion;

    var y0 = parseInt(canvasAlto / 2) - parseInt(alturaMuro / 2);
    var y1 = y0 + alturaMuro;
    var x = this.columna;

    var altoTextura = 64;
    var alturaImagen = y0 - y1;

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(tiles,
      this.pixelTextura,
      (this.idTextura - 1) * altoTextura,
      1,
      64,
      this.columna,
      y1,
      1,
      alturaImagen);
    // this.ctx.beginPath();
    // this.ctx.moveTo(x, y0);
    // this.ctx.lineTo(x,y1);
    // this.ctx.strokeStyle="grey";
    // this.ctx.stroke();
  }
  // dibuja() {
  //   this.cast();
  //   var xDestino = this.wallHitX;
  //   var yDestino = this.wallHitY;

  //   this.ctx.beginPath();
  //   this.ctx.moveTo(this.x, this.y);
  //   this.ctx.lineTo(xDestino, yDestino);
  //   this.ctx.strokeStyle = 'red';
  //   this.ctx.stroke();
  // }
}


class Level {
  constructor(can, con, arr) {
    this.canvas = can;
    this.ctx = con;
    this.matriz = arr;

    this.altoM = this.matriz.length;
    this.anchoM = this.matriz[0].length;

    this.altoC = this.canvas.height;
    this.anchoC = this.canvas.width;

    this.altoT = parseInt(this.altoC / this.altoM);
    this.anchoT = parseInt(this.anchoC / this.anchoM);
  }
  colision(x, y) {
    var choca = false
    if (this.matriz[y][x] != 0) choca = true;
    return choca;
  }
  tile(x, y) {
    var casillaX = parseInt(x / this.anchoT);
    var casillaY = parseInt(y / this.altoT);
    return (this.matriz[casillaY][casillaX]);
  }
  // dibuja() {
  //   var color;
  //   for (var y = 0; y < this.altoM; y++) {
  //     for (var x = 0; x < this.anchoM; x++) {
  //       this.matriz[y][x] == 1 ? color = paredColor : color = sueloColor;
  //       this.ctx.fillStyle = color;
  //       this.ctx.fillRect(x * this.anchoT, y * this.altoT, this.anchoT, this.altoT)
  //     }
  //   }
  // }
}

class Player {
  constructor(con, escenario, x, y) {
    this.ctx = con;
    this.escenario = escenario;
    this.x = x;
    this.y = y;
    this.avanza = 0;
    this.gira = 0;
    this.anguloRotacion = 0;
    this.velMovimiento = 3;
    this.velGiro = 3 * (Math.PI / 180);

    this.numRayos = 500;		//Cantidad de rayos que vamos a castear (los mismos que tenga el ancho del canvas)
    this.rayos = [];					//Array con todos los rayos


    //CALCULAMOS EL ANGULO DE LOS RAYOS

    var incrementoAngulo = convierteRadianes(FOV / this.numRayos);
    var anguloInicial = convierteRadianes(this.anguloRotacion - medioFOV);

    var anguloRayo = anguloInicial;

    //CREAMOS RAYOS
    for (let i = 0; i < this.numRayos; i++) {
      this.rayos[i] = new Rayo(this.ctx, this.escenario, this.x, this.y, this.anguloRotacion, anguloRayo, i);
      anguloRayo += incrementoAngulo;
    }
  }
  arriba() {
    this.avanza = 1;
  }
  abajo() {
    this.avanza = -1;
  }
  derecha() {
    this.gira = 1;
  }
  izquierda() {
    this.gira = -1;
  }
  avanzaSuelta() {
    this.avanza = 0;
  }
  giraSuelta() {
    this.gira = 0;
  }
  colision(x, y) {
    var choca = false;
    var casillaX = parseInt(x / this.escenario.anchoT);
    var casillaY = parseInt(y / this.escenario.altoT);

    if (this.escenario.colision(casillaX, casillaY)) choca = true;
    return choca;
  }
  actualiza() {
    var nuevaX = this.x + this.avanza * Math.cos(this.anguloRotacion) * this.velMovimiento;
    var nuevaY = this.y + this.avanza * Math.sin(this.anguloRotacion) * this.velMovimiento;

    if (!this.colision(nuevaX, nuevaY)) {
      this.x = nuevaX;
      this.y = nuevaY;
    }

    this.anguloRotacion += this.gira * this.velGiro;
    this.anguloRotacion = normalizaAngulo(this.anguloRotacion);
    for (let i = 0; i < this.numRayos; i++) {
      this.rayos[i].x = this.x;
      this.rayos[i].y = this.y;
      this.rayos[i].setAngulo(this.anguloRotacion);
    }
  }
  dibuja() {
    this.actualiza();
    for (let i = 0; i < this.numRayos; i++) {
      // this.rayos[i].dibuja();
      this.rayos[i].renderPared();
    }

    // this.ctx.fillStyle = jugadorColor;
    // this.ctx.fillRect(this.x - 3, this.y - 3, 6, 6);

  }
}

function principal() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //escenario.dibuja();
  sueloTecho();
  jugador.dibuja();
}

init();