import { makeSVGGroup } from '../utils/draw';

export class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		preMake,
		make,
		postMake,
		animate
	}) {
		this.layerClass = layerClass;
		this.layerTransform = layerTransform;

		this.preMake = preMake;
		this.make = make;
		this.postMake = postMake;

		this.animate = animate;

		this.layer = undefined;
		this.store = [];
	}

	refresh(args) {}

	render() {
		this.preMake && this.preMake();
		this.store = this.make();

		this.layer.textContent = '';
		this.store.forEach(element => {
			this.layer.appendChild(element);
		});

		this.postMake && this.postMake(this.store, this.layer);
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
