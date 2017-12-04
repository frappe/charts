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

// Indexed according to dataset
export class IndexedChartComponent extends ChartComponent {
	constructor(args) {
		super(args);
		this.stores = [];
	}

	refresh(args) {
		super.refresh(args);
		this.indexLength = this.chartState[this.argsKeys[0]].length;
	}

	makeLayer() {
		super.makeLayer();
		this.layers = [];
		for(var i = 0; i < this.indexLength; i++) {
			this.layers[i] = makeSVGGroup(this.layer, this.layerClass + '-' + i);
		}
	}

	addLayer() {}

	render() {
		let datasetArrays = this.argsKeys.map(key => this.chartState[key]);

		// datasetArrays will have something like an array of X positions sets
		// i.e.: [ [[0,0,0], [1,1,1]],  ... ]
		for(var i = 0; i < this.indexLength; i++) {
			let args = datasetArrays.map(datasetArray => datasetArray[i]);
			args.unshift(this.chartRenderer);

			args.push(i);
			args.push(this.indexLength);

			this.stores.push(this.make(...args));

			let layer = this.layers[i];
			layer.textContent = '';
			this.stores[i].forEach(element => {
				layer.appendChild(element);
			});
		}
	}
}