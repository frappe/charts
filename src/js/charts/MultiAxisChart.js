import AxisChart from './AxisChart';
import { Y_AXIS_MARGIN } from '../utils/constants';
// import { ChartComponent } from '../objects/ChartComponents';
import { floatTwo } from '../utils/helpers';

export default class MultiAxisChart extends AxisChart {
	constructor(args) {
		super(args);
		// this.unitType = args.unitType || 'line';
		// this.setup();
	}

	preSetup() {
		this.type = 'multiaxis';
	}

	setMeasures() {
		super.setMeasures();
		let noOfLeftAxes = this.data.datasets.filter(d => d.axisPosition === 'left').length;
		this.measures.margins.left = (noOfLeftAxes) * Y_AXIS_MARGIN || Y_AXIS_MARGIN;
		this.measures.margins.right = (this.data.datasets.length - noOfLeftAxes) * Y_AXIS_MARGIN || Y_AXIS_MARGIN;
	}

	prepareYAxis() { }

	prepareData(data) {
		super.prepareData(data);
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

	// TODO: function doesn't exist, handle with components
	renderConstants() {
		this.state.datasets.map(d => {
			let guidePos = d.yAxis.position === 'left'
				? -1 * d.yAxis.index * Y_AXIS_MARGIN
				: this.width + d.yAxis.index * Y_AXIS_MARGIN;
			this.renderer.xLine(guidePos, '', {
				pos:'top',
				mode: 'span',
				stroke: this.colors[i],
				className: 'y-axis-guide'
			})
		});
	}

	getYAxesComponents() {
		return this.data.datasets.map((e, i) => {
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

					return yAxis.positions.map((position, j) =>
						this.renderer.yLine(position, yAxis.labels[j], options)
					);
				},
				animate: () => {}
			});
		});
	}

	// TODO remove renderer zeroline from above and below
	getChartComponents() {
		return this.data.datasets.map((d, index) => {
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
				animate: (svgUnits) => {
					let d = this.state.datasets[index];
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

					this.renderer.setZeroline(d.yAxis.zeroLine);

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
}
