import Enemy from './Enemy';
import LandTile from './Tiles/LandTile';
import Map from './Map';
import Tower from './Tower';

export default class TD {
	ctx: CanvasRenderingContext2D;
	animationFrame: number;
	state = {
		paused: true,
	};
	money = 0;
	lastTime = 0;
	frameCount = 0;
	fpsCounter = false;
	lifeCounter = false;
	enemyCounter = false;
	moneyCounter = false;
	map: Map;
	enemies: Enemy[] = [];
	lives = 100;
	towers: Tower[] = [];
	placeTower = false;
	selectedTower: Tower;

	mousePos = {
		x: 0,
		y: 0,
	};

	constructor(
		public canvas: HTMLCanvasElement,
		public config = {
			fillScreen: true,
		},
		public els: {
			towerOverlay: HTMLElement;
			fps?: HTMLElement;
			lives?: HTMLElement;
			enemyCount?: HTMLElement;
			moneyCount?: HTMLElement;
		}
	) {
		if (this.canvas == null)
			throw new Error('No canvas element specified!');

		if (this.els.fps) this.fpsCounter = true;
		if (this.els.enemyCount) this.enemyCounter = true;
		if (this.els.moneyCount) this.moneyCounter = true;
		if (this.els.lives) {
			this.lifeCounter = true;
			this.takeLives(0);
		}

		if (this.config.fillScreen === true) {
			this.sizeFill();
			window.onresize = this.sizeFill;
		}

		this.ctx = canvas.getContext('2d');

		window.onclick = this.handleClick;
		window.oncontextmenu = this.handleClick;

		window.onmousemove = this.handleMouseMove;
	}

	clear = () => {
		this.selectedTower = null;
		this.closeTowerOverlay();

		for (let tower of this.towers) {
			tower.deSelect();
		}
	};

	openTowerOverlay = () => {
		let el = this.els.towerOverlay;
		el.classList.add('visible');

		let speedEl = el.querySelector('#stat-speed');
		speedEl.innerHTML = `${this.selectedTower.fireRatePS} / second`;

		let damageEl = el.querySelector('#stat-damage');
		damageEl.innerHTML = `${this.selectedTower.projectile.damage} / shot`;

		let damageDoneEl = el.querySelector('#stat-damage-done');
		damageDoneEl.innerHTML = `${this.selectedTower.damageDone}`;

		let targetingModeEl = el.querySelector('#stat-targeting-mode');
		targetingModeEl.innerHTML = `${
			this.selectedTower.targetingMode === 'first' ? 'First' : 'Nearest'
		}`;
	};

	closeTowerOverlay = () => {
		this.els.towerOverlay.classList.remove('visible');
	};

	handleMouseMove = (e: MouseEvent) => {
		this.mousePos = {
			x: e.pageX,
			y: e.pageY,
		};
	};

	handleClick = (e: MouseEvent) => {
		e.preventDefault();

		let offset = {
			x:
				window.innerWidth / 2 -
				(this.map.width * this.map.tileSize.width) / 2 +
				this.getXOffset(),

			y:
				window.innerHeight / 2 -
				(this.map.height * this.map.tileSize.height) / 2,
		};

		let tileX = Math.floor((e.pageX - offset.x) / this.map.tileSize.width);
		let tileY = Math.floor((e.pageY - offset.y) / this.map.tileSize.height);

		let clickedTile = this.map.getTile(tileX, tileY);
		if (e.button === 0) {
			if (
				(this.els.towerOverlay.classList.contains('visible') &&
					e.pageX > 200) ||
				!this.els.towerOverlay.classList.contains('visible')
			)
				this.clear();

			if (
				clickedTile instanceof LandTile &&
				tileX >= 0 &&
				tileX < this.map.width &&
				tileY >= 0 &&
				tileY < this.map.height
			) {
				if (clickedTile.occupied) {
					this.placeTower = false;
					for (let tower of this.towers) {
						if (tower.tileX === tileX && tower.tileY === tileY) {
							this.selectedTower = tower;
							this.openTowerOverlay();
							tower.select();
						}
					}
				} else if (this.placeTower) {
					this.towers.push(
						new Tower(
							tileX * this.map.tileSize.width +
								this.map.tileSize.width / 2,
							tileY * this.map.tileSize.height +
								this.map.tileSize.width / 2,
							10,
							this.map.tileSize.width,
							tileX,
							tileY
						)
					);
					clickedTile.setOccupied(true);
				}
			}
		}
	};

	reset = () => {
		this.lives = 100;
		this.enemies = [];
		this.towers = [];
		this.clear();
		this.placeTower = false;
		this.map.clear();
		this.els.enemyCount.innerText = this.enemies.length.toString();
		this.takeLives(0);
	};

	killPlayer = () => {
		console.log('You have ran out of lives! Resetting the game...');
		this.reset();
	};

	createEnemy = (enemy: Enemy) => {
		this.enemies.push(enemy);
		if (this.enemyCounter)
			this.els.enemyCount.innerText = this.enemies.length.toString();
	};

	loadMap = (map: Map) => {
		this.map = map;
	};

	sizeFill = () => {
		let minWidth = 0;
		let minHeight = 0;

		if (this.map) {
			minWidth = this.map.tileSize.width * this.map.width + 20;
			minHeight = this.map.tileSize.height * this.map.height + 20;
		}

		this.canvas.width =
			window.innerWidth > minWidth ? window.innerWidth : minWidth;
		this.canvas.height =
			window.innerHeight > minHeight ? window.innerHeight : minHeight;
	};

	addScore = (points: number) => {
		this.money += points;
		//Causes the damage done to update with a score
		if (this.els.towerOverlay.classList.contains('visible'))
			this.openTowerOverlay();

		if (this.moneyCounter)
			this.els.moneyCount.innerText = this.money.toString();
	};

	takeLives = (lives: number) => {
		this.lives -= lives;
		if (this.lives < 0) this.lives = 0;
		if (this.lifeCounter) this.els.lives.innerText = this.lives.toString();
	};

	start = () => {
		this.state.paused = false;
		this.animationFrame = requestAnimationFrame(this.loop);
	};

	pause = () => {
		this.state.paused = true;
		cancelAnimationFrame(this.animationFrame);
	};

	loop = (time: number) => {
		let delta = this.frameCount === 0 ? 1000 / 60 : time - this.lastTime;
		this.render();
		this.update(delta * 0.01);

		if (this.fpsCounter && this.frameCount % 60 === 0)
			this.els.fps.innerText = Math.round(1000 / delta).toString();

		if (!this.state.paused) requestAnimationFrame(this.loop);
		this.lastTime = time;
	};

	getXOffset = () => {
		return this.els.towerOverlay.classList.contains('visible') ? 100 : 0;
	};

	render = () => {
		this.frameCount++;

		//Clear between draws
		this.ctx.fillStyle = 'slategrey';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		//Get tile offset to center map
		let offset = {
			x:
				window.innerWidth / 2 -
				(this.map.width * this.map.tileSize.width) / 2 +
				this.getXOffset(),
			y:
				window.innerHeight / 2 -
				(this.map.height * this.map.tileSize.height) / 2,
		};

		if (this.map) {
			//Render tiles
			for (let tileX = 0; tileX < this.map.width; tileX++) {
				for (let tileY = 0; tileY < this.map.height; tileY++) {
					let tile = this.map.getTile(tileX, tileY);
					tile.render(
						this.ctx,
						tileX * this.map.tileSize.width,
						tileY * this.map.tileSize.height,
						this.map.tileSize,
						offset,
						this.frameCount
					);
				}
			}

			//Draw towers
			for (let tower of this.towers) {
				tower.render(this.ctx, offset);
			}

			//Draw enemies
			for (let enemy of this.enemies) {
				enemy.render(this.ctx, offset);
			}

			//Place tower under cursor in placement mode
			if (this.placeTower) {
				this.ctx.fillStyle = '#A0522D66';
				this.ctx.beginPath();
				this.ctx.arc(
					this.mousePos.x,
					this.mousePos.y,
					10,
					0,
					2 * Math.PI
				);
				this.ctx.fill();
			}
		}
	};

	update = (delta: number) => {
		//
		let offset = {
			x:
				window.innerWidth / 2 -
				(this.map.width * this.map.tileSize.width) / 2,
			y:
				window.innerHeight / 2 -
				(this.map.height * this.map.tileSize.height) / 2,
		};

		//check if player is out of lives
		if (this.lives <= 0) this.killPlayer();

		//check for dead or surviving enemies
		for (let index in this.enemies) {
			if (this.enemies[index].dead) {
				this.enemies.splice(parseInt(index), 1);

				if (this.enemyCounter)
					this.els.enemyCount.innerText = this.enemies.length.toString();
			}
			if (this.enemies.length > 0) {
				if (this.enemies[index] && this.enemies[index].survived) {
					this.takeLives(this.enemies[index].getLivesValue());
					this.enemies.splice(parseInt(index), 1);

					if (this.enemyCounter)
						this.els.enemyCount.innerText = this.enemies.length.toString();
				}
			}
		}

		//update towers
		for (let tower of this.towers) {
			tower.update(delta, offset, this.mousePos, this.enemies);
		}

		//update enemies
		for (let enemy of this.enemies) {
			if (enemy) {
				enemy.update(delta);
			}
		}
	};
}
