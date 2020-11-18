import Enemy from './Enemy';
import TD from './TD';

export default class Wave {
	age = 0;

	constructor(
		public game: TD,
		public waveData: { enemyType: number; time: number }[],
		public bonus = 40
	) {}

	update = (delta: number) => {
		this.age += 100 * delta;

		for (let index in this.waveData) {
			let { time, enemyType } = this.waveData[index];

			if (this.age >= time) {
				this.game.createEnemy(
					new Enemy(enemyType, this.game.map, this.game)
				);
				this.waveData.splice(parseInt(index), 1);
				break;
			}
		}

		if (this.waveData.length === 0) {
			this.game.waveSent = true;
		}
	};
}
