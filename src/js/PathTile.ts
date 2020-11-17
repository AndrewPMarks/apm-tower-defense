import Tile from './Tile';
import { loadImage } from 'canvas';
import path from '../images/path.jpg';

export default class PathTile extends Tile {
	image: CanvasImageSource;

	constructor(public width: number, public height: number) {
		super(width, height);

		loadImage(path).then((image) => {
			//TS does not allow assignment of Image type to
			//CanvasImageSource type, but it functions correctly
			// @ts-ignore
			this.image = <CanvasImageSource>image;
		});
	}

	render = (
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		size: { width: number; height: number },
		offset: { x: number; y: number }
	) => {
		if (this.image) {
			ctx.drawImage(
				this.image,
				x + offset.x,
				y + offset.y,
				size.width,
				size.height
			);
		}
	};
}
