import { makeSVGGroup } from '../utils/draw';
import { xLine, yLine, yMarker, yRegion } from '../utils/draw';
import { equilizeNoOfElements } from '../utils/draw-utils';
import { Animator, translateHoriLine, translateVertLine, animateRegion } from '../utils/animate';

class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		parent,
		constants,
		data,

		// called on update
		preMake,
		makeElements,
		postMake,
		getData,
		animateElements
	}) {
		this.parent = parent;
		this.layerClass = layerClass;
		this.layerTransform = layerTransform;
		this.constants = constants;

		this.preMake = preMake;
		this.makeElements = makeElements;
		this.postMake = postMake;
		this.getData = getData;

		this.animateElements = animateElements;

		this.store = [];
		this.layer = makeSVGGroup(this.parent, this.layerClass, this.layerTransform);

		this.data = data;

		this.make();
	}

	refresh(data) {
		this.data = data;
	}

	make() {
		this.preMake && this.preMake();
		this.render(this.data);
		this.postMake && this.postMake();
		this.oldData = this.data;
	}

	render(data) {
		this.store = this.makeElements(data);

		this.layer.textContent = '';
		this.store.forEach(element => {
			this.layer.appendChild(element);
		});
	}

	update(animate = true) {
		let animateElements = []
		if(animate) {
			animateElements = this.animateElements(this.data);
		}
		// TODO: Can we remove this?
		setTimeout(() => {
			this.make();
		}, 1400);
		return animateElements;
	}
}

let componentConfigs = {
	yAxis: {
		layerClass: 'y axis',
		makeElements: function(data) {
			return data.positions.map((position, i) =>
				yLine(position, data.labels[i], this.constants.width,
					{mode: this.constants.mode, pos: this.constants.pos})
			);
		},

		animateElements: function(newData) {
			let newPos =  newData.positions;
			let newLabels =  newData.labels;
			let oldPos = this.oldData.positions;
			let oldLabels = this.oldData.labels;

			[oldPos, newPos] = equilizeNoOfElements(oldPos, newPos);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				positions: oldPos,
				labels: newLabels
			});

			return this.store.map((line, i) => {
				return translateHoriLine(
					line, newPos[i], oldPos[i]
				);
			});
		}
	},

	xAxis: {
		layerClass: 'x axis',
		makeElements: function(data) {
			return data.positions.map((position, i) =>
				xLine(position, data.labels[i], this.constants.height,
					{mode: this.constants.mode, pos: this.constants.pos})
			);
		},

		animateElements: function(newData) {
			let newPos =  newData.positions;
			let newLabels =  newData.labels;
			let oldPos = this.oldData.positions;
			let oldLabels = this.oldData.labels;

			[oldPos, newPos] = equilizeNoOfElements(oldPos, newPos);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				positions: oldPos,
				labels: newLabels
			});

			return this.store.map((line, i) => {
				return translateVertLine(
					line, newPos[i], oldPos[i]
				);
			});
		}
	},

	yMarkers: {
		layerClass: 'y-markers',
		makeElements: function(data) {
			return data.map(marker =>
				yMarker(marker.position, marker.label, this.constants.width,
					{pos:'right', mode: 'span', lineType: 'dashed'})
			);
		},
		animateElements: function(newData) {
			[this.oldData, newData] = equilizeNoOfElements(this.oldData, newData);

			let newPos =  newData.map(d => d.position);
			let newLabels =  newData.map(d => d.label);

			let oldPos = this.oldData.map(d => d.position);
			let oldLabels = this.oldData.map(d => d.label);

			this.render(oldPos.map((pos, i) => {
				return {
					position: oldPos[i],
					label: newLabels[i]
				}
			}));

			return this.store.map((line, i) => {
				return translateHoriLine(
					line, newPos[i], oldPos[i]
				);
			});
		}
	},

	yRegions: {
		layerClass: 'y-regions',
		makeElements: function(data) {
			return data.map(region =>
				yRegion(region.start, region.end, this.constants.width,
					region.label)
			);
		},
		animateElements: function(newData) {
			[this.oldData, newData] = equilizeNoOfElements(this.oldData, newData);

			let newPos =  newData.map(d => d.end);
			let newLabels =  newData.map(d => d.label);
			let newStarts =  newData.map(d => d.start);

			let oldPos = this.oldData.map(d => d.end);
			let oldLabels = this.oldData.map(d => d.label);
			let oldStarts = this.oldData.map(d => d.start);

			this.render(oldPos.map((pos, i) => {
				return {
					start: oldStarts[i],
					end: oldPos[i],
					label: newLabels[i]
				}
			}));

			let animateElements = [];

			this.store.map((rectGroup, i) => {
				animateElements = animateElements.concat(animateRegion(
					rectGroup, newStarts[i], newPos[i], oldPos[i]
				));
			});

			return animateElements;
		}
	},

	dataUnits: {
		//
	}
}

export function getComponent(name, parent, constants, initData, getData) {
	let config = componentConfigs[name];
	Object.assign(config, {
		parent: parent,
		constants: constants,
		data: initData,
		getData: getData
	})
	return new ChartComponent(config);
}
