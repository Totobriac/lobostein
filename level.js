var paredColor = "black";
var sueloColor = "grey";

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
  dibuja() {
    var color;
    for (var y = 0; y < this.altoM; y++) {
      for (var x = 0; x < this.anchoM; x++) {
        this.matriz[y][x] == 1 ? color = paredColor : color = sueloColor;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.anchoT, y * this.altoT, this.anchoT, this.altoT)
      }
    }
  }
}

export default Level;