import Enemy from './Enemy';
import TD from './TD';
import Wave from './Wave';

export default class Waves {
	waves: Wave[];
	baseDelay = 100;

	constructor(public game: TD) {
		this.waves = [
			//1
			this.getWave(this.count(1, 5, 750)),
			//2
			this.getWave(this.count(1, 10, 500)),
			//3
			this.getWave(this.count(2, 10, 600)),
			//4
			this.getWave(
				this.sequenceCount([
					[1, 10, 500],
					[2, 6, 500],
				])
			),
			//5
			this.getWave(this.count(3, 5, 500)),
			//6
			this.getWave(this.count(3, 10, 500)),
			//7
			this.getWave(
				this.sequenceCount([
					[4, 1, 200],
					[3, 10, 400],
				])
			),
			//8
			this.getWave(this.count(5, 5, 250)),
			//9
			this.getWave(this.count(6, 8, 400)),
			//10
			this.getWave(this.count(10, 10, 750)),
			//11
			this.getWave(this.count(15, 1, 10)),
			//12
			this.getWave(this.count(4, 60, 250)),
			//13
			this.getWave(
				this.sequenceCount([
					[15, 1, 250],
					[10, 1, 250],
					[15, 1, 250],
					[10, 1, 250],
				])
			),
		];
	}

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

	getWave = (fn: { enemyType: number; time: number }[], bonus?: number) => {
		return new Wave(this.game, fn, bonus);
	};
}
