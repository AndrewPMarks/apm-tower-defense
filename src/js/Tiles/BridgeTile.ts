import Tile from './Tile';
import { loadImage } from 'canvas';
import wood from '../../images/wood.png';
import randomColor from 'randomcolor';

export default class BridgeTile extends Tile {
	image: CanvasImageSource;

	constructor(
		public width: number,
		public height: number,
		public seed: number
	) {
		super(width, height);

		loadImage(wood).then((image) => {
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
		offset: { x: number; y: number },
		frameCount: number
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

		ctx.fillStyle = randomColor({
			format: 'rgba',
			hue: 'brown',
			seed: this.seed,
			alpha: 0.05,
		});
		ctx.fillRect(x + offset.x, y + offset.y, size.width, size.height);
	};
}
