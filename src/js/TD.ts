import Enemy from './Enemy';
import LandTile from './Tiles/LandTile';
import Map from './Map';
import Tower from './Tower';
import Wave from './Wave';
import Waves from './Waves';

export default class TD {
	ctx: CanvasRenderingContext2D;
	animationFrame: number;
	state = {
		paused: true,
	};
	speed = 1;
	startingLives = 100;
	startingMoney = 250;
	lastTime = 0;
	frameCount = 0;
	fpsCounter = false;
	lifeCounter = false;
	enemyCounter = false;
	moneyCounter = false;
	speedDisplay = false;
	waveSent = false;
	map: Map;
	enemies: Enemy[] = [];
	lives: number;
	towers: Tower[] = [];
	placeTower = false;
	selectedTower: Tower;
	money: number;
	wave: Wave;
	currentWave: number = 0;
	waves: Waves;
	autoPlay = false;
	nextLevelReady = true;

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
			gameControls: HTMLElement;
			fps?: HTMLElement;
			lives?: HTMLElement;
			enemyCount?: HTMLElement;
			moneyCount?: HTMLElement;
			speed?: HTMLElement;
			victoryOverlay: HTMLElement;
		}
	) {
		if (this.canvas == null)
			throw new Error('No canvas element specified!');

		this.money = this.startingMoney;
		this.lives = this.startingLives;

		if (this.els.fps) this.fpsCounter = true;
		if (this.els.enemyCount) this.enemyCounter = true;
		if (this.els.moneyCount) {
			this.moneyCounter = true;
			this.updateBalance();
		}
		if (this.els.speed) this.speedDisplay = true;
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

		this.waves = new Waves(this);
	}

	startWave = (wave: number) => {
		this.enemies = [];
		this.waveSent = false;
		this.wave = this.waves.waves[this.currentWave];
		document.getElementById('wave').innerText = (
			this.currentWave + 1
		).toString();
		this.nextLevelReady = false;
		(document.querySelector(
			'#start-button'
		) as HTMLSelectElement).disabled = true;
		if (this.autoPlay) {
			let startButton = this.els.gameControls.querySelector(
				'#start-button'
			) as HTMLSelectElement;

			startButton.disabled = true;
		}
	};

	updateBalance = () => {
		this.els.moneyCount.innerText = `${this.money}`;

		let upgradeButton = document.querySelector(
			'#upgrade-button'
		) as HTMLSelectElement;
		if (this.selectedTower)
			upgradeButton.disabled =
				this.money < this.selectedTower.getUpgradeCost();
	};

	clear = () => {
		this.selectedTower = null;
		this.closeTowerOverlay();

		for (let tower of this.towers) {
			tower.deSelect();
		}
	};

	increaseSpeed = () => {
		if (this.speed < 3) this.setSpeed(this.speed + 1);
	};

	decreaseSpeed = () => {
		if (this.speed > 1) this.setSpeed(this.speed - 1);
	};

	setSpeed = (multiplier: number) => {
		this.speed = multiplier;
		if (this.speedDisplay) this.els.speed.innerText = `${this.speed}x`;
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

		let rangeEl = el.querySelector('#stat-range');
		rangeEl.innerHTML = `${this.selectedTower.range} tiles`;

		let penetrationEl = el.querySelector('#stat-penetration');
		penetrationEl.innerHTML = `${this.selectedTower.projectile.penetration} enemies`;

		let targetingModeButtonEl = el.querySelector(
			'#stat-targeting-mode'
		) as HTMLSelectElement;
		targetingModeButtonEl.innerHTML = `${
			this.selectedTower.targetingMode === 'first' ? 'First' : 'Nearest'
		}`;
		targetingModeButtonEl.onclick = (e) => {
			let el = e.target as HTMLSelectElement;
			this.selectedTower.targetingMode =
				this.selectedTower.targetingMode === 'first'
					? 'nearest'
					: 'first';
			this.openTowerOverlay();
		};

		let upgradeButtonEl = el.querySelector(
			'#upgrade-button'
		) as HTMLSelectElement;
		let cost = this.selectedTower.getUpgradeCost();
		upgradeButtonEl.innerHTML = cost ? `$${cost.toString()}` : 'MAX';
		upgradeButtonEl.disabled = cost ? this.money < cost : false;

		upgradeButtonEl.onclick = (e) => {
			let el = e.target as HTMLSelectElement;
			let cost = this.selectedTower.getUpgradeCost();
			if (cost && this.money >= cost) {
				this.selectedTower.upgrade();
				this.money -= cost;
				this.openTowerOverlay();
			}
			this.updateBalance();
		};
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
					let tower = new Tower(
						tileX * this.map.tileSize.width +
							this.map.tileSize.width / 2,
						tileY * this.map.tileSize.height +
							this.map.tileSize.width / 2,
						this.map.tileSize.width,
						tileX,
						tileY
					);

					if (this.money >= tower.baseCost) {
						this.towers.push(tower);
						this.money -= tower.baseCost;
						this.updateBalance();
						clickedTile.setOccupied(true);
					}
				}
			}
		}
	};

	reset = () => {
		this.autoPlay = false;
		this.nextLevelReady = true;
		(document.querySelector(
			'#start-button'
		) as HTMLSelectElement).disabled = false;
		document.querySelector('#wave').innerHTML = '1';
		this.lives = this.startingLives;
		this.enemies = [];
		this.towers = [];
		this.money = this.startingMoney;
		this.waves = new Waves(this);
		this.currentWave = 0;
		this.wave = null;
		this.updateBalance();
		this.clear();
		this.placeTower = false;
		this.map.clear();
		this.els.enemyCount.innerText = this.enemies.length.toString();
		this.takeLives(0);
		this.els.victoryOverlay.classList.remove('visible');
	};

	killPlayer = () => {
		this.reset();
	};

	createEnemy = (enemy: Enemy) => {
		this.enemies.push(enemy);
		if (this.enemyCounter)
			this.els.enemyCount.innerText = this.enemies.length.toString();
	};

	loadMap = (map: Map) => {
		this.map = map;

		let controlEl = this.els.gameControls;
		let mapSelector = controlEl.querySelector('#map-selector');
		for (let map of this.map.maps) {
			let button = document.createElement('button');
			button.innerText = map.name;
			button.classList.add('map-option', 'control-button');
			button.onclick = () => {
				this.reset();
				this.map.importMap(map);
			};
			mapSelector.appendChild(button);
		}

		let generalControls = controlEl.querySelector('#general-controls');

		let startButton = document.createElement('button');
		startButton.innerText = 'Play';
		startButton.id = 'start-button';
		startButton.classList.add('control-button');
		startButton.onclick = () => {
			if (!this.autoPlay && this.nextLevelReady) {
				this.startWave(this.currentWave);
			}
		};

		let autoPlayButton = document.createElement('button');
		autoPlayButton.innerText = 'Enable Autoplay';
		autoPlayButton.id = 'autoplay-button';
		autoPlayButton.classList.add('control-button');
		autoPlayButton.onclick = () => {
			this.autoPlay = !this.autoPlay;
			autoPlayButton.innerText = this.autoPlay
				? 'Disable Autoplay'
				: 'Enable Autoplay';

			startButton.disabled = this.autoPlay && !this.nextLevelReady;
			if (this.autoPlay && this.nextLevelReady) {
				this.startWave(this.currentWave);
			}
		};

		let towerButton = document.createElement('button');
		towerButton.innerText = 'Place Tower';
		towerButton.classList.add('control-button');
		towerButton.onclick = () => {
			this.placeTower = !this.placeTower;
		};

		let resetButton = document.createElement('button');
		resetButton.innerText = 'Reset';
		resetButton.classList.add('control-button');
		resetButton.onclick = () => {
			this.reset();
		};

		generalControls.appendChild(startButton);
		generalControls.appendChild(autoPlayButton);
		generalControls.appendChild(towerButton);
		generalControls.appendChild(resetButton);
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
		if (this.els.towerOverlay.classList.contains('visible')) {
			this.openTowerOverlay();
		}

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
		this.update(delta * 0.01 * this.speed);

		if (this.fpsCounter && this.frameCount % 60 === 0)
			this.els.fps.innerText = Math.round(1000 / delta).toString();

		if (!this.state.paused) requestAnimationFrame(this.loop);
		this.lastTime = time;
	};

	getXOffset = () => {
		return 100;
		//return this.els.towerOverlay.classList.contains('visible') ? 100 : 0;
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
				this.ctx.fillStyle = '#40e0d0AA';
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
			enemy?.update(delta);
		}

		//update wave
		this.wave?.update(delta);

		if (
			this.enemies.length === 0 &&
			this.waveSent &&
			!this.nextLevelReady
		) {
			this.nextLevelReady = true;
			(document.querySelector(
				'#start-button'
			) as HTMLSelectElement).disabled = false;

			if (this.currentWave < this.waves.waves.length - 1) {
				this.addScore(this.wave.bonus);
				this.currentWave++;

				if (this.autoPlay && this.nextLevelReady) {
					this.startWave(this.currentWave);
				} else {
					this.nextLevelReady = true;
					(document.querySelector(
						'#start-button'
					) as HTMLSelectElement).disabled = false;
				}
			} else {
				//win =
				this.selectedTower = null;
				this.closeTowerOverlay();
				this.els.victoryOverlay?.classList.add('visible');
			}
		}
	};
}
