import Tile from './Tile';
import water from '../../images/water.png';
import { loadImage } from 'canvas';
import { Perlin } from 'libnoise-ts/module/generator';

export default class WaterTile extends Tile {
	image: CanvasImageSource;
	perlin: Perlin;

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

		this.perlin = new Perlin();
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

		let blue =
			this.perlin.getValue(frameCount / 100, this.seed, 0) * 100 + 155;
		let opacity =
			this.perlin.getValue(this.seed, frameCount / 100, 0) * 0.15;
		ctx.fillStyle = `rgba(0, 0, ${blue}, ${opacity})`;

		ctx.fillRect(x + offset.x, y + offset.y, size.width, size.height);
	};
}
