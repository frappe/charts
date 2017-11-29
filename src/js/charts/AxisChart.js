import BaseChart from './BaseChart';
import { get_offset, fire } from '../utils/dom';
import { AxisChartRenderer } from '../utils/draw';
import { equilizeNoOfElements } from '../utils/draw-utils';
import { Animator } from '../utils/animate';
import { runSMILAnimation } from '../utils/animation';
import { calcIntervals } from '../utils/intervals';
import { floatTwo } from '../utils/helpers';

export default class AxisChart extends BaseChart {
	constructor(args) {
		super(args);
		this.is_series = args.is_series;
		this.format_tooltip_y = args.format_tooltip_y;
		this.format_tooltip_x = args.format_tooltip_x;
		this.zero_line = this.height;
	}

	validateAndPrepareData() {
		this.xAxisLabels = this.data.labels || [];
		this.y = this.data.datasets || [];

		this.y.forEach(function(d, i) {
			d.index = i;
		}, this);
		return true;
	}

	setupEmptyValues() {
		this.yAxisPositions = [this.height, this.height/2, 0];
		this.yAxisLabels = ['0', '5', '10'];

		this.xPositions = [0, this.width/2, this.width];
		this.xAxisLabels = ['0', '5', '10'];
	}

	// this should be inherent in BaseChart
	getRenderer() {
		// These args are basically the current state/config of the chart,
		// with constant and alive params mixed


		return new AxisChartRenderer(this.height, this.width,
			this.zero_line, this.avg_unit_width, this.xAxisMode, this.yAxisMode);
	}

	setupComponents() {
		let self = this;
		let renderer = this.getRenderer();
		this.yAxis = {
			layerClass: 'y axis',
			layer: undefined,
			make: self.makeYLines,
			makeArgs: [renderer, self.yAxisPositions, self.yAxisLabels],
			store: [],
			animate: self.animateYLines,
			// indexed: 1 // ?? As per datasets?
		};
		this.xAxis = {
			layerClass: 'x axis',
			layer: undefined,
			make: self.makeXLines,
			// TODO: better context of renderer
			// TODO: will implement series skip with avgUnitWidth and isSeries later
			makeArgs: [renderer, self.xPositions, self.xAxisLabels],
			store: [],
			animate: self.animateXLines
		};
		this.yMarkerLines = {
			// layerClass: 'y marker axis',
			// layer: undefined,
			// make: makeYMarkerLines,
			// makeArgs: [this.yMarkerPositions, this.yMarker],
			// store: [],
			// animate: animateYMarkerLines
		};
		this.xMarkerLines = {
			// layerClass: 'x marker axis',
			// layer: undefined,
			// make: makeXMarkerLines,
			// makeArgs: [this.yMarkerPositions, this.xMarker],
			// store: [],
			// animate: animateXMarkerLines
		};

		// Marker Regions

		// Indexed according to dataset
		this.dataUnits = {
			layerClass: 'y marker axis',
			layer: undefined,
			// make: makeXLines,
			// makeArgs: [this.xPositions, this.xAxisLabels],
			// store: [],
			// animate: animateXLines,
			indexed: 1
		};

		this.components = [
			this.yAxis,
			this.xAxis,
			// this.yMarkerLines,
			// this.xMarkerLines,
			// this.dataUnits,
		];
	}

	setup_values() {
		this.data.datasets.map(d => {
			d.values = d.values.map(val => (!isNaN(val) ? val : 0));
		});
		this.setup_x();
		this.setup_y();
	}

	setup_x() {
		this.set_avg_unit_width_and_x_offset();
		if(this.xPositions) {
			this.x_old_axis_positions =  this.xPositions.slice();
		}
		this.xPositions = this.xAxisLabels.map((d, i) =>
			floatTwo(this.x_offset + i * this.avg_unit_width));

		if(!this.x_old_axis_positions) {
			this.x_old_axis_positions = this.xPositions.slice();
		}
	}

	setup_y() {
		if(this.yAxisLabels) {
			this.y_old_axis_values =  this.yAxisLabels.slice();
		}

		let values = this.get_all_y_values();

		if(this.y_sums && this.y_sums.length > 0) {
			values = values.concat(this.y_sums);
		}

		this.yAxisLabels = calcIntervals(values, this.type === 'line');

		if(!this.y_old_axis_values) {
			this.y_old_axis_values = this.yAxisLabels.slice();
		}

		const y_pts = this.yAxisLabels;
		const value_range = y_pts[y_pts.length-1] - y_pts[0];

		if(this.multiplier) this.old_multiplier = this.multiplier;
		this.multiplier = this.height / value_range;
		if(!this.old_multiplier) this.old_multiplier = this.multiplier;

		const interval = y_pts[1] - y_pts[0];
		const interval_height = interval * this.multiplier;

		let zero_index;

		if(y_pts.indexOf(0) >= 0) {
			// the range has a given zero
			// zero-line on the chart
			zero_index = y_pts.indexOf(0);
		} else if(y_pts[0] > 0) {
			// Minimum value is positive
			// zero-line is off the chart: below
			let min = y_pts[0];
			zero_index = (-1) * min / interval;
		} else {
			// Maximum value is negative
			// zero-line is off the chart: above
			let max = y_pts[y_pts.length - 1];
			zero_index = (-1) * max / interval + (y_pts.length - 1);
		}

		if(this.zero_line) this.old_zero_line = this.zero_line;
		this.zero_line = this.height - (zero_index * interval_height);
		if(!this.old_zero_line) this.old_zero_line = this.zero_line;

		// Make positions arrays for y elements
		if(this.yAxisPositions) this.oldYAxisPositions = this.yAxisPositions;
		this.yAxisPositions = this.yAxisLabels.map(d => this.zero_line - d * this.multiplier);
		if(!this.oldYAxisPositions) this.oldYAxisPositions = this.yAxisPositions;

		// if(this.yAnnotationPositions) this.oldYAnnotationPositions = this.yAnnotationPositions;
		// this.yAnnotationPositions = this.specific_values.map(d => this.zero_line - d.value * this.multiplier);
		// if(!this.oldYAnnotationPositions) this.oldYAnnotationPositions = this.yAnnotationPositions;
	}

	makeXLines(renderer, positions, values) {
		// TODO: draw as per condition

		return positions.map((position, i) => renderer.xLine(position, values[i]));
	}

	makeYLines(renderer, positions, values) {
		return positions.map((position, i) => renderer.yLine(position, values[i]));
	}

	draw_graph(init=false) {
		// TODO: NO INIT!
		if(this.raw_chart_args.hasOwnProperty("init") && !this.raw_chart_args.init) {
			this.y.map((d, i) => {
				d.svg_units = [];
				this.make_path && this.make_path(d, this.xPositions, d.yUnitPositions, this.colors[i]);
				this.makeUnits(d);
				this.calcYDependencies();
			});
			return;
		}
		if(init) {
			this.draw_new_graph_and_animate();
			return;
		}
		this.y.map((d, i) => {
			d.svg_units = [];
			this.make_path && this.make_path(d, this.xPositions, d.yUnitPositions, this.colors[i]);
			this.makeUnits(d);
		});
	}

	draw_new_graph_and_animate() {
		let data = [];
		this.y.map((d, i) => {
			// Anim: Don't draw initial values, store them and update later
			d.yUnitPositions = new Array(d.values.length).fill(this.zero_line); // no value
			data.push({values: d.values});
			d.svg_units = [];

			this.make_path && this.make_path(d, this.xPositions, d.yUnitPositions, this.colors[i]);
			this.makeUnits(d);
		});

		setTimeout(() => {
			this.updateData(data);
		}, 350);
	}

	setupNavigation(init) {
		if(init) {
			// Hack: defer nav till initial updateData
			setTimeout(() => {
				super.setupNavigation(init);
			}, 500);
		} else {
			super.setupNavigation(init);
		}
	}

	makeUnits(d) {
		this.makeDatasetUnits(
			this.xPositions,
			d.yUnitPositions,
			this.colors[d.index],
			d.index,
			this.y.length
		);
	}

	makeDatasetUnits(x_values, y_values, color, dataset_index,
		no_of_datasets, units_group, units_array, unit) {

		if(!units_group) units_group = this.svg_units_groups[dataset_index];
		if(!units_array) units_array = this.y[dataset_index].svg_units;
		if(!unit) unit = this.unit_args;

		units_group.textContent = '';
		units_array.length = 0;

		let unit_AxisChartRenderer = new AxisChartRenderer(this.height, this.zero_line, this.avg_unit_width);

		y_values.map((y, i) => {
			let data_unit = unit_AxisChartRenderer[unit.type](
				x_values[i],
				y,
				unit.args,
				color,
				i,
				dataset_index,
				no_of_datasets
			);
			units_group.appendChild(data_unit);
			units_array.push(data_unit);
		});

		if(this.is_navigable) {
			this.bind_units(units_array);
		}
	}

	bind_tooltip() {
		// TODO: could be in tooltip itself, as it is a given functionality for its parent
		this.chart_wrapper.addEventListener('mousemove', (e) => {
			let offset = get_offset(this.chart_wrapper);
			let relX = e.pageX - offset.left - this.translate_x;
			let relY = e.pageY - offset.top - this.translate_y;

			if(relY < this.height + this.translate_y * 2) {
				this.mapTooltipXPosition(relX);
			} else {
				this.tip.hide_tip();
			}
		});
	}

	mapTooltipXPosition(relX) {
		if(!this.y_min_tops) return;

		let titles = this.xAxisLabels;
		if(this.format_tooltip_x && this.format_tooltip_x(this.xAxisLabels[0])) {
			titles = this.xAxisLabels.map(d=>this.format_tooltip_x(d));
		}

		let y_format = this.format_tooltip_y && this.format_tooltip_y(this.y[0].values[0]);

		for(var i=this.xPositions.length - 1; i >= 0 ; i--) {
			let x_val = this.xPositions[i];
			// let delta = i === 0 ? this.avg_unit_width : x_val - this.xPositions[i-1];
			if(relX > x_val - this.avg_unit_width/2) {
				let x = x_val + this.translate_x;
				let y = this.y_min_tops[i] + this.translate_y;

				let title = titles[i];
				let values = this.y.map((set, j) => {
					return {
						title: set.title,
						value: y_format ? this.format_tooltip_y(set.values[i]) : set.values[i],
						color: this.colors[j],
					};
				});

				this.tip.set_values(x, y, title, '', values);
				this.tip.show_tip();
				break;
			}
		}
	}

	// API
	updateData(newY, newX) {
		if(!newX) {
			newX = this.xAxisLabels;
		}
		this.updating = true;

		this.old_x_values = this.xAxisLabels.slice();
		this.old_y_axis_tops = this.y.map(d => d.yUnitPositions.slice());

		this.old_y_values = this.y.map(d => d.values);

		// Just update values prop, setup_x/y() will do the rest
		if(newY) this.y.map(d => {d.values = newY[d.index].values;});
		if(newX) this.xAxisLabels = newX;

		this.setup_x();
		this.setup_y();

		// Change in data, so calculate dependencies
		this.calcYDependencies();

		// Got the values? Now begin drawing
		this.animator = new Animator(this.height, this.width, this.zero_line, this.avg_unit_width);

		this.animate_graphs();

		this.updating = false;
	}

	animate_graphs() {
		this.elements_to_animate = [];
		// Pre-prep, equilize no of positions between old and new
		let [old_x, newX] = equilizeNoOfElements(
			this.x_old_axis_positions.slice(),
			this.xPositions.slice()
		);

		let [oldYAxis, newYAxis] = equilizeNoOfElements(
			this.oldYAxisPositions.slice(),
			this.yAxisPositions.slice()
		);

		let newXValues = this.xAxisLabels.slice();
		let newYValues = this.yAxisLabels.slice();

		let extra_points = this.xPositions.slice().length - this.x_old_axis_positions.slice().length;

		if(extra_points > 0) {
			this.makeXLines(old_x, newXValues);
		}
		// No Y extra check?
		this.makeYLines(oldYAxis, newYValues);

		// Animation
		if(extra_points !== 0) {
			this.animateXLines(old_x, newX);
		}
		this.animateYLines(oldYAxis, newYAxis);

		this.y.map(d => {
			let [old_y, newY] = equilizeNoOfElements(
				this.old_y_axis_tops[d.index].slice(),
				d.yUnitPositions.slice()
			);
			if(extra_points > 0) {
				this.make_path && this.make_path(d, old_x, old_y, this.colors[d.index]);
				this.makeDatasetUnits(old_x, old_y, this.colors[d.index], d.index, this.y.length);
			}
			// Animation
			d.path && this.animate_path(d, newX, newY);
			this.animate_units(d, newX, newY);
		});

		runSMILAnimation(this.chart_wrapper, this.svg, this.elements_to_animate);

		setTimeout(() => {
			this.y.map(d => {
				this.make_path && this.make_path(d, this.xPositions, d.yUnitPositions, this.colors[d.index]);
				this.makeUnits(d);

				this.makeYLines(this.yAxisPositions, this.yAxisLabels);
				this.makeXLines(this.xPositions, this.xAxisLabels);
				// this.make_y_specifics(this.yAnnotationPositions, this.specific_values);
			});
		}, 400);
	}

	animate_path(d, newX, newY) {
		const newPointsList = newY.map((y, i) => (newX[i] + ',' + y));
		this.elements_to_animate = this.elements_to_animate
			.concat(this.animator.path(d, newPointsList.join("L")));
	}

	animate_units(d, newX, newY) {
		let type = this.unit_args.type;

		d.svg_units.map((unit, i) => {
			if(newX[i] === undefined || newY[i] === undefined) return;
			this.elements_to_animate.push(this.animator[type](
				{unit:unit, array:d.svg_units, index: i}, // unit, with info to replace where it came from in the data
				newX[i],
				newY[i],
				d.index,
				this.y.length
			));
		});
	}

	animateXLines(oldX, newX) {
		this.xAxisLines.map((xLine, i) => {
			this.elements_to_animate.push(this.animator.verticalLine(
				xLine, newX[i], oldX[i]
			));
		});
	}

	animateYLines(oldY, newY) {
		this.yAxisLines.map((yLine, i) => {
			this.elements_to_animate.push(this.animator.horizontalLine(
				yLine, newY[i], oldY[i]
			));
		});
	}

	animateYAnnotations() {
		//
	}

	add_data_point(y_point, x_point, index=this.xAxisLabels.length) {
		let newY = this.y.map(data_set => { return {values:data_set.values}; });
		newY.map((d, i) => { d.values.splice(index, 0, y_point[i]); });
		let newX = this.xAxisLabels.slice();
		newX.splice(index, 0, x_point);

		this.updateData(newY, newX);
	}

	remove_data_point(index = this.xAxisLabels.length-1) {
		if(this.xAxisLabels.length < 3) return;

		let newY = this.y.map(data_set => { return {values:data_set.values}; });
		newY.map((d) => { d.values.splice(index, 1); });
		let newX = this.xAxisLabels.slice();
		newX.splice(index, 1);

		this.updateData(newY, newX);
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

	updateCurrentDataPoint(index) {
		index = parseInt(index);
		if(index < 0) index = 0;
		if(index >= this.xAxisLabels.length) index = this.xAxisLabels.length - 1;
		if(index === this.current_index) return;
		this.current_index = index;
		fire(this.parent, "data-select", this.getDataPoint());
	}

	set_avg_unit_width_and_x_offset() {
		// Set the ... you get it
		this.avg_unit_width = this.width/(this.xAxisLabels.length - 1);
		this.x_offset = 0;
	}

	get_all_y_values() {
		let all_values = [];

		// Add in all the y values in the datasets
		this.y.map(d => {
			all_values = all_values.concat(d.values);
		});

		// Add in all the specific values
		return all_values.concat(this.specific_values.map(d => d.value));
	}

	calcYDependencies() {
		this.y_min_tops = new Array(this.xAxisLabels.length).fill(9999);
		this.y.map(d => {
			d.yUnitPositions = d.values.map( val => floatTwo(this.zero_line - val * this.multiplier));
			d.yUnitPositions.map( (yUnitPosition, i) => {
				if(yUnitPosition < this.y_min_tops[i]) {
					this.y_min_tops[i] = yUnitPosition;
				}
			});
		});
		// this.chart_wrapper.removeChild(this.tip.container);
		// this.make_tooltip();
	}
}
