import SvgTip from '../objects/SvgTip';
import $ from '../utils/dom';
import { get_string_width } from '../utils/helpers';
import Chart from '../charts';

export default class BaseChart {
	constructor({
		height = 240,

		title = '', subtitle = '',

		format_lambdas = {},

		summary = [],

		is_navigable = 0,
		has_legend = 0,

		type = '', // eslint-disable-line no-unused-vars

		parent,
		data
	}) {
		this.raw_chart_args = arguments[0];

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		this.title = title;
		this.subtitle = subtitle;

		this.data = data;
		this.format_lambdas = format_lambdas;

		this.specific_values = data.specific_values || [];
		this.summary = summary;

		this.is_navigable = is_navigable;
		if(this.is_navigable) {
			this.current_index = 0;
		}
		this.has_legend = has_legend;

		this.chart_types = ['line', 'scatter', 'bar', 'percentage', 'heatmap', 'pie'];

		this.set_margins(height);
	}

	get_different_chart(type) {
		if(!this.chart_types.includes(type)) {
			console.error(`'${type}' is not a valid chart type.`);
		}
		if(type === this.type) return;

		// Only across compatible types
		let compatible_types = {
			bar: ['line', 'scatter', 'percentage', 'pie'],
			line: ['scatter', 'bar', 'percentage', 'pie'],
			pie: ['line', 'scatter', 'percentage', 'bar'],
			scatter: ['line', 'bar', 'percentage', 'pie'],
			percentage: ['bar', 'line', 'scatter', 'pie'],
			heatmap: []
		};

		if(!compatible_types[this.type].includes(type)) {
			console.error(`'${this.type}' chart cannot be converted to a '${type}' chart.`);
		}

		// Okay, this is anticlimactic
		// this function will need to actually be 'change_chart_type(type)'
		// that will update only the required elements, but for now ...
		return new Chart({
			parent: this.raw_chart_args.parent,
			title: this.title,
			data: this.raw_chart_args.data,
			type: type,
			height: this.raw_chart_args.height
		});
	}

	set_margins(height) {
		this.base_height = height;
		this.height = height - 40;
		this.translate_x = 60;
		this.translate_y = 10;
	}

	setup() {
		if(!this.parent) {
			console.error("No parent element to render on was provided.");
			return;
		}
		this.bind_window_events();
		this.refresh(true);
	}

	bind_window_events() {
		window.addEventListener('resize', () => this.refresh());
		window.addEventListener('orientationchange', () => this.refresh());
	}

	refresh(init=false) {
		this.setup_base_values();
		this.set_width();

		this.setup_container();
		this.setup_components();

		this.setup_values();
		this.setup_utils();

		this.make_graph_components(init);
		this.make_tooltip();

		if(this.summary.length > 0) {
			this.show_custom_summary();
		} else {
			this.show_summary();
		}

		if(this.is_navigable) {
			this.setup_navigation(init);
		}
	}

	set_width() {
		let special_values_width = 0;
		let char_width = 8;
		this.specific_values.map(val => {
			let str_width = get_string_width((val.title + ""), char_width);
			if(str_width > special_values_width) {
				special_values_width = str_width - 40;
			}
		});
		this.base_width = this.parent.offsetWidth - special_values_width;
		this.width = this.base_width - this.translate_x * 2;
	}

	setup_base_values() {}

	setup_container() {
		this.container = $.create('div', {
			className: 'chart-container',
			innerHTML: `<h6 class="title">${this.title}</h6>
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
		this.svg = $.createSVG('svg', {
			className: 'chart',
			inside: this.chart_wrapper,
			width: this.base_width,
			height: this.base_height
		});

		this.svg_defs = $.createSVG('defs', {
			inside: this.svg,
		});

		return this.svg;
	}

	make_draw_area() {
		this.draw_area = $.createSVG("g", {
			className: this.type + '-chart',
			inside: this.svg,
			transform: `translate(${this.translate_x}, ${this.translate_y})`
		});
	}

	setup_components() { }

	make_tooltip() {
		this.tip = new SvgTip({
			parent: this.chart_wrapper,
		});
		this.bind_tooltip();
	}


	show_summary() {}
	show_custom_summary() {
		this.summary.map(d => {
			let stats = $.create('div', {
				className: 'stats',
				innerHTML: `<span class="indicator ${d.color}">${d.title}: ${d.value}</span>`
			});
			this.stats_wrapper.appendChild(stats);
		});
	}

	setup_navigation(init=false) {
		this.make_overlay();

		if(init) {
			this.bind_overlay();

			document.addEventListener('keydown', (e) => {
				if($.isElementInViewport(this.chart_wrapper)) {
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
				}
			});
		}
	}

	make_overlay() {}
	bind_overlay() {}
	bind_units() {}

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
		index = parseInt(index);
		if(index < 0) index = 0;
		if(index >= this.x.length) index = this.x.length - 1;
		if(index === this.current_index) return;
		this.current_index = index;
		$.fire(this.parent, "data-select", this.get_data_point());
	}

	// Objects
	setup_utils() { }
}
