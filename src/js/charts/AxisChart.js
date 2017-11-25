import { offset } from '../utils/dom';
import { UnitRenderer, makeXLine, makeYLine } from '../utils/draw';
import { equilizeNoOfElements, getXLineProps, getYLineProps } from '../utils/draw-utils';
import { Animator } from '../utils/animate';
import { runSMILAnimation } from '../utils/animation';
import { calcIntervals } from '../utils/intervals';
import { floatTwo, getStringWidth } from '../utils/helpers';
import BaseChart from './BaseChart';

export default class AxisChart extends BaseChart {
	constructor(args) {
		super(args);

		this.x = this.data.labels || [];
		this.y = this.data.datasets || [];

		this.is_series = args.is_series;

		this.format_tooltip_y = args.format_tooltip_y;
		this.format_tooltip_x = args.format_tooltip_x;

		this.zero_line = this.height;
	}

	validate_and_prepare_data() {
		this.y.forEach(function(d, i) {
			d.index = i;
		}, this);
		return true;
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

		if(this.x_axis_positions) {
			this.x_old_axis_positions =  this.x_axis_positions.slice();
		}
		this.x_axis_positions = this.x.map((d, i) =>
			floatTwo(this.x_offset + i * this.avg_unit_width));

		if(!this.x_old_axis_positions) {
			this.x_old_axis_positions = this.x_axis_positions.slice();
		}
	}

	setup_y() {
		if(this.y_axis_values) {
			this.y_old_axis_values =  this.y_axis_values.slice();
		}

		let values = this.get_all_y_values();

		if(this.y_sums && this.y_sums.length > 0) {
			values = values.concat(this.y_sums);
		}

		this.y_axis_values = calcIntervals(values, this.type === 'line');

		if(!this.y_old_axis_values) {
			this.y_old_axis_values = this.y_axis_values.slice();
		}

		const y_pts = this.y_axis_values;
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
		this.yAxisPositions = this.y_axis_values.map(d => this.zero_line - d * this.multiplier);
		if(!this.oldYAxisPositions) this.oldYAxisPositions = this.yAxisPositions;

		if(this.yAnnotationPositions) this.oldYAnnotationPositions = this.yAnnotationPositions;
		this.yAnnotationPositions = this.specific_values.map(d => this.zero_line - d.value * this.multiplier);
		if(!this.oldYAnnotationPositions) this.oldYAnnotationPositions = this.yAnnotationPositions;
	}

	setup_components() {
		super.setup_components();
		this.setup_marker_components();
		this.setup_aggregation_components();
		this.setup_graph_components();
	}

	setup_marker_components() {
		this.y_axis_group = this.makeDrawAreaComponent('y axis');
		this.x_axis_group = this.makeDrawAreaComponent('x axis');
		this.specific_y_group = this.makeDrawAreaComponent('specific axis');
	}

	setup_aggregation_components() {
		this.sum_group = this.makeDrawAreaComponent('data-points');
		this.average_group = this.makeDrawAreaComponent('chart-area');
	}

	setup_graph_components() {
		this.svg_units_groups = [];
		this.y.map((d, i) => {
			this.svg_units_groups[i] = this.makeDrawAreaComponent(
				'data-points data-points-' + i);
		});
	}

	make_graph_components(init=false) {
		this.makeYLines(this.yAxisPositions, this.y_axis_values);
		this.makeXLines(this.x_axis_positions, this.x);
		this.draw_graph(init);
		// this.make_y_specifics(this.yAnnotationPositions, this.specific_values);
	}

	makeXLines(positions, values) {
		let [start_at, height, text_start_at,
			axis_line_class] = getXLineProps(this.height, this.x_axis_mode);
		this.x_axis_group.setAttribute('transform', `translate(0,${start_at})`);

		let char_width = 8;
		let allowed_space = this.avg_unit_width * 1.5;
		let allowed_letters = allowed_space / 8;

		this.xAxisLines = [];
		this.x_axis_group.textContent = '';
		values.map((value, i) => {
			let space_taken = getStringWidth(value, char_width) + 2;
			if(space_taken > allowed_space) {
				if(this.is_series) {
					// Skip some axis lines if X axis is a series
					let skips = 1;
					while((space_taken/skips)*2 > allowed_space) {
						skips++;
					}
					if(i % skips !== 0) {
						return;
					}
				} else {
					value = value.slice(0, allowed_letters-3) + " ...";
				}
			}

			let xLine = makeXLine(
				height,
				text_start_at,
				value,
				'x-value-text',
				axis_line_class,
				positions[i]
			);
			this.xAxisLines.push(xLine);
			this.x_axis_group.appendChild(xLine);
		});
	}

	makeYLines(positions, values) {
		let [width, text_end_at, axis_line_class,
			start_at] = getYLineProps(this.width, this.y_axis_mode);

		this.yAxisLines = [];
		this.y_axis_group.textContent = '';
		values.map((value, i) => {
			let yLine = makeYLine(
				start_at,
				width,
				text_end_at,
				value,
				'y-value-text',
				axis_line_class,
				positions[i],
				(value === 0 && i !== 0) // Non-first Zero line
			);
			this.yAxisLines.push(yLine);
			this.y_axis_group.appendChild(yLine);
		});
	}

	draw_graph(init=false) {
		if(this.raw_chart_args.hasOwnProperty("init") && !this.raw_chart_args.init) {
			this.y.map((d, i) => {
				d.svg_units = [];
				this.make_path && this.make_path(d, this.x_axis_positions, d.y_tops, this.colors[i]);
				this.make_new_units(d);
				this.calc_y_dependencies();
			});
			return;
		}
		if(init) {
			this.draw_new_graph_and_animate();
			return;
		}
		this.y.map((d, i) => {
			d.svg_units = [];
			this.make_path && this.make_path(d, this.x_axis_positions, d.y_tops, this.colors[i]);
			this.make_new_units(d);
		});
	}

	draw_new_graph_and_animate() {
		let data = [];
		this.y.map((d, i) => {
			// Anim: Don't draw initial values, store them and update later
			d.y_tops = new Array(d.values.length).fill(this.zero_line); // no value
			data.push({values: d.values});
			d.svg_units = [];

			this.make_path && this.make_path(d, this.x_axis_positions, d.y_tops, this.colors[i]);
			this.make_new_units(d);
		});

		setTimeout(() => {
			this.updateData(data);
		}, 350);
	}

	setup_navigation(init) {
		if(init) {
			// Hack: defer nav till initial updateData
			setTimeout(() => {
				super.setup_navigation(init);
			}, 500);
		} else {
			super.setup_navigation(init);
		}
	}

	make_new_units(d) {
		this.make_new_units_for_dataset(
			this.x_axis_positions,
			d.y_tops,
			this.colors[d.index],
			d.index,
			this.y.length
		);
	}

	make_new_units_for_dataset(x_values, y_values, color, dataset_index,
		no_of_datasets, units_group, units_array, unit) {

		if(!units_group) units_group = this.svg_units_groups[dataset_index];
		if(!units_array) units_array = this.y[dataset_index].svg_units;
		if(!unit) unit = this.unit_args;

		units_group.textContent = '';
		units_array.length = 0;

		let unit_renderer = new UnitRenderer(this.height, this.zero_line, this.avg_unit_width);

		y_values.map((y, i) => {
			let data_unit = unit_renderer[unit.type](
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
			let o = offset(this.chart_wrapper);
			let relX = e.pageX - o.left - this.translate_x;
			let relY = e.pageY - o.top - this.translate_y;

			if(relY < this.height + this.translate_y * 2) {
				this.map_tooltip_x_position_and_show(relX);
			} else {
				this.tip.hide_tip();
			}
		});
	}

	map_tooltip_x_position_and_show(relX) {
		if(!this.y_min_tops) return;

		let titles = this.x;
		if(this.format_tooltip_x && this.format_tooltip_x(this.x[0])) {
			titles = this.x.map(d=>this.format_tooltip_x(d));
		}

		let y_format = this.format_tooltip_y && this.format_tooltip_y(this.y[0].values[0]);

		for(var i=this.x_axis_positions.length - 1; i >= 0 ; i--) {
			let x_val = this.x_axis_positions[i];
			// let delta = i === 0 ? this.avg_unit_width : x_val - this.x_axis_positions[i-1];
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
	updateData(new_y, new_x) {
		if(!new_x) {
			new_x = this.x;
		}
		this.updating = true;

		this.old_x_values = this.x.slice();
		this.old_y_axis_tops = this.y.map(d => d.y_tops.slice());

		this.old_y_values = this.y.map(d => d.values);

		// Just update values prop, setup_x/y() will do the rest
		if(new_y) this.y.map(d => {d.values = new_y[d.index].values;});
		if(new_x) this.x = new_x;

		this.setup_x();
		this.setup_y();

		// Change in data, so calculate dependencies
		this.calc_y_dependencies();

		// Got the values? Now begin drawing
		this.animator = new Animator(this.height, this.width, this.zero_line, this.avg_unit_width);

		this.animate_graphs();

		this.updating = false;
	}

	animate_graphs() {
		this.elements_to_animate = [];
		// Pre-prep, equilize no of positions between old and new
		let [old_x, new_x] = equilizeNoOfElements(
			this.x_old_axis_positions.slice(),
			this.x_axis_positions.slice()
		);

		let [oldYAxis, newYAxis] = equilizeNoOfElements(
			this.oldYAxisPositions.slice(),
			this.yAxisPositions.slice()
		);

		let newXValues = this.x.slice();
		let newYValues = this.y_axis_values.slice();

		let extra_points = this.x_axis_positions.slice().length - this.x_old_axis_positions.slice().length;

		if(extra_points > 0) {
			this.makeXLines(old_x, newXValues);
		}
		// No Y extra check?
		this.makeYLines(oldYAxis, newYValues);

		// Animation
		if(extra_points !== 0) {
			this.animateXLines(old_x, new_x);
		}
		this.animateYLines(oldYAxis, newYAxis);

		this.y.map(d => {
			let [old_y, new_y] = equilizeNoOfElements(
				this.old_y_axis_tops[d.index].slice(),
				d.y_tops.slice()
			);
			if(extra_points > 0) {
				this.make_path && this.make_path(d, old_x, old_y, this.colors[d.index]);
				this.make_new_units_for_dataset(old_x, old_y, this.colors[d.index], d.index, this.y.length);
			}
			// Animation
			d.path && this.animate_path(d, new_x, new_y);
			this.animate_units(d, new_x, new_y);
		});

		runSMILAnimation(this.chart_wrapper, this.svg, this.elements_to_animate);

		setTimeout(() => {
			this.y.map(d => {
				this.make_path && this.make_path(d, this.x_axis_positions, d.y_tops, this.colors[d.index]);
				this.make_new_units(d);

				this.makeYLines(this.yAxisPositions, this.y_axis_values);
				this.makeXLines(this.x_axis_positions, this.x);
				// this.make_y_specifics(this.yAnnotationPositions, this.specific_values);
			});
		}, 400);
	}

	animate_path(d, new_x, new_y) {
		const newPointsList = new_y.map((y, i) => (new_x[i] + ',' + y));
		this.elements_to_animate = this.elements_to_animate
			.concat(this.animator.path(d, newPointsList.join("L")));
	}

	animate_units(d, new_x, new_y) {
		let type = this.unit_args.type;

		d.svg_units.map((unit, i) => {
			if(new_x[i] === undefined || new_y[i] === undefined) return;
			this.elements_to_animate.push(this.animator[type](
				{unit:unit, array:d.svg_units, index: i}, // unit, with info to replace where it came from in the data
				new_x[i],
				new_y[i],
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

	add_data_point(y_point, x_point, index=this.x.length) {
		let new_y = this.y.map(data_set => { return {values:data_set.values}; });
		new_y.map((d, i) => { d.values.splice(index, 0, y_point[i]); });
		let new_x = this.x.slice();
		new_x.splice(index, 0, x_point);

		this.updateData(new_y, new_x);
	}

	remove_data_point(index = this.x.length-1) {
		if(this.x.length < 3) return;

		let new_y = this.y.map(data_set => { return {values:data_set.values}; });
		new_y.map((d) => { d.values.splice(index, 1); });
		let new_x = this.x.slice();
		new_x.splice(index, 1);

		this.updateData(new_y, new_x);
	}

	getDataPoint(index=this.current_index) {
		// check for length
		let data_point = {
			index: index
		};
		let y = this.y[0];
		['svg_units', 'y_tops', 'values'].map(key => {
			let data_key = key.slice(0, key.length-1);
			data_point[data_key] = y[key][index];
		});
		data_point.label = this.x[index];
		return data_point;
	}

	updateCurrentDataPoint(index) {
		index = parseInt(index);
		if(index < 0) index = 0;
		if(index >= this.x.length) index = this.x.length - 1;
		if(index === this.current_index) return;
		this.current_index = index;
		$.fire(this.parent, "data-select", this.getDataPoint());
	}

	set_avg_unit_width_and_x_offset() {
		// Set the ... you get it
		this.avg_unit_width = this.width/(this.x.length - 1);
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

	calc_y_dependencies() {
		this.y_min_tops = new Array(this.x.length).fill(9999);
		this.y.map(d => {
			d.y_tops = d.values.map( val => floatTwo(this.zero_line - val * this.multiplier));
			d.y_tops.map( (y_top, i) => {
				if(y_top < this.y_min_tops[i]) {
					this.y_min_tops[i] = y_top;
				}
			});
		});
		// this.chart_wrapper.removeChild(this.tip.container);
		// this.make_tooltip();
	}
}