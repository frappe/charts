import SvgTip from '../objects/SvgTip';
import { $, isElementInViewport, getElementContentWidth } from '../utils/dom';
import { makeSVGContainer, makeSVGDefs, makeSVGGroup } from '../utils/draw';
import { getStringWidth } from '../utils/helpers';
import { getColor, DEFAULT_COLORS } from '../utils/colors';
import { getDifferentChart } from '../config';

export default class BaseChart {
	constructor({
		height = 240,

		title = '',
		subtitle = '',
		colors = [],

		isNavigable = 0,
		showLegend = 1,

		type = '',

		parent,
		data
	}) {
		this.rawChartArgs = arguments[0];

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		this.title = title;
		this.subtitle = subtitle;

		this.isNavigable = isNavigable;
		if(this.isNavigable) {
			this.currentIndex = 0;
		}

		this.configure(arguments[0]);
	}

	configure(args) {
		// Make a this.config, that has stuff like showTooltip,
		// showLegend, which then all functions will check

		this.setColors();
		this.setMargins(args);

		// constants
		this.config = {
			showTooltip: 1, // calculate
			showLegend: 1,
			isNavigable: 0,
			// animate: 1
			animate: 0
		};

		this.state = {};
	}

	setColors() {
		let args = this.rawChartArgs;

		// Needs structure as per only labels/datasets, from config
		const list = args.type === 'percentage' || args.type === 'pie'
			? args.data.labels
			: args.data.datasets;

		if(!args.colors || (list && args.colors.length < list.length)) {
			this.colors = DEFAULT_COLORS;
		} else {
			this.colors = args.colors;
		}

		this.colors = this.colors.map(color => getColor(color));
	}

	setMargins(args) {
		let height = args.height;
		this.baseHeight = height;
		this.height = height - 40;
		this.translateX = 60;
		this.translateY = 10;
	}

	validate(){
		let args = this.rawChartArgs;
		// Now yo have the args, set this stuff only after validating
		if(!this.parent) {
			console.error("No parent element to render on was provided.");
			return false;
		}
		if(!this.parseData()) {
			return false;
		}
		return true;
	}

	parseData() {
		let data = this.rawChartArgs.data;
		let valid = this.checkData(data);
		if(!valid) return false;

		if(!this.config.animate) {
			this.data = data;
		} else {
			[this.data, this.firstUpdateData] =
				this.getFirstUpdateData(data);
		}
		return true;
	}

	checkData() {}
	getFirstUpdateData() {}

	setup() {
		if(this.validate()) {
			this._setup();
		}
	}

	_setup() {
		this.bindWindowEvents();
		this.setupConstants();
		this.setupComponents();
		this.makeContainer();
		this.makeTooltip(); // without binding
		this.draw(true);
	}

	bindWindowEvents() {
		window.addEventListener('resize orientationchange', () => this.draw());
	}

	setupConstants() {}

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

		this.chartWrapper = this.container.querySelector('.frappe-chart');
		this.statsWrapper = this.container.querySelector('.graph-stats-container');
	}

	makeTooltip() {
		this.tip = new SvgTip({
			parent: this.chartWrapper,
			colors: this.colors
		});
		this.bindTooltip();
	}

	bindTooltip() {}

	draw(init=false) {
		// difference from update(): draw the whole object due to groudbreaking event (init, resize, etc.)
		// (draw everything, layers, groups, units)

		this.calcWidth();
		this.refresh(); // refresh conponent with chart a

		this.makeChartArea();
		this.setComponentParent();
		this.makeComponentLayers();

		this.renderLegend();
		this.setupNavigation(init);

		this.renderComponents(); // first time plain render, so no rerender

		if(this.config.animate) this.update(this.firstUpdateData);
	}

	update() {
		// difference from draw(): yes you do rerender everything here as well,
		// but not things like the chart itself or layers, mosty only at component level
		// HERE IS WHERE THE ACTUAL STATE CHANGES, and old one matters, not in draw
		this.refresh();
		this.reRender();
	}

	calcWidth() {
		let outerAnnotationsWidth = 0;
		// let charWidth = 8;
		// this.specificValues.map(val => {
		// 	let strWidth = getStringWidth((val.title + ""), charWidth);
		// 	if(strWidth > outerAnnotationsWidth) {
		// 		outerAnnotationsWidth = strWidth - 40;
		// 	}
		// });
		this.baseWidth = getElementContentWidth(this.parent) - outerAnnotationsWidth;
		this.width = this.baseWidth - this.translateX * 2;
	}

	refresh() { //?? refresh?
		this.oldState = this.state ? Object.assign({}, this.state) : {};
		this.prepareData();
		this.reCalc();
		this.refreshRenderer();
		this.refreshComponents();
	}

	makeChartArea() {
		this.svg = makeSVGContainer(
			this.chartWrapper,
			'chart',
			this.baseWidth,
			this.baseHeight
		);
		this.svg_defs = makeSVGDefs(this.svg);

		this.drawArea = makeSVGGroup(
			this.svg,
			this.type + '-chart',
			`translate(${this.translateX}, ${this.translateY})`
		);
	}

	prepareData() {}

	reCalc() {}
	// Will update values(state)
	// Will recalc specific parts depending on the update

	refreshRenderer() {}

	reRender(animate=true) {
		if(!animate) {
			this.renderComponents();
			return;
		}
		this.intermedState = this.calcIntermedState();
		this.refreshComponents();
		this.animateComponents();
		setTimeout(() => {
			this.renderComponents();
		}, 400);
		// TODO: should be max anim duration required
		// (opt, should not redraw if still in animate?)
	}

	calcIntermedState() {}

	// convenient component array abstractions
	setComponentParent() { this.components.forEach(c => c.setupParent(this.drawArea)); };
	makeComponentLayers() { this.components.forEach(c => c.makeLayer()); }
	renderComponents() { this.components.forEach(c => c.render()); }
	animateComponents() { this.components.forEach(c => c.animate()); }
	refreshComponents() {
		let args = {
			chartState: this.state,
			oldChartState: this.oldState,
			intermedState: this.intermedState,
			chartRenderer: this.renderer
		};
		this.components.forEach(c => c.refresh(args));
	}

	renderLegend() {}

	setupNavigation(init=false) {
		if(this.isNavigable) return;

		this.makeOverlay();

		if(init) {
			this.bindOverlay();

			document.addEventListener('keydown', (e) => {
				if(isElementInViewport(this.chartWrapper)) {
					e = e || window.event;

					if (e.keyCode == '37') {
						this.onLeftArrow();
					} else if (e.keyCode == '39') {
						this.onRightArrow();
					} else if (e.keyCode == '38') {
						this.onUpArrow();
					} else if (e.keyCode == '40') {
						this.onDownArrow();
					} else if (e.keyCode == '13') {
						this.onEnterKey();
					}
				}
			});
		}
	}

	makeOverlay() {}
	bindOverlay() {}
	bind_units() {}

	onLeftArrow() {}
	onRightArrow() {}
	onUpArrow() {}
	onDownArrow() {}
	onEnterKey() {}

	getDataPoint() {}
	updateCurrentDataPoint() {}

	getDifferentChart(type) {
		return getDifferentChart(type, this.type, this.rawChartArgs);
	}
}
