class Terrain {
	constructor(l, h) {
		this.length = l;
		this.height = h;
		this.ctx = ctx;
		this.cellSize = 20;
		this.sol = [];
		for (let i = 0; i < this.length; i++) {
			this.sol[i] = [];
			for (let j = 0; j < this.height; j++) {
				this.sol[i][j] = 0;
			}
		}
	}

	draw() {
		// https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/fillRect -> Création du rectangle
		for (let i = 0; i < this.length; i++) {
			for (let j = 0; j < this.height; j++) {
				// Choisis une couleur selon this.sol[i][j] si besoin
				if (this.sol[i][j] == 0) {
					this.ctx.fillStyle = 'green';
				} else if (this.sol[i][j] == 1) {
					this.ctx.fillStyle = 'gray';
				} else if (this.sol[i][j] == 2) {
					this.ctx.fillStyle = 'red';
				}
				this.ctx.fillRect(
					i * this.cellSize,
					j * this.cellSize,
					this.cellSize,
					this.cellSize,
				);
			}
		}
	}

	read(i, j) {
		if (0 <= i < this.length && 0 <= j < this.height) {
			return this.sol[i][j];
		}
	}

	write(i, j, val) {
		if (i >= 0 && i < this.length && j >= 0 && j < this.height) {
			this.sol[i][j] = val;
		}
	}
}
