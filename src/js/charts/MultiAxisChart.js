import AxisChart from './AxisChart';
import { Y_AXIS_MARGIN } from '../utils/margins';
import { ChartComponent } from '../objects/ChartComponent';
import { floatTwo } from '../utils/helpers';

export default class MultiAxisChart extends AxisChart {
	constructor(args) {
		super(args);
		this.type = 'multiaxis';
		this.unitType = args.unitType || 'line';
		this.setup();
	}

	setHorizontalMargin() {
		let noOfLeftAxes = this.data.datasets.filter(d => d.axisPosition === 'left').length;
		this.translateXLeft = (noOfLeftAxes) * Y_AXIS_MARGIN || Y_AXIS_MARGIN;
		this.translateXRight = (this.data.datasets.length - noOfLeftAxes) * Y_AXIS_MARGIN || Y_AXIS_MARGIN;
	}

	prepareYAxis() {
		let sets = this.state.datasets;
		// let axesLeft = sets.filter(d => d.axisPosition === 'left');
		// let axesRight = sets.filter(d => d.axisPosition === 'right');
		// let axesNone = sets.filter(d => !d.axisPosition ||
		// 	!['left', 'right'].includes(d.axisPosition));

		let leftCount = 0, rightCount = 0;

		sets.forEach((d, i) => {
			d.yAxis = {
				position: d.axisPosition,
				index: d.axisPosition === 'left' ? leftCount++ : rightCount++
			};
		});
	}

	configure(args) {
		super.configure(args);
		this.config.xAxisMode = args.xAxisMode || 'tick';
		this.config.yAxisMode = args.yAxisMode || 'span';
	}

	// setUnitWidthAndXOffset() {
	// 	this.state.unitWidth = this.width/(this.state.datasetLength);
	// 	this.state.xOffset = this.state.unitWidth/2;
	// }

	configUnits() {
		this.unitArgs = {
			type: 'bar',
			args: {
				spaceWidth: this.state.unitWidth/2,
			}
		};
	}

	setYAxis() {
		this.state.datasets.map(d => {
			this.calcYAxisParameters(d.yAxis, d.values, this.unitType === 'line');
		});
	}

	calcYUnits() {
		this.state.datasets.map(d => {
			d.positions = d.values.map(val => floatTwo(d.yAxis.zeroLine - val * d.yAxis.scaleMultiplier));
		});
	}

	getYAxesComponents() {
		return this.state.datasets.map((e, i) => {
			return new ChartComponent({
				layerClass: 'y axis y-axis-' + i,
				make: () => {
					let yAxis = this.state.datasets[i].yAxis;
					this.renderer.setZeroline(yAxis.zeroline);
					let options = {
						pos: yAxis.position,
						mode: 'tick',
						offset: yAxis.index * Y_AXIS_MARGIN,
						stroke: this.colors[i]
					};

					let yAxisLines = yAxis.positions.map((position, j) =>
						this.renderer.yLine(position, yAxis.labels[j], options)
					);

					let guidePos = yAxis.position === 'left'
						? -1 * yAxis.index * Y_AXIS_MARGIN
						: this.width + yAxis.index * Y_AXIS_MARGIN;

					yAxisLines.push(this.renderer.xLine(guidePos, '', {
						pos:'top',
						mode: 'span',
						stroke: this.colors[i],
						className: 'y-axis-guide'
					}));

					return yAxisLines;
				},
				animate: () => {}
			});
		});
	}

	getDataUnitsComponents() {
		return this.state.datasets.map((d, index) => {
			return new ChartComponent({
				layerClass: 'dataset-units dataset-' + index,
				make: () => {
					let d = this.state.datasets[index];
					let unitType = this.unitArgs;

					// the only difference, should be tied to datasets or default
					this.renderer.setZeroline(d.yAxis.zeroLine);

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
}
