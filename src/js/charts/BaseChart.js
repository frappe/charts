import SvgTip from '../objects/SvgTip';
import { $, isElementInViewport, getElementContentWidth } from '../utils/dom';
import { makeSVGContainer, makeSVGDefs, makeSVGGroup } from '../utils/draw';
import { getStringWidth } from '../utils/helpers';
import { getColor, DEFAULT_COLORS } from '../utils/colors';
import Chart from '../charts';

const ALL_CHART_TYPES = ['line', 'scatter', 'bar', 'percentage', 'heatmap', 'pie'];

const COMPATIBLE_CHARTS = {
	bar: ['line', 'scatter', 'percentage', 'pie'],
	line: ['scatter', 'bar', 'percentage', 'pie'],
	pie: ['line', 'scatter', 'percentage', 'bar'],
	scatter: ['line', 'bar', 'percentage', 'pie'],
	percentage: ['bar', 'line', 'scatter', 'pie'],
	heatmap: []
};

// TODO: Needs structure as per only labels/datasets
const COLOR_COMPATIBLE_CHARTS = {
	bar: ['line', 'scatter'],
	line: ['scatter', 'bar'],
	pie: ['percentage'],
	scatter: ['line', 'bar'],
	percentage: ['pie'],
	heatmap: []
};

export default class BaseChart {
	constructor({
		height = 240,
		margin_x = 60,
		margin_y = 10,

		title = '',
		subtitle = '',
		colors = [],
		summary = [],

		is_navigable = 0,
		has_legend = 0,

		type = '',

		parent,
		data
	}) {
		this.raw_chart_args = arguments[0];

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		this.title = title;
		this.subtitle = subtitle;

		this.data = data;

		this.specific_values = data.specific_values || [];
		this.summary = summary;

		this.is_navigable = is_navigable;
		if(this.is_navigable) {
			this.current_index = 0;
		}
		this.has_legend = has_legend;

		this.setColors(colors, type);
		this.set_margins(height, margin_x, margin_y);
	}

	get_different_chart(type) {
		if(type === this.type) return;

		if(!ALL_CHART_TYPES.includes(type)) {
			console.error(`'${type}' is not a valid chart type.`);
		}

		if(!COMPATIBLE_CHARTS[this.type].includes(type)) {
			console.error(`'${this.type}' chart cannot be converted to a '${type}' chart.`);
		}

		// whether the new chart can use the existing colors
		const use_color = COLOR_COMPATIBLE_CHARTS[this.type].includes(type);

		// Okay, this is anticlimactic
		// this function will need to actually be 'change_chart_type(type)'
		// that will update only the required elements, but for now ...
		return new Chart({
			parent: this.raw_chart_args.parent,
			title: this.title,
			data: this.raw_chart_args.data,
			type: type,
			height: this.raw_chart_args.height,
			colors: use_color ? this.colors : undefined
		});
	}

	setColors(colors, type) {
		this.colors = colors;

		// TODO: Needs structure as per only labels/datasets
		const list = type === 'percentage' || type === 'pie'
			? this.data.labels
			: this.data.datasets;

		if(!this.colors || (list && this.colors.length < list.length)) {
			this.colors = DEFAULT_COLORS;
		}

		this.colors = this.colors.map(color => getColor(color));
	}

	set_margins(height, margin_x, margin_y) {
		this.base_height = height;
		this.height = height - 2 * margin_y - 20;
		this.translate_x = margin_x;
		this.translate_y = margin_y;
	}

	setup() {
		if(!this.parent) {
			console.error("No parent element to render on was provided.");
			return;
		}
		if(this.validate_and_prepare_data()) {
			this.bind_window_events();
			this.refresh(true);
		}
	}

	validate_and_prepare_data() {
		return true;
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
			let str_width = getStringWidth((val.title + ""), char_width);
			if(str_width > special_values_width) {
				special_values_width = str_width - 40;
			}
		});
		this.base_width = getElementContentWidth(this.parent) - special_values_width;
		this.width = this.base_width - 2 * this.translate_x;
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
		this.svg = makeSVGContainer(
			this.chart_wrapper,
			'chart',
			this.base_width,
			this.base_height
		);
		this.svg_defs = makeSVGDefs(this.svg);
		return this.svg;
	}

	make_draw_area() {
		this.draw_area = makeSVGGroup(
			this.svg,
			this.type + '-chart',
			`translate(${this.translate_x}, ${this.translate_y})`
		);
	}

	setup_components() { }

	make_tooltip() {
		this.tip = new SvgTip({
			parent: this.chart_wrapper,
			colors: this.colors
		});
		this.bind_tooltip();
	}


	show_summary() {}
	show_custom_summary() {
		this.summary.map(d => {
			let stats = $.create('div', {
				className: 'stats',
				innerHTML: `<span class="indicator">
					<i style="background:${d.color}"></i>
					${d.title}: ${d.value}
				</span>`
			});
			this.stats_wrapper.appendChild(stats);
		});
	}

	setup_navigation(init=false) {
		this.make_overlay();

		if(init) {
			this.bind_overlay();

			document.addEventListener('keydown', (e) => {
				if(isElementInViewport(this.chart_wrapper)) {
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

	makeDrawAreaComponent(className, transform='') {
		return makeSVGGroup(this.draw_area, className, transform);
	}
}
