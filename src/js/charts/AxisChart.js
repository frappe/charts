import BaseChart from './BaseChart';
import { Y_AXIS_MARGIN } from '../utils/margins';
import { ChartComponent } from '../objects/ChartComponent';
import { getOffset, fire } from '../utils/dom';
import { AxisChartRenderer, makePath, makeGradient } from '../utils/draw';
import { equilizeNoOfElements } from '../utils/draw-utils';
import { Animator } from '../utils/animate';
import { runSMILAnimation } from '../utils/animation';
import { calcIntervals, getIntervalSize, getValueRange, getZeroIndex } from '../utils/intervals';
import { floatTwo, fillArray } from '../utils/helpers';

export default class AxisChart extends BaseChart {
	constructor(args) {
		super(args);
		this.is_series = args.is_series;
		this.format_tooltip_y = args.format_tooltip_y;
		this.format_tooltip_x = args.format_tooltip_x;

		this.zeroLine = this.height;
	}

	setHorizontalMargin() {
		this.translateXLeft = Y_AXIS_MARGIN;
		this.translateXRight = Y_AXIS_MARGIN;
	}

	checkData(data) {
		return true;
	}

	getFirstUpdateData(data) {
		//
	}

	prepareData() {
		let s = this.state;

		s.xAxisLabels = this.data.labels || [];
		s.xAxisPositions = [];

		s.datasetLength = s.xAxisLabels.length;

		let zeroArray = new Array(s.datasetLength).fill(0);

		s.datasets = this.data.datasets; // whole dataset info too
		if(!this.data.datasets) {
			// default
			s.datasets = [{
				values: zeroArray	// Proof that state version will be seen instead of this.data
			}];
		}

		s.datasets.map((d, i)=> {
			let vals = d.values;
			if(!vals) {
				vals = zeroArray;
			} else {
				// Check for non values
				vals = vals.map(val => (!isNaN(val) ? val : 0));

				// Trim or extend
				if(vals.length > s.datasetLength) {
					vals = vals.slice(0, s.datasetLength);
				} else {
					vals = fillArray(vals, s.datasetLength - vals.length, 0);
				}
			}

			d.index = i;
		});

		s.noOfDatasets = s.datasets.length;

		// s.yAxis = [];
		this.prepareYAxis();
	}

	prepareYAxis() {
		this.state.yAxis = {
			labels: [],
			positions: []
		};
	}

	reCalc() {
		let s = this.state;

		// X
		s.xAxisLabels = this.data.labels;
		this.calcXPositions();

		// Y
		s.datasetsLabels = this.data.datasets.map(d => d.name);

		this.setYAxis();

		this.calcYUnits();

		this.calcYMaximums();

		// should be state
		this.configUnits();
	}

	setYAxis() {
		this.calcYAxisParameters(this.state.yAxis, this.getAllYValues(), this.type === 'line');
		this.state.zeroLine = this.state.yAxis.zeroLine;
	}

	calcXPositions() {
		let s = this.state;
		this.setUnitWidthAndXOffset();
		s.xAxisPositions = s.xAxisLabels.map((d, i) =>
			floatTwo(s.xOffset + i * s.unitWidth));

		s.xUnitPositions = new Array(s.noOfDatasets).fill(s.xAxisPositions);
	}

	calcYAxisParameters(yAxis, dataValues, withMinimum = 'false') {
		yAxis.labels = calcIntervals(dataValues, withMinimum);
		const yPts = yAxis.labels;

		yAxis.scaleMultiplier = this.height / getValueRange(yPts);
		const intervalHeight = getIntervalSize(yPts) * yAxis.scaleMultiplier;
		yAxis.zeroLine = this.height - (getZeroIndex(yPts) * intervalHeight);

		yAxis.positions = yPts.map(d => yAxis.zeroLine - d * yAxis.scaleMultiplier);
	}

	calcYUnits() {
		let s = this.state;
		s.datasets.map(d => {
			d.positions = d.values.map(val => floatTwo(s.yAxis.zeroLine - val * s.yAxis.scaleMultiplier));
		});
	}

	calcYMaximums() {
		let s = this.state;
		s.yUnitMinimums = new Array(s.datasetLength).fill(9999);
		s.datasets.map((d, i) => {
			d.positions.map((pos, j) => {
				if(pos < s.yUnitMinimums[j]) {
					s.yUnitMinimums[j] = pos;
				}
			});
		});

		// Tooltip refresh should not be needed?
		// this.chartWrapper.removeChild(this.tip.container);
		// this.make_tooltip();
	}

	configUnits() {}

	setUnitWidthAndXOffset() {
		this.state.unitWidth = this.width/(this.state.datasetLength);
		this.state.xOffset = this.state.unitWidth/2;
	}

	getAllYValues() {
		// TODO: yMarkers, regions, sums, every Y value ever
		return [].concat(...this.state.datasets.map(d => d.values));
	}

	calcIntermedState() {
		//
	}

	setupValues() {}

	setupComponents() {

		// TODO: rebind new units
		// if(this.isNavigable) {
		// 	this.bind_units(units_array);
		// }

		this.yMarkerLines = {};
		this.xMarkerLines = {};

		// Marker Regions

		this.components = [
			// temp
			// this.yAxesAux,
			...this.getYAxesComponents(),
			this.getXAxisComponents(),
			// this.yMarkerLines,
			// this.xMarkerLines,
			...this.getPathComponents(),
			...this.getDataUnitsComponents(this.config),
		];
	}

	getYAxesComponents() {
		return [new ChartComponent({
			layerClass: 'y axis',
			make: () => {
				let s = this.state;
				return s.yAxis.positions.map((position, i) =>
					this.renderer.yLine(position, s.yAxis.labels[i], {pos:'right'})
				);
			},
			animate: () => {}
		})];
	}

	getXAxisComponents() {
		return new ChartComponent({
			layerClass: 'x axis',
			make: () => {
				let s = this.state;
				return s.xAxisPositions.map((position, i) =>
					this.renderer.xLine(position, s.xAxisLabels[i], {pos:'top'})
				);
			},
			// animate: (animator, lines, oldX, newX) => {
			// 	lines.map((xLine, i) => {
			// 		elements_to_animate.push(animator.verticalLine(
			// 			xLine, newX[i], oldX[i]
			// 		));
			// 	});
			// }
		});
	}

	getDataUnitsComponents() {
		return this.state.datasets.map((d, index) => {
			return new ChartComponent({
				layerClass: 'dataset-units dataset-' + index,
				make: () => {
					let d = this.state.datasets[index];
					let unitType = this.unitArgs;

					return d.positions.map((y, j) => {
						return this.renderer[unitType.type](
							this.state.xAxisPositions[j],
							y,
							unitType.args,
							this.colors[index],
							j,
							index,
							this.state.datasetLength
						);
					});
				},
				animate: () => {}
			});
		});
	}

	getPathComponents() {
		return [];
	}

	refreshRenderer() {
		// These args are basically the current state of the chart,
		// with constant and alive params mixed
		let state = {
			totalHeight: this.height,
			totalWidth: this.width,

			xAxisMode: this.config.xAxisMode,
			yAxisMode: this.config.yAxisMode,

			zeroLine: this.state.zeroLine,
			unitWidth: this.state.unitWidth,
		};
		if(!this.renderer) {
			this.renderer = new AxisChartRenderer(state);
		} else {
			this.renderer.refreshState(state);
		}
	}

}
