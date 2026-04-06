/** @Module Module Terrain */

export default class Terrain {
	constructor(l, h, ctx) {
		this.length = l;
		this.height = h;
		this.ctx = ctx;
		this.cellSize = 40;
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
				// Sol du terrain : 0 (libre), 1 (rochers), 2 (pomme), 3 (collision serpent - non affiché), 4-6 (tunnels), 7 (barrières)
				if (this.sol[i][j] == 0) {
					this.ctx.fillStyle = '#CBE2B5';
				} else if (this.sol[i][j] == 1) {
					this.ctx.fillStyle = '#969696';
				} else if (this.sol[i][j] == 2) {
					this.ctx.fillStyle = '#bd2323';
				} else if (this.sol[i][j] == 4) {
					this.ctx.fillStyle = '#ffa9ff';
				} else if (this.sol[i][j] == 5) {
					this.ctx.fillStyle = '#94ffff';
				} else if (this.sol[i][j] == 6) {
					this.ctx.fillStyle = '#ffff93';
				} else if (this.sol[i][j] == 7) {
					this.ctx.fillStyle = '#A0714F';
				}
				this.ctx.fillRect(
					i * this.cellSize,
					j * this.cellSize,
					this.cellSize,
					this.cellSize,
				);
				this.ctx.strokeStyle = '#3a3a3a';
				this.ctx.lineWidth = 1;
				this.ctx.strokeRect(
					i * this.cellSize,
					j * this.cellSize,
					this.cellSize,
					this.cellSize,
				);
			}
		}
	}

	read(i, j) {
		if (i >= 0 && i < this.length && j >= 0 && j < this.height) {
			return this.sol[i][j];
		}
	}

	write(i, j, val) {
		if (i >= 0 && i < this.length && j >= 0 && j < this.height) {
			this.sol[i][j] = val;
		}
	}
}
