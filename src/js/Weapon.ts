import Projectile from './Projectile';

export default class Weapon {
	projectile: Projectile;
	fireRatePS = 4;
	elapsedTime = 0;
	lastFire: number;
	range = 3;
	direction = 0;

	constructor(public x: number, public y: number, public radius: number) {}

	fire = (position: { x: number; y: number }) => {};

	render = (
		ctx: CanvasRenderingContext2D,
		offset: { x: number; y: number }
	) => {
		ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
		ctx.beginPath();
		ctx.arc(
			this.x + offset.x,
			this.y + offset.y,
			this.radius + this.range * 32,
			0,
			2 * Math.PI
		);
		ctx.fill();

		ctx.fillStyle = 'rgb(255, 255, 0)';
		ctx.beginPath();
		ctx.arc(
			this.x + offset.x,
			this.y + offset.y,
			this.radius,
			0,
			2 * Math.PI
		);
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(this.x + offset.x, this.y + offset.y);
		ctx.lineTo(
			this.x + offset.x + this.radius * 1.5 * Math.sin(this.direction),
			this.y + offset.y + this.radius * 1.5 * -Math.cos(this.direction)
		);
		ctx.stroke();
	};
	update = (delta: number) => {};
}
