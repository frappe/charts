import SvgTip from '../objects/SvgTip';
import { $, isElementInViewport, getElementContentWidth } from '../utils/dom';
import { makeSVGContainer, makeSVGDefs, makeSVGGroup } from '../utils/draw';
import { VERT_SPACE_OUTSIDE_BASE_CHART, TRANSLATE_Y_BASE_CHART, LEFT_MARGIN_BASE_CHART,
	RIGHT_MARGIN_BASE_CHART, INIT_CHART_UPDATE_TIMEOUT, CHART_POST_ANIMATE_TIMEOUT, DEFAULT_COLORS,
	ALL_CHART_TYPES, COMPATIBLE_CHARTS, DATA_COLOR_DIVISIONS} from '../utils/constants';
import { getColor, isValidColor } from '../utils/colors';
import { runSMILAnimation } from '../utils/animation';
import { Chart } from '../chart';

export default class BaseChart {
	constructor(parent, options) {
		this.parent = typeof parent === 'string' ? document.querySelector(parent) : parent;
		if (!(this.parent instanceof HTMLElement)) {
			throw new Error('No `parent` element to render on was provided.');
		}

		this.rawChartArgs = options;

		this.title = options.title || '';
		this.subtitle = options.subtitle || '';
		this.argHeight = options.height || 240;
		this.type = options.type || '';

		this.realData = this.prepareData(options.data);
		this.data = this.prepareFirstData(this.realData);

		this.colors = this.validateColors(options.colors)
			.concat(DEFAULT_COLORS[this.type]);

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

	configure() {
		this.setMargins();

		// Bind window events
		window.addEventListener('resize', () => this.draw(true));
		window.addEventListener('orientationchange', () => this.draw(true));
	}

	validateColors(colors = []) {
		const validColors = [];
		colors.forEach((string) => {
			const color = getColor(string);
			if(!isValidColor(color)) {
				console.warn('"' + string + '" is not a valid color.');
			} else {
				validColors.push(color);
			}
		});
		return validColors;
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

		this.parent.innerHTML = '';
		this.container = $.create('div', {
			inside: this.parent,
			className: 'chart-container'
		});

		this.container = this.container;
	}

	makeTooltip() {
		this.tip = new SvgTip({
			parent: this.container,
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
			runSMILAnimation(this.container, this.svg, elementsToAnimate);
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
			this.container.removeChild(this.svg);
		}
		this.svg = makeSVGContainer(
			this.container,
			'frappe-chart chart',
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
				if(isElementInViewport(this.container)) {
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
		const currentType = this.type;
		let args = this.rawChartArgs;
		if(type === currentType) return;

		if(!ALL_CHART_TYPES.includes(type)) {
			console.error(`'${type}' is not a valid chart type.`);
		}

		if(!COMPATIBLE_CHARTS[currentType].includes(type)) {
			console.error(`'${currentType}' chart cannot be converted to a '${type}' chart.`);
		}

		// whether the new chart can use the existing colors
		const useColor = DATA_COLOR_DIVISIONS[currentType] === DATA_COLOR_DIVISIONS[type];

		// Okay, this is anticlimactic
		// this function will need to actually be 'changeChartType(type)'
		// that will update only the required elements, but for now ...

		args.type = type;
		args.colors = useColor ? args.colors : undefined;

		return new Chart(this.parent, args);
	}

	unbindWindowEvents(){
		window.removeEventListener('resize', () => this.draw(true));
		window.removeEventListener('orientationchange', () => this.draw(true));
	}
}
