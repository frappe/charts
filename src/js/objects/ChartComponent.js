import { makeSVGGroup } from '../utils/draw';

export class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		make,
		animate
	}) {
		this.layerClass = layerClass; // 'y axis'
		this.layerTransform = layerTransform;
		this.make = make;
		this.animate = animate;

		this.layer = undefined;
		this.store = []; //[[]]  depends on indexed
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
		this.totalIndices = this.chartState[this.argsKeys[0]].length;
	}

	makeLayer() {
		super.makeLayer();
		this.layers = [];
		for(var i = 0; i < this.totalIndices; i++) {
			this.layers[i] = makeSVGGroup(this.layer, this.layerClass + '-' + i);
		}
	}

	addLayer() {}

	render() {
		let datasetArrays = this.argsKeys.map(key => this.chartState[key]);

		// datasetArrays will have something like an array of X positions sets
		// datasetArrays = [
		// 		xUnitPositions, yUnitPositions, colors, unitTypes, yUnitValues
		// ]
		// where xUnitPositions = [[0,0,0], [1,1,1]]
		// i.e.: [ [[0,0,0], [1,1,1]],  ... ]
		for(var i = 0; i < this.totalIndices; i++) {
			let args = datasetArrays.map(datasetArray => datasetArray[i]);

			args.push(i);
			args.push(this.totalIndices);

			this.stores.push(this.make(...args));

			let layer = this.layers[i];
			layer.textContent = '';
			this.stores[i].forEach(element => {
				layer.appendChild(element);
			});
		}
	}
}