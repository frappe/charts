import SvgTip from '../objects/SvgTip';
import { $, isElementInViewport, getElementContentWidth } from '../utils/dom';
import { makeSVGContainer, makeSVGDefs, makeSVGGroup, makeText, AXIS_TICK_LENGTH } from '../utils/draw';
import { BASE_CHART_TOP_MARGIN, BASE_CHART_LEFT_MARGIN,
	BASE_CHART_RIGHT_MARGIN, INIT_CHART_UPDATE_TIMEOUT, CHART_POST_ANIMATE_TIMEOUT, DEFAULT_COLORS,
	ALL_CHART_TYPES, COMPATIBLE_CHARTS, DATA_COLOR_DIVISIONS} from '../utils/constants';
import { getColor, isValidColor } from '../utils/colors';
import { runSMILAnimation } from '../utils/animation';
import { Chart } from '../chart';

export default class BaseChart {
	constructor(parent, options) {

		this.parent = typeof parent === 'string'
			? document.querySelector(parent)
			: parent;

		if (!(this.parent instanceof HTMLElement)) {
			throw new Error('No `parent` element to render on was provided.');
		}

		this.rawChartArgs = options;

		this.title = options.title || '';
		this.argHeight = options.height || 240;
		this.type = options.type || '';

		this.realData = this.prepareData(options.data);
		this.data = this.prepareFirstData(this.realData);

		this.colors = this.validateColors(options.colors, this.type);

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

	validateColors(colors, type) {
		const validColors = [];
		colors = (colors || []).concat(DEFAULT_COLORS[type]);
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
		this.height = height - 70;
		this.topMargin = BASE_CHART_TOP_MARGIN;

		// Horizontal margins
		this.leftMargin = BASE_CHART_LEFT_MARGIN;
		this.rightMargin = BASE_CHART_RIGHT_MARGIN;
	}

	setup() {
		this.makeContainer();
		this.makeTooltip();

		this.draw(false, true);
	}

	setupComponents() {
		this.components = new Map();
	}

	makeContainer() {
		// Chart needs a dedicated parent element
		this.parent.innerHTML = '';
		this.container = $.create('div', {
			inside: this.parent,
			className: 'chart-container'
		});
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
		this.calc(onlyWidthChange);
		this.updateWidth();
		this.makeChartArea();
		this.setupComponents();

		this.components.forEach(c => c.setup(this.drawArea));
		// this.components.forEach(c => c.make());
		this.render(this.components, false);

		if(init) {
			this.data = this.realData;
			setTimeout(() => {this.update(this.data);}, this.initTimeout);
		}

		if(!onlyWidthChange) {
			this.renderLegend();
		}

		this.setupNavigation(init);
	}

	updateWidth() {
		this.baseWidth = getElementContentWidth(this.parent);
		this.width = this.baseWidth - (this.leftMargin + this.rightMargin);
	}

	update(data) {
		if(!data) {
			console.error('No data to update.');
		}
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
			this.makeOverlay();
			this.bindUnits();
		}
	}

	makeChartArea() {
		if(this.svg) {
			this.container.removeChild(this.svg);
		}

		let titleAreaHeight = 0;
		let legendAreaHeight = 0;
		if(this.title.length) {
			titleAreaHeight = 30;
		}
		if(this.showLegend) {
			legendAreaHeight = 30;
		}
		this.svg = makeSVGContainer(
			this.container,
			'frappe-chart chart',
			this.baseWidth,
			this.baseHeight + titleAreaHeight + legendAreaHeight
		);
		this.svgDefs = makeSVGDefs(this.svg);

		if(this.title.length) {
			this.titleEL = makeText(
				'title',
				this.leftMargin - AXIS_TICK_LENGTH,
				this.topMargin,
				this.title,
				11
			);
			this.svg.appendChild(this.titleEL);
		}

		let top = this.topMargin + titleAreaHeight;
		this.drawArea = makeSVGGroup(
			this.svg,
			this.type + '-chart',
			`translate(${this.leftMargin}, ${top})`
		);

		top = this.baseHeight + titleAreaHeight;
		this.legendArea = makeSVGGroup(
			this.svg,
			'chart-legend',
			`translate(${this.leftMargin}, ${top})`
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
