import '../scss/main.scss';
import TD from './TD';
import Map from './Map';
import Enemy from './Enemy';

window.onload = () => {
	const game = new TD(
		document.getElementById('game') as HTMLCanvasElement,
		{
			fillScreen: true,
		},
		{
			gameControls: document.getElementById('game-controls'),
			towerOverlay: document.getElementById('tower-overlay'),
			fps: document.getElementById('fps'),
			lives: document.getElementById('lives'),
			enemyCount: document.getElementById('enemy-count'),
			moneyCount: document.getElementById('money'),
			speed: document.getElementById('speed'),
		}
	);

	let map = new Map();

	game.start();
	game.loadMap(map);

	window.onkeydown = (e: KeyboardEvent) => {
		switch (e.code) {
			case 'Digit1':
				game.createEnemy(new Enemy(1, game.map, game));
				break;

			case 'Digit2':
				game.createEnemy(new Enemy(2, game.map, game));
				break;

			case 'Digit3':
				game.createEnemy(new Enemy(3, game.map, game));
				break;

			case 'Digit4':
				game.createEnemy(new Enemy(4, game.map, game));
				break;

			case 'Digit5':
				game.createEnemy(new Enemy(5, game.map, game));
				break;

			case 'Digit6':
				game.createEnemy(new Enemy(6, game.map, game));
				break;

			case 'KeyP':
				game.placeTower = true;
				break;

			case 'Escape':
				game.placeTower = false;
				game.clear();
				break;

			case 'ArrowRight':
				game.increaseSpeed();
				break;

			case 'ArrowLeft':
				game.decreaseSpeed();
				break;

			default:
				console.log(e.code);
				break;
		}
	};
};
