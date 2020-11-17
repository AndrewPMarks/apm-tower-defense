import Map from './Map';
import PathNode from './PathNode';

export default class Path {
	constructor(public nodes: PathNode[] = []) {}

	getPositionAlongPath = (distance: number, map: Map) => {
		let currentTileIndex = Math.floor(distance / map.tileSize.width);

		if (currentTileIndex >= map.path.nodes.length) return false;

		let currentTile = map.path.nodes[currentTileIndex];
		let tilePosition = distance % map.tileSize.width;
		let direction = map.path.getNodeDirection(currentTileIndex);

		let tileCenter = {
			x: currentTile.x * map.tileSize.width + map.tileSize.width / 2,
			y: currentTile.y * map.tileSize.height + map.tileSize.height / 2,
		};

		let ret = {
			x: 0,
			y: 0,
		};

		if (tilePosition < map.tileSize.width / 2) {
			switch (direction.from) {
				case 'south':
					ret.y =
						tileCenter.y - tilePosition + map.tileSize.height / 2;
					ret.x = tileCenter.x;
					break;
				case 'north':
					ret.y =
						tileCenter.y + tilePosition - map.tileSize.height / 2;
					ret.x = tileCenter.x;
					break;

				case 'east':
					ret.y = tileCenter.y;
					ret.x =
						tileCenter.x - tilePosition + map.tileSize.width / 2;
					break;

				case 'west':
					ret.y = tileCenter.y;
					ret.x =
						tileCenter.x + tilePosition - map.tileSize.width / 2;
					break;
			}
		} else {
			switch (direction.to) {
				case 'north':
					ret.y =
						tileCenter.y - tilePosition + map.tileSize.height / 2;
					ret.x = tileCenter.x;
					break;
				case 'south':
					ret.y =
						tileCenter.y + tilePosition - map.tileSize.height / 2;
					ret.x = tileCenter.x;
					break;

				case 'west':
					ret.y = tileCenter.y;
					ret.x =
						tileCenter.x - tilePosition + map.tileSize.width / 2;
					break;

				case 'east':
					ret.y = tileCenter.y;
					ret.x =
						tileCenter.x + tilePosition - map.tileSize.width / 2;
					break;
			}
		}

		return ret;
	};

	getNodeDirection = (nodeIndex: number) => {
		let node = this.nodes[nodeIndex];
		let prevNode = this.nodes[nodeIndex - 1];
		let nextNode = this.nodes[nodeIndex + 1];

		let ret: { from: string; to: string } = {
			from: null,
			to: null,
		};

		if (prevNode) {
			if (prevNode.y - node.y != 0) {
				if (prevNode.y - node.y > 0) {
					ret.from = 'south';
				} else {
					ret.from = 'north';
				}
			}
			if (prevNode.x - node.x != 0) {
				if (prevNode.x - node.x > 0) {
					ret.from = 'east';
				} else {
					ret.from = 'west';
				}
			}
		}

		if (nextNode) {
			if (nextNode.y - node.y != 0) {
				if (nextNode.y - node.y > 0) {
					ret.to = 'south';
				} else {
					ret.to = 'north';
				}
			}
			if (nextNode.x - node.x != 0) {
				if (nextNode.x - node.x > 0) {
					ret.to = 'east';
				} else {
					ret.to = 'west';
				}
			}
		}

		if (!prevNode) {
			switch (ret.to) {
				case 'south':
					ret.from = 'north';
					break;
				case 'north':
					ret.from = 'south';
					break;
				case 'east':
					ret.from = 'west';
					break;
				case 'west':
					ret.from = 'east';
					break;
			}
		}

		if (!nextNode) {
			switch (ret.from) {
				case 'south':
					ret.to = 'north';
					break;
				case 'north':
					ret.to = 'south';
					break;
				case 'east':
					ret.to = 'west';
					break;
				case 'west':
					ret.to = 'east';
					break;
			}
		}

		return ret;
	};
}
