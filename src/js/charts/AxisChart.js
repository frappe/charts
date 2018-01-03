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

	setupConstants() {
		this.state = {
			xAxisLabels: [],
			xAxisPositions: [],
		}

		this.prepareYAxis();
	}

	prepareData(data) {
		let s = this.state;

		s.xAxisLabels = data.labels || [];

		s.datasetLength = s.xAxisLabels.length;

		let zeroArray = new Array(s.datasetLength).fill(0);

		s.datasets = data.datasets; // whole dataset info too
		if(!data.datasets) {
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

	prepareYAxis() {
		this.state.yAxis = {
			labels: [],
			positions: []
		};
	}

	reCalc() {
		let s = this.state;

		s.xAxisLabels = this.data.labels;
		this.calcXPositions();

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

		this.components = [
			// temp
			// this.yAxesAux,
			...this.getYAxesComponents(),
			this.getXAxisComponents(),
			// this.getYMarkerLines(),
			// this.getXMarkerLines(),
			// TODO: regions too?
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
			animate: (yLines) => {
				// Equilize
				let newY = this.state.yAxis.positions;
				let oldY = this.oldState.yAxis.positions;

				let extra = newY.length - oldY.length;
				let lastLine = yLines[yLines.length - 1];
				let parentNode = lastLine.parentNode;

				[oldY, newY] = equilizeNoOfElements(oldY, newY);
				// console.log(newY.slice(), oldY.slice());
				if(extra > 0) {
					for(var i = 0; i<extra; i++) {
						let line = lastLine.cloneNode(true);
						parentNode.appendChild(line);
						yLines.push(line);
					}
				}

				yLines.map((line, i) => {
					// console.log(line, newY[i], oldY[i]);
					this.elementsToAnimate.push(this.renderer.translateHoriLine(
						line, newY[i], oldY[i]
					));
				});
			}
		})];
	}

	getXAxisComponents() {
		return new ChartComponent({
			layerClass: 'x axis',
			make: () => {
				let s = this.state;
				// TODO: xAxis Label spacing
				return s.xAxisPositions.map((position, i) =>
					this.renderer.xLine(position, s.xAxisLabels[i], {pos:'top'})
				);
			},
			animate: (xLines) => {
				// Equilize
				let newX = this.state.xAxisPositions;
				let oldX = this.oldState.xAxisPositions;

				this.oldState.xExtra = newX.length - oldX.length;
				let lastLine = xLines[xLines.length - 1];
				let parentNode = lastLine.parentNode;

				[oldX, newX] = equilizeNoOfElements(oldX, newX);
				if(this.oldState.xExtra > 0) {
					for(var i = 0; i<this.oldState.xExtra; i++) {
						let line = lastLine.cloneNode(true);
						parentNode.appendChild(line);
						xLines.push(line);
					}
				}
				xLines.map((line, i) => {
					this.elementsToAnimate.push(this.renderer.translateVertLine(
						line, newX[i], oldX[i]
					));
				});
			}
		});
	}

	getDataUnitsComponents() {
		return this.data.datasets.map((d, index) => {
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
							this.state.noOfDatasets
						);
					});
				},
				animate: (svgUnits) => {
					let unitType = this.unitArgs.type;

					// have been updated in axis render;
					let newX = this.state.xAxisPositions;
					let newY = this.state.datasets[index].positions;

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
						this.elementsToAnimate.push(this.renderer['animate' + unitType](
							unit, // unit, with info to replace where it came from in the data
							newX[i],
							newY[i],
							index,
							this.state.noOfDatasets
						));
					});
				}
			});
		});
	}

	getPathComponents() {
		return [];
	}

	getYMarkerLines() {
		return [];
	}

	getXMarkerLines() {
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

	// API

	addDataPoint(label, datasetValues, index=this.state.datasetLength) {
		// console.log(label, datasetValues, this.data.labels);
		this.data.labels.splice(index, 0, label);
		this.data.datasets.map((d, i) => {
			d.values.splice(index, 0, datasetValues[i]);
		});
		// console.log(this.data);
		this.update(this.data);
	}

	removeDataPoint(index = this.state.datasetLength-1) {
		this.data.labels.splice(index, 1);
		this.data.datasets.map(d => {
			d.values.splice(index, 1);
		});
		this.update(this.data);
	}

	updateData() {
		// animate if same no. of datasets,
		// else return new chart

		//
	}
}
