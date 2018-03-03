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
		this.type = type;

		this.realData = this.prepareData(data);
		this.data = this.prepareFirstData(this.realData);
		this.colors = [];
		this.config = {
			showTooltip: 1, // calculate
			showLegend: 1,
			isNavigable: isNavigable,
			animate: 1
		};
		this.state = {};
		this.options = {};

		if(this.config.isNavigable) {
			this.state.currentIndex = 0;
			this.overlays = [];
		}

		this.configure(arguments[0]);
	}

	configure(args) {
		this.setColors();
		this.setMargins();

		// Bind window events
		window.addEventListener('resize', () => this.draw());
		window.addEventListener('orientationchange', () => this.draw());
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

		// Horizontal margins
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
		return true;
	}

	setup() {
		if(this.validate()) {
			this._setup();
		}
	}

	_setup() {
		this.makeContainer();
		this.makeTooltip();

		this.draw(true);
	}

	setupComponents() {
		this.components = new Map();
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
		this.calcWidth();
		this.calc();
		this.makeChartArea();
		this.setupComponents();

		this.components.forEach(c => c.setup(this.drawArea)); // or c.build()
		this.components.forEach(c => c.make()); // or c.build()

		// TODO: remove timeout and decrease post animate time in chart component
		if(init) {
			this.data = this.realData;
			setTimeout(() => {this.update();}, 1000);
		}

		this.renderLegend();
		this.setupNavigation(init);
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
		this.data = this.prepareData(data);
		this.calc(); // builds state
		this.render();
	}

	prepareData(data=this.data) {
		return data;
	}

	prepareFirstData(data=this.data) {
		return data;
	}

	calc() {} // builds state

	render(components=this.components, animate=true) {
		if(this.config.isNavigable) {
			// Remove all existing overlays
			this.overlays.map(o => o.parentNode.removeChild(o));
			// ref.parentNode.insertBefore(element, ref);
		}
		let elementsToAnimate = [];
		// Can decouple to this.refreshComponents() first to save animation timeout
		components.forEach(c => {
			elementsToAnimate = elementsToAnimate.concat(c.update(animate));
		});
		if(elementsToAnimate.length > 0) {
			runSMILAnimation(this.chartWrapper, this.svg, elementsToAnimate);
			setTimeout(() => {
				components.forEach(c => c.make());
				this.updateNav();
			}, 400);
		} else {
			this.updateNav();
		}
	}

	updateNav() {
		if(this.config.isNavigable) {
			// Make new overlays
			if(!this.overlayGuides){
				this.makeOverlays();
				this.bindUnits();
			} else {
				this.updateOverlays();
			}
		}
	}

	makeChartArea() {
		if(this.svg) {
			this.chartWrapper.removeChild(this.svg);
		}
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
		if(!this.config.isNavigable) return;

		if(init) {
			this.bindOverlay();

			this.keyActions = {
				'13': this.onEnterKey.bind(this),
				'37': this.onLeftArrow.bind(this),
				'38': this.onUpArrow.bind(this),
				'39': this.onRightArrow.bind(this),
				'40': this.onDownArrow.bind(this),
			}

			document.addEventListener('keydown', (e) => {
				if(isElementInViewport(this.chartWrapper)) {
					e = e || window.event;
					this.keyActions[e.keyCode]();
				}
			});
		}
	}

	makeOverlays() {}
	bindOverlay() {}
	bindUnits() {}

	onLeftArrow() {}
	onRightArrow() {}
	onUpArrow() {}
	onDownArrow() {}
	onEnterKey() {}

	getDataPoint(index = 0) {}
	setCurrentDataPoint(point) {}

	updateDataset(dataset, index) {}
	addDataset(dataset, index) {}
	removeDataset(index = 0) {}

	updateDatasets(datasets) {}

	updateDataPoint(dataPoint, index = 0) {}
	addDataPoint(dataPoint, index = 0) {}
	removeDataPoint(index = 0) {}

	getDifferentChart(type) {
		return getDifferentChart(type, this.type, this.rawChartArgs);
	}
}
