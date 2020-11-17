import '../scss/main.scss';
import TD from './TD';
import Map from './Map';
import PathTile from './PathTile';
import PlaceableTile from './LandTile';
import Enemy from './Enemy';

import firstMap from './maps/first';
import secondMap from './maps/second';

window.onload = () => {
	const game = new TD(
		document.getElementById('game') as HTMLCanvasElement,
		{
			fillScreen: true,
		},
		{
			fps: document.getElementById('fps'),
			frameCount: document.getElementById('frame-count'),
			lives: document.getElementById('lives'),
		}
	);

	let map = new Map(secondMap.width, secondMap.height);
	map.importMap(secondMap);

	game.start();
	game.loadMap(map);

	window.onkeypress = (e: KeyboardEvent) => {
		switch (e.code) {
			case 'Space':
				game.createEnemy(new Enemy(10, 15, game.map, 1));
				break;
		}
	};
};
