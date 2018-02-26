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
		makeElements,
		postMake,
		getData,
		animateElements
	}) {
		this.parent = parent;
		this.layerTransform = layerTransform;
		this.constants = constants;

		this.makeElements = makeElements;
		this.postMake = postMake;
		this.getData = getData;

		this.animateElements = animateElements;

		this.store = [];

		layerClass = typeof(layerClass) === 'function'
			? layerClass() : layerClass;

		this.layer = makeSVGGroup(this.parent, layerClass, this.layerTransform);

		this.data = data;

		this.make();
	}

	refresh(data) {
		this.data = data || this.getData();
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
		this.refresh();
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
		makeElements(data) {
			return data.positions.map((position, i) =>
				yLine(position, data.labels[i], this.constants.width,
					{mode: this.constants.mode, pos: this.constants.pos})
			);
		},

		animateElements(newData) {
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
		makeElements(data) {
			return data.positions.map((position, i) =>
				xLine(position, data.labels[i], this.constants.height,
					{mode: this.constants.mode, pos: this.constants.pos})
			);
		},

		animateElements(newData) {
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
		makeElements(data) {
			return data.map(marker =>
				yMarker(marker.position, marker.label, this.constants.width,
					{pos:'right', mode: 'span', lineType: 'dashed'})
			);
		},
		animateElements(newData) {
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
		makeElements(data) {
			return data.map(region =>
				yRegion(region.start, region.end, this.constants.width,
					region.label)
			);
		},
		animateElements(newData) {
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

	barGraph: {
		// opt:[
		// 	'barGraph',
		// 	this.drawArea,
		// 	{
		// 		controller: barController,
		// 		index: index,
		// 		color: this.colors[index],
		// 		valuesOverPoints: this.valuesOverPoints,
		// 		stacked: this.barOptions && this.barOptions.stacked,
		// 		spaceRatio: 0.5,
		// 		minHeight: this.height * MIN_BAR_PERCENT_HEIGHT
		// 	},
		// 	{
		// 		barsWidth: this.state.unitWidth * (1 - spaceRatio),
		// 		barWidth: barsWidth/(stacked ? 1 : this.state.noOfDatasets),

		// 	},
		// 	function() {
		// 		let s = this.state;
		// 		return {
		// 			barsWidth: this.state.unitWidth * (1 - spaceRatio),
		// 			barWidth: barsWidth/(stacked ? 1 : this.state.noOfDatasets),
		// 			positions: s.xAxisPositions,
		// 			labels: s.xAxisLabels,
		// 		}
		// 	}.bind(this)
		// ],
		layerClass() { return 'y-regions' + this.constants.index; },
		makeElements(data) {
			let c = this.constants;
			return data.yPositions.map((y, j) =>
				barController.draw(
					data.xPositions[j],
					y,
					color,
					(c.valuesOverPoints ? (c.stacked ? data.cumulativeYs[j] : data.values[j]) : ''),
					j,
					y - (data.cumulativePositions ? data.cumulativePositions[j] : y)
				)
			);
		},
		postMake() {
			if((!this.constants.stacked)) {
				this.layer.setAttribute('transform',
					`translate(${unitRenderer.consts.width * index}, 0)`);
			}
		},
		animateElements(newData) {
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

	lineGraph: {

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
