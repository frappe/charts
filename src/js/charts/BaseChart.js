import SvgTip from "../objects/SvgTip";
import {
	$,
	isElementInViewport,
	getElementContentWidth,
	isHidden,
} from "../utils/dom";
import {
	makeSVGContainer,
	makeSVGDefs,
	makeSVGGroup,
	makeText,
} from "../utils/draw";
import { LEGEND_ITEM_WIDTH } from "../utils/constants";
import {
	BASE_MEASURES,
	getExtraHeight,
	getExtraWidth,
	getTopOffset,
	getLeftOffset,
	INIT_CHART_UPDATE_TIMEOUT,
	CHART_POST_ANIMATE_TIMEOUT,
	DEFAULT_COLORS,
} from "../utils/constants";
import { getColor, isValidColor } from "../utils/colors";
import { runSMILAnimation } from "../utils/animation";
import { downloadFile, prepareForExport } from "../utils/export";
import { deepClone } from "../utils/helpers";

export default class BaseChart {
	constructor(parent, options) {
		// deepclone options to avoid making changes to orignal object
		options = deepClone(options);

		this.parent =
			typeof parent === "string"
				? document.querySelector(parent)
				: parent;

		if (!(this.parent instanceof HTMLElement)) {
			throw new Error("No `parent` element to render on was provided.");
		}

		this.rawChartArgs = options;

		this.title = options.title || "";
		this.type = options.type || "";

		this.colors = this.validateColors(options.colors, this.type);

		let legendPosition =
			options.legendPosition ||
			(options.legendOptions && options.legendOptions.position);
		if (!legendPosition) {
			legendPosition =
				this.type === "pie" || this.type === "donut" ? "right" : "bottom";
		}

		this.config = {
			showTooltip: 1, // calculate
			showLegend:
				typeof options.showLegend !== "undefined"
					? options.showLegend
					: 1,
			legendPosition: legendPosition,
			isNavigable: options.isNavigable || 0,
			animate: 0,
			overrideCeiling: options.overrideCeiling || false,
			overrideFloor: options.overrideFloor || false,
			truncateLegends:
				typeof options.truncateLegends !== "undefined"
					? options.truncateLegends
					: 1,
			continuous:
				typeof options.continuous !== "undefined"
					? options.continuous
					: 1,
		};

		this.measures = JSON.parse(JSON.stringify(BASE_MEASURES));
		let m = this.measures;

		this.realData = this.prepareData(options.data, this.config);
		this.data = this.prepareFirstData(this.realData);

		this.setMeasures(options);
		if (!this.title.length) {
			m.titleHeight = 0;
		}
		if (!this.config.showLegend || this.config.legendPosition === "right") {
			m.legendHeight = 0;
			if (this.config.legendPosition === "right" && this.type !== "line" && this.type !== "bar" && this.type !== "axis-mixed") {
				m.paddings.bottom = 15;
			}
		}
		this.argHeight = options.height || m.baseHeight;

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
		// Look into improving responsiveness
		//if (ResizeObserver) {
		//	this.resizeObserver = new ResizeObserver(this.boundDrawFn);
		//	this.resizeObserver.observe(this.parent);
		//}
		window.addEventListener("resize", this.boundDrawFn);
		window.addEventListener("orientationchange", this.boundDrawFn);
	}

	destroy() {
		//if (this.resizeObserver) this.resizeObserver.disconnect();
		window.removeEventListener("resize", this.boundDrawFn);
		window.removeEventListener("orientationchange", this.boundDrawFn);
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
		this.parent.innerHTML = "";

		let args = {
			inside: this.parent,
			className: "chart-container",
		};

		if (this.independentWidth) {
			args.styles = { width: this.independentWidth + "px" };
		}

		this.container = $.create("div", args);
	}

	makeTooltip() {
		this.tip = new SvgTip({
			parent: this.container,
			colors: this.colors,
		});
		this.bindTooltip();
	}

	bindTooltip() {}

	draw(onlyWidthChange = false, init = false) {
		if (onlyWidthChange && isHidden(this.parent)) {
			// Don't update anything if the chart is hidden
			return;
		}
		this.updateWidth();

		this.calc(onlyWidthChange);
		this.makeChartArea();
		this.setupComponents();

		this.components.forEach((c) => c.setup(this.drawArea));
		// this.components.forEach(c => c.make());
		this.render(this.components, false);

		if (init) {
			this.data = this.realData;
			this.update(this.data, true);
			// Not needed anymore since animate defaults to 0 and might potentially be refactored or deprecated
			/* setTimeout(() => {
				this.update(this.data, true);
			}, this.initTimeout); */
		}

		if (this.config.showLegend) {
			this.renderLegend();
		}

		this.setupNavigation(init);
	}

	calc() {} // builds state

	updateWidth() {
		this.baseWidth = getElementContentWidth(this.parent);
		if (this.config.showLegend && this.config.legendPosition === "right") {
			let availWidth = this.baseWidth - getExtraWidth(this.measures);
			let targetLegendWidth = Math.max(120, Math.min(Math.floor(availWidth * 0.42), 240));
			if (availWidth - targetLegendWidth < 120) {
				targetLegendWidth = Math.floor(availWidth * 0.45);
			}
			this.legendWidth = Math.max(80, targetLegendWidth);
			this.width = Math.max(60, availWidth - this.legendWidth);
		} else {
			this.legendWidth = 0;
			this.width = this.baseWidth - getExtraWidth(this.measures);
		}
	}

	makeChartArea() {
		if (this.svg) {
			this.container.removeChild(this.svg);
		}
		let m = this.measures;

		this.svg = makeSVGContainer(
			this.container,
			"frappe-chart chart",
			this.baseWidth,
			this.baseHeight
		);
		this.svgDefs = makeSVGDefs(this.svg);

		if (this.title.length) {
			this.titleEL = makeText(
				"title",
				m.margins.left,
				m.margins.top,
				this.title,
				{
					fontSize: m.titleFontSize,
					fill: "#666666",
					dy: m.titleFontSize,
				}
			);
		}

		let top = getTopOffset(m);
		this.drawArea = makeSVGGroup(
			this.type + "-chart chart-draw-area",
			`translate(${getLeftOffset(m)}, ${top})`
		);

		if (this.config.showLegend) {
			if (this.config.legendPosition === "right") {
				let legendX = getLeftOffset(m) + this.width + 15;
				this.legendArea = makeSVGGroup(
					"chart-legend",
					`translate(${legendX}, ${top})`
				);
			} else {
				let legendTop = top + this.height + m.paddings.bottom;
				this.legendArea = makeSVGGroup(
					"chart-legend",
					`translate(${getLeftOffset(m)}, ${legendTop})`
				);
			}
		}

		if (this.title.length) {
			this.svg.appendChild(this.titleEL);
		}
		this.svg.appendChild(this.drawArea);
		if (this.config.showLegend) {
			this.svg.appendChild(this.legendArea);
		}

		this.updateTipOffset(getLeftOffset(m), getTopOffset(m));
	}

	updateTipOffset(x, y) {
		this.tip.offset = {
			x: x,
			y: y,
		};
	}

	setupComponents() {
		this.components = new Map();
	}

	update(data, drawing = false, config) {
		if (!data) console.error("No data to update.");
		if (!drawing) data = deepClone(data);
		this.data = this.prepareData(data, config);
		this.calc(); // builds state
		this.render(this.components, this.config.animate);
		if (this.config.showLegend) {
			this.renderLegend();
		}
	}

	render(components = this.components, animate = true) {
		if (this.config.isNavigable) {
			// Remove all existing overlays
			this.overlays.map((o) => o.parentNode.removeChild(o));
			// ref.parentNode.insertBefore(element, ref);
		}
		let elementsToAnimate = [];
		// Can decouple to this.refreshComponents() first to save animation timeout
		components.forEach((c) => {
			elementsToAnimate = elementsToAnimate.concat(c.update(animate));
		});
		if (elementsToAnimate.length > 0) {
			runSMILAnimation(this.container, this.svg, elementsToAnimate);
			setTimeout(() => {
				components.forEach((c) => c.make());
				this.updateNav();
			}, CHART_POST_ANIMATE_TIMEOUT);
		} else {
			components.forEach((c) => c.make());
			this.updateNav();
		}
	}

	updateNav() {
		if (this.config.isNavigable) {
			this.makeOverlay();
			this.bindUnits();
		}
	}

	renderLegend(dataset = []) {
		this.legendArea.textContent = "";
		if (!dataset || !dataset.length) return;

		if (this.config.legendPosition === "right") {
			this.renderRightLegend(dataset);
		} else {
			this.renderBottomLegend(dataset);
		}
	}

	renderRightLegend(dataset) {
		this.legendArea.textContent = "";
		let n = dataset.length;
		if (!n) return;

		let availHeight = this.height;
		let availWidth = Math.max(80, (this.legendWidth || 140) - 15);

		let numCols = 1;
		if (availWidth >= 160 && n > 6) {
			numCols = 2;
		}

		let itemsPerCol = Math.ceil(n / numCols);
		let colWidth = Math.floor(availWidth / numCols);

		let idealRowHeight = Math.floor(availHeight / itemsPerCol);
		let rowHeight = Math.max(13, Math.min(32, idealRowHeight));

		let isCompact = rowHeight < 24;
		let isInline = rowHeight < 20 || numCols > 1;

		let totalHeight = itemsPerCol * rowHeight;
		let startY = Math.max(0, Math.floor((availHeight - totalHeight) / 2));

		dataset.forEach((data, index) => {
			let col = Math.floor(index / itemsPerCol);
			let row = index % itemsPerCol;
			let x = col * colWidth;
			let y = startY + row * rowHeight;

			let dot = this.makeLegend(data, index, x, y, {
				itemWidth: colWidth,
				inline: isInline,
				fontSize: isCompact ? 6.5 : 7.5,
				labelFontSize: isCompact ? "10px" : "11px",
				valueFontSize: isCompact ? "9px" : "10px",
				valueY: isCompact ? 10 : 13,
				dotSize: isCompact ? 8 : 10,
				textOffset: isCompact ? 6 : 8,
				maxChars: Math.max(8, Math.floor((colWidth - 22) / 6.5)),
			});
			this.legendArea.appendChild(dot);
		});
	}

	renderBottomLegend(dataset) {
		this.legendArea.textContent = "";
		if (!dataset || !dataset.length) return;

		let dotSize = 8;
		let charWidth = 6.5;
		let itemGap = 24;
		let rowHeight = this.config.legendRowHeight || 28;

		let items = dataset.map((data, index) => {
			let label =
				data.name ||
				(this.state && this.state.labels ? this.state.labels[index] : "") ||
				"";
			let textWidth = label.length * charWidth;
			let itemWidth = dotSize + 8 + textWidth;
			return { data, index, itemWidth, label };
		});

		let rows = [[]];
		let curRowWidth = 0;

		items.forEach((item) => {
			let widthWithGap = item.itemWidth + (curRowWidth ? itemGap : 0);
			if (curRowWidth && curRowWidth + widthWithGap > this.width) {
				rows.push([]);
				curRowWidth = 0;
			}
			rows[rows.length - 1].push(item);
			curRowWidth += item.itemWidth + itemGap;
		});

		rows.forEach((row, rowIndex) => {
			let x = 0;
			let y = rowIndex * rowHeight;

			row.forEach((item) => {
				let dot = this.makeLegend(item.data, item.index, x, y, {
					itemWidth: item.itemWidth,
					fontSize: 6.5,
					labelFontSize: "10px",
					valueFontSize: "9px",
					valueY: 12,
					dotSize: dotSize,
					textOffset: 6,
					maxChars: 30,
				});
				this.legendArea.appendChild(dot);
				x += item.itemWidth + itemGap;
			});
		});
	}

	makeLegend() {}

	setupNavigation(init = false) {
		if (!this.config.isNavigable) return;

		if (init) {
			this.bindOverlay();

			this.keyActions = {
				13: this.onEnterKey.bind(this),
				37: this.onLeftArrow.bind(this),
				38: this.onUpArrow.bind(this),
				39: this.onRightArrow.bind(this),
				40: this.onDownArrow.bind(this),
			};

			document.addEventListener("keydown", (e) => {
				if (isElementInViewport(this.container)) {
					e = e || window.event;
					if (this.keyActions[e.keyCode]) {
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
		downloadFile(this.title || "Chart", [chartSvg]);
	}
}
