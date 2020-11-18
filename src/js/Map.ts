import BlankTile from './Tiles/BlankTile';
import Tile from './Tiles/Tile';
import PathTile from './Tiles/PathTile';
import LandTile from './Tiles/LandTile';
import WaterTile from './Tiles/WaterTile';
import BridgeTile from './Tiles/BridgeTile';
import PathNode from './PathNode';
import Path from './Path';

import firstMap, { mapObject } from './maps/first';
import secondMap from './maps/second';

export default class Map {
	tiles: Tile[] = [];
	path = new Path();
	maps: mapObject[] = [firstMap, secondMap];
	width: number = 0;
	height: number = 0;
	tileSize = {
		width: 32,
		height: 32,
	};

	constructor() {
		this.importMap(this.maps[0]);
	}

	importMap = (mapObject: mapObject) => {
		let mapData = mapObject.data.replace(/\s+/g, '');
		this.path = new Path();

		this.width = mapObject.width;
		this.height = mapObject.height;

		this.tileSize = mapObject.tileSize;

		this.tiles = new Array(this.width * this.height).fill(
			new BlankTile(this.tileSize.width, this.tileSize.height)
		);

		for (let i = 0; i < mapData.length; i++) {
			let char = mapData[i];

			switch (char) {
				case 'W':
					this.setTileRaw(
						i,
						new WaterTile(
							this.tileSize.width,
							this.tileSize.height,
							Math.floor(Math.random() * i * 3)
						)
					);
					break;
				case 'L':
					this.setTileRaw(
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

	setTileRaw = (index: number, tile: Tile) => {
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
