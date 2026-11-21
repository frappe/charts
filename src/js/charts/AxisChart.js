import BaseChart from './BaseChart';
import { dataPrep, zeroDataPrep, getShortenedLabels } from '../utils/axis-chart-utils';
import { getComponent } from '../objects/ChartComponents';
import { getOffset, fire, getTextWidth } from '../utils/dom';
import { calcChartIntervals, getIntervalSize, getValueRange, getZeroIndex, scale, getClosestInArray } from '../utils/intervals';
import { floatTwo, getStringWidth, escapeHTML, deepClone, round } from '../utils/helpers';
import { makeOverlay, updateOverlay, legendDot, makeHoverBand, makeText, FONT_SIZE, AXIS_TICK_LENGTH } from '../utils/draw';
import {
	BASE_MEASURES, getExtraHeight, getTopOffset, getLeftOffset, MIN_BAR_PERCENT_HEIGHT, BAR_CHART_SPACE_RATIO,
	BAR_CHART_RADIUS, BAR_CHART_GAP, BAR_CHART_MAX_WIDTH, LINE_CHART_DOT_SIZE, LEGEND_DOT_SIZE, LEGEND_FONT_SIZE,
	LEGEND_CHAR_WIDTH, TOOLTIP_SIDE_GAP, DEFAULT_CHAR_WIDTH, ROTATED_LABEL_MAX_CHARS, AXIS_TITLE_HEIGHT
} from '../utils/constants';
import { shortenLargeNumber, truncateString } from '../utils/draw-utils';
import { getColor } from '../utils/colors';

export default class AxisChart extends BaseChart {
	constructor(parent, args) {
		super(parent, args);

		this.barOptions = args.barOptions || {};
		this.lineOptions = args.lineOptions || {};

		this.type = args.type || 'line';
		this.init = 1;

		this.setup();
	}

	setMeasures() {
		if (this.data.datasets.length <= 1) {
			this.config.showLegend = 0;
			this.measures.paddings.bottom = 30;
		}
	}

	update(data, drawing = false) {
		if (!drawing && data && this.changesDatasets(data)) {
			this.data = this.prepareData(deepClone(data));
			this.updateLegendMeasures();
			this.draw();
			return;
		}
		super.update(data, drawing);
	}

	changesDatasets(data) {
		let next = this.prepareData(deepClone(data)).datasets;
		let current = this.data.datasets;
		return next.length !== current.length || next.some((d, i) => d.chartType !== current[i].chartType);
	}

	updateLegendMeasures() {
		let m = this.measures;
		let showLegend = this.rawChartArgs.showLegend;
		this.config.showLegend = this.data.datasets.length > 1
			? (typeof showLegend !== 'undefined' ? showLegend : 1)
			: 0;
		m.paddings.bottom = (this.data.datasets.length > 1 ? BASE_MEASURES.paddings.bottom : 30) + this.labelSpace;
		m.legendHeight = this.config.showLegend ? BASE_MEASURES.legendHeight : 0;
		this.baseLegendHeight = m.legendHeight;
		this.height = this.argHeight - getExtraHeight(m);
	}

	configure(options) {
		super.configure(options);
		this.baseLeftPadding = this.measures.paddings.left;

		options.axisOptions = options.axisOptions || {};
		options.tooltipOptions = options.tooltipOptions || {};

		this.config.xAxisMode = options.axisOptions.xAxisMode || 'span';
		this.config.xOffset = options.axisOptions.xOffset;
		this.config.xAxisType = options.axisOptions.xAxisType;
		this.config.yAxisMode = options.axisOptions.yAxisMode || 'span';
		this.config.xIsSeries = options.axisOptions.xIsSeries || 0;
		this.config.shortenYAxisNumbers = options.axisOptions.shortenYAxisNumbers || 0;
		this.config.numberFormatter = options.axisOptions.numberFormatter;
		this.config.seriesLabelSpaceRatio = options.axisOptions.seriesLabelSpaceRatio

		this.config.yAxisRange = options.axisOptions.yAxisRange || {},

		this.config.formatTooltipX = options.tooltipOptions.formatTooltipX;
		this.config.formatTooltipY = options.tooltipOptions.formatTooltipY;
		this.config.tooltipPlacement = options.tooltipOptions.placement || 'side';

		this.config.valuesOverPoints = options.valuesOverPoints;
		this.config.legendRowHeight = 30;

		this.config.xAxisLabelRotation = Math.min(Math.max(Number(options.axisOptions.xAxisLabelRotation) || 0, 0), 90);
		this.config.hideXAxis = options.axisOptions.hideXAxis || 0;
		this.config.hideYAxis = options.axisOptions.hideYAxis || 0;
		this.config.xAxisTitle = options.axisOptions.xAxisTitle || '';
		this.config.yAxisTitle = options.axisOptions.yAxisTitle || '';
		this.rotatedLabelSpace = this.calcLabelSpace();
		this.labelSpace = this.rotatedLabelSpace + (this.config.xAxisTitle ? AXIS_TITLE_HEIGHT : 0);
		this.measures.paddings.bottom += this.labelSpace;
		this.height -= this.labelSpace;
	}

	calcLabelSpace() {
		let angle = this.config.xAxisLabelRotation * Math.PI / 180;
		if (!angle) return 0;
		let longest = Math.max(0, ...(this.realData.labels || []).map(l => (l + '').length));
		this.labelMaxChars = Math.min(longest, ROTATED_LABEL_MAX_CHARS);
		let width = getStringWidth('x'.repeat(this.labelMaxChars), DEFAULT_CHAR_WIDTH);
		return Math.max(0, Math.ceil(width * Math.sin(angle) + FONT_SIZE * Math.cos(angle) - FONT_SIZE));
	}

	getRotatedLabels() {
		let { labels, positions } = this.state.xAxis;
		let angle = this.config.xAxisLabelRotation * Math.PI / 180;
		let minGap = FONT_SIZE / Math.sin(angle) + 2;
		let charWidth = DEFAULT_CHAR_WIDTH * Math.cos(angle);
		let left = getLeftOffset(this.measures);
		let last = -Infinity;
		return labels.map((label, i) => {
			if (positions[i] - last < minGap) return '';
			last = positions[i];
			let room = charWidth > 0.01 ? Math.floor((positions[i] + left) / charWidth) : Infinity;
			return truncateString(label + '', Math.min(this.labelMaxChars, room)) || '';
		});
	}

	getLabelsBelow(datasetIndex) {
		let s = this.state;
		let lines = s.datasets.filter(d => d.chartType === 'line');
		if (!this.config.valuesOverPoints || lines.length < 2) return [];
		let height = FONT_SIZE + 2;
		return s.datasets[datasetIndex].values.map((v, j) => {
			let taken = [];
			let below = false;
			lines
				.filter(d => d.values[j] !== null && d.values[j] !== undefined)
				.sort((a, b) => a.yPositions[j] - b.yPositions[j] || a.index - b.index)
				.forEach(d => {
					let o = Object.assign({}, this.lineOptions, d.lineOptions);
					let r = o.showDots ? (o.dotSize || LINE_CHART_DOT_SIZE) : 0;
					let y = d.yPositions[j];
					let above = [y - r - height, y - r];
					let under = [y + r, y + r + height];
					let free = box => taken.every(t => box[1] <= t[0] || box[0] >= t[1]);
					let goBelow = !free(above) && free(under);
					taken.push(goBelow ? under : above);
					if (d.index === datasetIndex) below = goBelow;
				});
			return below;
		});
	}

	prepareData(data = this.data) {
		return dataPrep(data, this.type);
	}

	prepareFirstData(data = this.data) {
		return zeroDataPrep(data);
	}

	calc(onlyWidthChange = false) {
		this.calcLegend();
		this.calcXPositions();
		this.calcXMarkers();
		if (!onlyWidthChange) {
			let hasBars = this.data.datasets.some(d => d.chartType === 'bar');
			let hasArea = this.data.datasets.some(d => Object.assign({}, this.lineOptions, d.lineOptions).regionFill);
			this.calcYAxisParameters(this.getAllYValues(), this.type === 'line' && !hasBars && !hasArea);
			if (this.fitYAxisLabels()) {
				this.calcLegend();
				this.calcXPositions();
				this.calcXMarkers();
			}
		}
		this.makeDataByIndex();
	}

	fitYAxisLabels() {
		if (this.config.hideYAxis) return false;
		let m = this.measures;
		let { numberFormatter, shortenYAxisNumbers } = this.config;
		let font = `${FONT_SIZE}px ${getComputedStyle(this.container).fontFamily}`;
		let widest = Math.max(0, ...this.state.yAxis.labels.map(value => {
			let label = typeof value === 'number' ? round(value) : value;
			if (numberFormatter) label = numberFormatter(label);
			else if (shortenYAxisNumbers) label = shortenLargeNumber(label);
			return getTextWidth(String(label), font);
		}));
		let left = Math.max(this.baseLeftPadding, Math.ceil(widest + AXIS_TICK_LENGTH + 8 - m.margins.left))
			+ (this.config.yAxisTitle ? AXIS_TITLE_HEIGHT : 0);
		if (left === m.paddings.left) return false;

		m.paddings.left = left;
		this.updateWidth();
		if (this.drawArea) {
			this.drawArea.setAttribute('transform', `translate(${getLeftOffset(m)}, ${getTopOffset(m)})`);
			if (this.legendArea) {
				let [, y] = this.legendArea.getAttribute('transform').match(/,\s*([^)]+)\)/) || [];
				this.legendArea.setAttribute('transform', `translate(${getLeftOffset(m)}, ${y})`);
			}
			this.updateTipOffset(getLeftOffset(m), getTopOffset(m));
			this.placeAxisTitles();
		}
		return true;
	}

	makeChartArea() {
		super.makeChartArea();
		this.axisTitles = {};
		['xAxisTitle', 'yAxisTitle'].filter(key => this.config[key]).forEach(key => {
			this.axisTitles[key] = makeText('axis-title', 0, 0, this.config[key], {
				dy: FONT_SIZE * 0.35,
				textAnchor: 'middle'
			});
			this.svg.appendChild(this.axisTitles[key]);
		});
		this.placeAxisTitles();
	}

	placeAxisTitles() {
		let m = this.measures;
		let { xAxisTitle, yAxisTitle } = this.axisTitles || {};
		if (xAxisTitle) {
			let y = getTopOffset(m) + this.height + AXIS_TICK_LENGTH + 2 * FONT_SIZE + 12 + this.rotatedLabelSpace;
			xAxisTitle.setAttribute('transform', `translate(${getLeftOffset(m) + this.width / 2}, ${y})`);
		}
		if (yAxisTitle) {
			let x = m.margins.left / 2 + FONT_SIZE / 2;
			yAxisTitle.setAttribute('transform', `translate(${x}, ${getTopOffset(m) + this.height / 2}) rotate(-90)`);
		}
	}

	calcXPositions() {
		let s = this.state;
		let labels = this.data.labels;
		s.datasetLength = labels.length;

		let hasBars = this.data.datasets.some(d => d.chartType === 'bar');
		let edgeToEdge = this.config.xOffset === 0 && !hasBars && s.datasetLength > 1;
		s.unitWidth = this.width / (edgeToEdge ? s.datasetLength - 1 : s.datasetLength);
		s.xOffset = edgeToEdge ? 0 : s.unitWidth / 2;

		let times = !hasBars && this.config.xAxisType === 'time' ? this.getLabelTimes() : null;
		let span = this.width - 2 * s.xOffset;

		s.xAxis = {
			labels: labels,
			isTime: !!times,
			positions: labels.map((d, i) =>
				floatTwo(s.xOffset + (times
					? (times[i] - times[0]) / (times[times.length - 1] - times[0]) * span
					: i * s.unitWidth))
			)
		};
	}

	getSpacedLabels() {
		let { labels, positions } = this.state.xAxis;
		let lastEnd = -Infinity;
		return labels.map((label, i) => {
			let half = getStringWidth(label, DEFAULT_CHAR_WIDTH) / 2;
			if (positions[i] - half < lastEnd) return '';
			lastEnd = positions[i] + half + DEFAULT_CHAR_WIDTH;
			return label + '';
		});
	}

	getLabelTimes() {
		let times = this.data.labels.map(d => new Date(d).getTime());
		let valid = times.length > 1 && times.every((t, i) => !isNaN(t) && (i === 0 || t >= times[i - 1]));
		return valid && times[times.length - 1] > times[0] ? times : null;
	}

	// always a list, even when empty, so the marker layer exists for markers added by a later update
	calcXMarkers() {
		let s = this.state;
		s.xMarkers = (this.data.xMarkers || [])
			.map(d => Object.assign({}, d, {
				position: s.xAxis.positions[this.data.labels.indexOf(d.value)],
				options: d.options || {}
			}))
			.filter(d => d.position !== undefined);
	}

	calcYAxisParameters(dataValues, withMinimum = 'false') {
		const yPts = calcChartIntervals(dataValues, withMinimum, this.config.yAxisRange);
		const scaleMultiplier = this.height / getValueRange(yPts);
		const intervalHeight = getIntervalSize(yPts) * scaleMultiplier;
		const zeroLine = this.height - (getZeroIndex(yPts) * intervalHeight);

		this.state.yAxis = {
			labels: yPts,
			positions: yPts.map(d => zeroLine - d * scaleMultiplier),
			scaleMultiplier: scaleMultiplier,
			zeroLine: zeroLine,
		};

		// Dependent if above changes
		this.calcDatasetPoints();
		this.calcYExtremes();
		this.calcYRegions();
	}

	calcDatasetPoints() {
		let s = this.state;
		let scaleAll = values => values.map(val => scale(val, s.yAxis));

		s.datasets = this.data.datasets.map((d, i) => {
			let values = d.values;
			let cumulativeYs = d.cumulativeYs || [];
			return {
				name: d.name,
				index: i,
				chartType: d.chartType,

				values: values,
				yPositions: scaleAll(values),
				lineOptions: d.lineOptions || {},

				cumulativeYs: cumulativeYs,
				cumulativeYPos: scaleAll(cumulativeYs),
			};
		});
	}

	calcYExtremes() {
		let s = this.state;
		if (this.barOptions.stacked) {
			s.yExtremes = s.datasets[s.datasets.length - 1].cumulativeYPos;
			return;
		}
		s.yExtremes = new Array(s.datasetLength).fill(9999);
		s.datasets.map(d => {
			d.yPositions.map((pos, j) => {
				if (pos < s.yExtremes[j]) {
					s.yExtremes[j] = pos;
				}
			});
		});
	}

	calcYRegions() {
		let s = this.state;
		if (this.data.yMarkers) {
			this.state.yMarkers = this.data.yMarkers.map(d => {
				d.position = scale(d.value, s.yAxis);
				if (!d.options) d.options = {};
				// if(!d.label.includes(':')) {
				// 	d.label += ': ' + d.value;
				// }
				return d;
			});
		}
		if (this.data.yRegions) {
			this.state.yRegions = this.data.yRegions.map(d => {
				d.startPos = scale(d.start, s.yAxis);
				d.endPos = scale(d.end, s.yAxis);
				if (!d.options) d.options = {};
				return d;
			});
		}
	}

	getAllYValues() {
		let key = 'values';

		if (this.barOptions.stacked) {
			key = 'cumulativeYs';
			let positive = new Array(this.state.datasetLength).fill(0);
			let negative = new Array(this.state.datasetLength).fill(0);
			this.data.datasets.map(d => {
				d[key] = d.values.map((value, i) => value < 0
					? (negative[i] += value)
					: (positive[i] += value));
			});
		}

		let allValueLists = this.data.datasets.map(d => d[key]);
		if (this.data.yMarkers) {
			allValueLists.push(this.data.yMarkers.map(d => d.value));
		}
		if (this.data.yRegions) {
			this.data.yRegions.map(d => {
				allValueLists.push([d.end, d.start]);
			});
		}

		return [].concat(...allValueLists);
	}

	formatValueLabel(value) {
		return this.config.numberFormatter
			? this.config.numberFormatter(value)
			: shortenLargeNumber(value);
	}

	setupComponents() {
		let componentConfigs = [
			[
				'yAxis',
				{
					mode: this.config.yAxisMode,
					width: this.width,
					shortenNumbers: this.config.shortenYAxisNumbers,
					numberFormatter: this.config.numberFormatter,
				},
				function () {
					return this.state.yAxis;
				}.bind(this)
			],

			[
				'xAxis',
				{
					mode: this.config.xAxisMode,
					height: this.height,
					rotation: this.config.xAxisLabelRotation,
					// pos: 'right'
				},
				function () {
					let s = this.state;
					s.xAxis.calcLabels = this.config.xAxisLabelRotation
						? this.getRotatedLabels()
						: s.xAxis.isTime
						? this.getSpacedLabels()
						: getShortenedLabels(this.width,
							s.xAxis.labels, this.config.xIsSeries,this.config.seriesLabelSpaceRatio);

					return s.xAxis;
				}.bind(this)
			],

			[
				'yRegions',
				{
					width: this.width,
					pos: 'right'
				},
				function () {
					return this.state.yRegions;
				}.bind(this)
			],

			[
				'xRegions',
				{
					height: this.height
				},
				function () {
					let s = this.state;
					let labels = this.data.labels;
					return (this.data.xRegions || []).map(r => {
						let start = labels.indexOf(r.start);
						let end = labels.indexOf(r.end);
						if (start === -1 || end === -1) return null;
						if (start > end) [start, end] = [end, start];
						return {
							label: r.label,
							startPos: s.xAxis.positions[start] - s.unitWidth / 2,
							endPos: s.xAxis.positions[end] + s.unitWidth / 2,
							options: r.options || {}
						};
					}).filter(Boolean);
				}.bind(this)
			],
		];

		let barDatasets = this.state.datasets.filter(d => d.chartType === 'bar');
		let lineDatasets = this.state.datasets.filter(d => d.chartType === 'line');

		let barsConfigs = barDatasets.map(d => {
			let index = d.index;
			return [
				'barGraph' + '-' + d.index,
				{
					index: index,
					color: this.colors[index],
					stacked: this.barOptions.stacked,
					radius: this.barOptions.stacked ? 0 : (this.barOptions.radius ?? BAR_CHART_RADIUS),

					// same for all datasets
					valuesOverPoints: this.config.valuesOverPoints,
					minHeight: this.height * MIN_BAR_PERCENT_HEIGHT,
				},
				function () {
					let s = this.state;
					let d = s.datasets[index];
					let stacked = this.barOptions.stacked;

					let spaceRatio = this.barOptions.spaceRatio ?? BAR_CHART_SPACE_RATIO;
					let barsWidth = s.unitWidth * (1 - spaceRatio);
					let barCount = stacked ? 1 : barDatasets.length;
					let barWidth = barsWidth / barCount;
					let gap = barCount < 2 ? 0 : Math.min(this.barOptions.gap ?? BAR_CHART_GAP, barWidth / 2);
					let maxWidth = this.barOptions.maxWidth ?? BAR_CHART_MAX_WIDTH;
					if (maxWidth && barWidth - gap > maxWidth) {
						barWidth = maxWidth + gap;
						barsWidth = barWidth * barCount;
					}

					let xPositions = s.xAxis.positions.map(x => x - barsWidth / 2);
					if (!stacked) {
						xPositions = xPositions.map(p => p + barWidth * index + gap / 2);
					}

					let labels = new Array(s.datasetLength).fill('');
					if (this.config.valuesOverPoints) {
						if (!stacked) {
							labels = d.values.map(v => this.formatValueLabel(v));
						} else if (d.index === s.datasets.length - 1) {
							labels = d.cumulativeYs.map(v => this.formatValueLabel(v));
						}
					}

					let offsets = new Array(s.datasetLength).fill(0);
					if (stacked) {
						offsets = d.yPositions.map((y, j) => y - d.cumulativeYPos[j]);
					}

					return {
						xPositions: xPositions,
						yPositions: d.yPositions,
						offsets: offsets,
						// values: d.values,
						labels: labels,
						colors: (this.data.datasets[d.index].colors || []).map(color => color && getColor(color)),

						zeroLine: s.yAxis.zeroLine,
						barsWidth: barsWidth,
						barWidth: barWidth - gap,
					};
				}.bind(this)
			];
		});

		let lineConfigs = lineDatasets.map(d => {
			let index = d.index;
			return [
				'lineGraph' + '-' + d.index,
				{
					index: index,
					color: this.colors[index],
					svgDefs: this.svgDefs,

					// same for all datasets
					valuesOverPoints: this.config.valuesOverPoints,
					numberFormatter: this.config.numberFormatter,
				},
				function () {
					let s = this.state;
					let d = s.datasets[index];
					let minLine = s.yAxis.positions[0] < s.yAxis.zeroLine
						? s.yAxis.positions[0] : s.yAxis.zeroLine;
					// read on every render, so a dataset's own options follow updated data
					let lineOptions = Object.assign({}, this.lineOptions, d.lineOptions);

					return {
						xPositions: s.xAxis.positions,
						yPositions: d.yPositions,

						values: d.values,
						lineOptions: lineOptions,

						zeroLine: minLine,
						radius: lineOptions.dotSize || LINE_CHART_DOT_SIZE,
						labelsBelow: this.getLabelsBelow(index),
					};
				}.bind(this)
			];
		});

		let markerConfigs = [
			[
				'xMarkers',
				{
					height: this.height
				},
				function () {
					return this.state.xMarkers;
				}.bind(this)
			],
			[
				'yMarkers',
				{
					width: this.width,
					pos: 'right'
				},
				function () {
					return this.state.yMarkers;
				}.bind(this)
			]
		];

		componentConfigs = componentConfigs.concat(barsConfigs, lineConfigs, markerConfigs);

		let optionals = ['xMarkers', 'yMarkers', 'yRegions'];
		let hidden = [this.config.hideXAxis && 'xAxis', this.config.hideYAxis && 'yAxis'];
		this.dataUnitComponents = [];

		this.components = new Map(componentConfigs
			.filter(args => (!optionals.includes(args[0]) || this.state[args[0]]) && !hidden.includes(args[0]))
			.map(args => {
				let component = getComponent(...args);
				if (args[0].includes('lineGraph') || args[0].includes('barGraph')) {
					this.dataUnitComponents.push(component);
				}
				return [args[0], component];
			}));
	}

	makeDataByIndex() {
		this.dataByIndex = {};

		let s = this.state;
		let formatX = this.config.formatTooltipX;
		let formatY = this.config.formatTooltipY;
		let titles = s.xAxis.labels;

		titles.map((label, index) => {
			let values = this.state.datasets.map((set, i) => {
				let value = set.values[index];
				return {
					title: escapeHTML(set.name),
					value: value,
					yPos: set.yPositions[index],
					color: this.colors[i],
					formatted: escapeHTML(formatY ? formatY(value, {
						name: set.name,
						index: set.index,
						values: set.values
					}) : value),
				};
			});

			this.dataByIndex[index] = {
				label: label,
				formattedLabel: escapeHTML(formatX ? formatX(label, index) : label),
				xPos: s.xAxis.positions[index],
				values: values,
				yExtreme: s.yExtremes[index],
			};
		});
	}

	makeTooltip() {
		super.makeTooltip();
		this.tip.placement = this.config.tooltipPlacement;
	}

	bindTooltip() {
		// NOTE: could be in tooltip itself, as it is a given functionality for its parent
		this.container.addEventListener('mousemove', (e) => {
			let m = this.measures;
			let o = getOffset(this.container);
			let relX = e.pageX - o.left - getLeftOffset(m);
			let relY = e.pageY - o.top;

			if (!this.config.valuesOverPoints && relY < this.height + getTopOffset(m)
				&& relY > getTopOffset(m)) {
				this.mapTooltipXPosition(relX, 0, relY);
			} else if (this.config.valuesOverPoints && e.target.getAttribute("class") == "data-point-value"){
				this.mapTooltipXPosition(relX, -20, relY);
			}else {
				this.hideTooltip();
			}
		});
		this.container.addEventListener('mouseleave', () => this.hideTooltip());
	}

	hideTooltip() {
		this.tip.hideTip();
		if (this.hoverBand) this.hoverBand.style.display = 'none';
	}

	mapTooltipXPosition(relX, y = 0, pointerY = null) {
		let s = this.state;
		if (!s.yExtremes) return;

		let index = getClosestInArray(relX, s.xAxis.positions, true);
		if (index >= 0) {
			let dbi = this.dataByIndex[index];
			let side = this.tip.placement === 'side';
			this.showHoverBand(dbi.xPos);
			this.tip.sideOffset = side ? this.hoverBandWidth() / 2 + TOOLTIP_SIDE_GAP : 0;

			this.tip.setValues(
				dbi.xPos + this.tip.offset.x,
				side && pointerY !== null ? pointerY : dbi.yExtreme + this.tip.offset.y + y,
				{ name: dbi.formattedLabel, value: '' },
				dbi.values,
				index
			);

			this.tip.showTip();
		}
	}

	hoverBandWidth() {
		let hasBars = this.state.datasets.some(d => d.chartType === 'bar');
		return hasBars ? this.state.unitWidth : 1;
	}

	showHoverBand(xPos) {
		if (!this.hoverBand || !this.drawArea.contains(this.hoverBand)) {
			this.hoverBand = makeHoverBand(this.height);
			this.drawArea.insertBefore(this.hoverBand, this.drawArea.firstChild);
		}
		let width = this.hoverBandWidth();
		this.hoverBand.setAttribute('x', xPos - width / 2);
		this.hoverBand.setAttribute('width', width);
		this.hoverBand.setAttribute('height', this.height);
		this.hoverBand.style.display = '';
	}

	calcLegend() {
		let datasets = this.data.datasets;
		if (datasets.length <= 1) return;
		this.calcLegendRows(datasets.map(data => LEGEND_DOT_SIZE * 2 + getStringWidth(data.name || '', LEGEND_CHAR_WIDTH)));
	}

	renderLegend() {
		let datasets = this.data.datasets;
		if (datasets.length <= 1) return;
		super.renderLegend(datasets);
	}

	makeLegend(data, index, x_pos, y_pos) {
		return legendDot(
			x_pos,
			y_pos + 5,
			LEGEND_DOT_SIZE,
			LEGEND_DOT_SIZE / 2,
			this.colors[index],
			data.name,
			null,
			LEGEND_FONT_SIZE,
			this.config.truncateLegends
		);
	}

	// Overlay
	makeOverlay() {
		if (this.init) {
			this.init = 0;
			return;
		}
		this.updateOverlayGuides();

		this.overlayGuides = this.dataUnitComponents.map(c => {
			return {
				type: c.unitType,
				overlay: undefined,
				units: c.units,
			};
		});

		if (this.state.currentIndex === undefined || this.state.currentIndex >= this.state.datasetLength) {
			this.state.currentIndex = this.state.datasetLength - 1;
		}

		// Render overlays
		this.overlayGuides.map(d => {
			let currentUnit = d.units[this.state.currentIndex];
			if (!currentUnit) return;

			d.overlay = makeOverlay[d.type](currentUnit);
			d.overlay.style.pointerEvents = 'none';
			this.drawArea.appendChild(d.overlay);
		});
	}

	updateOverlayGuides() {
		if (this.overlayGuides) {
			this.overlayGuides.forEach(g => {
				let o = g.overlay;
				if (o && o.parentNode) o.parentNode.removeChild(o);
			});
		}
	}

	bindOverlay() {
		this.parent.addEventListener('data-select', () => {
			this.updateOverlay();
		});
	}

	bindUnits() {
		this.dataUnitComponents.map(c => {
			c.units.map(unit => {
				unit.addEventListener('click', () => {
					let index = unit.getAttribute('data-point-index');
					this.setCurrentDataPoint(index, true);
				});
			});
		});

		// Note: Doesn't work as tooltip is absolutely positioned
		this.tip.container.onclick = () => {
			let index = this.tip.container.getAttribute('data-point-index');
			this.setCurrentDataPoint(index, true);
		};
	}

	updateOverlay() {
		(this.overlayGuides || []).map(d => {
			let currentUnit = d.units[this.state.currentIndex];
			if (!currentUnit || !d.overlay) return;
			updateOverlay[d.type](currentUnit, d.overlay);
		});
	}

	onLeftArrow() {
		this.setCurrentDataPoint(this.state.currentIndex - 1);
	}

	onRightArrow() {
		this.setCurrentDataPoint(this.state.currentIndex + 1);
	}

	getDataPoint(index = this.state.currentIndex) {
		let s = this.state;
		let data_point = {
			index: index,
			label: s.xAxis.labels[index],
			values: s.datasets.map(d => d.values[index])
		};
		return data_point;
	}

	setCurrentDataPoint(index, fireOnSame = false) {
		let s = this.state;
		index = parseInt(index);
		if (index < 0) index = 0;
		if (index >= s.xAxis.labels.length) index = s.xAxis.labels.length - 1;
		if (index === s.currentIndex && !fireOnSame) return;
		s.currentIndex = index;
		fire(this.parent, "data-select", this.getDataPoint());
	}



	// API
	addDataPoint(label, datasetValues, index = this.state.datasetLength) {
		super.addDataPoint(label, datasetValues, index);
		this.data.labels.splice(index, 0, label);
		this.data.datasets.map((d, i) => {
			d.values.splice(index, 0, datasetValues[i]);
		});
		this.update(this.data);
	}

	removeDataPoint(index = this.state.datasetLength - 1) {
		if (this.data.labels.length <= 1) {
			return;
		}
		super.removeDataPoint(index);
		this.data.labels.splice(index, 1);
		this.data.datasets.map(d => {
			d.values.splice(index, 1);
		});
		this.update(this.data);
	}

	updateDataset(datasetValues, index = 0) {
		this.data.datasets[index].values = datasetValues;
		this.update(this.data);
	}
	// addDataset(dataset, index) {}
	// removeDataset(index = 0) {}

	updateDatasets(datasets) {
		this.data.datasets.map((d, i) => {
			if (datasets[i]) {
				d.values = datasets[i];
			}
		});
		this.update(this.data);
	}

	// updateDataPoint(dataPoint, index = 0) {}
	// addDataPoint(dataPoint, index = 0) {}
	// removeDataPoint(index = 0) {}
}
