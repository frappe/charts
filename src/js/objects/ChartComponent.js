import { makeSVGGroup } from '../utils/draw';

export class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		make,
		animate
	}) {
		this.layerClass = layerClass;
		this.layerTransform = layerTransform;
		this.make = make;
		this.animate = animate;

		this.layer = undefined;
		this.store = [];
	}

	refresh(args) {}

	render() {
		this.store = this.make();

		this.layer.textContent = '';
		this.store.forEach(element => {
			this.layer.appendChild(element);
		});
	}

	setupParent(parent) {
		this.parent = parent;
	}

	loadAnimatedComponents() {
		this.animate(this.store);
	}

	makeLayer() {
		this.layer = makeSVGGroup(this.parent, this.layerClass, this.layerTransform);
	}
}
