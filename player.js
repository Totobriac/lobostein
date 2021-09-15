import { normalizaAngulo } from "./functions.js"

var jugadorColor = "red";

class Player {
  constructor(con, escenario, x, y, rayo) {
    this.ctx = con;
    this.escenario = escenario;
    this.x = x;
    this.y = y;
    this.avanza = 0;
    this.gira = 0;
    this.anguloRotacion = 0;
    this.velMovimiento = 3;
    this.velGiro = 3 * (Math.PI / 180);

    this.rayo = rayo;
    this.rayo.cast();
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
    this.rayo.setAngulo(this.anguloRotacion);
    this.rayo.x = this.x;
    this.rayo.y = this.y;
  }
  dibuja() {
    this.actualiza();
    this.rayo.dibuja();
    this.ctx.fillStyle = jugadorColor;
    this.ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
  }
}

export default Player;