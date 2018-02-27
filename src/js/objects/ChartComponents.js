import { makeSVGGroup } from '../utils/draw';
import { xLine, yLine, yMarker, yRegion, datasetBar } from '../utils/draw';
import { equilizeNoOfElements } from '../utils/draw-utils';
import { Animator, translateHoriLine, translateVertLine, animateRegion } from '../utils/animate';

class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		constants,

		getData,
		makeElements,
		postMake,
		animateElements
	}) {
		this.layerTransform = layerTransform;
		this.constants = constants;

		this.makeElements = makeElements;
		this.postMake = postMake;
		this.getData = getData;

		this.animateElements = animateElements;

		this.store = [];

		this.layerClass = layerClass;
		this.layerClass = typeof(this.layerClass) === 'function'
			? this.layerClass() : this.layerClass;

		this.refresh();
	}

	refresh(data) {
		this.data = data || this.getData();
	}

	setup(parent) {
		this.layer = makeSVGGroup(parent, this.layerClass, this.layerTransform);
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
		layerClass: function() { return 'dataset-units dataset-' + this.constants.index; },
		makeElements(data) {
			let c = this.constants;
			return data.yPositions.map((y, j) => {
				// console.log(data.cumulativeYPos, data.cumulativeYPos[j]);
				return datasetBar(
					data.xPositions[j],
					y,
					c.barWidth,
					c.color,
					(c.valuesOverPoints ? (c.stacked ? data.cumulativeYs[j] : data.values[j]) : ''),
					j,
					y - (c.stacked ? data.cumulativeYPos[j] : y),
					{
						zeroLine: c.zeroLine,
						barsWidth: c.barsWidth,
						minHeight: c.minHeight
					}
				)
			});
		},
		postMake() {
			if((!this.constants.stacked)) {
				this.layer.setAttribute('transform',
					`translate(${this.constants.width * this.constants.index}, 0)`);
			}
		},
		animateElements(newData) {
			// [this.oldData, newData] = equilizeNoOfElements(this.oldData, newData);

			// let newPos =  newData.map(d => d.end);
			// let newLabels =  newData.map(d => d.label);
			// let newStarts =  newData.map(d => d.start);

			// let oldPos = this.oldData.map(d => d.end);
			// let oldLabels = this.oldData.map(d => d.label);
			// let oldStarts = this.oldData.map(d => d.start);

			// this.render(oldPos.map((pos, i) => {
			// 	return {
			// 		start: oldStarts[i],
			// 		end: oldPos[i],
			// 		label: newLabels[i]
			// 	}
			// }));

			// let animateElements = [];

			// this.store.map((rectGroup, i) => {
			// 	animateElements = animateElements.concat(animateRegion(
			// 		rectGroup, newStarts[i], newPos[i], oldPos[i]
			// 	));
			// });

			// return animateElements;
		}
	},

	lineGraph: {

	}
}

export function getComponent(name, constants, getData) {
	let config = componentConfigs[name];
	Object.assign(config, {
		constants: constants,
		getData: getData
	})
	return new ChartComponent(config);
}
