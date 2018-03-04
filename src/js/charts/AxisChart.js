import BaseChart from './BaseChart';
import { dataPrep, zeroDataPrep } from './axis-chart-utils';
import { Y_AXIS_MARGIN } from '../utils/constants';
import { getComponent } from '../objects/ChartComponents';
import { getOffset, fire } from '../utils/dom';
import { calcChartIntervals, getIntervalSize, getValueRange, getZeroIndex, scale } from '../utils/intervals';
import { floatTwo } from '../utils/helpers';
import { makeOverlay, updateOverlay } from '../utils/draw';
import { MIN_BAR_PERCENT_HEIGHT, DEFAULT_AXIS_CHART_TYPE, BAR_CHART_SPACE_RATIO, LINE_CHART_DOT_SIZE } from '../utils/constants';

export default class AxisChart extends BaseChart {
	constructor(parent, args) {
		super(parent, args);
		this.isSeries = args.isSeries;
		this.valuesOverPoints = args.valuesOverPoints;
		this.formatTooltipY = args.formatTooltipY;
		this.formatTooltipX = args.formatTooltipX;
		this.barOptions = args.barOptions || {};
		this.lineOptions = args.lineOptions || {};
		this.type = args.type || 'line';

		this.xAxisMode = args.xAxisMode || 'span';
		this.yAxisMode = args.yAxisMode || 'span';

		this.setup();
	}

	configure(args) {3
		super.configure();
		this.config.xAxisMode = args.xAxisMode;
		this.config.yAxisMode = args.yAxisMode;
	}

	setMargins() {
		super.setMargins();
		this.leftMargin = Y_AXIS_MARGIN;
		this.rightMargin = Y_AXIS_MARGIN;
	}

	prepareData(data=this.data) {
		return dataPrep(data, this.type);
	}

	prepareFirstData(data=this.data) {
		return zeroDataPrep(data);
	}

	calc() {
		this.calcXPositions();
		this.calcYAxisParameters(this.getAllYValues(), this.type === 'line');
	}

	calcXPositions(s=this.state) {
		let labels = this.data.labels;
		s.datasetLength = labels.length;

		s.unitWidth = this.width/(s.datasetLength);
		// Default, as per bar, and mixed. Only line will be a special case
		s.xOffset = s.unitWidth/2;

		// // For a pure Line Chart
		// s.unitWidth = this.width/(s.datasetLength - 1);
		// s.xOffset = 0;

		s.xAxis = {
			labels: labels,
			positions: labels.map((d, i) =>
				floatTwo(s.xOffset + i * s.unitWidth)
			)
		};
	}

	calcYAxisParameters(dataValues, withMinimum = 'false') {
		const yPts = calcChartIntervals(dataValues, withMinimum);
		const scaleMultiplier = this.height / getValueRange(yPts);
		const intervalHeight = getIntervalSize(yPts) * scaleMultiplier;
		const zeroLine = this.height - (getZeroIndex(yPts) * intervalHeight);

		this.state.yAxis = {
			labels: yPts,
			positions: yPts.map(d => zeroLine - d * scaleMultiplier),
			scaleMultiplier: scaleMultiplier,
			zeroLine: zeroLine,
		}

		// Dependent if above changes
		this.calcDatasetPoints();
		this.calcYExtremes();
		this.calcYRegions();
	}

	calcDatasetPoints() {
		let s = this.state;
		let scaleAll = values => values.map(val => scale(val, s.yAxis));

		s.datasets = this.data.datasets.map((d, i) => {
			let values = d.values;
			let cumulativeYs = d.cumulativeYs || [];
			return {
				name: d.name,
				index: i,
				chartType: d.chartType,

				values: values,
				yPositions: scaleAll(values),

				cumulativeYs: cumulativeYs,
				cumulativeYPos: scaleAll(cumulativeYs),
			};
		});
	}

	calcYExtremes() {
		let s = this.state;
		if(this.barOptions.stacked) {
			s.yExtremes = s.datasets[s.datasets.length - 1].cumulativeYPos;
			return;
		}
		s.yExtremes = new Array(s.datasetLength).fill(9999);
		s.datasets.map((d, i) => {
			d.yPositions.map((pos, j) => {
				if(pos < s.yExtremes[j]) {
					s.yExtremes[j] = pos;
				}
			});
		});
	}

	calcYRegions() {
		let s = this.state;
		if(this.data.yMarkers) {
			this.state.yMarkers = this.data.yMarkers.map(d => {
				d.position = scale(d.value, s.yAxis);
				d.label += ': ' + d.value;
				return d;
			});
		}
		if(this.data.yRegions) {
			this.state.yRegions = this.data.yRegions.map(d => {
				d.start = scale(d.start, s.yAxis);
				d.end = scale(d.end, s.yAxis);
				return d;
			});
		}
	}

	getAllYValues() {
		// TODO: yMarkers, regions, sums, every Y value ever
		let key = 'values';

		if(this.barOptions.stacked) {
			key = 'cumulativeYs';
			let cumulative = new Array(this.state.datasetLength).fill(0);
			this.data.datasets.map((d, i) => {
				let values = this.data.datasets[i].values;
				d[key] = cumulative = cumulative.map((c, i) => c + values[i]);
			});
		}

		return [].concat(...this.data.datasets.map(d => d[key]));
	}

	setupComponents() {
		let s = this.state;
		let componentConfigs = [
			[
				'yAxis',
				{
					mode: this.yAxisMode,
					width: this.width,
					// pos: 'right'
				}
			],

			[
				'xAxis',
				{
					mode: this.xAxisMode,
					height: this.height,
					// pos: 'right'
				}
			],

			[
				'yRegions',
				{
					width: this.width,
					pos: 'right'
				}
			],
		];

		componentConfigs.map(args => {
			args.push(
				function() {
					return this.state[args[0]];
				}.bind(this)
			);
		});

		let barDatasets = this.state.datasets.filter(d => d.chartType === 'bar');
		let lineDatasets = this.state.datasets.filter(d => d.chartType === 'line');

		// console.log('barDatasets', barDatasets, this.state.datasets);

		let barsConfigs = barDatasets.map(d => {
			let index = d.index;
			return [
				'barGraph' + '-' + d.index,
				{
					index: index,
					color: this.colors[index],
					stacked: this.barOptions.stacked,

					// same for all datasets
					valuesOverPoints: this.valuesOverPoints,
					minHeight: this.height * MIN_BAR_PERCENT_HEIGHT,
				},
				function() {
					let s = this.state;
					let d = s.datasets[index];

					let spaceRatio = this.barOptions.spaceRatio || BAR_CHART_SPACE_RATIO;
					let barsWidth = s.unitWidth * (1 - spaceRatio);
					let barWidth = barsWidth/(this.barOptions.stacked ? 1 : barDatasets.length);

					let xPositions = s.xAxis.positions.map(x => x - barsWidth/2);
					if(!this.barOptions.stacked) {
						xPositions = xPositions.map(p => p + barWidth * index);
					}

					return {
						xPositions: xPositions,
						yPositions: d.yPositions,
						cumulativeYPos: d.cumulativeYPos,

						values: d.values,
						cumulativeYs: d.cumulativeYs,

						zeroLine: s.yAxis.zeroLine,
						barsWidth: barsWidth,
						barWidth: barWidth,
					};
				}.bind(this)
			];
		});

		let lineConfigs = lineDatasets.map(d => {
			let index = d.index;
			return [
				'lineGraph' + '-' + d.index,
				{
					index: index,
					color: this.colors[index],
					svgDefs: this.svgDefs,
					heatline: this.lineOptions.heatline,
					regionFill: this.lineOptions.regionFill,
					hideDots: this.lineOptions.hideDots,

					// same for all datasets
					valuesOverPoints: this.valuesOverPoints,
				},
				function() {
					let s = this.state;
					let d = s.datasets[index];

					return {
						xPositions: s.xAxis.positions,
						yPositions: d.yPositions,

						values: d.values,

						zeroLine: s.yAxis.zeroLine,
						radius: this.lineOptions.dotSize || LINE_CHART_DOT_SIZE,
					};
				}.bind(this)
			];
		});

		let markerConfigs = [
			[
				'yMarkers',
				{
					width: this.width,
					pos: 'right'
				}
			]
		];

		markerConfigs.map(args => {
			args.push(
				function() {
					return this.state[args[0]];
				}.bind(this)
			);
		});

		componentConfigs = componentConfigs.concat(barsConfigs, lineConfigs, markerConfigs);

		let optionals = ['yMarkers', 'yRegions'];
		this.dataUnitComponents = [];

		this.components = new Map(componentConfigs
			.filter(args => !optionals.includes(args[0]) || this.state[args[0]])
			.map(args => {
				let component = getComponent(...args);
				if(args[0].includes('lineGraph') || args[0].includes('barGraph')) {
					this.dataUnitComponents.push(component);
				}
				return [args[0], component];
			}));
	}

	bindTooltip() {
		// NOTE: could be in tooltip itself, as it is a given functionality for its parent
		this.chartWrapper.addEventListener('mousemove', (e) => {
			let o = getOffset(this.chartWrapper);
			let relX = e.pageX - o.left - this.leftMargin;
			let relY = e.pageY - o.top - this.translateY;

			if(relY < this.height + this.translateY * 2) {
				this.mapTooltipXPosition(relX);
			} else {
				this.tip.hide_tip();
			}
		});
	}

	mapTooltipXPosition(relX) {
		let s = this.state;
		if(!s.yExtremes) return;

		let titles = s.xAxis.labels;
		if(this.formatTooltipX && this.formatTooltipX(titles[0])) {
			titles = titles.map(d=>this.formatTooltipX(d));
		}

		let formatY = this.formatTooltipY && this.formatTooltipY(this.y[0].values[0]);

		for(var i=s.datasetLength - 1; i >= 0 ; i--) {
			let xVal = s.xAxis.positions[i];
			// let delta = i === 0 ? s.unitWidth : xVal - s.xAxis.positions[i-1];
			if(relX > xVal - s.unitWidth/2) {
				let x = xVal + this.leftMargin;
				let y = s.yExtremes[i] + this.translateY;

				let values = this.data.datasets.map((set, j) => {
					return {
						title: set.title,
						value: formatY ? this.formatTooltipY(set.values[i]) : set.values[i],
						color: this.colors[j],
					};
				});

				this.tip.set_values(x, y, titles[i], '', values);
				this.tip.show_tip();
				break;
			}
		}
	}

	makeOverlays() {
		// Just make one out of the first element
		// let index = this.xAxisLabels.length - 1;
		// let unit = this.y[0].svg_units[index];
		// this.setCurrentDataPoint(index);

		// if(this.overlay) {
		// 	this.overlay.parentNode.removeChild(this.overlay);
		// }

		// this.overlay = unit.cloneNode();
		// this.overlay.style.fill = '#000000';
		// this.overlay.style.opacity = '0.4';
		// this.drawArea.appendChild(this.overlay);
		this.overlayGuides = this.dataUnitComponents.map(c => {
			return {
				type: c.unitType,
				overlay: undefined,
				units: c.store,
			}
		});

		this.state.currentIndex = 0;

		// Render overlays
		this.overlayGuides.map(d => {
			let currentUnit = d.units[this.state.currentIndex];
			d.overlay = makeOverlay[d.type](currentUnit);
			this.drawArea.appendChild(d.overlay);
		})
	}

	bindOverlay() {
		// on event, update overlay
		this.parent.addEventListener('data-select', (e) => {
			this.updateOverlay(e.svg_unit);
		});
	}

	bindUnits(units_array) {
		// units_array.map(unit => {
		// 	unit.addEventListener('click', () => {
		// 		let index = unit.getAttribute('data-point-index');
		// 		this.setCurrentDataPoint(index);
		// 	});
		// });
	}

	updateOverlay() {
		this.overlayGuides.map(d => {
			let currentUnit = d.units[this.state.currentIndex];
			updateOverlay[d.type](currentUnit, d.overlay);
		})
	}

	onLeftArrow() {
		this.setCurrentDataPoint(this.state.currentIndex - 1);
	}

	onRightArrow() {
		this.setCurrentDataPoint(this.state.currentIndex + 1);
	}

	getDataPoint(index=this.state.currentIndex) {
		// check for length
		let data_point = {
			index: index
		};
		// let y = this.y[0];
		// ['svg_units', 'yUnitPositions', 'values'].map(key => {
		// 	let data_key = key.slice(0, key.length-1);
		// 	data_point[data_key] = y[key][index];
		// });
		// data_point.label = this.xAxis.labels[index];
		return data_point;
	}

	setCurrentDataPoint(index) {
		let s = this.state;
		index = parseInt(index);
		if(index < 0) index = 0;
		if(index >= s.xAxis.labels.length) index = s.xAxis.labels.length - 1;
		if(index === s.currentIndex) return;
		s.currentIndex = index;
		fire(this.parent, "data-select", this.getDataPoint());
	}

	// API

	addDataPoint(label, datasetValues, index=this.state.datasetLength) {
		super.addDataPoint(label, datasetValues, index);
		// console.log(label, datasetValues, this.data.labels);
		this.data.labels.splice(index, 0, label);
		this.data.datasets.map((d, i) => {
			d.values.splice(index, 0, datasetValues[i]);
		});
		// console.log(this.data);
		this.update(this.data);
	}

	removeDataPoint(index = this.state.datasetLength-1) {
		super.removeDataPoint(index);
		this.data.labels.splice(index, 1);
		this.data.datasets.map(d => {
			d.values.splice(index, 1);
		});
		this.update(this.data);
	}

	// getDataPoint(index = 0) {}
	// setCurrentDataPoint(point) {}

	updateDataset(datasetValues, index=0) {
		this.data.datasets[index].values = datasetValues;
		this.update(this.data);
	}
	// addDataset(dataset, index) {}
	// removeDataset(index = 0) {}

	// updateDatasets(datasets) {}

	// updateDataPoint(dataPoint, index = 0) {}
	// addDataPoint(dataPoint, index = 0) {}
	// removeDataPoint(index = 0) {}
}


// keep a binding at the end of chart

