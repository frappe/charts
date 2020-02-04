import { makeSVGGroup } from '../utils/draw';
import { makeText, makePath, xLine, yLine, yMarker, yRegion, datasetBar, datasetDot, percentageBar, getPaths, heatSquare } from '../utils/draw';
import { equilizeNoOfElements } from '../utils/draw-utils';
import { translateHoriLine, translateVertLine, animateRegion, animateBar,
	animateDot, animatePath, animatePathStr } from '../utils/animate';
import { getMonthName } from '../utils/date-utils';

class ChartComponent {
	constructor({
		layerClass = '',
		layerTransform = '',
		constants,

		getData,
		makeElements,
		animateElements
	}) {
		this.layerTransform = layerTransform;
		this.constants = constants;

		this.makeElements = makeElements;
		this.getData = getData;

		this.animateElements = animateElements;

		this.store = [];
		this.labels = [];

		this.layerClass = layerClass;
		this.layerClass = typeof(this.layerClass) === 'function'
			? this.layerClass() : this.layerClass;

		this.refresh();
	}

	refresh(data) {
		this.data = data || this.getData();
	}

	setup(parent) {
		this.layer = makeSVGGroup(this.layerClass, this.layerTransform, parent);
	}

	make() {
		this.render(this.data);
		this.oldData = this.data;
	}

	render(data) {
		this.store = this.makeElements(data);

		this.layer.textContent = '';
		this.store.forEach(element => {
			this.layer.appendChild(element);
		});
		this.labels.forEach(element => {
			this.layer.appendChild(element);
		});
	}

	update(animate = true) {
		this.refresh();
		let animateElements = [];
		if(animate) {
			animateElements = this.animateElements(this.data) || [];
		}
		return animateElements;
	}
}

let componentConfigs = {
	donutSlices: {
		layerClass: 'donut-slices',
		makeElements(data) {
			return data.sliceStrings.map((s, i) => {
				let slice = makePath(s, 'donut-path', data.colors[i], 'none', data.strokeWidth);
				slice.style.transition = 'transform .3s;';
				return slice;
			});
		},

		animateElements(newData) {
			return this.store.map((slice, i) => animatePathStr(slice, newData.sliceStrings[i]));
		},
	},
	pieSlices: {
		layerClass: 'pie-slices',
		makeElements(data) {
			return data.sliceStrings.map((s, i) =>{
				let slice = makePath(s, 'pie-path', 'none', data.colors[i]);
				slice.style.transition = 'transform .3s;';
				return slice;
			});
		},

		animateElements(newData) {
			return this.store.map((slice, i) =>
				animatePathStr(slice, newData.sliceStrings[i])
			);
		}
	},
	percentageBars: {
		layerClass: 'percentage-bars',
		makeElements(data) {
			return data.xPositions.map((x, i) =>{
				let y = 0;
				let bar = percentageBar(x, y, data.widths[i],
					this.constants.barHeight, this.constants.barDepth, data.colors[i]);
				return bar;
			});
		},

		animateElements(newData) {
			if(newData) return [];
		}
	},
	yAxis: {
		layerClass: 'y axis',
		makeElements(data) {
			return data.positions.map((position, i) =>
				yLine(position, data.labels[i], this.constants.width,
					{mode: this.constants.mode, pos: this.constants.pos, shortenNumbers: this.constants.shortenNumbers})
			);
		},

		animateElements(newData) {
			let newPos = newData.positions;
			let newLabels = newData.labels;
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
				xLine(position, data.calcLabels[i], this.constants.height,
					{mode: this.constants.mode, pos: this.constants.pos})
			);
		},

		animateElements(newData) {
			let newPos = newData.positions;
			let newLabels = newData.calcLabels;
			let oldPos = this.oldData.positions;
			let oldLabels = this.oldData.calcLabels;

			[oldPos, newPos] = equilizeNoOfElements(oldPos, newPos);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				positions: oldPos,
				calcLabels: newLabels
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
			return data.map(m =>
				yMarker(m.position, m.label, this.constants.width,
					{labelPos: m.options.labelPos, mode: 'span', lineType: 'dashed'})
			);
		},
		animateElements(newData) {
			[this.oldData, newData] = equilizeNoOfElements(this.oldData, newData);

			let newPos = newData.map(d => d.position);
			let newLabels = newData.map(d => d.label);
			let newOptions = newData.map(d => d.options);

			let oldPos = this.oldData.map(d => d.position);

			this.render(oldPos.map((pos, i) => {
				return {
					position: oldPos[i],
					label: newLabels[i],
					options: newOptions[i]
				};
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
			return data.map(r =>
				yRegion(r.startPos, r.endPos, this.constants.width,
					r.label, {labelPos: r.options.labelPos})
			);
		},
		animateElements(newData) {
			[this.oldData, newData] = equilizeNoOfElements(this.oldData, newData);

			let newPos = newData.map(d => d.endPos);
			let newLabels = newData.map(d => d.label);
			let newStarts = newData.map(d => d.startPos);
			let newOptions = newData.map(d => d.options);

			let oldPos = this.oldData.map(d => d.endPos);
			let oldStarts = this.oldData.map(d => d.startPos);

			this.render(oldPos.map((pos, i) => {
				return {
					startPos: oldStarts[i],
					endPos: oldPos[i],
					label: newLabels[i],
					options: newOptions[i]
				};
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

	heatDomain: {
		layerClass: function() { return 'heat-domain domain-' + this.constants.index; },
		makeElements(data) {
			let {index, colWidth, rowHeight, squareSize, xTranslate} = this.constants;
			let monthNameHeight = -12;
			let x = xTranslate, y = 0;

			this.serializedSubDomains = [];

			data.cols.map((week, weekNo) => {
				if(weekNo === 1) {
					this.labels.push(
						makeText('domain-name', x, monthNameHeight, getMonthName(index, true).toUpperCase(),
							{
								fontSize: 9
							}
						)
					);
				}
				week.map((day, i) => {
					if(day.fill) {
						let data = {
							'data-date': day.yyyyMmDd,
							'data-value': day.dataValue,
							'data-day': i
						};
						let square = heatSquare('day', x, y, squareSize, day.fill, data);
						this.serializedSubDomains.push(square);
					}
					y += rowHeight;
				});
				y = 0;
				x += colWidth;
			});

			return this.serializedSubDomains;
		},

		animateElements(newData) {
			if(newData) return [];
		}
	},

	barGraph: {
		layerClass: function() { return 'dataset-units dataset-bars dataset-' + this.constants.index; },
		makeElements(data) {
			let c = this.constants;
			this.unitType = 'bar';
			this.units = data.yPositions.map((y, j) => {
				return datasetBar(
					data.xPositions[j],
					y,
					data.barWidth,
					c.color,
					data.labels[j],
					j,
					data.offsets[j],
					{
						zeroLine: data.zeroLine,
						barsWidth: data.barsWidth,
						minHeight: c.minHeight
					}
				);
			});
			return this.units;
		},
		animateElements(newData) {
			let newXPos = newData.xPositions;
			let newYPos = newData.yPositions;
			let newOffsets = newData.offsets;
			let newLabels = newData.labels;

			let oldXPos = this.oldData.xPositions;
			let oldYPos = this.oldData.yPositions;
			let oldOffsets = this.oldData.offsets;
			let oldLabels = this.oldData.labels;

			[oldXPos, newXPos] = equilizeNoOfElements(oldXPos, newXPos);
			[oldYPos, newYPos] = equilizeNoOfElements(oldYPos, newYPos);
			[oldOffsets, newOffsets] = equilizeNoOfElements(oldOffsets, newOffsets);
			[oldLabels, newLabels] = equilizeNoOfElements(oldLabels, newLabels);

			this.render({
				xPositions: oldXPos,
				yPositions: oldYPos,
				offsets: oldOffsets,
				labels: newLabels,

				zeroLine: this.oldData.zeroLine,
				barsWidth: this.oldData.barsWidth,
				barWidth: this.oldData.barWidth,
			});

			let animateElements = [];

			this.store.map((bar, i) => {
				animateElements = animateElements.concat(animateBar(
					bar, newXPos[i], newYPos[i], newData.barWidth, newOffsets[i],
					{zeroLine: newData.zeroLine}
				));
			});

			return animateElements;
		}
	},

	lineGraph: {
		layerClass: function() { return 'dataset-units dataset-line dataset-' + this.constants.index; },
		makeElements(data) {
			let c = this.constants;
			this.unitType = 'dot';
			this.paths = {};
			if(!c.hideLine) {
				this.paths = getPaths(
					data.xPositions,
					data.yPositions,
					c.color,
					{
						heatline: c.heatline,
						regionFill: c.regionFill,
						spline: c.spline
					},
					{
						svgDefs: c.svgDefs,
						zeroLine: data.zeroLine
					}
				);
			}

			this.units = [];
			if(!c.hideDots) {
				this.units = data.yPositions.map((y, j) => {
					return datasetDot(
						data.xPositions[j],
						y,
						data.radius,
						c.color,
						(c.valuesOverPoints ? data.values[j] : ''),
						j
					);
				});
			}

			return Object.values(this.paths).concat(this.units);
		},
		animateElements(newData) {
			let newXPos = newData.xPositions;
			let newYPos = newData.yPositions;
			let newValues = newData.values;

			let oldXPos = this.oldData.xPositions;
			let oldYPos = this.oldData.yPositions;
			let oldValues = this.oldData.values;

			[oldXPos, newXPos] = equilizeNoOfElements(oldXPos, newXPos);
			[oldYPos, newYPos] = equilizeNoOfElements(oldYPos, newYPos);
			[oldValues, newValues] = equilizeNoOfElements(oldValues, newValues);

			this.render({
				xPositions: oldXPos,
				yPositions: oldYPos,
				values: newValues,

				zeroLine: this.oldData.zeroLine,
				radius: this.oldData.radius,
			});

			let animateElements = [];

			if(Object.keys(this.paths).length) {
				animateElements = animateElements.concat(animatePath(
					this.paths, newXPos, newYPos, newData.zeroLine, this.constants.spline));
			}

			if(this.units.length) {
				this.units.map((dot, i) => {
					animateElements = animateElements.concat(animateDot(
						dot, newXPos[i], newYPos[i]));
				});
			}

			return animateElements;
		}
	}
};

export function getComponent(name, constants, getData) {
	let keys = Object.keys(componentConfigs).filter(k => name.includes(k));
	let config = componentConfigs[keys[0]];
	Object.assign(config, {
		constants: constants,
		getData: getData
	});
	return new ChartComponent(config);
}
