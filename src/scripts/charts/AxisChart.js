import $ from '../helpers/dom';
import { float_2, arrays_equal, get_string_width, get_bar_height_and_y_attr } from '../helpers/utils';
import BaseChart from './BaseChart';

export default class AxisChart extends BaseChart {
	constructor(args) {
		super(args);

		this.x = this.data.labels;
		this.y = this.data.datasets;

		this.is_series = args.is_series;

		this.get_y_label = this.format_lambdas.y_label;
		this.get_y_tooltip = this.format_lambdas.y_tooltip;
		this.get_x_tooltip = this.format_lambdas.x_tooltip;

		this.colors = ['green', 'blue', 'violet', 'red', 'orange',
			'yellow', 'light-blue', 'light-green', 'purple', 'magenta'];

		this.zero_line = this.height;

		this.old_values = {};
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
			float_2(this.x_offset + i * this.avg_unit_width));

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

		this.y_axis_values = this.get_y_axis_points(values);

		if(!this.y_old_axis_values) {
			this.y_old_axis_values = this.y_axis_values.slice();
		}

		const y_pts = this.y_axis_values;
		const value_range = y_pts[y_pts.length-1] - y_pts[0];

		if(this.multiplier) this.old_multiplier = this.multiplier;
		this.multiplier = this.height / value_range;
		if(!this.old_multiplier) this.old_multiplier = this.multiplier;

		const zero_index = y_pts.indexOf(0);
		const interval = y_pts[1] - y_pts[0];
		const interval_height = interval * this.multiplier;

		if(this.zero_line) this.old_zero_line = this.zero_line;
		this.zero_line = this.height - (zero_index * interval_height);
		if(!this.old_zero_line) this.old_zero_line = this.zero_line;
	}

	setup_components() {
		super.setup_components();
		this.setup_marker_components();
		this.setup_aggregation_components();
		this.setup_graph_components();
	}

	setup_marker_components() {
		this.y_axis_group = $.createSVG('g', {className: 'y axis', inside: this.draw_area});
		this.x_axis_group = $.createSVG('g', {className: 'x axis', inside: this.draw_area});
		this.specific_y_group = $.createSVG('g', {className: 'specific axis', inside: this.draw_area});
	}

	setup_aggregation_components() {
		this.sum_group = $.createSVG('g', {className: 'data-points', inside: this.draw_area});
		this.average_group = $.createSVG('g', {className: 'chart-area', inside: this.draw_area});
	}

	setup_graph_components() {
		this.svg_units_groups = [];
		this.y.map((d, i) => {
			this.svg_units_groups[i] = $.createSVG('g', {
				className: 'data-points data-points-' + i,
				inside: this.draw_area
			});
		});
	}

	make_graph_components(init=false) {
		this.make_y_axis();
		this.make_x_axis();
		this.draw_graph(init);
		this.make_y_specifics();
	}

	// make VERTICAL lines for x values
	make_x_axis(animate=false) {
		let char_width = 8;
		let start_at, height, text_start_at, axis_line_class = '';
		if(this.x_axis_mode === 'span') {		// long spanning lines
			start_at = -7;
			height = this.height + 15;
			text_start_at = this.height + 25;
		} else if(this.x_axis_mode === 'tick'){	// short label lines
			start_at = this.height;
			height = 6;
			text_start_at = 9;
			axis_line_class = 'x-axis-label';
		}

		this.x_axis_group.setAttribute('transform', `translate(0,${start_at})`);

		if(animate) {
			this.make_anim_x_axis(height, text_start_at, axis_line_class);
			return;
		}

		let allowed_space = this.avg_unit_width * 1.5;
		let allowed_letters = allowed_space / 8;

		this.x_axis_group.textContent = '';
		this.x.map((point, i) => {
			let space_taken = get_string_width(point, char_width) + 2;
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
					point = point.slice(0, allowed_letters-3) + " ...";
				}
			}
			this.x_axis_group.appendChild(
				this.make_x_line(
					height,
					text_start_at,
					point,
					'x-value-text',
					axis_line_class,
					this.x_axis_positions[i]
				)
			);
		});
	}

	// make HORIZONTAL lines for y values
	make_y_axis(animate=false) {
		if(animate) {
			this.make_anim_y_axis();
			this.make_anim_y_specifics();
			return;
		}

		let [width, text_end_at, axis_line_class, start_at] = this.get_y_axis_line_props();

		this.y_axis_group.textContent = '';
		this.y_axis_values.map((value, i) => {
			this.y_axis_group.appendChild(
				this.make_y_line(
					start_at,
					width,
					text_end_at,
					value,
					'y-value-text',
					axis_line_class,
					this.zero_line - value * this.multiplier,
					(value === 0 && i !== 0) // Non-first Zero line
				)
			);
		});
	}

	get_y_axis_line_props(specific=false) {
		if(specific) {
			return[this.width, this.width + 5, 'specific-value', 0];
		}
		let width, text_end_at = -9, axis_line_class = '', start_at = 0;
		if(this.y_axis_mode === 'span') {		// long spanning lines
			width = this.width + 6;
			start_at = -6;
		} else if(this.y_axis_mode === 'tick'){	// short label lines
			width = -6;
			axis_line_class = 'y-axis-label';
		}

		return [width, text_end_at, axis_line_class, start_at];
	}

	draw_graph(init=false) {
		if(this.raw_chart_args.hasOwnProperty("init") && !this.raw_chart_args.init) {
			this.y.map((d, i) => {
				d.svg_units = [];
				this.make_path && this.make_path(d, i, this.x_axis_positions, d.y_tops, d.color || this.colors[i]);
				this.make_new_units(d, i);
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
			this.make_path && this.make_path(d, i, this.x_axis_positions, d.y_tops, d.color || this.colors[i]);
			this.make_new_units(d, i);
		});
	}

	draw_new_graph_and_animate() {
		let data = [];
		this.y.map((d, i) => {
			// Anim: Don't draw initial values, store them and update later
			d.y_tops = new Array(d.values.length).fill(this.zero_line); // no value
			data.push({values: d.values});
			d.svg_units = [];

			this.make_path && this.make_path(d, i, this.x_axis_positions, d.y_tops, d.color || this.colors[i]);
			this.make_new_units(d, i);
		});

		setTimeout(() => {
			this.update_values(data);
		}, 350);
	}

	setup_navigation(init) {
		if(init) {
			// Hack: defer nav till initial update_values
			setTimeout(() => {
				super.setup_navigation(init);
			}, 500);
		} else {
			super.setup_navigation(init);
		}
	}

	make_new_units(d, i) {
		this.make_new_units_for_dataset(
			this.x_axis_positions,
			d.y_tops,
			d.color || this.colors[i],
			i,
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

		y_values.map((y, i) => {
			let data_unit = this.draw[unit.type](
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

	make_y_specifics() {
		this.specific_y_group.textContent = '';
		this.specific_values.map(d => {
			this.specific_y_group.appendChild(
				this.make_y_line(
					0,
					this.width,
					this.width + 5,
					d.title.toUpperCase(),
					'specific-value',
					'specific-value',
					this.zero_line - d.value * this.multiplier,
					false,
					d.line_type
				)
			);
		});
	}

	bind_tooltip() {
		// TODO: could be in tooltip itself, as it is a given functionality for its parent
		this.chart_wrapper.addEventListener('mousemove', (e) => {
			let offset = $.offset(this.chart_wrapper);
			let relX = e.pageX - offset.left - this.translate_x;
			let relY = e.pageY - offset.top - this.translate_y;

			if(relY < this.height + this.translate_y * 2) {
				this.map_tooltip_x_position_and_show(relX);
			} else {
				this.tip.hide_tip();
			}
		});
	}

	map_tooltip_x_position_and_show(relX) {
		if(!this.y_min_tops) return;
		for(var i=this.x_axis_positions.length - 1; i >= 0 ; i--) {
			let x_val = this.x_axis_positions[i];
			// let delta = i === 0 ? this.avg_unit_width : x_val - this.x_axis_positions[i-1];
			if(relX > x_val - this.avg_unit_width/2) {
				let x = x_val + this.translate_x;
				let y = this.y_min_tops[i] + this.translate_y;

				let title = this.x.formatted && this.x.formatted.length>0
					? this.x.formatted[i] : this.x[i];
				let values = this.y.map((set, j) => {
					return {
						title: set.title,
						value: set.formatted ? set.formatted[i] : set.values[i],
						color: set.color || this.colors[j],
					};
				});

				// TODO: upside-down tooltips for negative values?
				this.tip.set_values(x, y, title, '', values);
				this.tip.show_tip();
				break;
			}
		}
	}

	// API
	show_sums() {
		this.updating = true;

		this.y_sums = new Array(this.x_axis_positions.length).fill(0);
		this.y.map(d => {
			d.values.map( (value, i) => {
				this.y_sums[i] += value;
			});
		});

		// Remake y axis, animate
		this.update_values();

		// Then make sum units, don't animate
		this.sum_units = [];

		this.make_new_units_for_dataset(
			this.x_axis_positions,
			this.y_sums.map( val => float_2(this.zero_line - val * this.multiplier)),
			'light-grey',
			0,
			1,
			this.sum_group,
			this.sum_units
		);

		// this.make_path && this.make_path(d, i, old_x, old_y, d.color || this.colors[i]);

		this.updating = false;
	}

	hide_sums() {
		if(this.updating) return;
		this.y_sums = [];
		this.sum_group.textContent = '';
		this.sum_units = [];
		this.update_values();
	}

	show_averages() {
		this.old_specific_values = this.specific_values.slice();
		this.y.map((d, i) => {
			let sum = 0;
			d.values.map(e => {sum+=e;});
			let average = sum/d.values.length;

			this.specific_values.push({
				title: "AVG" + " " + (i+1),
				line_type: "dashed",
				value: average,
				auto: 1
			});
		});

		this.update_values();
	}

	hide_averages() {
		this.old_specific_values = this.specific_values.slice();

		let indices_to_remove = [];
		this.specific_values.map((d, i) => {
			if(d.auto) indices_to_remove.unshift(i);
		});

		indices_to_remove.map(index => {
			this.specific_values.splice(index, 1);
		});

		this.update_values();
	}

	update_values(new_y, new_x) {
		if(!new_x) {
			new_x = this.x;
		}
		this.elements_to_animate = [];
		this.updating = true;

		this.old_x_values = this.x.slice();
		this.old_y_axis_tops = this.y.map(d => d.y_tops.slice());

		this.old_y_values = this.y.map(d => d.values);

		this.no_of_extra_pts = new_x.length - this.x.length;

		// Just update values prop, setup_x/y() will do the rest
		if(new_y) this.y.map((d, i) => {d.values = new_y[i].values;});
		if(new_x) this.x = new_x;

		this.setup_x();
		this.setup_y();

		// Animate only if positions have changed
		if(!arrays_equal(this.x_old_axis_positions, this.x_axis_positions)) {
			this.make_x_axis(true);
			setTimeout(() => {
				if(!this.updating) this.make_x_axis();
			}, 350);
		}

		if(!arrays_equal(this.y_old_axis_values, this.y_axis_values) ||
			(this.old_specific_values &&
			!arrays_equal(this.old_specific_values, this.specific_values))) {

			this.make_y_axis(true);
			setTimeout(() => {
				if(!this.updating) {
					this.make_y_axis();
					this.make_y_specifics();
				}
			}, 350);
		}

		// Change in data, so calculate dependencies
		this.calc_y_dependencies();

		this.animate_graphs();

		// Trigger animation with the animatable elements in this.elements_to_animate
		this.run_animation();

		this.updating = false;
	}

	add_data_point(y_point, x_point, index=this.x.length) {
		let new_y = this.y.map(data_set => { return {values:data_set.values}; });
		new_y.map((d, i) => { d.values.splice(index, 0, y_point[i]); });
		let new_x = this.x.slice();
		new_x.splice(index, 0, x_point);

		this.update_values(new_y, new_x);
	}

	remove_data_point(index = this.x.length-1) {
		if(this.x.length < 3) return;

		let new_y = this.y.map(data_set => { return {values:data_set.values}; });
		new_y.map((d) => { d.values.splice(index, 1); });
		let new_x = this.x.slice();
		new_x.splice(index, 1);

		this.update_values(new_y, new_x);
	}

	run_animation() {
		let anim_svg = $.runSVGAnimation(this.svg, this.elements_to_animate);

		if(this.svg.parentNode == this.chart_wrapper) {
			this.chart_wrapper.removeChild(this.svg);
			this.chart_wrapper.appendChild(anim_svg);

		}

		// Replace the new svg (data has long been replaced)
		setTimeout(() => {
			if(anim_svg.parentNode == this.chart_wrapper) {
				this.chart_wrapper.removeChild(anim_svg);
				this.chart_wrapper.appendChild(this.svg);
			}
		}, 250);
	}

	animate_graphs() {
		this.y.map((d, i) => {
			// Pre-prep, equilize no of positions between old and new
			let [old_x, old_y, new_x, new_y] = this.calc_old_and_new_postions(d, i);
			if(this.no_of_extra_pts >= 0) {
				this.make_path && this.make_path(d, i, old_x, old_y, d.color || this.colors[i]);
				this.make_new_units_for_dataset(old_x, old_y, d.color || this.colors[i], i, this.y.length);
			}
			d.path && this.animate_path(d, i, old_x, old_y, new_x, new_y);
			this.animate_units(d, i, old_x, old_y, new_x, new_y);
		});

		// TODO: replace with real units
		setTimeout(() => {
			this.y.map((d, i) => {
				this.make_path && this.make_path(d, i, this.x_axis_positions, d.y_tops, d.color || this.colors[i]);
				this.make_new_units(d, i);
			});
		}, 400);
	}

	animate_path(d, i, old_x, old_y, new_x, new_y) {
		// Animate path
		const new_points_list = new_y.map((y, i) => (new_x[i] + ',' + y));
		const new_path_str = new_points_list.join("L");

		const path_args = [{unit: d.path, object: d, key: 'path'}, {d:"M"+new_path_str}, 350, "easein"];
		this.elements_to_animate.push(path_args);

		// Animate region
		if(d.region_path) {
			let reg_start_pt = `0,${this.zero_line}L`;
			let reg_end_pt = `L${this.width},${this.zero_line}`;

			const region_args = [
				{unit: d.region_path, object: d, key: 'region_path'},
				{d:"M" + reg_start_pt + new_path_str + reg_end_pt},
				350,
				"easein"
			];
			this.elements_to_animate.push(region_args);
		}
	}

	animate_units(d, index, old_x, old_y, new_x, new_y) {
		let type = this.unit_args.type;

		d.svg_units.map((unit, i) => {
			if(new_x[i] === undefined || new_y[i] === undefined) return;
			this.elements_to_animate.push(this.animate[type](
				{unit:unit, array:d.svg_units, index: i}, // unit, with info to replace where it came from in the data
				new_x[i],
				new_y[i],
				index
			));
		});
	}

	calc_old_and_new_postions(d, i) {
		let old_x = this.x_old_axis_positions.slice();
		let new_x = this.x_axis_positions.slice();

		let old_y = this.old_y_axis_tops[i].slice();
		let new_y = d.y_tops.slice();

		const last_old_x_pos = old_x[old_x.length - 1];
		const last_old_y_pos = old_y[old_y.length - 1];

		const last_new_x_pos = new_x[new_x.length - 1];
		const last_new_y_pos = new_y[new_y.length - 1];

		if(this.no_of_extra_pts >= 0) {
			// First substitute current path with a squiggled one (looking the same but
			// having more points at end),
			// then animate to stretch it later to new points
			// (new points already have more points)

			// Hence, the extra end points will correspond to current(old) positions
			let filler_x = new Array(Math.abs(this.no_of_extra_pts)).fill(last_old_x_pos);
			let filler_y = new Array(Math.abs(this.no_of_extra_pts)).fill(last_old_y_pos);

			old_x = old_x.concat(filler_x);
			old_y = old_y.concat(filler_y);

		} else {
			// Just modify the new points to have extra points
			// with the same position at end
			let filler_x = new Array(Math.abs(this.no_of_extra_pts)).fill(last_new_x_pos);
			let filler_y = new Array(Math.abs(this.no_of_extra_pts)).fill(last_new_y_pos);

			new_x = new_x.concat(filler_x);
			new_y = new_y.concat(filler_y);
		}

		return [old_x, old_y, new_x, new_y];
	}

	make_anim_x_axis(height, text_start_at, axis_line_class) {
		// Animate X AXIS to account for more or less axis lines

		const old_pos = this.x_old_axis_positions;
		const new_pos = this.x_axis_positions;

		const old_vals = this.old_x_values;
		const new_vals = this.x;

		const last_line_pos = old_pos[old_pos.length - 1];

		let add_and_animate_line = (value, old_pos, new_pos) => {
			if(typeof new_pos === 'string') {
				new_pos = parseInt(new_pos.substring(0, new_pos.length-1));
			}
			const x_line = this.make_x_line(
				height,
				text_start_at,
				value, // new value
				'x-value-text',
				axis_line_class,
				old_pos // old position
			);
			this.x_axis_group.appendChild(x_line);

			this.elements_to_animate && this.elements_to_animate.push([
				{unit: x_line, array: [0], index: 0},
				{transform: `${ new_pos }, 0`},
				350,
				"easein",
				"translate",
				{transform: `${ old_pos }, 0`}
			]);
		};

		this.x_axis_group.textContent = '';

		this.make_new_axis_anim_lines(
			old_pos,
			new_pos,
			old_vals,
			new_vals,
			last_line_pos,
			add_and_animate_line
		);
	}

	make_anim_y_axis() {
		// Animate Y AXIS to account for more or less axis lines

		const old_pos = this.y_old_axis_values.map(value =>
			this.zero_line - value * this.multiplier);
		const new_pos = this.y_axis_values.map(value =>
			this.zero_line - value * this.multiplier);

		const old_vals = this.y_old_axis_values;
		const new_vals = this.y_axis_values;

		const last_line_pos = old_pos[old_pos.length - 1];

		this.y_axis_group.textContent = '';

		this.make_new_axis_anim_lines(
			old_pos,
			new_pos,
			old_vals,
			new_vals,
			last_line_pos,
			this.add_and_animate_y_line.bind(this),
			this.y_axis_group
		);
	}

	make_anim_y_specifics() {
		this.specific_y_group.textContent = '';
		this.specific_values.map((d) => {
			this.add_and_animate_y_line(
				d.title,
				this.old_zero_line - d.value * this.old_multiplier,
				this.zero_line - d.value * this.multiplier,
				0,
				this.specific_y_group,
				d.line_type,
				true
			);
		});
	}

	make_new_axis_anim_lines(old_pos, new_pos, old_vals, new_vals, last_line_pos, add_and_animate_line, group) {
		let superimposed_positions, superimposed_values;
		let no_of_extras = new_vals.length - old_vals.length;
		if(no_of_extras > 0) {
			// More axis are needed
			// First make only the superimposed (same position) ones
			// Add in the extras at the end later
			superimposed_positions = new_pos.slice(0, old_pos.length);
			superimposed_values = new_vals.slice(0, old_vals.length);
		} else {
			// Axis have to be reduced
			// Fake it by moving all current extra axis to the last position
			// You'll need filler positions and values in the new arrays
			const filler_vals = new Array(Math.abs(no_of_extras)).fill("");
			superimposed_values = new_vals.concat(filler_vals);

			const filler_pos = new Array(Math.abs(no_of_extras)).fill(last_line_pos + "F");
			superimposed_positions = new_pos.concat(filler_pos);
		}

		superimposed_values.map((value, i) => {
			add_and_animate_line(value, old_pos[i], superimposed_positions[i], i, group);
		});

		if(no_of_extras > 0) {
			// Add in extra axis in the end
			// and then animate to new positions
			const extra_values = new_vals.slice(old_vals.length);
			const extra_positions = new_pos.slice(old_pos.length);

			extra_values.map((value, i) => {
				add_and_animate_line(value, last_line_pos, extra_positions[i], i, group);
			});
		}
	}

	make_x_line(height, text_start_at, point, label_class, axis_line_class, x_pos) {
		let line = $.createSVG('line', {
			x1: 0,
			x2: 0,
			y1: 0,
			y2: height
		});

		let text = $.createSVG('text', {
			className: label_class,
			x: 0,
			y: text_start_at,
			dy: '.71em',
			innerHTML: point
		});

		let x_level = $.createSVG('g', {
			className: `tick ${axis_line_class}`,
			transform: `translate(${ x_pos }, 0)`
		});

		x_level.appendChild(line);
		x_level.appendChild(text);

		return x_level;
	}

	make_y_line(start_at, width, text_end_at, point, label_class, axis_line_class, y_pos, darker=false, line_type="") {
		let line = $.createSVG('line', {
			className: line_type === "dashed" ? "dashed": "",
			x1: start_at,
			x2: width,
			y1: 0,
			y2: 0
		});

		let text = $.createSVG('text', {
			className: label_class,
			x: text_end_at,
			y: 0,
			dy: '.32em',
			innerHTML: point+""
		});

		let y_level = $.createSVG('g', {
			className: `tick ${axis_line_class}`,
			transform: `translate(0, ${y_pos})`,
			'stroke-opacity': 1
		});

		if(darker) {
			line.style.stroke = "rgba(27, 31, 35, 0.6)";
		}

		y_level.appendChild(line);
		y_level.appendChild(text);

		return y_level;
	}

	add_and_animate_y_line(value, old_pos, new_pos, i, group, type, specific=false) {
		let filler = false;
		if(typeof new_pos === 'string') {
			new_pos = parseInt(new_pos.substring(0, new_pos.length-1));
			filler = true;
		}
		let new_props = {transform: `0, ${ new_pos }`};
		let old_props = {transform: `0, ${ old_pos }`};

		if(filler) {
			new_props['stroke-opacity'] = 0;
			// old_props['stroke-opacity'] = 1;
		}

		let [width, text_end_at, axis_line_class, start_at] = this.get_y_axis_line_props(specific);
		let axis_label_class = !specific ? 'y-value-text' : 'specific-value';
		value = !specific ? value : (value+"").toUpperCase();
		const y_line = this.make_y_line(
			start_at,
			width,
			text_end_at,
			value,
			axis_label_class,
			axis_line_class,
			old_pos,  // old position
			(value === 0 && i !== 0), // Non-first Zero line
			type
		);

		group.appendChild(y_line);

		this.elements_to_animate && this.elements_to_animate.push([
			{unit: y_line, array: [0], index: 0},
			new_props,
			350,
			"easein",
			"translate",
			old_props
		]);
	}

	get_y_axis_points(array) {
		//*** Where the magic happens ***

		// Calculates best-fit y intervals from given values
		// and returns the interval array

		// TODO: Fractions

		let max_bound, min_bound, pos_no_of_parts, neg_no_of_parts, part_size; // eslint-disable-line no-unused-vars

		// Critical values
		let max_val = parseInt(Math.max(...array));
		let min_val = parseInt(Math.min(...array));
		if(min_val >= 0) {
			min_val = 0;
		}

		let get_params = (value1, value2) => {
			let bound1, bound2, no_of_parts_1, no_of_parts_2, interval_size;
			if((value1+"").length <= 1) {
				[bound1, no_of_parts_1] = [10, 5];
			} else {
				[bound1, no_of_parts_1] = this.calc_upper_bound_and_no_of_parts(value1);
			}

			interval_size = bound1 / no_of_parts_1;
			no_of_parts_2 = this.calc_no_of_parts(value2, interval_size);
			bound2 = no_of_parts_2 * interval_size;

			return [bound1, bound2, no_of_parts_1, no_of_parts_2, interval_size];
		};

		const abs_min_val = min_val * -1;
		if(abs_min_val <= max_val) {
			// Get the positive region intervals
			// then calc negative ones accordingly
			[max_bound, min_bound, pos_no_of_parts, neg_no_of_parts, part_size]
				= get_params(max_val, abs_min_val);
			if(abs_min_val === 0) {
				min_bound = 0; neg_no_of_parts = 0;
			}
		} else {
			// Get the negative region here first
			[min_bound, max_bound, neg_no_of_parts, pos_no_of_parts, part_size]
				= get_params(abs_min_val, max_val);
		}

		// Make both region parts even
		if(pos_no_of_parts % 2 !== 0 && neg_no_of_parts > 0) pos_no_of_parts++;
		if(neg_no_of_parts % 2 !== 0) {
			// every increase in no_of_parts entails an increase in corresponding bound
			// except here, it happens implicitly after every calc_no_of_parts() call
			neg_no_of_parts++;
			min_bound += part_size;
		}

		let no_of_parts = pos_no_of_parts + neg_no_of_parts;
		if(no_of_parts > 5) {
			no_of_parts /= 2;
			part_size *= 2;

			pos_no_of_parts /=2;
		}

		if (max_val < (pos_no_of_parts - 1) * part_size) {
			no_of_parts--;
		}

		return this.get_intervals(
			(-1) * min_bound,
			part_size,
			no_of_parts
		);
	}

	get_intervals(start, interval_size, count) {
		let intervals = [];
		for(var i = 0; i <= count; i++){
			intervals.push(start);
			start += interval_size;
		}
		return intervals;
	}

	calc_upper_bound_and_no_of_parts(max_val) {
		// Given a positive value, calculates a nice-number upper bound
		// and a consequent optimal number of parts

		const part_size = Math.pow(10, ((max_val+"").length - 1));
		const no_of_parts = this.calc_no_of_parts(max_val, part_size);

		// Use it to get a nice even upper bound
		const upper_bound = part_size * no_of_parts;

		return [upper_bound, no_of_parts];
	}

	calc_no_of_parts(value, divisor) {
		// value should be a positive number, divisor should be greater than 0
		// returns an even no of parts
		let no_of_parts = Math.ceil(value / divisor);
		if(no_of_parts % 2 !== 0) no_of_parts++; // Make it an even number

		return no_of_parts;
	}

	get_optimal_no_of_parts(no_of_parts) {
		// aka Divide by 2 if too large
		return (no_of_parts < 5) ? no_of_parts : no_of_parts / 2;
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
		this.y_min_tops = new Array(this.x_axis_positions.length).fill(9999);
		this.y.map(d => {
			d.y_tops = d.values.map( val => float_2(this.zero_line - val * this.multiplier));
			d.y_tops.map( (y_top, i) => {
				if(y_top < this.y_min_tops[i]) {
					this.y_min_tops[i] = y_top;
				}
			});
		});
		// this.chart_wrapper.removeChild(this.tip.container);
		// this.make_tooltip();
	}

	setup_utils() {
		this.draw = {
			'bar': (x, y_top, args, color, index, dataset_index, no_of_datasets) => {
				let total_width = this.avg_unit_width - args.space_width;
				let start_x = x - total_width/2;

				let width = total_width / no_of_datasets;
				let current_x = start_x + width * dataset_index;

				let [height, y] = get_bar_height_and_y_attr(y_top, this.zero_line, this.height);

				return $.createSVG('rect', {
					className: `bar mini fill ${color}`,
					'data-point-index': index,
					x: current_x,
					y: y,
					width: width,
					height: height
				});

			},
			'dot': (x, y, args, color, index) => {
				return $.createSVG('circle', {
					className: `fill ${color}`,
					'data-point-index': index,
					cx: x,
					cy: y,
					r: args.radius
				});
			}
		};

		this.animate = {
			'bar': (bar_obj, x, y_top, index) => {
				let start = x - this.avg_unit_width/4;
				let width = (this.avg_unit_width/2)/this.y.length;
				let [height, y] = get_bar_height_and_y_attr(y_top, this.zero_line, this.height);

				x = start + (width * index);

				return [bar_obj, {width: width, height: height, x: x, y: y}, 350, "easein"];
				// bar.animate({height: args.new_height, y: y_top}, 350, mina.easein);
			},
			'dot': (dot_obj, x, y_top) => {
				return [dot_obj, {cx: x, cy: y_top}, 350, "easein"];
				// dot.animate({cy: y_top}, 350, mina.easein);
			}
		};
	}
}
