import SvgTip from '../objects/SvgTip';
import { $, isElementInViewport, getElementContentWidth } from '../utils/dom';
import { makeSVGContainer, makeSVGDefs, makeSVGGroup } from '../utils/draw';
import { getStringWidth } from '../utils/helpers';
import { getColor, DEFAULT_COLORS } from '../utils/colors';
import { getDifferentChart } from '../config';
import { runSMILAnimation } from '../utils/animation';

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
		this.argHeight = height;

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

		// constants
		this.config = {
			showTooltip: 1, // calculate
			showLegend: 1,
			isNavigable: 0,
			// animate: 1
			animate: 0
		};

		this.state = {
			colors: this.colors
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
		// TODO: think for all
		let height = this.argHeight;
		this.baseHeight = height;
		this.height = height - 40; // change
		this.translateY = 20;

		this.setHorizontalMargin();
	}

	setHorizontalMargin() {
		this.translateXLeft = 60;
		this.translateXRight = 40;
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

		this.setMargins();
		this.makeContainer();
		this.makeTooltip(); // without binding

		this.calcWidth();
		this.makeChartArea();
		this.initComponents();

		this.setupComponents();
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
		this.components.forEach(c => c.make()); // or c.build()
		this.renderLegend();

		this.setupNavigation(init);

		// TODO: remove timeout and decrease post animate time in chart component
		setTimeout(() => {this.update();}, 1000);
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
		this.width = this.baseWidth - (this.translateXLeft + this.translateXRight);
	}

	update(data=this.data) {
		this.prepareData(data);
		this.calc(); // builds state
		this.render();
	}

	prepareData() {}

	renderConstants() {}

	calc() {} // builds state

	render(animate=true) {
		// Can decouple to this.refreshComponents() first to save animation timeout
		this.elementsToAnimate = [].concat.apply([],
			this.components.map(c => c.update(animate)));
		if(this.elementsToAnimate) {
			runSMILAnimation(this.chartWrapper, this.svg, this.elementsToAnimate);
		}

		// TODO: rebind new units
		// if(this.isNavigable) {
		// 	this.bind_units(units_array);
		// }
	}

	makeChartArea() {
		this.svg = makeSVGContainer(
			this.chartWrapper,
			'chart',
			this.baseWidth,
			this.baseHeight
		);
		this.svgDefs = makeSVGDefs(this.svg);

		// I WISH !!!
		// this.svg = makeSVGGroup(
		// 	svgContainer,
		// 	'flipped-coord-system',
		// 	`translate(0, ${this.baseHeight}) scale(1, -1)`
		// );

		this.drawArea = makeSVGGroup(
			this.svg,
			this.type + '-chart',
			`translate(${this.translateXLeft}, ${this.translateY})`
		);
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

	// updateData() {
	// 	update();
	// }

	getDataPoint() {}
	setCurrentDataPoint() {}


	// Update the data here, then do relevant updates
	// and drawing in child classes by overriding
	// The Child chart will only know what a particular update means
	// and what components are affected,
	// BaseChart shouldn't be doing the animating

	updateDataset(dataset, index) {}

	updateDatasets(datasets) {
		//
	}

	addDataset(dataset, index) {}

	removeDataset(index = 0) {}

	addDataPoint(dataPoint, index = 0) {}

	removeDataPoint(index = 0) {}

	updateDataPoint(dataPoint, index = 0) {}



	getDifferentChart(type) {
		return getDifferentChart(type, this.type, this.rawChartArgs);
	}
}
