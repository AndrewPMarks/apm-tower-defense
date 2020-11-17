import Tile from './Tile';

export default class BlankTile extends Tile {
	constructor(public width: number, public height: number) {
		super(width, height);
	}

	render = (
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		size: { width: number; height: number },
		offset: { x: number; y: number }
	) => {
		if (x % (2 * size.width) === 0) {
			ctx.fillStyle = y % (2 * size.height) === 0 ? '#f0f0f0' : '#d0d0d0';
		} else {
			ctx.fillStyle = y % (2 * size.height) === 0 ? '#d0d0d0' : '#f0f0f0';
		}
		ctx.fillRect(x + offset.x, y + offset.y, size.width, size.height);
	};
}
