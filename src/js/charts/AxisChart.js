import BaseChart from './BaseChart';
import { dataPrep, zeroDataPrep, getShortenedLabels } from '../utils/axis-chart-utils';
import { getComponent } from '../objects/ChartComponents';
import { getOffset, fire } from '../utils/dom';
import { calcChartIntervals, getIntervalSize, getValueRange, getZeroIndex, scale, getClosestInArray } from '../utils/intervals';
import { floatTwo, getStringWidth } from '../utils/helpers';
import { makeOverlay, updateOverlay, legendDot, makeHoverBand } from '../utils/draw';
import {
	getTopOffset, getLeftOffset, MIN_BAR_PERCENT_HEIGHT, BAR_CHART_SPACE_RATIO,
	BAR_CHART_RADIUS, BAR_CHART_GAP, BAR_CHART_MAX_WIDTH, LINE_CHART_DOT_SIZE, LEGEND_DOT_SIZE, LEGEND_FONT_SIZE,
	LEGEND_CHAR_WIDTH, LEGEND_ITEM_GAP, TOOLTIP_SIDE_GAP
} from '../utils/constants';
import { shortenLargeNumber } from '../utils/draw-utils';

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

	configure(options) {
		super.configure(options);

		options.axisOptions = options.axisOptions || {};
		options.tooltipOptions = options.tooltipOptions || {};

		this.config.xAxisMode = options.axisOptions.xAxisMode || 'span';
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
	}

	prepareData(data = this.data) {
		return dataPrep(data, this.type);
	}

	prepareFirstData(data = this.data) {
		return zeroDataPrep(data);
	}

	calc(onlyWidthChange = false) {
		this.calcXPositions();
		if (!onlyWidthChange) {
			this.calcYAxisParameters(this.getAllYValues(), this.type === 'line');
		}
		this.makeDataByIndex();
	}

	calcXPositions() {
		let s = this.state;
		let labels = this.data.labels;
		s.datasetLength = labels.length;

		s.unitWidth = this.width / (s.datasetLength);
		// Default, as per bar, and mixed. Only line will be a special case
		s.xOffset = s.unitWidth / 2;

		// // For a pure Line Chart
		// s.unitWidth = this.width/(s.datasetLength - 1);
		// s.xOffset = 0;

		s.xAxis = {
			labels: labels,
			positions: labels.map((d, i) =>
				floatTwo(s.xOffset + i * s.unitWidth)
			)
		};
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
				name: d.name && d.name.replace(/<|>|&/g, (char) => char == '&' ? '&amp;' : char == '<' ? '&lt;' : '&gt;'),
				index: i,
				chartType: d.chartType,

				values: values,
				yPositions: scaleAll(values),

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
			let cumulative = new Array(this.state.datasetLength).fill(0);
			this.data.datasets.map((d, i) => {
				let values = this.data.datasets[i].values;
				d[key] = cumulative = cumulative.map((c, i) => c + values[i]);
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
					// pos: 'right'
				},
				function () {
					let s = this.state;
					s.xAxis.calcLabels = getShortenedLabels(this.width,
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

					let spaceRatio = this.barOptions.spaceRatio || BAR_CHART_SPACE_RATIO;
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
						if (stacked && d.index === s.datasets.length - 1) {
							labels = d.cumulativeYs;
						} else {
							labels = d.values.map(v => shortenLargeNumber(v));
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
					heatline: this.lineOptions.heatline,
					regionFill: this.lineOptions.regionFill,
					spline: this.lineOptions.spline,
					showDots: this.lineOptions.showDots,
					trailingDot: this.lineOptions.trailingDot,
					hideDotBorder: this.lineOptions.hideDotBorder,
					hideLine: this.lineOptions.hideLine,

					// same for all datasets
					valuesOverPoints: this.config.valuesOverPoints,
				},
				function () {
					let s = this.state;
					let d = s.datasets[index];
					let minLine = s.yAxis.positions[0] < s.yAxis.zeroLine
						? s.yAxis.positions[0] : s.yAxis.zeroLine;

					return {
						xPositions: s.xAxis.positions,
						yPositions: d.yPositions,

						values: d.values,

						zeroLine: minLine,
						radius: this.lineOptions.dotSize || LINE_CHART_DOT_SIZE,
					};
				}.bind(this)
			];
		});

		let markerConfigs = [
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

		let optionals = ['yMarkers', 'yRegions'];
		this.dataUnitComponents = [];

		this.components = new Map(componentConfigs
			.filter(args => !optionals.includes(args[0]) || this.state[args[0]])
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
					title: set.name,
					value: value,
					yPos: set.yPositions[index],
					color: this.colors[i],
					formatted: formatY ? formatY(value, {
						name: set.name,
						index: set.index,
						values: set.values
					}) : value,
				};
			});

			this.dataByIndex[index] = {
				label: label,
				formattedLabel: formatX ? formatX(label, index) : label,
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

	renderLegend() {
		let datasets = this.data.datasets;
		if (datasets.length <= 1) return;

		this.legendArea.textContent = '';
		let items = datasets.map((data, index) => ({
			data,
			index,
			width: LEGEND_DOT_SIZE + LEGEND_DOT_SIZE + getStringWidth(data.name || '', LEGEND_CHAR_WIDTH),
		}));

		let rows = [[]];
		let rowWidth = 0;
		items.forEach(item => {
			let width = item.width + (rowWidth ? LEGEND_ITEM_GAP : 0);
			if (rowWidth && rowWidth + width > this.width) {
				rows.push([]);
				rowWidth = 0;
				width = item.width;
			}
			rows[rows.length - 1].push(item);
			rowWidth += width;
		});

		rows.forEach((row, i) => {
			let total = row.reduce((sum, item) => sum + item.width, 0) + LEGEND_ITEM_GAP * (row.length - 1);
			let x = Math.max(0, (this.width - total) / 2);
			row.forEach(item => {
				this.legendArea.appendChild(this.makeLegend(item.data, item.index, x, i * this.config.legendRowHeight));
				x += item.width + LEGEND_ITEM_GAP;
			});
		});
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
		if (this.overlayGuides) {
			this.overlayGuides.forEach(g => {
				let o = g.overlay;
				o.parentNode.removeChild(o);
			});
		}

		this.overlayGuides = this.dataUnitComponents.map(c => {
			return {
				type: c.unitType,
				overlay: undefined,
				units: c.units,
			};
		});

		if (this.state.currentIndex === undefined) {
			this.state.currentIndex = this.state.datasetLength - 1;
		}

		// Render overlays
		this.overlayGuides.map(d => {
			let currentUnit = d.units[this.state.currentIndex];

			d.overlay = makeOverlay[d.type](currentUnit);
			this.drawArea.appendChild(d.overlay);
		});
	}

	updateOverlayGuides() {
		if (this.overlayGuides) {
			this.overlayGuides.forEach(g => {
				let o = g.overlay;
				o.parentNode.removeChild(o);
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
					this.setCurrentDataPoint(index);
				});
			});
		});

		// Note: Doesn't work as tooltip is absolutely positioned
		this.tip.container.addEventListener('click', () => {
			let index = this.tip.container.getAttribute('data-point-index');
			this.setCurrentDataPoint(index);
		});
	}

	updateOverlay() {
		this.overlayGuides.map(d => {
			let currentUnit = d.units[this.state.currentIndex];
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

	setCurrentDataPoint(index) {
		let s = this.state;
		index = parseInt(index);
		if (index < 0) index = 0;
		if (index >= s.xAxis.labels.length) index = s.xAxis.labels.length - 1;
		if (index === s.currentIndex) return;
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
