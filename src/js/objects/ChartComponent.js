import { makeSVGGroup } from '../utils/draw';

export class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		make,
		argsKeys,
		animate
	}) {
		this.layerClass = layerClass; // 'y axis'
		this.layerTransform = layerTransform;
		this.make = make;
		this.argsKeys = argsKeys;//['yAxisPositions', 'yAxisLabels'];
		this.animate = animate;

		this.layer = undefined;
		this.store = []; //[[]]  depends on indexed
	}

	refresh(args) {
		this.chartState = args.chartState;
		this.oldChartState = args.oldChartState;
		this.intermedState = args.intermedState;

		this.chartRenderer = args.chartRenderer;
	}

	render() {
		let args = this.argsKeys.map(key => this.chartState[key]);
		args.unshift(this.chartRenderer);
		this.store = this.make(...args);

		this.layer.textContent = '';
		this.store.forEach(element => {
			this.layer.appendChild(element);
		});
	}

	setupParent(parent) {
		this.parent = parent;
	}

	makeLayer() {
		this.layer = makeSVGGroup(this.parent, this.layerClass, this.layerTransform);
	}
}

export class IndexedChartComponent extends ChartComponent {
	//
}