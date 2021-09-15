import { distanciaEntrePuntos, normalizaAngulo } from "./functions.js"

var tamTile = 50;
var canvasAncho = 500;
var canvasAlto = 500;

class Rayo {
  constructor(con, escenario, x, y, anguloJugador, incrementoAngulo, columna) {
    this.ctx = con;
    this.escenario = escenario;
    this.x = x;
    this.y = y;
    this.angulo = anguloJugador;
    this.incrementoAngulo = incrementoAngulo;
    this.columna = columna;
    this.wallHitX = 0;
    this.wallHitY = 0;

    this.wallHitXHorizontal = 0;
    this.wallHitYHorizontal = 0;

    this.wallHitXVertical = 0;
    this.wallHitYVertical = 0;
  }
  setAngulo(angulo) {
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
    }
    else {
      this.wallHitX = this.wallHitXVertical;
      this.wallHitY = this.wallHitYVertical;
    }

  }
  dibuja() {
    this.cast();
    var xDestino = this.wallHitX;
    var yDestino = this.wallHitY;

    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.lineTo(xDestino, yDestino);
    this.ctx.strokeStyle = 'red';
    this.ctx.stroke();
  }
}

export default Rayo;