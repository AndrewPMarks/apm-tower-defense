import Map from './Map';
import randomcolor from 'randomcolor';

export default class Enemy {
	x: number;
	y: number;
	color: string;
	radius = 10;
	distance = 0;
	dead = false;
	survived = false;

	constructor(
		public health: number,
		public speed: number,
		public map: Map,
		colorSeed: number
	) {
		this.x =
			map.path.nodes[0].x * map.tileSize.width + map.tileSize.width / 2;
		this.y =
			map.path.nodes[0].y * map.tileSize.height + map.tileSize.height / 2;

		this.color = randomcolor({
			seed: colorSeed,
			hue: 'red',
			luminosity: 'bright',
		});
	}

	getLivesValue = () => {
		return this.health;
	};

	survive = () => {
		this.survived = true;
	};

	kill = () => {
		this.dead = true;
	};

	update = (delta: number) => {
		this.distance += this.speed * delta;
		let newPos = this.map.path.getPositionAlongPath(
			this.distance,
			this.map
		);

		if (newPos) {
			this.x = newPos.x;
			this.y = newPos.y;
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
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(
				this.x + offset.x,
				this.y + offset.y,
				this.radius,
				0,
				2 * Math.PI
			);
			ctx.fill();
		}
	};
}
