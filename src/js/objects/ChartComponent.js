import { makeSVGGroup } from '../utils/draw';

export class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		initData,

		// called on update
		setData,
		preMake,
		make,
		postMake,
		animate
	}) {
		this.layerClass = layerClass;
		this.layerTransform = layerTransform;

		this.initData = initData;
		this.setData = setData;

		this.preMake = preMake;
		this.make = make;
		this.postMake = postMake;

		this.animate = animate;

		this.layer = undefined;
		this.store = [];
	}

	refresh(state, args) {
		this.meta = Object.assign((this.meta || {}), args);
		this.state = state;
	}


	render() {
		this.data = this.setData(); // The only without this function?

		this.preMake && this.preMake();
		this.store = this.make();

		this.layer.textContent = '';
		this.store.forEach(element => {
			this.layer.appendChild(element);
		});

		this.postMake && this.postMake();
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
