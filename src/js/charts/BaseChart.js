import SvgTip from '../objects/SvgTip';
import { $, isElementInViewport, getElementContentWidth } from '../utils/dom';
import { makeSVGContainer, makeSVGDefs, makeSVGGroup } from '../utils/draw';
import { VERT_SPACE_OUTSIDE_BASE_CHART, TRANSLATE_Y_BASE_CHART, LEFT_MARGIN_BASE_CHART,
	RIGHT_MARGIN_BASE_CHART, INIT_CHART_UPDATE_TIMEOUT, CHART_POST_ANIMATE_TIMEOUT } from '../utils/constants';
import { getColor, DEFAULT_COLORS } from '../utils/colors';
import { getDifferentChart } from '../config';
import { runSMILAnimation } from '../utils/animation';

export default class BaseChart {
	constructor(parent, options) {
		this.rawChartArgs = options;

		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		if (!(this.parent instanceof HTMLElement)) {
			throw new Error('No `parent` element to render on was provided.');
		}

		this.title = options.title || '';
		this.subtitle = options.subtitle || '';
		this.argHeight = options.height || 240;
		this.type = options.type || '';

		this.realData = this.prepareData(options.data);
		this.data = this.prepareFirstData(this.realData);
		this.colors = [];
		this.config = {
			showTooltip: 1, // calculate
			showLegend: options.showLegend || 1,
			isNavigable: options.isNavigable || 0,
			animate: 1
		};
		this.state = {};
		this.options = {};

		this.initTimeout = INIT_CHART_UPDATE_TIMEOUT;

		if(this.config.isNavigable) {
			this.overlays = [];
		}

		this.configure(options);
	}

	configure(args) {
		this.setColors(args);
		this.setMargins();

		// Bind window events
		window.addEventListener('resize', () => this.draw(true));
		window.addEventListener('orientationchange', () => this.draw(true));
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
		let height = this.argHeight;
		this.baseHeight = height;
		this.height = height - VERT_SPACE_OUTSIDE_BASE_CHART;
		this.translateY = TRANSLATE_Y_BASE_CHART;

		// Horizontal margins
		this.leftMargin = LEFT_MARGIN_BASE_CHART;
		this.rightMargin = RIGHT_MARGIN_BASE_CHART;
	}

	validate() {
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

		this.draw(false, true);
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

	draw(onlyWidthChange=false, init=false) {
		this.calcWidth();
		this.calc(onlyWidthChange);
		this.makeChartArea();
		this.setupComponents();

		this.components.forEach(c => c.setup(this.drawArea));
		// this.components.forEach(c => c.make());
		this.render(this.components, false);

		if(init) {
			this.data = this.realData;
			setTimeout(() => {this.update();}, this.initTimeout);
		}

		if(!onlyWidthChange) {
			this.renderLegend();
		}

		this.setupNavigation(init);
	}

	calcWidth() {
		this.baseWidth = getElementContentWidth(this.parent);
		this.width = this.baseWidth - (this.leftMargin + this.rightMargin);
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
			}, CHART_POST_ANIMATE_TIMEOUT);
		} else {
			components.forEach(c => c.make());
			this.updateNav();
		}
	}

	updateNav() {
		if(this.config.isNavigable) {
			// if(!this.overlayGuides){
			this.makeOverlay();
			this.bindUnits();
			// } else {
			// 	this.updateOverlay();
			// }
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
			`translate(${this.leftMargin}, ${this.translateY})`
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
			};

			document.addEventListener('keydown', (e) => {
				if(isElementInViewport(this.chartWrapper)) {
					e = e || window.event;
					if(this.keyActions[e.keyCode]) {
						this.keyActions[e.keyCode]();
					}
				}
			});
		}
	}

	makeOverlay() {}
	updateOverlay() {}
	bindOverlay() {}
	bindUnits() {}

	onLeftArrow() {}
	onRightArrow() {}
	onUpArrow() {}
	onDownArrow() {}
	onEnterKey() {}

	addDataPoint() {}
	removeDataPoint() {}

	getDataPoint() {}
	setCurrentDataPoint() {}

	updateDataset() {}

	getDifferentChart(type) {
		return getDifferentChart(type, this.type, this.parent, this.rawChartArgs);
	}
}
