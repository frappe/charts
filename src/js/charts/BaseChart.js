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

		this.setupConfiguration();
	}

	setupConfiguration() {
		// Make a this.config, that has stuff like showTooltip,
		// showLegend, which then all functions will check

		this.setColors();
		this.setMargins();

		this.config = {
			showTooltip: 1,
			showLegend: 1,
			isNavigable: 0
		};
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

	setMargins() {
		let height = this.rawChartArgs.height;
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
		// Check and all



		// If all good
		this.data = data;


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


		this.makeContainer();
		this.makeTooltip(); // without binding
		this.draw(true);
	}

	draw(init=false) {
		// (draw everything, layers, groups, units)
		this.calc();
		this.setupRenderer(); // this chart's rendered with the config
		this.setupComponents();


		this.makeChartArea();
		this.makeLayers();

		this.renderComponents(); // with zero values
		this.renderLegend();
		this.setupNavigation(init);

		if(init) this.update(this.data);
	}

	bindWindowEvents() {
		window.addEventListener('resize', () => this.draw());
		window.addEventListener('orientationchange', () => this.draw());
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

	setupConstants() {}

	calc() {
		this.calcWidth();
		this.reCalc();
	}

	setupRenderer() {}

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

	update() {
		this.reCalc();
		this.reRender();
	}

	reCalc() {
		// Will update values(state)
		// Will recalc specific parts depending on the update
	}

	reRender(animate=true) {
		if(!animate) {
			this.renderComponents();
			return;
		}
		this.animateComponents();
		setTimeout(() => {
			this.renderComponents();
		}, 400);
		// TODO: should be max anim duration required
		// (opt, should not redraw if still in animate?)
	}

	animateComponents() {
		this.intermedValues = this.calcIntermediateValues();
		this.components.forEach(c => {
			// c.store = c.animate(...c.animateArgs);
			// c.layer.textContent = '';
			// c.store.forEach(element => {c.layer.appendChild(element);});
		});
	}


	calcInitStage() {}

	makeTooltip() {
		this.tip = new SvgTip({
			parent: this.chartWrapper,
			colors: this.colors
		});
		this.bindTooltip();
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

	makeLayer(className, transform='') {
		return makeSVGGroup(this.drawArea, className, transform);
	}

	getDifferentChart(type) {
		return getDifferentChart(type, this.type, this.rawChartArgs);
	}
}
