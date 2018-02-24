import BaseChart from './BaseChart';
import { Y_AXIS_MARGIN } from '../utils/margins';
import { getYAxisComponent } from '../objects/ChartComponents';
import { BarChartController, LineChartController, getPaths } from '../objects/AxisChartControllers';
import { AxisChartRenderer } from '../utils/draw';
import { getOffset, fire } from '../utils/dom';
import { equilizeNoOfElements } from '../utils/draw-utils';
import { Animator, translateHoriLine } from '../utils/animate';
import { runSMILAnimation } from '../utils/animation';
import { getRealIntervals, calcChartIntervals, getIntervalSize, getValueRange, getZeroIndex } from '../utils/intervals';
import { floatTwo, fillArray } from '../utils/helpers';

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

		this.setupUnitRenderer();

		this.zeroLine = this.height;
		this.preSetup();
		this.setup();
	}

	configure(args) {
		super.configure();

		this.config.xAxisMode = args.xAxisMode;
		this.config.yAxisMode = args.yAxisMode;
	}

	preSetup() {}

	setupUnitRenderer() {
		// TODO: this is empty
		let options = this.rawChartArgs.options;
		this.unitRenderers = {
			bar: new BarChartController(options),
			line: new LineChartController(options)
		};
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
			xAxisMode: this.config.xAxisMode,
			yAxisMode: this.config.yAxisMode
		}

		this.data.datasets.map(d => {
			if(!d.chartType ) {
				d.chartType = this.type;
			}
		});

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
		s.yMarkers = data.yMarkers;
		s.yRegions = data.yRegions;
	}

	prepareYAxis() {
		this.state.yAxis = {
			labels: [],
			positions: []
		};
	}

	calc() {
		let s = this.state;

		s.xAxisLabels = this.data.labels;
		this.calcXPositions();

		s.datasetsLabels = this.data.datasets.map(d => d.name);
		this.setYAxis();
		this.calcYUnits();
		this.calcYMaximums();
		this.calcYRegions();

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
			floatTwo(s.xOffset + i * s.unitWidth)
		);

		s.xUnitPositions = new Array(s.noOfDatasets).fill(s.xAxisPositions);
	}

	calcYAxisParameters(yAxis, dataValues, withMinimum = 'false') {
		yAxis.labels = calcChartIntervals(dataValues, withMinimum);
		const yPts = yAxis.labels;

		yAxis.scaleMultiplier = this.height / getValueRange(yPts);
		const intervalHeight = getIntervalSize(yPts) * yAxis.scaleMultiplier;
		yAxis.zeroLine = this.height - (getZeroIndex(yPts) * intervalHeight);

		yAxis.positions = yPts.map(d => yAxis.zeroLine - d * yAxis.scaleMultiplier);
	}

	calcYUnits() {
		let s = this.state;
		s.datasets.map(d => {
			d.positions = d.values.map(val =>
				floatTwo(s.yAxis.zeroLine - val * s.yAxis.scaleMultiplier));
		});

		if(this.barOptions && this.barOptions.stacked) {
			s.datasets.map((d, i) => {
				d.cumulativePositions = d.cumulativeYs.map(val =>
					floatTwo(s.yAxis.zeroLine - val * s.yAxis.scaleMultiplier));
			});
		}
	}

	calcYMaximums() {
		let s = this.state;
		if(this.barOptions && this.barOptions.stacked) {
			s.yExtremes = s.datasets[s.datasets.length - 1].cumulativePositions;
			return;
		}
		s.yExtremes = new Array(s.datasetLength).fill(9999);
		s.datasets.map((d, i) => {
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
		if(s.yMarkers) {
			s.yMarkers = s.yMarkers.map(d => {
				d.value = floatTwo(s.yAxis.zeroLine - d.value * s.yAxis.scaleMultiplier);
				return d;
			});
		}
		if(s.yRegions) {
			s.yRegions = s.yRegions.map(d => {
				d.start = floatTwo(s.yAxis.zeroLine - d.start * s.yAxis.scaleMultiplier);
				d.end = floatTwo(s.yAxis.zeroLine - d.end * s.yAxis.scaleMultiplier);
				return d;
			});
		}
	}

	configUnits() {}

	// Default, as per bar, and mixed. Only line will be a special case
	setUnitWidthAndXOffset() {
		this.state.unitWidth = this.width/(this.state.datasetLength);
		this.state.xOffset = this.state.unitWidth/2;
	}

	getAllYValues() {
		// TODO: yMarkers, regions, sums, every Y value ever

		let key = 'values';

		if(this.barOptions && this.barOptions.stacked) {
			key = 'cumulativeYs';
			let cumulative = new Array(this.state.datasetLength).fill(0);
			this.state.datasets.map((d, i) => {
				let values = this.state.datasets[i].values;
				d[key] = cumulative = cumulative.map((c, i) => c + values[i]);
			});
		}

		return [].concat(...this.state.datasets.map(d => d[key]));
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

		this.yAxis = getYAxisComponent(
			this.drawArea,
			{
				mode: this.yAxisMode,
				width: this.width,
				// pos: 'right'
			},
			{
				positions: getRealIntervals(this.height, 4, 0, 0),
				labels: getRealIntervals(this.height, 4, 0, 0).map(d => d + ""),
			}
		)
		this.components = [
			this.yAxis
			// this.getXAxisComponents(),
			// ...this.getYRegions(),
			// ...this.getXRegions(),
			// ...this.getYMarkerLines(),
			// // ...this.getXMarkerLines(),
			// ...this.getChartComponents(),
			// ...this.getChartLabels(),
		];
	}

	refreshComponents() {
		this.refreshYAxis();
	}

	refreshYAxis() {
		let s = this.state;
		this.yAxis.refresh({
			positions: s.yAxis.positions,
			labels: s.yAxis.labels,
		});
	}

	getXAxisComponents() {
		return new ChartComponent({
			layerClass: 'x axis',
			setData: () => {
				let s = this.state;
				let data = {
					positions: s.xAxisPositions,
					labels: s.xAxisLabels,
				};
				let constants = {
					mode: this.xAxisMode,
					height: this.height
				}
				return [data, constants];
			},
			makeElements: () => {
				let s = this.state;
				// positions
				// TODO: xAxis Label spacing
				return s.xAxisPositions.map((position, i) =>
					xLine(position, s.xAxisLabels[i], this.constants.height
						// , {pos:'top'}
					)
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

	getChartLabels() {
		// To layer all labels above everything else
		return [];
	}

	getDataUnitComponent(index, unitRenderer) {
		return new ChartComponent({
			layerClass: 'dataset-units dataset-' + index,
			setData: () => {},
			preMake: () => { },
			makeElements: () => {
				let d = this.state.datasets[index];

				return d.positions.map((y, j) => {
					return unitRenderer.draw(
						this.state.xAxisPositions[j],
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

				// let d = this.state.datasets[index];

				if(this.meta.type === 'bar' && (!this.meta.barOptions
					|| !this.meta.barOptions.stacked)) {

					translate_layer();
				}
			},
			animate: (svgUnits) => {
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
					this.elementsToAnimate.push(unitRenderer.animate(
						unit, // unit, with info to replace where it came from in the data
						newX[i],
						newY[i],
						index,
						this.state.noOfDatasets
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
				let d = this.state.datasets[index];
				let color = this.colors[index];

				return getPaths(
					d.positions,
					this.state.xAxisPositions,
					color,
					this.config.heatline,
					this.config.regionFill
				);
			},
			animate: (paths) => {
				let newX = this.state.xAxisPositions;
				let newY = this.state.datasets[index].positions;

				let oldX = this.oldState.xAxisPositions;
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

	getYMarkerLines() {
		if(!this.data.yMarkers) {
			return [];
		}
		return this.data.yMarkers.map((d, index) => {
			return new ChartComponent({
				layerClass: 'y-markers',
				setData: () => {},
				makeElements: () => {
					let s = this.state;
					return s.yMarkers.map(marker =>
						this.renderer.yMarker(marker.value, marker.name,
							{pos:'right', mode: 'span', lineType: marker.type})
					);
				},
				animate: () => {}
			});
		});
	}

	getYRegions() {
		if(!this.data.yRegions) {
			return [];
		}
		// return [];
		return this.data.yRegions.map((d, index) => {
			return new ChartComponent({
				layerClass: 'y-regions',
				setData: () => {},
				makeElements: () => {
					let s = this.state;
					return s.yRegions.map(region =>
						this.renderer.yRegion(region.start, region.end, region.name)
					);
				},
				animate: () => {}
			});
		});
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

		let meta = {
			totalHeight: this.height,
			totalWidth: this.width,
			zeroLine: this.state.zeroLine,
			unitWidth: this.state.unitWidth,
			noOfDatasets: this.state.noOfDatasets,
		};

		meta = Object.assign(meta, this.rawChartArgs.options);

		Object.keys(this.unitRenderers).map(key => {
			meta.options = this[key + 'Options'];
			this.unitRenderers[key].refreshMeta(meta);
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

		let titles = s.xAxisLabels;
		if(this.formatTooltipX && this.formatTooltipX(titles[0])) {
			titles = titles.map(d=>this.formatTooltipX(d));
		}

		let formatY = this.formatTooltipY && this.formatTooltipY(this.y[0].values[0]);

		for(var i=s.datasetLength - 1; i >= 0 ; i--) {
			let xVal = s.xAxisPositions[i];
			// let delta = i === 0 ? s.unitWidth : xVal - s.xAxisPositions[i-1];
			if(relX > xVal - s.unitWidth/2) {
				let x = xVal + this.translateXLeft;
				let y = s.yExtremes[i] + this.translateY;

				let values = s.datasets.map((set, j) => {
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
		data_point.label = this.xAxisLabels[index];
		return data_point;
	}

	setCurrentDataPoint(index) {
		index = parseInt(index);
		if(index < 0) index = 0;
		if(index >= this.xAxisLabels.length) index = this.xAxisLabels.length - 1;
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

