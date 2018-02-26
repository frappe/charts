import BaseChart from './BaseChart';
import { dataPrep } from './axis-chart-utils';
import { Y_AXIS_MARGIN } from '../utils/constants';
import { getComponent } from '../objects/ChartComponents';
import { BarChartController, LineChartController, getPaths } from '../objects/AxisChartControllers';
import { AxisChartRenderer } from '../utils/draw';
import { getOffset, fire } from '../utils/dom';
import { equilizeNoOfElements } from '../utils/draw-utils';
import { Animator, translateHoriLine } from '../utils/animate';
import { runSMILAnimation } from '../utils/animation';
import { getRealIntervals, calcChartIntervals, getIntervalSize, getValueRange, getZeroIndex } from '../utils/intervals';
import { floatTwo, fillArray, bindChange } from '../utils/helpers';
import { MIN_BAR_PERCENT_HEIGHT, DEFAULT_AXIS_CHART_TYPE } from '../utils/constants';

export default class AxisChart extends BaseChart {
	constructor(args) {
		super(args);
		this.isSeries = args.isSeries;
		this.valuesOverPoints = args.valuesOverPoints;
		this.formatTooltipY = args.formatTooltipY;
		this.formatTooltipX = args.formatTooltipX;
		this.barOptions = args.barOptions;
		this.lineOptions = args.lineOptions;
		this.type = args.type || 'line';

		this.xAxisMode = args.xAxisMode || 'span';
		this.yAxisMode = args.yAxisMode || 'span';

		this.zeroLine = this.height;
		this.setTrivialState();
		this.setup();
	}

	configure(args) {
		super.configure();

		// TODO: set in options and use

		this.config.xAxisMode = args.xAxisMode;
		this.config.yAxisMode = args.yAxisMode;
	}

	setTrivialState() {
		// Define data and stuff
		let yTempPos = getRealIntervals(this.height, 4, 0, 0);

		this.state = {
			xAxis: {
				positions: [],
				labels: [],
			},
			yAxis: {
				positions: yTempPos,
				labels: yTempPos.map(d => ""),
			},
			yRegions: [
				{
					start: this.height,
					end: this.height,
					label: ''
				}
			],
			yMarkers: [
				{
					position: this.height,
					label: ''
				}
			]
		}

		this.calcWidth();
		this.calcXPositions(this.state);
	}

	setMargins() {
		super.setMargins();
		this.translateXLeft = Y_AXIS_MARGIN;
		this.translateXRight = Y_AXIS_MARGIN;
	}

	prepareData(data=this.data) {
		return dataPrep(data, this.type);
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

		this.calcYUnits();
		this.calcYMaximums();
		this.calcYRegions();
	}

	calcYUnits() {
		let s = this.state;
		this.data.datasets.map(d => {
			d.positions = d.values.map(val =>
				floatTwo(s.yAxis.zeroLine - val * s.yAxis.scaleMultiplier));
		});

		if(this.barOptions && this.barOptions.stacked) {
			this.data.datasets.map((d, i) => {
				d.cumulativePositions = d.cumulativeYs.map(val =>
					floatTwo(s.yAxis.zeroLine - val * s.yAxis.scaleMultiplier));
			});
		}
	}

	calcYMaximums() {
		let s = this.state;
		if(this.barOptions && this.barOptions.stacked) {
			s.yExtremes = this.data.datasets[this.data.datasets.length - 1].cumulativePositions;
			return;
		}
		s.yExtremes = new Array(s.datasetLength).fill(9999);
		this.data.datasets.map((d, i) => {
			d.positions.map((pos, j) => {
				if(pos < s.yExtremes[j]) {
					s.yExtremes[j] = pos;
				}
			});
		});

		// Tooltip refresh should not be needed?
		// this.chartWrapper.removeChild(this.tip.container);
		// this.make_tooltip();
	}

	calcYRegions() {
		let s = this.state;
		if(this.data.yMarkers) {
			this.state.yMarkers = this.data.yMarkers.map(d => {
				d.position = floatTwo(s.yAxis.zeroLine - d.value * s.yAxis.scaleMultiplier);
				d.label += ': ' + d.value;
				return d;
			});
		}
		if(this.data.yRegions) {
			this.state.yRegions = this.data.yRegions.map(d => {
				if(d.end < d.start) {
					[d.start, d.end] = [d.end, start];
				}
				d.start = floatTwo(s.yAxis.zeroLine - d.start * s.yAxis.scaleMultiplier);
				d.end = floatTwo(s.yAxis.zeroLine - d.end * s.yAxis.scaleMultiplier);
				return d;
			});
		}
	}

	getAllYValues() {
		// TODO: yMarkers, regions, sums, every Y value ever
		let key = 'values';

		if(this.barOptions && this.barOptions.stacked) {
			key = 'cumulativeYs';
			let cumulative = new Array(this.state.datasetLength).fill(0);
			this.data.datasets.map((d, i) => {
				let values = this.data.datasets[i].values;
				d[key] = cumulative = cumulative.map((c, i) => c + values[i]);
			});
		}

		return [].concat(...this.data.datasets.map(d => d[key]));
	}

	initComponents() {
		this.componentConfigs = [
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

			[
				'yMarkers',
				{
					width: this.width,
					pos: 'right'
				}
			]
		];
	}
	setupComponents() {
		let optionals = ['yMarkers', 'yRegions'];
		this.components = new Map(this.componentConfigs
			.filter(args => !optionals.includes(args[0]) || this.data[args[0]])
			.map(args => {
				args.push(
					function() {
						return this.state[args[0]];
					}.bind(this)
				);
				return [args[0], getComponent(...args)];
			}));
	}

	getChartComponents() {
		let dataUnitsComponents = []
		// this.state is not defined at this stage
		this.data.datasets.forEach((d, index) => {
			if(d.chartType === 'line') {
				dataUnitsComponents.push(this.getPathComponent(d, index));
			}

			let renderer = this.unitRenderers[d.chartType];
			dataUnitsComponents.push(this.getDataUnitComponent(
				index, renderer
			));
		});
		return dataUnitsComponents;
	}

	getDataUnitComponent(index, unitRenderer) {
		return new ChartComponent({
			layerClass: 'dataset-units dataset-' + index,
			makeElements: () => {
				// yPositions, xPostions, color, valuesOverPoints,
				let d = this.data.datasets[index];

				return d.positions.map((y, j) => {
					return unitRenderer.draw(
						this.state.xAxis.positions[j],
						y,
						this.colors[index],
						(this.valuesOverPoints ? (this.barOptions &&
							this.barOptions.stacked ? d.cumulativeYs[j] : d.values[j]) : ''),
						j,
						y - (d.cumulativePositions ? d.cumulativePositions[j] : y)
					);
				});
			},
			postMake: function() {
				let translate_layer = () => {
					this.layer.setAttribute('transform', `translate(${unitRenderer.consts.width * index}, 0)`);
				}

				// let d = this.data.datasets[index];

				if(this.meta.type === 'bar' && (!this.meta.barOptions
					|| !this.meta.barOptions.stacked)) {

					translate_layer();
				}
			},
			animate: (svgUnits) => {
				// have been updated in axis render;
				let newX = this.state.xAxis.positions;
				let newY = this.data.datasets[index].positions;

				let lastUnit = svgUnits[svgUnits.length - 1];
				let parentNode = lastUnit.parentNode;

				if(this.oldState.xExtra > 0) {
					for(var i = 0; i<this.oldState.xExtra; i++) {
						let unit = lastUnit.cloneNode(true);
						parentNode.appendChild(unit);
						svgUnits.push(unit);
					}
				}

				svgUnits.map((unit, i) => {
					if(newX[i] === undefined || newY[i] === undefined) return;
					this.elementsToAnimate.push(unitRenderer.animate(
						unit, // unit, with info to replace where it came from in the data
						newX[i],
						newY[i],
						index,
						this.data.datasets.length
					));
				});
			}
		});
	}

	getPathComponent(d, index) {
		return new ChartComponent({
			layerClass: 'path dataset-path',
			setData: () => {},
			makeElements: () => {
				let d = this.data.datasets[index];
				let color = this.colors[index];

				return getPaths(
					d.positions,
					this.state.xAxis.positions,
					color,
					this.config.heatline,
					this.config.regionFill
				);
			},
			animate: (paths) => {
				let newX = this.state.xAxis.positions;
				let newY = this.data.datasets[index].positions;

				let oldX = this.oldState.xAxis.positions;
				let oldY = this.oldState.datasets[index].positions;


				let parentNode = paths[0].parentNode;

				[oldX, newX] = equilizeNoOfElements(oldX, newX);
				[oldY, newY] = equilizeNoOfElements(oldY, newY);

				if(this.oldState.xExtra > 0) {
					paths = getPaths(
						oldY, oldX, this.colors[index],
						this.config.heatline,
						this.config.regionFill
					);
					parentNode.textContent = '';
					paths.map(path => parentNode.appendChild(path));
				}

				const newPointsList = newY.map((y, i) => (newX[i] + ',' + y));
				this.elementsToAnimate = this.elementsToAnimate
					.concat(this.renderer.animatepath(paths, newPointsList.join("L")));
			}
		});
	}

	bindTooltip() {
		// TODO: could be in tooltip itself, as it is a given functionality for its parent
		this.chartWrapper.addEventListener('mousemove', (e) => {
			let o = getOffset(this.chartWrapper);
			let relX = e.pageX - o.left - this.translateXLeft;
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
				let x = xVal + this.translateXLeft;
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

	getDataPoint(index=this.current_index) {
		// check for length
		let data_point = {
			index: index
		};
		let y = this.y[0];
		['svg_units', 'yUnitPositions', 'values'].map(key => {
			let data_key = key.slice(0, key.length-1);
			data_point[data_key] = y[key][index];
		});
		data_point.label = this.xAxis.labels[index];
		return data_point;
	}

	setCurrentDataPoint(index) {
		index = parseInt(index);
		if(index < 0) index = 0;
		if(index >= this.xAxis.labels.length) index = this.xAxis.labels.length - 1;
		if(index === this.current_index) return;
		this.current_index = index;
		$.fire(this.parent, "data-select", this.getDataPoint());
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

	// updateData() {
	// 	// animate if same no. of datasets,
	// 	// else return new chart

	// 	//
	// }
}


// keep a binding at the end of chart

