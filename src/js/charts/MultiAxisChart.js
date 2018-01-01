import AxisChart from './AxisChart';
import { Y_AXIS_MARGIN } from '../utils/margins';
import { ChartComponent } from '../objects/ChartComponent';

export default class MultiAxisChart extends AxisChart {
	constructor(args) {
		super(args);
		this.type = 'multiaxis';
		this.unitType = args.unitType || 'line';
		this.setup();
	}

	setHorizontalMargin() {
		let noOfLeftAxes = this.data.datasets.filter(d => d.axisPosition === 'left').length;
		this.translateXLeft = (noOfLeftAxes) * Y_AXIS_MARGIN;
		this.translateXRight = (this.data.datasets.length - noOfLeftAxes) * Y_AXIS_MARGIN || Y_AXIS_MARGIN;
	}

	prepareYAxis() {
		this.state.yAxes = [];
		let sets = this.state.datasets;
		// let axesLeft = sets.filter(d => d.axisPosition === 'left');
		// let axesRight = sets.filter(d => d.axisPosition === 'right');
		// let axesNone = sets.filter(d => !d.axisPosition ||
		// 	!['left', 'right'].includes(d.axisPosition));

		let leftCount = 0, rightCount = 0;

		sets.forEach((d, i) => {
			this.state.yAxes.push({
				position: d.axisPosition,
				color: d.color,
				dataValues: d.values,
				index: d.axisPosition === 'left' ? leftCount++ : rightCount++
			});
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
		this.state.unitArgs = {
			type: 'bar',
			args: {
				spaceWidth: this.state.unitWidth/2,
			}
		};
	}

	setYAxis() {
		this.state.yAxes.map(yAxis => {
			// console.log(yAxis);
			this.calcYAxisParameters(yAxis, yAxis.dataValues, this.unitType === 'line');
			// console.log(yAxis);
		});
	}

	setupYAxesComponents() {
		this.yAxesComponents = this.state.yAxes.map((e, i) => {
			return new ChartComponent({
				layerClass: 'y axis y-axis-' + i,
				make: () => {
					let d = this.state.yAxes[i];
					this.renderer.setZeroline(d.zeroline);
					let axis = d.positions.map((position, j) =>
						this.renderer.yLine(position, d.labels[j], {
							pos: d.position,
							mode: 'tick',
							offset: d.index * Y_AXIS_MARGIN,
							stroke: this.colors[i]
						})
					);

					let guidePos = d.position === 'left'
						? -1 * d.index * Y_AXIS_MARGIN
						: this.width + d.index * Y_AXIS_MARGIN;

					axis.push(this.renderer.xLine(guidePos, '', {
						pos:'top',
						mode: 'span',
						stroke: this.colors[i],
						className: 'y-axis-guide'
					}));

					return axis;
				},
				animate: () => {}
			});
		});
	}
}
