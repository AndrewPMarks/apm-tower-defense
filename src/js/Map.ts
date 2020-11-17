import BlankTile from './BlankTile';
import Tile from './Tile';
import PathTile from './PathTile';
import LandTile from './LandTile';
import WaterTile from './WaterTile';
import PathNode from './PathNode';
import Path from './Path';

export default class Map {
	tiles: Tile[];
	path = new Path();

	constructor(
		public width: number,
		public height: number,
		public tileSize = {
			width: 32,
			height: 32,
		}
	) {
		this.tiles = new Array(width * height).fill(
			new BlankTile(this.tileSize.width, this.tileSize.height)
		);
	}

	importMap = (mapObject: {
		width: number;
		height: number;
		path: number[][];
		data: string;
	}) => {
		let mapData = mapObject.data.replace(/\s+/g, '');

		for (let i = 0; i < mapData.length; i++) {
			let char = mapData[i];
			switch (char) {
				case 'W':
					this.setTimeRaw(
						i,
						new WaterTile(
							this.tileSize.width,
							this.tileSize.height,
							i
						)
					);
					break;
				case 'L':
					this.setTimeRaw(
						i,
						new LandTile(
							this.tileSize.width,
							this.tileSize.height,
							i
						)
					);
					break;
			}
		}

		let pathTile = new PathTile(this.tileSize.width, this.tileSize.height);
		for (let pathNode of mapObject.path) {
			this.setTile(pathNode[0], pathNode[1], pathTile);
		}
	};

	setTimeRaw = (index: number, tile: Tile) => {
		this.tiles[index] = tile;
	};

	setTile = (x: number, y: number, tile: Tile) => {
		if (tile instanceof PathTile) this.path.nodes.push(new PathNode(x, y));
		this.tiles[y * this.width + x] = tile;
	};

	getTile = (x: number, y: number) => {
		return this.tiles[y * this.width + x];
	};
}
