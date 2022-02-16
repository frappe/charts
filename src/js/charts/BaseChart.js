import SvgTip from '../objects/SvgTip';
import { $, isElementInViewport, getElementContentWidth, isHidden } from '../utils/dom';
import { makeSVGContainer, makeSVGDefs, makeSVGGroup, makeText } from '../utils/draw';
import { BASE_MEASURES, getExtraHeight, getExtraWidth, getTopOffset, getLeftOffset,
	INIT_CHART_UPDATE_TIMEOUT, CHART_POST_ANIMATE_TIMEOUT, DEFAULT_COLORS} from '../utils/constants';
import { getColor, isValidColor } from '../utils/colors';
import { runSMILAnimation } from '../utils/animation';
import { downloadFile, prepareForExport } from '../utils/export';
import { deepClone } from  '../utils/helpers';

export default class BaseChart {
	constructor(parent, options) {
		// deepclone options to avoid making changes to orignal object
		options = deepClone(options);

		this.parent = typeof parent === 'string'
			? document.querySelector(parent)
			: parent;

		if (!(this.parent instanceof HTMLElement)) {
			throw new Error('No `parent` element to render on was provided.');
		}

		this.rawChartArgs = options;

		this.title = options.title || '';
		this.type = options.type || '';

		this.realData = this.prepareData(options.data);
		this.data = this.prepareFirstData(this.realData);

		this.colors = this.validateColors(options.colors, this.type);

		this.config = {
			showTooltip: 1, // calculate
			showLegend: 1, // calculate
			isNavigable: options.isNavigable || 0,
			animate: (typeof options.animate !== 'undefined') ? options.animate : 1,
			truncateLegends: options.truncateLegends || 1
		};

		this.measures = JSON.parse(JSON.stringify(BASE_MEASURES));
		let m = this.measures;
		this.setMeasures(options);
		if(!this.title.length) { m.titleHeight = 0; }
		if(!this.config.showLegend) m.legendHeight = 0;
		this.argHeight = options.height || m.baseHeight;

		this.state = {};
		this.options = {};

		this.initTimeout = INIT_CHART_UPDATE_TIMEOUT;

		if(this.config.isNavigable) {
			this.overlays = [];
		}

		this.configure(options);
	}

	prepareData(data) {
		return data;
	}

	prepareFirstData(data) {
		return data;
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

	setMeasures() {
		// Override measures, including those for title and legend
		// set config for legend and title
	}

	configure() {
		let height = this.argHeight;
		this.baseHeight = height;
		this.height = height - getExtraHeight(this.measures);

		// Bind window events
		this.boundDrawFn = () => this.draw(true);
		if (ResizeObserver) {
			this.resizeObserver = new ResizeObserver(this.boundDrawFn);
			this.resizeObserver.observe(this.parent);
		}
		window.addEventListener('resize', this.boundDrawFn);
		window.addEventListener('orientationchange', this.boundDrawFn);
	}

	destroy() {
		if (this.resizeObserver) this.resizeObserver.disconnect();
		window.removeEventListener('resize', this.boundDrawFn);
		window.removeEventListener('orientationchange', this.boundDrawFn);
	}

	// Has to be called manually
	setup() {
		this.makeContainer();
		this.updateWidth();
		this.makeTooltip();

		this.draw(false, true);
	}

	makeContainer() {
		// Chart needs a dedicated parent element
		this.parent.innerHTML = '';

		let args = {
			inside: this.parent,
			className: 'chart-container'
		};

		if(this.independentWidth) {
			args.styles = { width: this.independentWidth + 'px' };
		}

		this.container = $.create('div', args);
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
		if (onlyWidthChange && isHidden(this.parent)) {
			// Don't update anything if the chart is hidden
			return;
		}
		this.updateWidth();

		this.calc(onlyWidthChange);
		this.makeChartArea();
		this.setupComponents();

		this.components.forEach(c => c.setup(this.drawArea));
		// this.components.forEach(c => c.make());
		this.render(this.components, false);

		if(init) {
			this.data = this.realData;
			setTimeout(() => {this.update(this.data);}, this.initTimeout);
		}

		this.renderLegend();

		this.setupNavigation(init);
	}

	calc() {} // builds state

	updateWidth() {
		this.baseWidth = getElementContentWidth(this.parent);
		this.width = this.baseWidth - getExtraWidth(this.measures);
	}

	makeChartArea() {
		if(this.svg) {
			this.container.removeChild(this.svg);
		}
		let m = this.measures;

		this.svg = makeSVGContainer(
			this.container,
			'frappe-chart chart',
			this.baseWidth,
			this.baseHeight
		);
		this.svgDefs = makeSVGDefs(this.svg);

		if(this.title.length) {
			this.titleEL = makeText(
				'title',
				m.margins.left,
				m.margins.top,
				this.title,
				{
					fontSize: m.titleFontSize,
					fill: '#666666',
					dy: m.titleFontSize
				}
			);
		}

		let top = getTopOffset(m);
		this.drawArea = makeSVGGroup(
			this.type + '-chart chart-draw-area',
			`translate(${getLeftOffset(m)}, ${top})`
		);

		if(this.config.showLegend) {
			top += this.height + m.paddings.bottom;
			this.legendArea = makeSVGGroup(
				'chart-legend',
				`translate(${getLeftOffset(m)}, ${top})`
			);
		}

		if(this.title.length) { this.svg.appendChild(this.titleEL); }
		this.svg.appendChild(this.drawArea);
		if(this.config.showLegend) { this.svg.appendChild(this.legendArea); }

		this.updateTipOffset(getLeftOffset(m), getTopOffset(m));
	}

	updateTipOffset(x, y) {
		this.tip.offset = {
			x: x,
			y: y
		};
	}

	setupComponents() { this.components = new Map(); }

	update(data) {
		if(!data) {
			console.error('No data to update.');
		}
		this.data = this.prepareData(data);
		this.calc(); // builds state
		this.render(this.components, this.config.animate);
		this.renderLegend();
	}

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

	export() {
		let chartSvg = prepareForExport(this.svg);
		downloadFile(this.title || 'Chart', [chartSvg]);
	}
}
