import BaseChart from './BaseChart';
import { ChartComponent, IndexedChartComponent } from '../objects/ChartComponent';
import { getOffset, fire } from '../utils/dom';
import { AxisChartRenderer } from '../utils/draw';
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

	checkData(data) {
		return true;
	}

	getFirstUpdateData(data) {
		//
	}

	prepareData() {
		let s = this.state;
		s.xAxisLabels = this.data.labels || [];
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
	}

	reCalc() {
		let s = this.state;

		// X
		s.xAxisLabels = this.data.labels;
		this.calcXPositions();

		// Y
		s.datasetsLabels = this.data.datasets.map(d => d.label);

		// s.yUnitValues = [[]]; indexed component
		// s.yUnitValues = [[[12, 34, 68], [10, 5, 46]], [[20, 20, 20]]]; // array of indexed components
		s.yUnitValues = s.datasets.map(d => d.values); // indexed component
		s.yAxisLabels = calcIntervals(this.getAllYValues(), this.type === 'line');
		this.calcYAxisPositions();

		this.calcYUnitPositions();

		// should be state
		this.configUnits();

		// temp
		s.unitTypes = new Array(s.noOfDatasets).fill(this.state.unitArgs);
	}

	calcXPositions() {
		let s = this.state;
		this.setUnitWidthAndXOffset();
		s.xAxisPositions = s.xAxisLabels.map((d, i) =>
			floatTwo(s.xOffset + i * s.unitWidth));

		s.xUnitPositions = new Array(s.noOfDatasets).fill(s.xAxisPositions);
	}

	calcYAxisPositions() {
		let s = this.state;
		const yPts = s.yAxisLabels;

		s.scaleMultiplier = this.height / getValueRange(yPts);
		const intervalHeight = getIntervalSize(yPts) * s.scaleMultiplier;
		s.zeroLine = this.height - (getZeroIndex(yPts) * intervalHeight);

		s.yAxisPositions = yPts.map(d => s.zeroLine - d * s.scaleMultiplier);
	}

	calcYUnitPositions() {
		let s = this.state;
		s.yUnitPositions = s.yUnitValues.map(values =>
			values.map(val => floatTwo(s.zeroLine - val * s.scaleMultiplier))
		);

		s.yUnitMinimums = new Array(s.datasetLength).fill(9999);
		s.datasets.map((d, i) => {
			s.yUnitPositions[i].map((pos, j) => {
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
		this.state.unitWidth = this.width/(this.state.datasetLength - 1);
		this.state.xOffset = 0;
	}

	getAllYValues() {
		// TODO: yMarkers, regions, sums, every Y value ever
		return [].concat(...this.state.yUnitValues);
	}

	calcIntermedState() {
		//
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

	setupComponents() {
		this.yAxis = new ChartComponent({
			layerClass: 'y axis',
			make: (renderer, positions, values) => {
				return positions.map((position, i) => renderer.yLine(position, values[i]));
			},
			argsKeys: ['yAxisPositions', 'yAxisLabels'],
			animate: () => {}
		});

		this.xAxis = new ChartComponent({
			layerClass: 'x axis',
			make: (renderer, positions, values) => {
				return positions.map((position, i) => renderer.xLine(position, values[i]));
			},
			argsKeys: ['xAxisPositions', 'xAxisLabels'],
			animate: () => {}
		});

		this.dataUnits = new IndexedChartComponent({
			layerClass: 'dataset-units',
			make: (renderer, xPosSet, yPosSet, color, unitType,
				yValueSet, datasetIndex, noOfDatasets) => {

				return yPosSet.map((y, i) => {
					return renderer[unitType.type](
						xPosSet[i],
						y,
						unitType.args,
						color,
						i,
						datasetIndex,
						noOfDatasets
					);
				});
			},
			argsKeys: ['xUnitPositions', 'yUnitPositions',
				'colors', 'unitTypes', 'yUnitValues'],
			animate: () => {}
		});

		this.yMarkerLines = {};
		this.xMarkerLines = {};

		// Marker Regions

		this.components = [
			this.yAxis,
			this.xAxis,
			// this.yMarkerLines,
			// this.xMarkerLines,
			this.dataUnits,
		];
	}

}
