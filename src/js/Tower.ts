import Enemy from './Enemy';
import Projectile from './Projectile';

export default class Tower {
	projectile: Projectile;
	fireRatePS = 2;
	lastFire = 0;
	direction = Math.PI * 2 * Math.random();
	selected = false;
	damageDone = 0;
	baseCost = 120;
	range = 3;
	pos = {
		x: 0,
		y: 0,
	};
	targetingMode = 'first';
	age = 0;
	currentTarget: Enemy;
	currentLevel = 0;
	maxLevel: number;

	levels = [
		{
			fireRatePS: 2,
			projectileDamage: 1,
			cost: 0,
			range: 3,
		},
		{
			fireRatePS: 3,
			projectileDamage: 1,
			cost: 80,
			range: 3,
		},
		{
			fireRatePS: 4,
			projectileDamage: 1,
			cost: 100,
			range: 3,
		},
		{
			fireRatePS: 4,
			projectileDamage: 2,
			cost: 120,
			range: 4,
		},
		{
			fireRatePS: 4,
			projectileDamage: 4,
			cost: 200,
			range: 4,
		},
		{
			fireRatePS: 8,
			projectileDamage: 4,
			cost: 400,
			range: 5,
		},
		{
			fireRatePS: 12,
			projectileDamage: 5,
			cost: 1000,
			range: 6,
		},
	];

	constructor(
		public x: number,
		public y: number,
		public radius: number,
		public tileSize: number,
		public tileX: number,
		public tileY: number
	) {
		this.projectile = new Projectile(1);
		this.maxLevel = this.levels.length - 1;
	}

	upgrade = () => {
		let cost = this.getUpgradeCost();
		if (cost) {
			this.currentLevel++;
			this.projectile = new Projectile(
				this.levels[this.currentLevel].projectileDamage
			);
			this.fireRatePS = this.levels[this.currentLevel].fireRatePS;
			this.range = this.levels[this.currentLevel].range;
		} else {
			return false;
		}
	};

	getUpgradeCost = () => {
		if (this.currentLevel < this.maxLevel) {
			return this.levels[this.currentLevel + 1].cost;
		} else {
			return false;
		}
	};

	select = () => {
		this.selected = true;
	};

	deSelect = () => {
		this.selected = false;
	};

	fire = (enemies: Enemy[], offset: { x: number; y: number }) => {
		let targetX = this.currentTarget.x + offset.x;
		let targetY = this.currentTarget.y + offset.y;

		let currX = this.x + offset.x;
		let currY = this.y + offset.y;

		enemies = enemies.sort((a, b) => {
			let da = this.getDistanceToEnemy(a);
			let db = this.getDistanceToEnemy(b);

			return da - db;
		});

		for (let enemy of enemies) {
			let qx = enemy.x + offset.x;
			let qy = enemy.y + offset.y;
			if (
				this.enemyIsHit(enemy, currX, currY, targetX, targetY, qx, qy)
			) {
				let damageDealt = enemy.damage(this.projectile.damage);
				this.damageDone += damageDealt;
				return;
			}
		}
	};

	enemyIsHit = (
		enemy: Enemy,
		cx: number,
		cy: number,
		tx: number,
		ty: number,
		qx: number,
		qy: number
	) => {
		//Enemies are sorted by distance, and the tower is aiming at the
		//nearest enemy. The tower only fires if an enemy is in range
		//therefore the first enemy is the correct target to hit
		if (this.targetingMode === 'nearest') return true;

		//	targetingMode 'first':
		//if the position of the target and enemy we are checking are equal
		//they are the same thing, and since they are checked in order of
		//distance, we hit the target without further checks
		if (tx === qx && ty === qy) return true;

		//Check for intersection
		let qh = qy - cy;
		let qw = qx - cx;
		let dq = Math.sqrt(qh * qh + qw * qw);

		let th = ty - cy;
		let tw = tx - cx;
		let dt = Math.sqrt(th * th + tw * tw);

		let qth = qy - ty;
		let qtw = qx - tx;
		let dqt = Math.sqrt(qth * qth + qtw * qtw);

		let theta = Math.acos((dq * dq + dt * dt - dqt * dqt) / (2 * dq * dt));

		if (dq * Math.sin(theta) <= enemy.getRadius()) return true;
	};

	render = (
		ctx: CanvasRenderingContext2D,
		offset: { x: number; y: number }
	) => {
		if (this.selected) {
			ctx.fillStyle = `#A0522D44`;
			ctx.lineWidth = 2;
			ctx.strokeStyle = `#A0522D66`;
			ctx.beginPath();
			ctx.arc(
				this.x + offset.x,
				this.y + offset.y,
				this.radius + this.range * this.tileSize,
				0,
				2 * Math.PI
			);
			ctx.stroke();
			ctx.fill();
		}

		ctx.lineWidth = this.targetingMode == 'first' ? 2 : 5;
		ctx.fillStyle = '#A0522D';
		ctx.beginPath();
		ctx.arc(
			this.x + offset.x,
			this.y + offset.y,
			this.radius,
			0,
			2 * Math.PI
		);
		ctx.fill();

		ctx.strokeStyle = '#aaa9ad';
		ctx.beginPath();
		ctx.moveTo(this.x + offset.x, this.y + offset.y);
		let multiplier = this.targetingMode == 'first' ? 2 : 1.3;
		ctx.lineTo(
			this.x +
				offset.x +
				this.radius * Math.cos(this.direction) * multiplier,
			this.y +
				offset.y +
				this.radius * Math.sin(this.direction) * multiplier
		);
		ctx.stroke();
	};

	getDistanceToEnemy = (enemy: Enemy) => {
		let dx = this.x - enemy.x;
		let dy = this.y - enemy.y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	findEnemy = (enemies: Enemy[], offset: { x: number; y: number }) => {
		let targets: {
			enemy: Enemy;
			distance: number;
		}[] = [];

		if (enemies.length > 0) {
			switch (this.targetingMode) {
				case 'first':
					for (let index in enemies) {
						let enemy = enemies[index];
						let distance = this.getDistanceToEnemy(enemy);
						if (distance < this.radius + this.range * this.tileSize)
							targets.push({
								enemy,
								distance: 0,
							});
					}
					if (targets.length > 0) {
						this.aimAt(
							targets[0].enemy.x + offset.x,
							targets[0].enemy.y + offset.y
						);
					}
					break;
				case 'nearest':
					for (let index in enemies) {
						let enemy = enemies[index];
						let distance = this.getDistanceToEnemy(enemy);
						if (distance < this.radius + this.range * this.tileSize)
							targets.push({
								enemy,
								distance,
							});
					}

					targets = targets.sort(function (a, b) {
						return a.distance - b.distance;
					});

					if (targets.length > 0)
						this.aimAt(
							targets[0].enemy.x + offset.x,
							targets[0].enemy.y + offset.y
						);

					break;
			}
		}

		if (targets.length > 0) {
			this.currentTarget = targets[0].enemy;
		}

		return targets;
	};

	aimAt = (x: number, y: number) => {
		this.direction = Math.atan2(y - this.pos.y, x - this.pos.x);
	};

	update = (
		delta: number,
		offset: { x: number; y: number },
		mouse: { x: number; y: number },
		enemies: Enemy[]
	) => {
		this.age += delta;

		this.pos = {
			x: this.x + offset.x,
			y: this.y + offset.y,
		};

		let targets = this.findEnemy(enemies, offset);
		if (
			targets.length > 0 &&
			this.age >= this.lastFire + 10 / this.fireRatePS
		) {
			this.fire(enemies, offset);
			this.lastFire = this.age;
		}
	};
}
