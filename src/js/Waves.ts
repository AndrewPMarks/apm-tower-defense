import Enemy from './Enemy';
import TD from './TD';
import Wave from './Wave';

export default class Waves {
	waves: Wave[];
	baseDelay = 100;

	constructor(public game: TD) {
		this.waves = [
			this.getWave(this.count(1, 5, 750)),
			this.getWave(this.count(1, 10, 500)),
			this.getWave(this.count(2, 10, 600)),
			this.getWave(
				this.sequenceCount([
					[1, 10, 500],
					[2, 6, 500],
				])
			),
			this.getWave(this.count(3, 5, 500)),
			this.getWave(this.count(3, 10, 500)),
			this.getWave(
				this.sequenceCount([
					[4, 1, 200],
					[3, 10, 400, 0],
				])
			),
			this.getWave(this.count(5, 10, 200)),
			this.getWave(this.count(6, 10, 400)),
			this.getWave(this.count(10, 10, 750)),
		];
	}

	getWave = (fn: { enemyType: number; time: number }[], bonus?: number) => {
		return new Wave(this.game, fn, bonus);
	};

	sequenceCount = (counts: number[][]) => {
		let ret: { enemyType: number; time: number }[] = [];

		let countDelay = 0;
		for (let count of counts) {
			for (let i = 0; i < count[1]; i++) {
				ret.push({
					enemyType: count[0],
					time: i * count[2] + this.baseDelay + countDelay,
				});
			}
			//Delay the next count in sequence
			countDelay =
				count[1] +
				(count.length > 3 ? 0 : 1) * count[2] +
				(count.length > 3 ? count[3] : 0);
		}

		return ret;
	};

	count = (level: number, count: number, delay: number, offset = 0) => {
		let ret: { enemyType: number; time: number }[] = [];

		for (let i = 0; i < count; i++) {
			ret.push({
				enemyType: level,
				time: i * delay + this.baseDelay + offset,
			});
		}
		return ret;
	};
}
