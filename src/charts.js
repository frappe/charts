// specific_values = [
// 	{
// 		title: "Average",
// 		line_type: "dashed",	// "dashed" or "solid"
// 		value: 10
// 	},

// summary = [
// 	{
// 		title: "Total",
// 		color: 'blue',		// Indicator colors: 'grey', 'blue', 'red', 'green', 'orange',
// 					// 'violet', 'darkgrey', 'black', 'yellow', 'light-blue'
// 		value: 80
// 	}
// ]

// Validate all arguments, check passed data format, set defaults
"use strict";

let frappe = {chart:{}};

frappe.chart.FrappeChart = class {
	constructor({
		parent = "",
		height = 240,

		title = '', subtitle = '',

		data = {},
		format_lambdas = {},

		specific_values = [],
		summary = [],

		is_navigable = 0,

		type = ''
	}) {
		if(Object.getPrototypeOf(this) === frappe.chart.FrappeChart.prototype) {
			if(type === 'line') {
				return new frappe.chart.LineChart(arguments[0]);
			} else if(type === 'bar') {
				return new frappe.chart.BarChart(arguments[0]);
			} else if(type === 'percentage') {
				return new frappe.chart.PercentageChart(arguments[0]);
			} else if(type === 'heatmap') {
				return new frappe.chart.HeatMap(arguments[0]);
			} else {
				return new frappe.chart.LineChart(arguments[0]);
			}
		}

		this.parent = document.querySelector(parent);
		this.title = title;
		this.subtitle = subtitle;

		this.data = data;
		this.format_lambdas = format_lambdas;

		this.specific_values = specific_values;
		this.summary = summary;

		this.is_navigable = is_navigable;
		if(this.is_navigable) {
			this.current_index = 0;
		}

		this.set_margins(height);
	}

	set_margins(height) {
		this.base_height = height;
		this.height = height - 40;
		this.translate_x = 60;
		this.translate_y = 10;
	}

	setup() {
		this.bind_window_events();
		this.refresh();
	}

	bind_window_events() {
		window.addEventListener('resize', () => this.refresh());
		window.addEventListener('orientationchange', () => this.refresh());
	}

	refresh() {
		this.setup_base_values();
		this.set_width();

		this.setup_container();
		this.setup_components();

		this.setup_values();
		this.setup_utils();

		this.make_graph_components();
		this.make_tooltip();

		if(this.summary.length > 0) {
			this.show_custom_summary();
		} else {
			this.show_summary();
		}

		if(this.is_navigable) {
			this.setup_navigation();
		}
	}

	set_width() {
		let special_values_width = 0;
		this.specific_values.map(val => {
			if(this.get_strwidth(val.title) > special_values_width) {
				special_values_width = this.get_strwidth(val.title);
			}
		});
		this.base_width = this.parent.offsetWidth - special_values_width;
		this.width = this.base_width - this.translate_x * 2;
	}

	setup_base_values() {}

	setup_container() {
		this.container = $$.create('div', {
			className: 'chart-container',
			innerHTML: `<h6 class="title" style="margin-top: 15px;">${this.title}</h6>
				<h6 class="sub-title uppercase">${this.subtitle}</h6>
				<div class="frappe-chart graphics"></div>
				<div class="graph-stats-container"></div>`
		});

		// Chart needs a dedicated parent element
		this.parent.innerHTML = '';
		this.parent.appendChild(this.container);

		this.chart_wrapper = this.container.querySelector('.frappe-chart');
		this.stats_wrapper = this.container.querySelector('.graph-stats-container');

		this.make_chart_area();
		this.make_draw_area();
	}

	make_chart_area() {
		this.svg = $$.createSVG('svg', {
			className: 'chart',
			inside: this.chart_wrapper,
			width: this.base_width,
			height: this.base_height
		});

		this.svg_defs = $$.createSVG('defs', {
			inside: this.svg,
		});

		return this.svg;
	}

	make_draw_area() {
		this.draw_area = $$.createSVG("g", {
			className: this.type,
			inside: this.svg,
			transform: `translate(${this.translate_x}, ${this.translate_y})`
		});
	}

	setup_components() { }

	make_tooltip() {
		this.tip = new frappe.chart.SvgTip({
			parent: this.chart_wrapper,
		});
		this.bind_tooltip();
	}


	show_summary() {}
	show_custom_summary() {
		this.summary.map(d => {
			let stats = $$.create('div', {
				className: 'stats',
				innerHTML: `<span class="indicator ${d.color}">${d.title}: ${d.value}</span>`
			});
			this.stats_wrapper.appendChild(stats);
		});
	}

	setup_navigation() {
		this.make_overlay();
		this.bind_overlay();
		document.onkeydown = (e) => {
			e = e || window.event;

			if (e.keyCode == '37') {
				this.on_left_arrow();
			} else if (e.keyCode == '39') {
				this.on_right_arrow();
			} else if (e.keyCode == '38') {
				this.on_up_arrow();
			} else if (e.keyCode == '40') {
				this.on_down_arrow();
			} else if (e.keyCode == '13') {
				this.on_enter_key();
			}
		};
	}

	make_overlay() {}
	bind_overlay() {}

	on_left_arrow() {}
	on_right_arrow() {}
	on_up_arrow() {}
	on_down_arrow() {}
	on_enter_key() {}

	get_data_point(index=this.current_index) {
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

	update_current_data_point(index) {
		if(index < 0) index = 0;
		if(index >= this.x.length) index = this.x.length - 1;
		if(index === this.current_index) return;
		this.current_index = index;
		$$.fire(this.parent, "data-select", this.get_data_point());
	}

	// Helpers
	get_strwidth(string) {
		return string.length * 8;
	}

	// Objects
	setup_utils() { }
}

frappe.chart.AxisChart = class AxisChart extends frappe.chart.FrappeChart {
	constructor(args) {
		super(args);

		this.x = this.data.labels;
		this.y = this.data.datasets;

		this.get_x_label = this.format_lambdas.x_label;
		this.get_y_label = this.format_lambdas.y_label;
		this.get_x_tooltip = this.format_lambdas.x_tooltip;
		this.get_y_tooltip = this.format_lambdas.y_tooltip;

		this.colors = ['green', 'blue', 'violet', 'red', 'orange',
				'yellow', 'light-blue', 'light-green', 'purple', 'magenta'];

		this.zero_line = this.height;
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
			$$.float_2(this.x_offset + i * this.avg_unit_width));

		if(!this.x_old_axis_positions) {
			this.x_old_axis_positions = this.x_axis_positions.slice();
		}
	}

	setup_y() {
		const values = this.get_all_y_values();

		if(this.y_axis_positions) {
			this.y_old_axis_positions =  this.y_axis_positions.slice();
		}

		this.y_axis_positions = this.get_y_axis_points(values);

		if(!this.y_old_axis_positions) {
			this.y_old_axis_positions = this.y_axis_positions.slice();
		}

		// this.y_axis_positions = this.get_y_axis_points(values);

		const y_pts = this.y_axis_positions;
		const value_range = y_pts[y_pts.length-1] - y_pts[0];
		this.multiplier = this.height / value_range;

		const zero_index = y_pts.indexOf(0);
		const interval = y_pts[1] - y_pts[0];
		const interval_height = interval * this.multiplier;

		this.zero_line = this.height - (zero_index * interval_height);
	}

	setup_components() {
		super.setup_components();
		this.y_axis_group = $$.createSVG('g', {className: 'y axis', inside: this.draw_area});
		this.x_axis_group = $$.createSVG('g', {className: 'x axis', inside: this.draw_area});
		this.specific_y_group = $$.createSVG('g', {className: 'specific axis', inside: this.draw_area});

		this.svg_units_groups = [];
		this.y.map((d, i) => {
			this.svg_units_groups[i] = $$.createSVG('g', {
				className: 'data-points data-points-' + i,
				inside: this.draw_area
			});
		});
	}

	make_graph_components() {
		this.make_y_axis();
		this.make_x_axis();
		this.draw_graph();
		this.make_y_specifics();
	}

	// make HORIZONTAL lines for y values
	make_y_axis(animate=false) {
		let width, text_end_at = -9, axis_line_class = '', start_at = 0;
		if(this.y_axis_mode === 'span') {		// long spanning lines
			width = this.width + 6;
			start_at = -6;
		} else if(this.y_axis_mode === 'tick'){	// short label lines
			width = -6;
			axis_line_class = 'y-axis-label';
		}

		if(animate) {
			this.make_anim_y_axis(width, text_end_at, axis_line_class, start_at);
			return;
		}

		this.y_axis_group.textContent = '';
		this.y_axis_positions.map((point, i) => {
			this.y_axis_group.appendChild(
				this.make_y_line(
					start_at,
					width,
					text_end_at,
					point,
					'y-value-text',
					axis_line_class,
					this.zero_line - point * this.multiplier,
					(point === 0 && i !== 0) // Non-first Zero line
				)
			);
		});
	}

	// make VERTICAL lines for x values
	make_x_axis(animate=false) {
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

		this.x_axis_group.textContent = '';
		this.x.map((point, i) => {
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

	draw_graph() {
		// TODO: Don't animate on refresh
		let data = [];
		this.y.map((d, i) => {
			// Anim: Don't draw initial values, store them and update later
			d.y_tops = new Array(d.values.length).fill(this.zero_line); // no value
			data.push({values: d.values});
			d.svg_units = [];

			this.make_path && this.make_path(d, i, this.x_axis_positions, d.y_tops, d.color || this.colors[i]);
			this.make_new_units_for_dataset(this.x_axis_positions, d.y_tops, d.color || this.colors[i], i);
		});

		setTimeout(() => {
			this.update_values(data);
		}, 500);
	}

	setup_navigation() {
		// Hack: defer nav till initial update_values
		setTimeout(() => {
			super.setup_navigation();
		}, 1000);
	}

	make_new_units() {
		this.y.map((d, i) => {
			this.make_new_units_for_dataset(this.x_axis_positions, d.y_tops, d.color || this.colors[i], i);
		});
	}

	make_new_units_for_dataset(x_values, y_values, color, dataset_index) {
		let group = this.svg_units_groups[dataset_index];
		group.textContent = '';
		this.y[dataset_index].svg_units = [];

		let d = this.unit_args;
		y_values.map((y, i) => {
			let data_unit = this.draw[d.type](
				x_values[i],
				y,
				d.args,
				color,
				dataset_index
			);
			group.appendChild(data_unit);
			this.y[dataset_index].svg_units.push(data_unit);
		});
	}

	make_y_specifics() {
		this.specific_values.map(d => {
			this.specific_y_group.appendChild(
				this.make_y_line(
					0,
					this.width,
					this.width + 5,
					d.title.toUpperCase(),
					'specific-value',
					'specific-value',
					this.zero_line - d.value * this.multiplier
				)
			);
		});
	}

	bind_tooltip() {
		// TODO: could be in tooltip itself, as it is a given functionality for its parent
		this.chart_wrapper.addEventListener('mousemove', (e) => {
			let offset = $$.offset(this.chart_wrapper);
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
					}
				});

				// TODO: upside-down tooltips for negative values?
				this.tip.set_values(x, y, title, '', values);
				this.tip.show_tip();
				break;
			}
		}
	}

	make_anim_x_axis(height, text_start_at, axis_line_class) {
		// Animate X AXIS to account for more or less axis lines

		const old_pos = this.x_old_axis_positions;
		const new_pos = this.x_axis_positions;

		const old_vals = this.old_x_axis_values;
		const new_vals = this.x;

		const last_line_x_pos = old_pos[old_pos.length - 1];

		let superimposed_positions, superimposed_values;

		let add_and_animate_line = (value, old_pos, new_pos) => {
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
				250,
				"easein",
				"translate",
				`${ old_pos }, 0`
			]);
		}

		this.x_axis_group.textContent = '';

		if(this.no_of_extras > 0) {
			// More axis are needed
			// First make only the superimposed (same position) ones
			// Add in the extras at the end later
			superimposed_positions = new_pos.slice(0, old_pos.length);
			superimposed_values = new_vals.slice(0, old_vals.length);
		} else {
			// Axis have to be reduced
			// Fake it by moving all current extra axis to the last position
			// You'll need filler positions and values in the new arrays
			const filler_vals = new Array(Math.abs(this.no_of_extras)).fill("");
			superimposed_values = new_vals.concat(filler_vals);

			const filler_pos = new Array(Math.abs(this.no_of_extras)).fill(last_line_x_pos);
			superimposed_positions = new_pos.concat(filler_pos);
		}

		this.x_axis_group.textContent = '';
		superimposed_values.map((value, i) => {
			add_and_animate_line(value, old_pos[i], superimposed_positions[i]);
		});

		if(this.no_of_extras > 0) {
			// Add in extra axis in the end
			// and then animate to new positions
			const extra_values = new_vals.slice(old_vals.length);
			const extra_positions = new_pos.slice(old_pos.length);

			extra_values.map((value, i) => {
				add_and_animate_line(value, last_line_x_pos, extra_positions[i]);
			});
		}
	}

	make_anim_y_axis() {
		// Animate Y AXIS to account for more or less axis lines
	}

	make_x_line(height, text_start_at, point, label_class, axis_line_class, x_pos) {
		let allowed_space = this.avg_unit_width * 1.5;

		if(this.get_strwidth(point) > allowed_space) {
			let allowed_letters = allowed_space / 8;
			point = point.slice(0, allowed_letters-3) + " ...";
		}

		let line = $$.createSVG('line', {
			x1: 0,
			x2: 0,
			y1: 0,
			y2: height
		});

		let text = $$.createSVG('text', {
			className: label_class,
			x: 0,
			y: text_start_at,
			dy: '.71em',
			innerHTML: point
		});

		let x_level = $$.createSVG('g', {
			className: `tick ${axis_line_class}`,
			transform: `translate(${ x_pos }, 0)`
		});

		x_level.appendChild(line);
		x_level.appendChild(text);

		return x_level;
	}

	make_y_line(start_at, width, text_end_at, point, label_class, axis_line_class, y_pos, darker=false) {
		let line = $$.createSVG('line', {
			x1: start_at,
			x2: width,
			y1: 0,
			y2: 0
		});

		let text = $$.createSVG('text', {
			className: label_class,
			x: text_end_at,
			y: 0,
			dy: '.32em',
			innerHTML: point+""
		});

		let y_level = $$.createSVG('g', {
			className: `tick ${axis_line_class}`,
			transform: `translate(0, ${y_pos})`
		});

		if(darker) {
			line.style.stroke = "rgba(27, 31, 35, 0.6)";
		}

		y_level.appendChild(line);
		y_level.appendChild(text);

		return y_level;
	}

	// API
	update_values(new_y, new_x) {
		if(!new_x) {
			new_x = this.x;
		}
		this.elements_to_animate = [];
		this.updating = true;

		this.old_x_axis_values = this.x.slice();
		this.old_y_axis_values = this.y.map(d => d.values);
		this.old_y_axis_tops = this.y.map(d => d.y_tops);

		this.no_of_extras = new_x.length - this.x.length;

		// Just update values prop, setup_x/y() will do the rest
		this.y.map((d, i) => {d.values = new_y[i].values;});
		if(new_x) this.x = new_x;

		this.setup_x();
		this.setup_y();

		// Animate only if positions have changed
		if(!$$.arrays_equal(this.x_old_axis_positions, this.x_axis_positions)) {
			this.make_x_axis(true);
			setTimeout(() => {
				if(!this.updating) this.make_x_axis();
			}, 400)
		} else {
			this.make_x_axis();
		}

		// if(!$$.arrays_equal(this.y_old_axis_positions, this.y_axis_positions)) {
		// 	this.make_y_axis(true);
		// 	setTimeout(() => {
		// 		if(!this.updating) this.make_y_axis();
		// 	}, 400)
		// } else {
		// 	this.make_y_axis();
		// }

		// Change in data, so calculate dependencies
		this.calc_y_tops();

		this.animate_graphs();

		// if(this.y[0].path) {
		// 	this.animate_paths();
		// 	setTimeout(() => {
		// 		if(!this.updating) this.make_paths();
		// 	}, 400)
		// }

		// this.animate_units();
		// setTimeout(() => {
		// 	if(!this.updating) this.make_new_units();
		// }, 400)

		// Trigger animation with the animatable elements in this.elements_to_animate
		this.run_animation();

		this.updating = false;
	}

	run_animation() {
		let anim_svg = $$.runSVGAnimation(this.svg, this.elements_to_animate);

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
		}, 200);
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

		if(this.no_of_extras >= 0) {
			// First substitute current path with a squiggled one (looking the same but
			// having more points at end),
			// then animate to stretch it later to new points
			// (new points already have more points)

			// Hence, the extra end points will correspond to current(old) positions
			let filler_x = new Array(Math.abs(this.no_of_extras)).fill(last_old_x_pos);
			let filler_y = new Array(Math.abs(this.no_of_extras)).fill(last_old_y_pos);

			old_x = old_x.concat(filler_x);
			old_y = old_y.concat(filler_y);

		} else {
			// Just modify the new points to have extra points
			// with the same position at end
			let filler_x = new Array(Math.abs(this.no_of_extras)).fill(last_new_x_pos);
			let filler_y = new Array(Math.abs(this.no_of_extras)).fill(last_new_y_pos);

			new_x = new_x.concat(filler_x);
			new_y = new_y.concat(filler_y);
		}

		return [old_x, old_y, new_x, new_y];
	}

	animate_graphs() {
		this.y.map((d, i) => {
			// Pre-prep, equilize no of positions between old and new
			let [old_x, old_y, new_x, new_y] = this.calc_old_and_new_postions(d, i);
			if(this.no_of_extras >= 0) {
				this.make_path && this.make_path(d, i, old_x, old_y, d.color || this.colors[i]);
				this.make_new_units_for_dataset(old_x, old_y, d.color || this.colors[i], i);
			}
			d.path && this.animate_path(d, i, old_x, old_y, new_x, new_y);
			this.animate_units(d, i, old_x, old_y, new_x, new_y);
		});

		// TODO: replace with real units
		// setTimeout(() => {
		// 	this.y.map((d, i) => {
		// 		this.make_path && this.make_path(d, i, this.x_axis_positions, d.y_tops, d.color || this.colors[i]);
		// 		this.make_new_units_for_dataset(this.x_axis_positions, d.y_tops, d.color || this.colors[i], i);
		// 	});
		// }, 400);
	}

	animate_path(d, i, old_x, old_y, new_x, new_y) {
		// Animate path
		const new_points_list = new_y.map((y, i) => (new_x[i] + ',' + y));
		const new_path_str = new_points_list.join("L");

		const path_args = [{unit: d.path, object: d, key: 'path'}, {d:"M"+new_path_str}, 250, "easein"];
		this.elements_to_animate.push(path_args);

		// Animate region
		if(d.region_path) {
			let reg_start_pt = `0,${this.zero_line}L`;
			let reg_end_pt = `L${this.width},${this.zero_line}`;

			const region_args = [
				{unit: d.region_path, object: d, key: 'region_path'},
				{d:"M" + reg_start_pt + new_path_str + reg_end_pt},
				250,
				"easein"
			];
			this.elements_to_animate.push(region_args);
		}
	}

	animate_units(d, index, old_x, old_y, new_x, new_y) {
		let type = this.unit_args.type;

		d.svg_units.map((unit, i) => {
			this.elements_to_animate.push(this.animate[type](
				{unit:unit, array:d.svg_units, index: i}, // unit, with info to replace where it came from in the data
				new_x[i],
				new_y[i],
				index
			));
		});
	}

	add_data_point(data_point) {
		this.x.push(data_point.label);
		this.y.values.push();
	}

	// Helpers
	get_y_axis_points(array) {
		//*** Where the magic happens ***

		// Calculates best-fit y intervals from given values
		// and returns the interval array

		// TODO: Fractions

		let max_bound, min_bound, pos_no_of_parts, neg_no_of_parts, part_size;

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
		}

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

		let no_of_parts = this.calc_no_of_parts(max_val, part_size);

		// Use it to get a nice even upper bound
		const upper_bound = part_size * no_of_parts;

		return [upper_bound, this.get_optimal_no_of_parts(no_of_parts)];
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

	calc_y_tops() {
		this.y_min_tops = new Array(this.x_axis_positions.length).fill(9999);
		this.y.map(d => {
			d.y_tops = d.values.map( val => $$.float_2(this.zero_line - val * this.multiplier));
			d.y_tops.map( (y_top, i) => {
				if(y_top < this.y_min_tops[i]) {
					this.y_min_tops[i] = y_top;
				}
			});
		});
	}

	get_rect_height_and_y_attr(y_top) {
		let height, y;
		if (y_top <= this.zero_line) {
			height = this.zero_line - y_top;
			y = y_top;

			// In case of invisible bars
			if(height === 0) {
				height = this.height * 0.02;
				y -= height;
			}
		} else {
			height = y_top - this.zero_line;
			y = this.zero_line;

			// In case of invisible bars
			if(height === 0) {
				height = this.height * 0.02;
			}
		}

		return [height, y];
	}

	setup_utils() {
		this.draw = {
			'bar': (x, y_top, args, color, index) => {
				let total_width = this.avg_unit_width - args.space_width;
				let start_x = x - total_width/2;

				let width = total_width / args.no_of_datasets;
				let current_x = start_x + width * index;

				let [height, y] = this.get_rect_height_and_y_attr(y_top);

				return $$.createSVG('rect', {
					className: `bar mini fill ${color}`,
					x: current_x,
					y: y,
					width: width,
					height: height
				});

			},
			'dot': (x, y, args, color) => {
				return $$.createSVG('circle', {
					className: `fill ${color}`,
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
				let [height, y] = this.get_rect_height_and_y_attr(y_top);

				x = start + (width * index);

				return [bar_obj, {width: width, height: height, x: x, y: y}, 250, "easein"];
				// bar.animate({height: args.new_height, y: y_top}, 250, mina.easein);
			},
			'dot': (dot_obj, x, y_top) => {
				return [dot_obj, {cx: x, cy: y_top}, 250, "easein"];
				// dot.animate({cy: y_top}, 250, mina.easein);
			}
		};
	}
}

frappe.chart.BarChart = class BarChart extends frappe.chart.AxisChart {
	constructor(args) {
		super(args);

		this.type = 'bar-graph';
		this.x_axis_mode = args.x_axis_mode || 'tick';
		this.y_axis_mode = args.y_axis_mode || 'span';
		this.setup();
	}

	setup_values() {
		super.setup_values();
		this.x_offset = this.avg_unit_width;
		this.unit_args = {
			type: 'bar',
			args: {
				space_width: this.avg_unit_width/2,
				no_of_datasets: this.y.length
			}
		};
	}

	make_overlay() {
		// Just make one out of the first element
		let unit = this.y[0].svg_units[0];

		this.overlay = unit.cloneNode();
		this.overlay.style.fill = '#000000';
		this.overlay.style.opacity = '0.4';
		this.draw_area.appendChild(this.overlay);
	}

	bind_overlay() {
		// on event, update overlay
		this.parent.addEventListener('data-select', (e) => {
			this.update_overlay(e.svg_unit);
		});
	}

	update_overlay(unit) {
		let attributes = [];
		Object.keys(unit.attributes).map(index => {
			attributes.push(unit.attributes[index]);
		});

		attributes.filter(attr => attr.specified).map(attr => {
			this.overlay.setAttribute(attr.name, attr.nodeValue);
		});
	}

	on_left_arrow() {
		this.update_current_data_point(this.current_index - 1);
	}

	on_right_arrow() {
		this.update_current_data_point(this.current_index + 1);
	}

	set_avg_unit_width_and_x_offset() {
		this.avg_unit_width = this.width/(this.x.length + 1);
		this.x_offset = this.avg_unit_width;
	}
}

frappe.chart.LineChart = class LineChart extends frappe.chart.AxisChart {
	constructor(args) {
		super(args);
		if(Object.getPrototypeOf(this) !== frappe.chart.LineChart.prototype) {
			return;
		}

		this.type = 'line-graph';
		this.region_fill = args.region_fill;
		this.x_axis_mode = args.x_axis_mode || 'span';
		this.y_axis_mode = args.y_axis_mode || 'span';

		this.setup();
	}

	setup_components() {
		this.paths_groups = [];
		this.y.map((d, i) => {
			this.paths_groups[i] = $$.createSVG('g', {
				className: 'path-group path-group-' + i,
				inside: this.draw_area
			});
		});

		super.setup_components();
	}

	setup_values() {
		super.setup_values();
		this.unit_args = {
			type: 'dot',
			args: { radius: 4 }
		};
	}

	make_paths() {
		this.y.map((d, i) => {
			this.make_path(d, i, this.x_axis_positions, d.y_tops, d.color || this.colors[i]);
		});
	}

	make_path(d, i, x_positions, y_positions, color) {
		let points_list = y_positions.map((y, i) => (x_positions[i] + ',' + y));
		let points_str = points_list.join("L");

		this.paths_groups[i].textContent = '';

		d.path = $$.createSVG('path', {
			inside: this.paths_groups[i],
			className: `stroke ${color}`,
			d: "M"+points_str
		});

		if(this.region_fill) {
			let gradient_id ='path-fill-gradient' + '-' + color;

			this.gradient_def = $$.createSVG('linearGradient', {
				inside: this.svg_defs,
				id: gradient_id,
				x1: 0,
				x2: 0,
				y1: 0,
				y2: 1
			});

			function set_gradient_stop(grad_elem, offset, color, opacity) {
				$$.createSVG('stop', {
					'inside': grad_elem,
					'offset': offset,
					'stop-color': color,
					'stop-opacity': opacity
				});
			}

			set_gradient_stop(this.gradient_def, "0%", color, 0.4);
			set_gradient_stop(this.gradient_def, "50%", color, 0.2);
			set_gradient_stop(this.gradient_def, "100%", color, 0);

			d.region_path = $$.createSVG('path', {
				inside: this.paths_groups[i],
				className: `region-fill`,
				d: "M" + `0,${this.zero_line}L` + points_str + `L${this.width},${this.zero_line}`,
			});

			d.region_path.style.stroke = "none";
			d.region_path.style.fill = `url(#${gradient_id})`;
		}
	}
}

frappe.chart.PercentageChart = class PercentageChart extends frappe.chart.FrappeChart {
	constructor(args) {
		super(args);

		this.get_x_label = this.format_lambdas.x_label;
		this.get_y_label = this.format_lambdas.y_label;
		this.get_x_tooltip = this.format_lambdas.x_tooltip;
		this.get_y_tooltip = this.format_lambdas.y_tooltip;

		this.max_slices = 10;
		this.max_legend_points = 6;

		this.colors = args.colors;

		if(!this.colors || this.colors.length < this.data.labels.length) {
			this.colors = ['light-blue', 'blue', 'violet', 'red', 'orange',
				'yellow', 'green', 'light-green', 'purple', 'magenta'];
		}

		this.setup();
	}

	make_chart_area() {
		this.chart_wrapper.className += ' ' + 'graph-focus-margin';
		this.chart_wrapper.style.marginTop = '45px';

		this.stats_wrapper.className += ' ' + 'graph-focus-margin';
		this.stats_wrapper.style.marginBottom = '30px';
		this.stats_wrapper.style.paddingTop = '0px';
	}

	make_draw_area() {
		this.chart_div = $$.create('div', {
			className: 'div',
			inside: this.chart_wrapper,
			width: this.base_width,
			height: this.base_height
		});

		this.chart = $$.create('div', {
			className: 'progress-chart',
			inside: this.chart_div
		});
	}

	setup_components() {
		this.percentage_bar = $$.create('div', {
			className: 'progress',
			inside: this.chart
		});
	}

	setup_values() {
		this.slice_totals = [];
		let all_totals = this.data.labels.map((d, i) => {
			let total = 0;
			this.data.datasets.map(e => {
				total += e.values[i];
			});
			return [total, d];
		}).filter(d => { return d[0] > 0; }); // keep only positive results

		let totals = all_totals;

		if(all_totals.length > this.max_slices) {
			all_totals.sort((a, b) => { return b[0] - a[0]; });

			totals = all_totals.slice(0, this.max_slices-1);
			let others = all_totals.slice(this.max_slices-1);

			let sum_of_others = 0;
			others.map(d => {sum_of_others += d[0]});

			totals.push([sum_of_others, 'Rest']);

			this.colors[this.max_slices-1] = 'grey';
		}

		this.labels = [];
		totals.map(d => {
			this.slice_totals.push(d[0]);
			this.labels.push(d[1]);
		});

		this.legend_totals = this.slice_totals.slice(0, this.max_legend_points);
	}

	setup_utils() { }

	make_graph_components() {
		this.grand_total = this.slice_totals.reduce((a, b) => a + b, 0);
		this.slices = [];
		this.slice_totals.map((total, i) => {
			let slice = $$.create('div', {
				className: `progress-bar background ${this.colors[i]}`,
				style: `width: ${total*100/this.grand_total}%`,
				inside: this.percentage_bar
			});
			this.slices.push(slice);
		});
	}

	bind_tooltip() {
		this.slices.map((slice, i) => {
			slice.addEventListener('mouseenter', () => {
				let g_off = $$.offset(this.chart_wrapper), p_off = $$.offset(slice);

				let x = p_off.left - g_off.left + slice.offsetWidth/2;
				let y = p_off.top - g_off.top - 6;
				let title = (this.formatted_labels && this.formatted_labels.length>0
					? this.formatted_labels[i] : this.labels[i]) + ': ';
				let percent = (this.slice_totals[i]*100/this.grand_total).toFixed(1);

				this.tip.set_values(x, y, title, percent + "%");
				this.tip.show_tip();
			});
		});
	}

	show_summary() {
		let x_values = this.formatted_labels && this.formatted_labels.length > 0
			? this.formatted_labels : this.labels;
		this.legend_totals.map((d, i) => {
			if(d) {
				let stats = $$.create('div', {
					className: 'stats',
					inside: this.stats_wrapper
				});
				stats.innerHTML = `<span class="indicator ${this.colors[i]}">
					<span class="text-muted">${x_values[i]}:</span>
					${d}
				</span>`;
			}
		});
	}
}

frappe.chart.HeatMap = class HeatMap extends frappe.chart.FrappeChart {
	constructor({
		start = new Date(moment().subtract(1, 'year').toDate()),
		domain = '',
		subdomain = '',
		data = {},
		discrete_domains = 0,
		count_label = ''
	}) {
		super(arguments[0]);

		this.type = 'heatmap';

		this.domain = domain;
		this.subdomain = subdomain;
		this.start = start;
		this.data = data;
		this.discrete_domains = discrete_domains;
		this.count_label = count_label;

		this.legend_colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

		this.translate_x = 0;
		this.setup();
	}

	setup_base_values() {
		this.today = new Date();

		if(!this.start) {
			this.start = new Date();
			this.start.setFullYear( this.start.getFullYear() - 1 );
		}
		this.first_week_start = new Date(this.start.toDateString());
		this.last_week_start = new Date(this.today.toDateString());
		if(this.first_week_start.getDay() !== 7) {
			this.add_days(this.first_week_start, (-1) * this.first_week_start.getDay());
		}
		if(this.last_week_start.getDay() !== 7) {
			this.add_days(this.last_week_start, (-1) * this.last_week_start.getDay());
		}
		this.no_of_cols = this.get_weeks_between(this.first_week_start + '', this.last_week_start + '') + 1;
	}

	set_width() {
		this.base_width = (this.no_of_cols) * 12;
	}

	setup_components() {
		this.domain_label_group = $$.createSVG("g", {
			className: "domain-label-group chart-label",
			inside: this.draw_area
		});
		this.data_groups = $$.createSVG("g", {
			className: "data-groups",
			inside: this.draw_area,
			transform: `translate(0, 20)`
		});
	}

	setup_values() {
		this.domain_label_group.textContent = '';
		this.data_groups.textContent = '';
		this.distribution = this.get_distribution(this.data, this.legend_colors);
		this.month_names = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];

		this.render_all_weeks_and_store_x_values(this.no_of_cols);
	}

	render_all_weeks_and_store_x_values(no_of_weeks) {
		let current_week_sunday = new Date(this.first_week_start);
		this.week_col = 0;
		this.current_month = current_week_sunday.getMonth();

		this.months = [this.current_month + ''];
		this.month_weeks = {}, this.month_start_points = [];
		this.month_weeks[this.current_month] = 0;
		this.month_start_points.push(13);

		for(var i = 0; i < no_of_weeks; i++) {
			let data_group, month_change = 0;
			let day = new Date(current_week_sunday);

			[data_group, month_change] = this.get_week_squares_group(day, this.week_col);
			this.data_groups.appendChild(data_group);
			this.week_col += 1 + parseInt(this.discrete_domains && month_change);
			this.month_weeks[this.current_month]++;
			if(month_change) {
				this.current_month = (this.current_month + 1) % 12;
				this.months.push(this.current_month + '');
				this.month_weeks[this.current_month] = 1;
			}
			this.add_days(current_week_sunday, 7);
		}
		this.render_month_labels();
	}

	get_week_squares_group(current_date, index) {
		const no_of_weekdays = 7;
		const square_side = 10;
		const cell_padding = 2;
		const step = 1;

		let month_change = 0;
		let week_col_change = 0;

		let data_group = $$.createSVG("g", {
			className: "data-group",
			inside: this.data_groups
		});

		for(var y = 0, i = 0; i < no_of_weekdays; i += step, y += (square_side + cell_padding)) {
			let data_value = 0;
			let color_index = 0;

			let timestamp = Math.floor(current_date.getTime()/1000).toFixed(1);

			if(this.data[timestamp]) {
				data_value = this.data[timestamp];
				color_index = this.get_max_checkpoint(data_value, this.distribution);
			}

			if(this.data[Math.round(timestamp)]) {
				data_value = this.data[Math.round(timestamp)];
				color_index = this.get_max_checkpoint(data_value, this.distribution);
			}

			let x = 13 + (index + week_col_change) * 12;

			$$.createSVG("rect", {
				className: 'day',
				inside: data_group,
				x: x,
				y: y,
				width: square_side,
				height: square_side,
				fill:  this.legend_colors[color_index],
				'data-date': this.get_dd_mm_yyyy(current_date),
				'data-value': data_value,
				'data-day': current_date.getDay()
			});

			let next_date = new Date(current_date);
			this.add_days(next_date, 1);
			if(next_date.getMonth() - current_date.getMonth()) {
				month_change = 1;
				if(this.discrete_domains) {
					week_col_change = 1;
				}

				this.month_start_points.push(13 + (index + week_col_change) * 12);
			}
			current_date = next_date;
		}

		return [data_group, month_change];
	}

	render_month_labels() {
		// this.first_month_label = 1;
		// if (this.first_week_start.getDate() > 8) {
		// 	this.first_month_label = 0;
		// }
		// this.last_month_label = 1;

		// let first_month = this.months.shift();
		// let first_month_start = this.month_start_points.shift();
		// render first month if

		// let last_month = this.months.pop();
		// let last_month_start = this.month_start_points.pop();
		// render last month if

		this.months.shift();
		this.month_start_points.shift();
		this.months.pop();
		this.month_start_points.pop();

		this.month_start_points.map((start, i) => {
			let month_name =  this.month_names[this.months[i]].substring(0, 3);

			$$.createSVG('text', {
				className: 'y-value-text',
				inside: this.domain_label_group,
				x: start + 12,
				y: 10,
				dy: '.32em',
				innerHTML: month_name
			});

		});
	}

	make_graph_components() {
		Array.prototype.slice.call(
			this.container.querySelectorAll('.graph-stats-container, .sub-title, .title')
		).map(d => {
			d.style.display = 'None';
		});
		this.chart_wrapper.style.marginTop = '0px';
		this.chart_wrapper.style.paddingTop = '0px';
	}

	bind_tooltip() {
		Array.prototype.slice.call(
			document.querySelectorAll(".data-group .day")
		).map(el => {
			el.addEventListener('mouseenter', (e) => {
				let count = e.target.getAttribute('data-value');
				let date_parts = e.target.getAttribute('data-date').split('-');

				let month = this.month_names[parseInt(date_parts[1])-1].substring(0, 3);

				let g_off = this.chart_wrapper.getBoundingClientRect(), p_off = e.target.getBoundingClientRect();

				let width = parseInt(e.target.getAttribute('width'));
				let x = p_off.left - g_off.left + (width+2)/2;
				let y = p_off.top - g_off.top - (width+2)/2;
				let value = count + ' ' + this.count_label;
				let name = ' on ' + month + ' ' + date_parts[0] + ', ' + date_parts[2];

				this.tip.set_values(x, y, name, value, [], 1);
				this.tip.show_tip();
			});
		});
	}

	update(data) {
		this.data = data;
		this.setup_values();
		this.bind_tooltip();
	}

	get_distribution(data={}, mapper_array) {
		let data_values = Object.keys(data).map(key => data[key]);
		let data_max_value = Math.max(...data_values);

		let distribution_step = 1 / (mapper_array.length - 1);
		let distribution = [];

		mapper_array.map((color, i) => {
			let checkpoint = data_max_value * (distribution_step * i);
			distribution.push(checkpoint);
		});

		return distribution;
	}

	get_max_checkpoint(value, distribution) {
		return distribution.filter((d, i) => {
			if(i === 1) {
				return distribution[0] < value;
			}
			return d <= value;
		}).length - 1;
	}

	// TODO: date utils, move these out

	// https://stackoverflow.com/a/11252167/6495043
	treat_as_utc(date_str) {
		let result = new Date(date_str);
		result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
		return result;
	}

	get_dd_mm_yyyy(date) {
		let dd = date.getDate();
		let mm = date.getMonth() + 1; // getMonth() is zero-based
		return [
			(dd>9 ? '' : '0') + dd,
			(mm>9 ? '' : '0') + mm,
			date.getFullYear()
		].join('-');
	}

	get_weeks_between(start_date_str, end_date_str) {
		return Math.ceil(this.get_days_between(start_date_str, end_date_str) / 7);
	}

	get_days_between(start_date_str, end_date_str) {
		let milliseconds_per_day = 24 * 60 * 60 * 1000;
		return (this.treat_as_utc(end_date_str) - this.treat_as_utc(start_date_str)) / milliseconds_per_day;
	}

	// mutates
	add_days(date, number_of_days) {
		date.setDate(date.getDate() + number_of_days);
	}

	get_month_name() {}
}

frappe.chart.SvgTip = class {
	constructor({
		parent = null
	}) {
		this.parent = parent;
		this.title_name = '';
		this.title_value = '';
		this.list_values = [];
		this.title_value_first = 0;

		this.x = 0;
		this.y = 0;

		this.top = 0;
		this.left = 0;

		this.setup();
	}

	setup() {
		this.make_tooltip();
	}

	refresh() {
		this.fill();
		this.calc_position();
		// this.show_tip();
	}

	make_tooltip() {
		this.container = $$.create('div', {
			inside: this.parent,
			className: 'graph-svg-tip comparison',
			innerHTML: `<span class="title"></span>
				<ul class="data-point-list"></ul>
				<div class="svg-pointer"></div>`
		});
		this.hide_tip();

		this.title = this.container.querySelector('.title');
		this.data_point_list = this.container.querySelector('.data-point-list');

		this.parent.addEventListener('mouseleave', () => {
			this.hide_tip();
		});
	}

	fill() {
		let title;
		if(this.title_value_first) {
			title = `<strong>${this.title_value}</strong>${this.title_name}`;
		} else {
			title = `${this.title_name}<strong>${this.title_value}</strong>`;
		}
		this.title.innerHTML = title;
		this.data_point_list.innerHTML = '';

		this.list_values.map((set) => {
			let li = $$.create('li', {
				className: `border-top ${set.color || 'black'}`,
				innerHTML: `<strong style="display: block;">${set.value ? set.value : '' }</strong>
					${set.title ? set.title : '' }`
			});

			this.data_point_list.appendChild(li);
		});
	}

	calc_position() {
		this.top = this.y - this.container.offsetHeight;
		this.left = this.x - this.container.offsetWidth/2;
		let max_left = this.parent.offsetWidth - this.container.offsetWidth;

		let pointer = this.container.querySelector('.svg-pointer');

		if(this.left < 0) {
			pointer.style.left = `calc(50% - ${-1 * this.left}px)`;
			this.left = 0;
		} else if(this.left > max_left) {
			let delta = this.left - max_left;
			pointer.style.left = `calc(50% + ${delta}px)`;
			this.left = max_left;
		} else {
			pointer.style.left = `50%`;
		}
	}

	set_values(x, y, title_name = '', title_value = '', list_values = [], title_value_first = 0) {
		this.title_name = title_name;
		this.title_value = title_value;
		this.list_values = list_values;
		this.x = x;
		this.y = y;
		this.title_value_first = title_value_first;
		this.refresh();
	}

	hide_tip() {
		this.container.style.top = '0px';
		this.container.style.left = '0px';
		this.container.style.opacity = '0';
	}

	show_tip() {
		this.container.style.top = this.top + 'px';
		this.container.style.left = this.left + 'px';
		this.container.style.opacity = '1';
	}
}

// Helpers
frappe.chart.utils = {};
$$.float_2 = d => parseFloat(d.toFixed(2));
function $$(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
}

$$.arrays_equal = (arr1, arr2) => {
	if(arr1.length !== arr2.length) return false;
	let are_equal = true;
	arr1.map((d, i) => {
		if(arr2[i] !== d) are_equal = false;
	});
	return are_equal;
}

// $$.findNodeIndex = (node) =>
// {
// 	var i = 0;
// 	while (node = node.previousSibling) {
// 		if (node.nodeType === 1) { ++i; }
// 	}
// 	return i;
// }

$$.create = function(tag, o) {
	var element = document.createElement(tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$$(val).appendChild(element);
		}
		else if (i === "around") {
			var ref = $$(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);
		}
		else if (i in element) {
			element[i] = val;
		}
		else {
			element.setAttribute(i, val);
		}
	}

	return element;
};

$$.createSVG = function(tag, o) {
	var element = document.createElementNS("http://www.w3.org/2000/svg", tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$$(val).appendChild(element);
		}
		else if (i === "around") {
			var ref = $$(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);
		}
		else {
			if(i === "className") { i = "class"; }
			if(i === "innerHTML") {
				element['textContent'] = val;
			} else {
				element.setAttribute(i, val);
			}
		}
	}

	return element;
};

$$.runSVGAnimation = (svg_container, elements) => {
	// let parent = elements[0][0]['unit'].parentNode;

	let new_elements = [];
	let anim_elements = [];

	elements.map(element => {
		let obj = element[0];
		let parent = obj.unit.parentNode;
		// let index = $$.findNodeIndex(obj.unit);

		let anim_element, new_element;

		element[0] = obj.unit;

		[anim_element, new_element] = $$.animateSVG(...element);

		new_elements.push(new_element);
		anim_elements.push([anim_element, parent]);

		parent.replaceChild(anim_element, obj.unit);

		if(obj.array) {
			obj.array[obj.index] = new_element;
		} else {
			obj.object[obj.key] = new_element;
		}
	});

	let anim_svg = svg_container.cloneNode(true);

	anim_elements.map((anim_element, i) => {
		anim_element[1].replaceChild(new_elements[i], anim_element[0]);
		elements[i][0] = new_elements[i];
	});

	return anim_svg;
}

// $$.animateMotion = (element, props, dur, easing_type="linear")

$$.animateSVG = (element, props, dur, easing_type="linear", type=undefined, old_value=undefined) => {
	let easing = {
		ease: "0.25 0.1 0.25 1",
		linear: "0 0 1 1",
		// easein: "0.42 0 1 1",
		easein: "0.1 0.8 0.2 1",
		easeout: "0 0 0.58 1",
		easeinout: "0.42 0 0.58 1"
	}

	let anim_element = element.cloneNode(true);
	let new_element = element.cloneNode(true);

	for(var attributeName in props) {
		let animate_element;
		if(attributeName === 'transform') {
			animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
		} else {
			animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animate");
		}
		let current_value = old_value || element.getAttribute(attributeName);
		let value = props[attributeName];

		let anim_attr = {
			attributeName: attributeName,
			from: current_value,
			to: value,
			begin: "0s",
			dur: dur/1000 + "s",
			values: current_value + ";" + value,
			keySplines: easing[easing_type],
			keyTimes: "0;1",
			calcMode: "spline",
			fill: 'freeze'
		}

		if(type) {
			anim_attr["type"] = type;
		}

		for (var i in anim_attr) {
			animate_element.setAttribute(i, anim_attr[i]);
		}

		anim_element.appendChild(animate_element);

		if(type) {
			new_element.setAttribute(attributeName, `translate(${value})`);
		} else {
			new_element.setAttribute(attributeName, value);
		}
	}

	return [anim_element, new_element];
}

$$.offset = function(element) {
	let rect = element.getBoundingClientRect();
	return {
		// https://stackoverflow.com/a/7436602/6495043
		// rect.top varies with scroll, so we add whatever has been
		// scrolled to it to get absolute distance from actual page top
		top: rect.top + (document.documentElement.scrollTop || document.body.scrollTop),
		left: rect.left + (document.documentElement.scrollLeft || document.body.scrollLeft)
	}
};

$$.bind = function(element, o) {
	if (element) {
		for (var event in o) {
			var callback = o[event];

			event.split(/\s+/).forEach(function (event) {
				element.addEventListener(event, callback);
			});
		}
	}
};

$$.unbind = function(element, o) {
	if (element) {
		for (var event in o) {
			var callback = o[event];

			event.split(/\s+/).forEach(function(event) {
				element.removeEventListener(event, callback);
			});
		}
	}
};

$$.fire = function(target, type, properties) {
	var evt = document.createEvent("HTMLEvents");

	evt.initEvent(type, true, true );

	for (var j in properties) {
		evt[j] = properties[j];
	}

	return target.dispatchEvent(evt);
};
