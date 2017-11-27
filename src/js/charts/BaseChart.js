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

// Needs structure as per only labels/datasets
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

		title = '',
		subtitle = '',
		colors = [],

		is_navigable = 0,

		type = '',

		parent,
		data
	}) {
		this.raw_chart_args = arguments[0];

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		this.title = title;
		this.subtitle = subtitle;

		this.data = data;

		this.is_navigable = is_navigable;
		if(this.is_navigable) {
			this.current_index = 0;
		}

		this.setupConfiguration(arguments[0]);
	}

	setupConfiguration(args) {
		// Make a this.config, that has stuff like showTooltip,
		// showLegend, which then all functions will check
		this.setColors(args.colors, args.type);
		this.set_margins(args.height);

		this.config = {
			showTooltip: 1,
			showLegend: 1,
			isNavigable: 0
		};
	}

	setColors(colors, type) {
		this.colors = colors;

		// Needs structure as per only labels/datasets
		const list = type === 'percentage' || type === 'pie'
			? this.data.labels
			: this.data.datasets;

		if(!this.colors || (list && this.colors.length < list.length)) {
			this.colors = DEFAULT_COLORS;
		}

		this.colors = this.colors.map(color => getColor(color));
	}

	set_margins(height) {
		this.baseHeight = height;
		this.height = height - 40;
		this.translate_x = 60;
		this.translate_y = 10;
	}

	validate(){
		if(!this.parent) {
			console.error("No parent element to render on was provided.");
			return false;
		}
		if(!this.validateAndPrepareData()) {
			return false;
		}
		return true;
	}

	validateAndPrepareData() {
		return true;
	}

	setup() {
		if(this.validate()) {
			this._setup();
		}
	}

	_setup() {
		this.bindWindowEvents();
		this.setupConstants();

		this.setupEmptyValues();
		// this.setupComponents();

		this.makeContainer();
		this.makeTooltip(); // without binding
		this.draw(true);
	}

	draw(init=false) {
		// (everything, layers, groups, units)
		this.setWidth();

		// dependent on width >.<, how can this be decoupled
		this.setupComponents();

		this.makeChartArea();
		this.makeLayers();

		this.renderComponents(); // with zero values
		this.renderLegend();
		this.setupNavigation(init);

		if(init) this.update(this.data);
	}

	update(data, animate=true) {
		this.oldData = Object.assign({}, this.data);
		this.data = this.prepareNewData(data);

		this.calculateValues();
		this.updateComponents(animate);
	}

	prepareNewData(newData) {
		// handle all types of passed data?
		return newData;
	}

	bindWindowEvents() {
		window.addEventListener('resize', () => this.draw());
		window.addEventListener('orientationchange', () => this.draw());
	}

	setWidth() {
		let special_values_width = 0;
		let char_width = 8;
		this.specific_values.map(val => {
			let str_width = getStringWidth((val.title + ""), char_width);
			if(str_width > special_values_width) {
				special_values_width = str_width - 40;
			}
		});
		this.base_width = getElementContentWidth(this.parent) - special_values_width;
		this.width = this.base_width - this.translate_x * 2;
	}

	setupConstants() {}

	setupEmptyValues() {}

	setupComponents() {
		// Components config
		this.components = [];
	}

	makeContainer() {
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
	}

	makeChartArea() {
		this.svg = makeSVGContainer(
			this.chart_wrapper,
			'chart',
			this.baseWidth,
			this.baseHeight
		);
		this.svg_defs = makeSVGDefs(this.svg);

		this.drawArea = makeSVGGroup(
			this.svg,
			this.type + '-chart',
			`translate(${this.translate_x}, ${this.translate_y})`
		);
	}


	makeLayers() {
		this.components.forEach((component) => {
			component.layer = this.makeLayer(component.layerClass);
		});
	}

	calculateValues() {}

	renderComponents() {
		this.components.forEach(c => {
			c.store = c.make(...c.makeArgs);
			c.layer.textContent = '';
			c.store.forEach(element => {c.layer.appendChild(element);});
		});
	}

	updateComponents() {
		// this.components.forEach((component) => {
		// 	//
		// });
	}

	makeTooltip() {
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
	renderLegend() {}

	setupNavigation(init=false) {
		if(this.is_navigable) return;

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

	getDataPoint() {}
	updateCurrentDataPoint() {}

	makeLayer(className, transform='') {
		return makeSVGGroup(this.drawArea, className, transform);
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
}
