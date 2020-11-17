import Tile from './Tile';
import water from '../images/water.jpg';
import { loadImage } from 'canvas';

export default class WaterTile extends Tile {
	image: CanvasImageSource;

	constructor(
		public width: number,
		public height: number,
		public seed: number
	) {
		super(width, height);
		loadImage(water).then((image) => {
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
