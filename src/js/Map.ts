import BlankTile from './Tiles/BlankTile';
import Tile from './Tiles/Tile';
import PathTile from './Tiles/PathTile';
import LandTile from './Tiles/LandTile';
import WaterTile from './Tiles/WaterTile';
import BridgeTile from './Tiles/BridgeTile';
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
							Math.floor(Math.random() * i * 3)
						)
					);
					break;
				case 'L':
					this.setTimeRaw(
						i,
						new LandTile(
							this.tileSize.width,
							this.tileSize.height,
							Math.floor(Math.random() * i * 3)
						)
					);
					break;
			}
		}

		let pathTile = new PathTile(
			this.tileSize.width,
			this.tileSize.height,
			1
		);
		for (let index in mapObject.path) {
			let pathNode = mapObject.path[index];
			if (this.getTile(pathNode[0], pathNode[1]) instanceof LandTile) {
				pathTile = new PathTile(
					this.tileSize.width,
					this.tileSize.height,
					Math.floor(Math.random() * parseInt(index) * 3)
				);
			} else {
				pathTile = new BridgeTile(
					this.tileSize.width,
					this.tileSize.height,
					Math.floor(Math.random() * parseInt(index) * 3)
				);
			}
			this.setTile(pathNode[0], pathNode[1], pathTile);
		}
	};

	clear = () => {
		for (let tile of this.tiles) {
			tile.occupied = false;
		}
	};

	setTimeRaw = (index: number, tile: Tile) => {
		this.tiles[index] = tile;
	};

	setTile = (x: number, y: number, tile: Tile) => {
		if (tile instanceof PathTile || tile instanceof BridgeTile)
			this.path.nodes.push(new PathNode(x, y));
		this.tiles[y * this.width + x] = tile;
	};

	getTile = (x: number, y: number) => {
		return this.tiles[y * this.width + x];
	};
}
