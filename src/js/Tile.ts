export default abstract class Tile {
	occupied = false;

	constructor(width: number, height: number) {}

	abstract render = (
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		size: { width: number; height: number },
		offset: { x: number; y: number }
	) => {};

	setOccupied = (bool = true) => {
		this.occupied = bool;
	};
}
