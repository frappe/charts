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
// 					// 'purple', 'darkgrey', 'black', 'yellow', 'lightblue'
// 		value: 80
// 	}
// ]

// Validate all arguments, check passed data format, set defaults

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
		// this.chart_wrapper.appendChild();

		this.make_chart_area();
		this.make_draw_area();

		this.stats_wrapper = this.container.querySelector('.graph-stats-container');
	}

	make_chart_area() {
		this.svg = $$.createSVG('svg', {
			className: 'chart',
			inside: this.chart_wrapper,
			width: this.base_width,
			height: this.base_height
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

	setup_components() {
		this.svg_units_group = $$.createSVG('g', {
			className: 'data-points',
			inside: this.draw_area
		});
	}

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
	setup_utils() {
		this.draw = {
			'bar': (x, y, args, color, index) => {
				let total_width = this.avg_unit_width - args.space_width;
				let start_x = x - total_width/2;

				let width = total_width / args.no_of_datasets;
				let current_x = start_x + width * index;
				if(y == this.height) {
					y = this.height * 0.98;
				}
				return $$.createSVG('rect', {
					className: `bar mini fill ${color}`,
					x: current_x,
					y: y,
					width: width,
					height: this.height - y
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
			'bar': (bar, new_y, args) => {
				return [bar, {height: args.new_height, y: new_y}, 300, "easein"];
				// bar.animate({height: args.new_height, y: new_y}, 300, mina.easein);
			},
			'dot': (dot, new_y) => {
				return [dot, {cy: new_y}, 300, "easein"];
				// dot.animate({cy: new_y}, 300, mina.easein);
			}
		};
	}
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

		this.colors = ['lightblue', 'purple', 'blue', 'green', 'lightgreen',
			'yellow', 'orange', 'red'];
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
		this.x_axis_values = this.x.map((d, i) => frappe.chart.utils.float_2(this.x_offset + i * this.avg_unit_width));
	}

	setup_y() {
		this.setup_metrics();
		this.y_axis_values = this.get_y_axis_values(this.upper_limit, this.parts);
	}

	setup_components() {
		this.y_axis_group = $$.createSVG('g', {className: 'y axis', inside: this.draw_area});
		this.x_axis_group = $$.createSVG('g', {className: 'x axis', inside: this.draw_area});
		this.specific_y_lines = $$.createSVG('g', {className: 'specific axis', inside: this.draw_area});
		super.setup_components();
	}

	make_graph_components() {
		this.make_y_axis();
		this.make_x_axis();
		this.draw_graph();
		this.make_y_specifics();
	}

	// make HORIZONTAL lines for y values
	make_y_axis() {
		if(this.y_axis_group.textContent) {
			// animate from old to new, both elemnets
		} else {
			// only new
		}

		this.y_axis_group.textContent = '';

		let width, text_end_at = -9, label_class = '', start_at = 0;
		if(this.y_axis_mode === 'span') {		// long spanning lines
			width = this.width + 6;
			start_at = -6;
		} else if(this.y_axis_mode === 'tick'){	// short label lines
			width = -6;
			label_class = 'y-axis-label';
		}

		this.y_axis_values.map((point) => {
			let line = $$.createSVG('line', {
				x1: start_at,
				x2: width,
				y1: 0,
				y2: 0
			});
			let text = $$.createSVG('text', {
				className: 'y-value-text',
				x: text_end_at,
				y: 0,
				dy: '.32em',
				innerHTML: point+""
			});

			let y_level = $$.createSVG('g', {
				className: `tick ${label_class}`,
				transform: `translate(0, ${this.height - point * this.multiplier })`
			});

			y_level.appendChild(line);
			y_level.appendChild(text);

			this.y_axis_group.appendChild(y_level);
		});
	}

	// make VERTICAL lines for x values
	make_x_axis() {
		let start_at, height, text_start_at, label_class = '';
		if(this.x_axis_mode === 'span') {		// long spanning lines
			start_at = -7;
			height = this.height + 15;
			text_start_at = this.height + 25;
		} else if(this.x_axis_mode === 'tick'){	// short label lines
			start_at = this.height;
			height = 6;
			text_start_at = 9;
			label_class = 'x-axis-label';
		}

		this.x_axis_group.setAttribute('transform', `translate(0,${start_at})`);

		this.x.map((point, i) => {
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
				className: 'x-value-text',
				x: 0,
				y: text_start_at,
				dy: '.71em',
				innerHTML: point
			});

			let x_level = $$.createSVG('g', {
				className: `tick ${label_class}`,
				transform:  `translate(${ this.x_axis_values[i] }, 0)`
			});

			x_level.appendChild(line);
			x_level.appendChild(text);

			this.x_axis_group.appendChild(x_level);
		});
	}

	draw_graph() {
		// TODO: Don't animate on refresh
		let data = [];
		this.svg_units_group.textContent = '';
		this.y.map((d, i) => {
			// Anim: Don't draw initial values, store them and update later
			d.y_tops = new Array(d.values.length).fill(this.height); // no value
			data.push({values: d.values});
			d.svg_units = [];

			this.make_new_units_for_dataset(d.y_tops, d.color || this.colors[i], i);
			this.make_path && this.make_path(d, d.color || this.colors[i]);
		});

		// Data points
		// this.calc_all_y_tops();
		// this.calc_min_tops();

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

	make_new_units_for_dataset(y_values, color, dataset_index) {
		this.y[dataset_index].svg_units = [];

		let d = this.unit_args;
		y_values.map((y, i) => {
			let data_unit = this.draw[d.type](
				this.x_axis_values[i],
				y,
				d.args,
				color,
				dataset_index
			);
			this.svg_units_group.appendChild(data_unit);
			this.y[dataset_index].svg_units.push(data_unit);
		});
	}

	make_y_specifics() {
		this.specific_values.map(d => {
			let line = $$.createSVG('line', {
				className: d.line_type === "dashed" ? "dashed": "",
				x1: 0,
				x2: this.width,
				y1: 0,
				y2: 0
			});

			let text = $$.createSVG('text', {
				className: 'specific-value',
				x: this.width + 5,
				y: 0,
				dy: '.32em',
				innerHTML: d.title.toUpperCase()
			});

			let specific_y_level = $$.createSVG('g', {
				className: `tick`,
				transform: `translate(0, ${this.height - d.value * this.multiplier })`
			});

			specific_y_level.appendChild(line);
			specific_y_level.appendChild(text);

			this.specific_y_lines.appendChild(specific_y_level);
		});
	}

	bind_tooltip() {
		// should be w.r.t. this.parent, but will have to take care of
		// all the elements and padding, margins on top
		this.chart_wrapper.addEventListener('mousemove', (e) => {
			let rect = this.chart_wrapper.getBoundingClientRect();
			let offset = {
				top: rect.top + document.body.scrollTop,
				left: rect.left + document.body.scrollLeft
			}
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
		for(var i=this.x_axis_values.length - 1; i >= 0 ; i--) {
			let x_val = this.x_axis_values[i];
			// let delta = i === 0 ? this.avg_unit_width : x_val - this.x_axis_values[i-1];
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

				this.tip.set_values(x, y, title, '', values);
				this.tip.show_tip();
				break;
			}
		}
	}

	// API
	update_values(new_y) {
		// Just update values prop, setup_y() will do the rest
		this.y.map((d, i) => {d.values = new_y[i].values;});

		let old_upper_limit = this.upper_limit;
		this.setup_y();
		if(old_upper_limit !== this.upper_limit){
			this.make_y_axis();
		}

		let elements_to_animate = [];
		elements_to_animate = this.animate_for_equilength_data(elements_to_animate);

		// create new x,y pair string and animate path
		if(this.y[0].path) {
			this.y.map((e, i) => {
				let new_points_list = e.y_tops.map((y, i) => (this.x_axis_values[i] + ',' + y));
				let new_path_str = "M"+new_points_list.join("L");
				let args = [{unit:this.y[i].path, object: this.y[i], key:'path'}, {d:new_path_str}, 300, "easein"];
				elements_to_animate.push(args);
			});
		}

		// elements_to_animate = elements_to_animate.concat(this.update_y_axis());
		let anim_svg = $$.runSVGAnimation(this.svg, elements_to_animate);
		this.chart_wrapper.removeChild(this.svg);
		this.chart_wrapper.appendChild(anim_svg);

		// Replace the new svg (data has long been replaced)
		setTimeout(() => {
			this.chart_wrapper.removeChild(anim_svg);
			this.chart_wrapper.appendChild(this.svg);
		}, 250);
	}

	update_y_axis() {
		let elements = [];

		return elements;
	}

	update_x_axis() {
		// update
	}

	animate_for_equilength_data(elements_to_animate) {
		this.y.map((d) => {
			d.y_tops = d.values.map(val => frappe.chart.utils.float_2(this.height - val * this.multiplier));
			d.svg_units.map((unit, j) => {
				elements_to_animate.push(this.animate[this.unit_args.type](
					{unit:unit, array:d.svg_units, index: j}, // unit, with info to replace from data
					d.y_tops[j],
					{new_height: this.height - d.y_tops[j]}
				));
			});
		});
		this.calc_min_tops();
		return elements_to_animate;
	}

	add_data_point(data_point) {
		this.x.push(data_point.label);
		this.y.values.push();
	}

	// Helpers
	get_upper_limit_and_parts(array) {
		let max_val = parseInt(Math.max(...array));
		if((max_val+"").length <= 1) {
			return [10, 5];
		} else {
			let multiplier = Math.pow(10, ((max_val+"").length - 1));
			let significant = Math.ceil(max_val/multiplier);
			if(significant % 2 !== 0) significant++;
			let parts = (significant < 5) ? significant : significant/2;
			return [significant * multiplier, parts];
		}
	}

	get_y_axis_values(upper_limit, parts) {
		let y_axis = [];
		for(var i = 0; i <= parts; i++){
			y_axis.push(upper_limit / parts * i);
		}
		return y_axis;
	}

	set_avg_unit_width_and_x_offset() {
		this.avg_unit_width = this.width/(this.x.length - 1);
		this.x_offset = 0;
	}

	setup_metrics() {
		// Metrics: upper limit, no. of parts, multiplier
		let values = this.get_all_y_values();
		[this.upper_limit, this.parts] = this.get_upper_limit_and_parts(values);
		this.multiplier = this.height / this.upper_limit;
	}

	get_all_y_values() {
		let all_values = [];
		this.y.map(d => {
			all_values = all_values.concat(d.values);
		});
		return all_values.concat(this.specific_values.map(d => d.value));
	}

	calc_all_y_tops() {
		this.y.map(d => {
			d.y_tops = d.values.map( val => frappe.chart.utils.float_2(this.height - val * this.multiplier));
		});
	}

	calc_min_tops() {
		this.y_min_tops = new Array(this.x_axis_values.length).fill(9999);
		this.y.map(d => {
			d.y_tops.map( (y_top, i) => {
				if(y_top < this.y_min_tops[i]) {
					this.y_min_tops[i] = y_top;
				}
			});
		});
	}
}

frappe.chart.BarChart = class BarChart extends frappe.chart.AxisChart {
	constructor() {
		super(arguments[0]);

		this.type = 'bar-graph';
		this.setup();
	}

	setup_values() {
		super.setup_values();
		this.x_offset = this.avg_unit_width;
		this.y_axis_mode = 'span';
		this.x_axis_mode = 'tick';
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

		this.setup();
	}

	setup_values() {
		super.setup_values();
		this.y_axis_mode = 'span';
		this.x_axis_mode = 'span';
		this.unit_args = {
			type: 'dot',
			args: { radius: 4 }
		};
	}

	make_path(d, color) {
		let points_list = d.y_tops.map((y, i) => (this.x_axis_values[i] + ',' + y));
		let path_str = "M"+points_list.join("L");

		d.path = $$.createSVG('path', {
			className: `stroke ${color}`,
			d: path_str
		});

		this.svg_units_group.prepend(d.path);
	}
}

frappe.chart.RegionChart = class RegionChart extends frappe.chart.LineChart {
	constructor(args) {
		super(args);

		this.type = 'region-graph';
		this.region_fill = 1;
		this.setup();
	}
}

frappe.chart.PercentageChart = class PercentageChart extends frappe.chart.FrappeChart {
	constructor(args) {
		super(args);

		this.x = this.data.labels;
		this.y = this.data.datasets;

		this.get_x_label = this.format_lambdas.x_label;
		this.get_y_label = this.format_lambdas.y_label;
		this.get_x_tooltip = this.format_lambdas.x_tooltip;
		this.get_y_tooltip = this.format_lambdas.y_tooltip;

		this.setup();
	}

	make_chart_area() {
		this.chart_wrapper.className += ' ' + 'graph-focus-margin';
		this.chart_wrapper.style.marginTop = '45px';

		this.stats_wrapper.className += ' ' + 'graph-focus-margin';
		this.stats_wrapper.style.marginBottom = '30px';
		this.stats_wrapper.style.paddingTop = '0px';

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

	setup_values() {
		this.x.totals = this.x.map((d, i) => {
			let total = 0;
			this.y.map(e => {
				total += e.values[i];
			});
			return total;
		});

		if(!this.x.colors) {
			this.x.colors = ['green', 'blue', 'purple', 'red', 'orange',
				'yellow', 'lightblue', 'lightgreen'];
		}
	}

	setup_utils() { }
	setup_components() {
		this.percentage_bar = $$.create('div', {
			className: 'progress',
			inside: this.chart
		});
	}

	make_graph_components() {
		this.grand_total = this.x.totals.reduce((a, b) => a + b, 0);
		this.x.units = [];
		this.x.totals.map((total, i) => {
			let part = $$.create('div', {
				className: `progress-bar background ${this.x.colors[i]}`,
				style: `width: ${total*100/this.grand_total}%`,
				inside: this.percentage_bar
			});
			this.x.units.push(part);
		});
	}

	bind_tooltip() {
		this.x.units.map((part, i) => {
			part.addEventListener('mouseenter', () => {
				let g_off = this.chart_wrapper.offset(), p_off = part.offset();

				let x = p_off.left - g_off.left + part.offsetWidth/2;
				let y = p_off.top - g_off.top - 6;
				let title = (this.x.formatted && this.x.formatted.length>0
					? this.x.formatted[i] : this.x[i]) + ': ';
				let percent = (this.x.totals[i]*100/this.grand_total).toFixed(1);

				this.tip.set_values(x, y, title, percent);
				this.tip.show_tip();
			});
		});
	}

	show_summary() {
		let x_values = this.x.formatted && this.x.formatted.length > 0
			? this.x.formatted : this.x;
		this.x.totals.map((d, i) => {
			if(d) {
				let stats = $$.create('div', {
					className: 'stats',
					inside: this.stats_wrapper
				});
				stats.innerHTML = `<span class="indicator ${this.x.colors[i]}">
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

			// TODO: More foolproof for any data
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

frappe.chart.map_c3 = (chart) => {
	if (chart.data) {
		let data = chart.data;
		let type = chart.chart_type || 'line';
		if(type === 'pie') {
			type = 'percentage';
		}

		let x = {}, y = [];

		if(data.columns) {
			let columns = data.columns;

			x = columns.filter(col => {
				return col[0] === data.x;
			})[0];

			if(x && x.length) {
				let dataset_length = x.length;
				let dirty = false;
				columns.map(col => {
					if(col[0] !== data.x) {
						if(col.length === dataset_length) {
							let title = col[0];
							col.splice(0, 1);
							y.push({
								title: title,
								values: col,
							});
						} else {
							dirty = true;
						}
					}
				});

				if(dirty) {
					return;
				}

				x.splice(0, 1);

				return {
					type: type,
					y: y,
					x: x
				}

			}
		} else if(data.rows) {
			let rows = data.rows;
			x = rows[0];

			rows.map((row, i) => {
				if(i === 0) {
					x = row;
				} else {
					y.push({
						title: 'data' + i,
						values: row,
					});
				}
			});

			return {
				type: type,
				y: y,
				x: x
			}
		}
	}
}

// Helpers
frappe.chart.utils = {};
frappe.chart.utils.float_2 = d => parseFloat(d.toFixed(2));
function $$(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
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
	let parent = elements[0][0]['unit'].parentNode;

	let new_elements = [];
	let anim_elements = [];

	elements.map(element => {
		let obj = element[0];
		// let index = $$.findNodeIndex(obj.unit);

		let anim_element, new_element;

		element[0] = obj.unit;
		[anim_element, new_element] = $$.animateSVG(...element);

		new_elements.push(new_element);
		anim_elements.push(anim_element);

		parent.replaceChild(anim_element, obj.unit);

		if(obj.array) {
			obj.array[obj.index] = new_element;
		} else {
			obj.object[obj.key] = new_element;
		}
	});

	let anim_svg = svg_container.cloneNode(true);

	anim_elements.map((anim_element, i) => {
		parent.replaceChild(new_elements[i], anim_element);
		elements[i][0] = new_elements[i];
	});

	return anim_svg;
}

$$.animateSVG = (element, props, dur, easing_type="linear") => {
	let easing = {
		ease: "0.25 0.1 0.25 1",
		linear: "0 0 1 1",
		// easein: "0.42 0 1 1",
		easein: "0.1 0.8 0.2 1",
		easeout: "0 0 0.58 1",
		easeinout: "0.42 0 0.58 1"
	}

	let anim_element = element.cloneNode(false);
	let new_element = element.cloneNode(false);

	for(var attributeName in props) {
		let animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animate");

		let current_value = element.getAttribute(attributeName);
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
			calcMode: "spline"
		}

		for (var i in anim_attr) {
			animate_element.setAttribute(i, anim_attr[i]);
		}

		anim_element.appendChild(animate_element);
		new_element.setAttribute(attributeName, value);
	}

	return [anim_element, new_element];
}

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
