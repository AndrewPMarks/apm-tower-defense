import BlankTile from './BlankTile';
import Enemy from './Enemy';
import LandTile from './LandTile';
import Map from './Map';
import Weapon from './Weapon';

export default class TD {
	ctx: CanvasRenderingContext2D;
	animationFrame: number;
	state = {
		paused: true,
	};
	lastTime = 0;
	frameCount = 0;
	fpsCounter = false;
	frameCounter = false;
	lifeCounter = false;
	map: Map;
	enemies: Enemy[] = [];
	lives = 100;
	weapons: Weapon[] = [];

	constructor(
		public canvas: HTMLCanvasElement,
		public config = {
			fillScreen: true,
		},
		public els?: {
			fps?: HTMLElement;
			frameCount?: HTMLElement;
			lives?: HTMLElement;
		}
	) {
		if (this.canvas == null)
			throw new Error('No canvas element specified!');

		if (this.els.fps) this.fpsCounter = true;
		if (this.els.frameCount) this.frameCounter = true;
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
	}

	handleClick = (e: MouseEvent) => {
		e.preventDefault();

		let offset = {
			x:
				window.innerWidth / 2 -
				(this.map.width * this.map.tileSize.width) / 2,

			y:
				window.innerHeight / 2 -
				(this.map.height * this.map.tileSize.height) / 2,
		};

		let tileX = Math.floor((e.pageX - offset.x) / this.map.tileSize.width);
		let tileY = Math.floor((e.pageY - offset.y) / this.map.tileSize.height);

		let clickedTile = this.map.getTile(tileX, tileY);
		if (
			clickedTile instanceof LandTile &&
			!clickedTile.occupied &&
			tileX >= 0 &&
			tileX < this.map.width &&
			tileY >= 0 &&
			tileY < this.map.height
		) {
			if (e.button === 0) {
				this.weapons.push(
					new Weapon(
						tileX * this.map.tileSize.width +
							this.map.tileSize.width / 2,
						tileY * this.map.tileSize.height +
							this.map.tileSize.width / 2,
						10
					)
				);
				clickedTile.setOccupied(true);
			} else {
			}
		}
	};

	reset = () => {
		this.lives = 100;
		this.enemies = [];
		this.takeLives(0);
	};

	killPlayer = () => {
		alert('You have died!');
		this.reset();
	};

	createEnemy = (enemy: Enemy) => {
		this.enemies.push(enemy);
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

		if (this.frameCounter && this.frameCount % 10 === 0)
			this.els.frameCount.innerText = this.frameCount.toString();

		if (!this.state.paused) requestAnimationFrame(this.loop);
		this.lastTime = time;
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
				(this.map.width * this.map.tileSize.width) / 2,
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
						offset
					);
				}
			}

			//Draw weapons
			for (let weapon of this.weapons) {
				weapon.render(this.ctx, offset);
			}

			//Draw enemies
			for (let enemy of this.enemies) {
				enemy.render(this.ctx, offset);
			}
		}
	};

	update = (delta: number) => {
		//check if player is out of lives
		if (this.lives <= 0) this.killPlayer();

		//check for dead or surviving enemies
		for (let index in this.enemies) {
			if (this.enemies[index].dead)
				this.enemies.splice(parseInt(index), 1);

			if (this.enemies[index].survived) {
				this.takeLives(this.enemies[index].getLivesValue());
				this.enemies.splice(parseInt(index), 1);
			}
		}

		//update enemies
		for (let enemy of this.enemies) {
			if (enemy) {
				enemy.update(delta);
			}
		}
	};
}
