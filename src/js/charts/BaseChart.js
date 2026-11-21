import SvgTip from '../objects/SvgTip';
import { $, isElementInViewport, getElementContentWidth, getElementContentHeight, isHidden } from '../utils/dom';
import { makeSVGContainer, makeSVGDefs, makeSVGGroup, makeText } from '../utils/draw';
import {
	BASE_MEASURES, getExtraHeight, getExtraWidth, getTopOffset, getLeftOffset,
	INIT_CHART_UPDATE_TIMEOUT, CHART_POST_ANIMATE_TIMEOUT, DEFAULT_COLORS, LEGEND_ITEM_GAP
} from '../utils/constants';
import { getColor, isValidColor } from '../utils/colors';
import { runSMILAnimation } from '../utils/animation';
import { downloadFile, prepareForExport } from '../utils/export';
import { deepClone, getLegendRows } from '../utils/helpers';

export default class BaseChart {
	constructor(parent, options) {
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

		this.realData = this.prepareData(options.data || {});
		this.data = this.prepareFirstData(this.realData);

		this.colors = this.validateColors(options.colors, this.type);
		this.paletteSize = this.colors.length;
		this.extendColors(this.realData);

		this.config = {
			showTooltip: 1, // calculate
			showLegend: (typeof options.showLegend !== 'undefined') ? options.showLegend : 1,
			isNavigable: options.isNavigable || 0,
			animate: (typeof options.animate !== 'undefined') ? options.animate : 1,
			disableEntryAnimation: options.disableEntryAnimation || 0,
			truncateLegends:  (typeof options.truncateLegends !== 'undefined') ? options.truncateLegends : 1,
			onClick: options.onClick
		};

		if (this.config.disableEntryAnimation || !this.config.animate) {
			this.data = this.realData;
		}

		this.measures = JSON.parse(JSON.stringify(BASE_MEASURES));
		let m = this.measures;
		this.setMeasures(options);
		let measures = options.measures || {};
		['margins', 'paddings'].forEach(key => Object.assign(m[key], measures[key]));
		if (!this.title.length) { m.titleHeight = 0; }
		if (!this.config.showLegend) m.legendHeight = 0;
		this.fitHeight = options.height === '100%';
		this.argHeight = (!this.fitHeight && options.height) || m.baseHeight;
		this.baseLegendHeight = m.legendHeight;

		this.state = {};
		this.options = {};

		this.initTimeout = INIT_CHART_UPDATE_TIMEOUT;

		if (this.config.isNavigable) {
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
			if (!isValidColor(color)) {
				console.warn('"' + string + '" is not a valid color.');
			} else {
				validColors.push(color);
			}
		});
		return validColors;
	}

	extendColors(data = {}) {
		if (this.type === 'heatmap' || !this.paletteSize) return;
		let count = Math.max((data.labels || []).length, (data.datasets || []).length);
		for (let i = this.colors.length; i < count; i++) {
			this.colors.push(this.colors[i % this.paletteSize]);
		}
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

		if (this.independentWidth) {
			args.styles = { width: this.independentWidth + 'px', maxWidth: '100%' };
		}

		this.container = $.create('div', args);
		this.container.classList.toggle('fit-height', !!this.fitHeight);
		this.container.classList.toggle('is-clickable', !!this.config.onClick);
	}

	makeTooltip() {
		this.tip = new SvgTip({
			parent: this.container,
			colors: this.colors
		});
		this.bindTooltip();
	}

	bindTooltip() { }

	draw(onlyWidthChange = false, init = false) {
		if (onlyWidthChange && isHidden(this.parent)) {
			// Don't update anything if the chart is hidden
			return;
		}
		this.updateWidth();
		if (this.fitHeight && this.updateHeight()) onlyWidthChange = false;

		this.calc(onlyWidthChange);
		this.makeChartArea();
		this.setupComponents();

		this.components.forEach(c => c.setup(this.drawArea));
		// this.components.forEach(c => c.make());
		this.render(this.components, false);

		if (init && this.data !== this.realData) {
			this.data = this.realData;
			setTimeout(() => { this.update(this.data, true); }, this.initTimeout);
		}
		
		if (this.config.showLegend) {
			this.renderLegend();
		}

		this.setupNavigation(init);
	}

	calc() { } // builds state

	updateHeight() {
		let height = getElementContentHeight(this.parent);
		if (!height || height === this.argHeight) return false;
		this.argHeight = height;
		this.measures.legendHeight = this.baseLegendHeight;
		this.baseHeight = height;
		this.height = height - getExtraHeight(this.measures);
		return true;
	}

	updateWidth() {
		this.baseWidth = getElementContentWidth(this.parent);
		this.width = this.baseWidth - getExtraWidth(this.measures);
	}

	makeChartArea() {
		this.container.querySelectorAll(':scope > svg.frappe-chart').forEach(svg => svg.remove());
		let m = this.measures;

		this.svg = makeSVGContainer(
			this.container,
			'frappe-chart chart',
			this.baseWidth,
			this.baseHeight
		);
		this.svgDefs = makeSVGDefs(this.svg);

		if (this.title.length) {
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

		if (this.config.showLegend) {
			top += this.height + m.paddings.bottom;
			this.legendArea = makeSVGGroup(
				'chart-legend',
				`translate(${getLeftOffset(m)}, ${top})`
			);
		}

		if (this.title.length) { this.svg.appendChild(this.titleEL); }
		this.svg.appendChild(this.drawArea);
		if (this.config.showLegend) { this.svg.appendChild(this.legendArea); }

		this.updateTipOffset(getLeftOffset(m), getTopOffset(m));
	}

	updateTipOffset(x, y) {
		this.tip.offset = {
			x: x,
			y: y
		};
	}

	setupComponents() { this.components = new Map(); }

	update(data, drawing = false) {
		if (!data) console.error('No data to update.');
		if (!drawing) data = deepClone(data);
		const animate = drawing ? !this.config.disableEntryAnimation : this.config.animate;
		
		this.data = this.prepareData(data);
		this.extendColors(this.data);
		this.calc(); // builds state
		this.render(this.components, animate);
	}

	render(components = this.components, animate = true) {
		if (this.config.isNavigable) {
			// Remove all existing overlays
			this.overlays.map(o => o.parentNode.removeChild(o));
			// ref.parentNode.insertBefore(element, ref);
		}
		let elementsToAnimate = [];
		// Can decouple to this.refreshComponents() first to save animation timeout
		components.forEach(c => {
			elementsToAnimate = elementsToAnimate.concat(c.update(animate));
		});
		if (elementsToAnimate.length > 0) {
			runSMILAnimation(this.svg.parentNode, this.svg, elementsToAnimate);
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
		if (this.config.isNavigable) {
			this.makeOverlay();
			this.bindUnits();
		}
	}

	calcLegendRows(widths) {
		if (!this.config.showLegend) return;
		this.legendRows = getLegendRows(widths, this.width, LEGEND_ITEM_GAP);
		let extra = Math.max(this.legendRows.length - 1, 0) * this.config.legendRowHeight;
		this.measures.legendHeight = this.baseLegendHeight + extra;
		this.baseHeight = this.argHeight + extra;
	}

	renderLegend(dataset) {
		this.legendArea.textContent = '';
		(this.legendRows || []).forEach((row, i) => {
			row.forEach(({ index, x }) => {
				this.legendArea.appendChild(this.makeLegend(dataset[index], index, x, i * this.config.legendRowHeight));
			});
		});
	}

	makeLegend() { }


	setupNavigation(init = false) {
		if (!this.config.isNavigable) return;

		if (init) {
			this.bindOverlay();

			this.keyActions = {
				'13': this.onEnterKey.bind(this),
				'37': this.onLeftArrow.bind(this),
				'38': this.onUpArrow.bind(this),
				'39': this.onRightArrow.bind(this),
				'40': this.onDownArrow.bind(this),
			};

			document.addEventListener('keydown', (e) => {
				if (isElementInViewport(this.container)) {
					e = e || window.event;
					if (this.keyActions[e.keyCode]) {
						this.keyActions[e.keyCode]();
					}
				}
			});
		}
	}

	makeOverlay() { }
	updateOverlay() { }
	bindOverlay() { }
	bindUnits() { }

	onLeftArrow() { }
	onRightArrow() { }
	onUpArrow() { }
	onDownArrow() { }
	onEnterKey() { }

	addDataPoint() { }
	removeDataPoint() { }

	getDataPoint() { }
	setCurrentDataPoint() { }

	updateDataset() { }

	export() {
		let background = [this.container, this.parent]
			.map(el => getComputedStyle(el).backgroundColor)
			.find(color => color && color !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(color));
		let chartSvg = prepareForExport(this.svg, background);
		downloadFile(this.title || 'Chart', [chartSvg]);
	}
}
