import Map from './Map';
import TD from './TD';

export default class Enemy {
	x: number;
	y: number;
	color: string;
	direction = Math.PI * 2;
	distance = 0;
	dead = false;
	survived = false;

	constructor(public health: number, public map: Map, public game: TD) {
		this.x =
			map.path.nodes[0].x * map.tileSize.width + map.tileSize.width / 2;
		this.y =
			map.path.nodes[0].y * map.tileSize.height + map.tileSize.height / 2;
	}

	getRadius = () => {
		return 8 + this.health;
	};

	getSpeed = () => {
		return this.health * 2 + 10;
	};

	getColor = () => {
		switch (this.health) {
			case 1:
				return '#FF3333';

			case 2:
				return '#3355FF';

			case 3:
				return '#55CC77';

			case 4:
				return '#FFFF55';

			case 5:
				return '#CC55CC';

			case 6:
				return '#FFAA00';

			default:
				return '#808080';
		}
	};

	damage = (damage: number) => {
		let startingHealth = this.health;
		this.health -= damage;

		let damageDealt =
			this.health < 0 ? startingHealth : startingHealth - this.health;

		this.game.addScore(damageDealt);

		if (this.health <= 0) {
			this.kill();
		}

		return damageDealt;
	};

	getLivesValue = () => {
		return this.health;
	};

	survive = () => {
		this.survived = true;
	};

	kill = () => {
		this.dead = true;
	};

	aimAt = (x: number, y: number) => {
		this.direction = Math.atan2(y - this.y, x - this.x);
	};

	update = (delta: number) => {
		this.distance += this.getSpeed() * delta;
		let posVec = this.map.path.getPositionAlongPath(
			this.distance,
			this.map
		);

		if (posVec) {
			this.x = posVec.pos.x;
			this.y = posVec.pos.y;
			this.direction = posVec.direction;
		} else {
			//Enemy has reached end of path
			this.survive();
		}
	};

	render = (
		ctx: CanvasRenderingContext2D,
		offset: { x: number; y: number }
	) => {
		if (!this.dead) {
			ctx.fillStyle = this.getColor();
			ctx.beginPath();
			ctx.arc(
				this.x + offset.x,
				this.y + offset.y,
				this.getRadius(),
				0,
				2 * Math.PI
			);
			ctx.fill();
		}
	};
}
