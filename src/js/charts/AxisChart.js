import BaseChart from "./BaseChart";
import {
	dataPrep,
	zeroDataPrep,
	getShortenedLabels,
} from "../utils/axis-chart-utils";
import { getComponent } from "../objects/ChartComponents";
import { getOffset, fire } from "../utils/dom";
import {
	calcChartIntervals,
	getIntervalSize,
	getValueRange,
	getZeroIndex,
	scale,
	getClosestInArray,
} from "../utils/intervals";
import { floatTwo } from "../utils/helpers";
import { makeOverlay, updateOverlay, legendDot } from "../utils/draw";
import {
	getTopOffset,
	getLeftOffset,
	MIN_BAR_PERCENT_HEIGHT,
	BAR_CHART_SPACE_RATIO,
	LINE_CHART_DOT_SIZE,
	LEGEND_ITEM_WIDTH,
} from "../utils/constants";

export default class AxisChart extends BaseChart {
	constructor(parent, args) {
		super(parent, args);

		this.barOptions = args.barOptions || {};
		this.lineOptions = args.lineOptions || {};

		this.type = args.type || "line";
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
		const { axisOptions = {} } = options;
		const { xAxis, yAxis } = axisOptions || {};

		options.tooltipOptions = options.tooltipOptions || {};

		this.config.xAxisMode = xAxis
			? xAxis.xAxisMode
			: axisOptions.xAxisMode || "span";

		// this will pass an array
		// lets determine if we need two yAxis based on if there is length
		// to the yAxis array
		if (yAxis && yAxis.length) {
			this.config.yAxisConfig = yAxis.map((item) => {
				return {
					yAxisMode: item.yAxisMode,
					id: item.id,
					position: item.position,
					title: item.title,
				};
			});
		} else {
			this.config.yAxisMode = yAxis
				? yAxis.yAxisMode
				: axisOptions.yAxisMode || "span";

			// if we have yAxis config settings lets populate a yAxis config array.
			if (yAxis && yAxis.id && yAxis.position) {
				this.config.yAxisConfig = [yAxis];
			}
		}

		this.config.xIsSeries = axisOptions.xIsSeries || 0;
		this.config.shortenYAxisNumbers = axisOptions.shortenYAxisNumbers || 0;

		this.config.formatTooltipX = options.tooltipOptions.formatTooltipX;
		this.config.formatTooltipY = options.tooltipOptions.formatTooltipY;

		this.config.valuesOverPoints = options.valuesOverPoints;
		this.config.legendRowHeight = 30;
	}

	prepareData(data = this.data, config = this.config) {
		return dataPrep(data, this.type, config.continuous);
	}

	prepareFirstData(data = this.data) {
		return zeroDataPrep(data);
	}

	calc(onlyWidthChange = false) {
		this.calcXPositions();
		if (!onlyWidthChange) {
			this.calcYAxisParameters(
				this.getAllYValues(),
				this.type === "line"
			);
		}
		this.makeDataByIndex();
	}

	calcXPositions() {
		let s = this.state;
		let labels = this.data.labels;
		s.datasetLength = labels.length;

		s.unitWidth = this.width / s.datasetLength;
		// Default, as per bar, and mixed. Only line will be a special case
		s.xOffset = s.unitWidth / 2;

		// // For a pure Line Chart
		// s.unitWidth = this.width/(s.datasetLength - 1);
		// s.xOffset = 0;

		s.xAxis = {
			labels: labels,
			positions: labels.map((d, i) =>
				floatTwo(s.xOffset + i * s.unitWidth)
			),
		};
	}

	calcYAxisParameters(dataValues, withMinimum = "false") {
		let yPts,
			scaleMultiplier,
			intervalHeight,
			zeroLine,
			positions,
			yAxisConfigObject,
			yAxisAlignment,
			yKeys;

		yKeys = [];
		yAxisConfigObject = this.config.yAxisMode || {};
		yAxisAlignment = yAxisConfigObject.position
			? yAxisConfigObject.position
			: "left";

		// if we have an object we have multiple yAxisParameters.
		if (dataValues instanceof Array) {
			yPts = calcChartIntervals(dataValues, withMinimum, this.config.overrideCeiling, this.config.overrideFloor);
			scaleMultiplier = this.height / getValueRange(yPts);
			intervalHeight = getIntervalSize(yPts) * scaleMultiplier;
			zeroLine = this.height - getZeroIndex(yPts) * intervalHeight;

			this.state.yAxis = {
				labels: yPts,
				positions: yPts.map((d) => zeroLine - d * scaleMultiplier),
				title: yAxisConfigObject.title || null,
				pos: yAxisAlignment,
				scaleMultiplier: scaleMultiplier,
				zeroLine: zeroLine,
			};
		} else {
			this.state.yAxis = [];
			for (let key in dataValues) {
				const dataValue = dataValues[key];
				yAxisConfigObject =
					this.config.yAxisConfig.find((item) => key === item.id) ||
					[];
				yAxisAlignment = yAxisConfigObject.position
					? yAxisConfigObject.position
					: "left";
				yPts = calcChartIntervals(dataValue, withMinimum, this.config.overrideCeiling, this.config.overrideFloor);
				scaleMultiplier = this.height / getValueRange(yPts);
				intervalHeight = getIntervalSize(yPts) * scaleMultiplier;
				zeroLine = this.height - getZeroIndex(yPts) * intervalHeight;
				positions = yPts.map((d) => zeroLine - d * scaleMultiplier);
				yKeys.push(key);

				if (this.state.yAxis.length > 1) {
					const yPtsArray = [];
					const firstArr = this.state.yAxis[0];

					// we need to calculate the scaleMultiplier.

					// now that we have an accurate scaleMultiplier we can
					// we need to loop through original positions.
					scaleMultiplier = this.height / getValueRange(yPts);
					firstArr.positions.forEach((pos) => {
						yPtsArray.push(Math.ceil(pos / scaleMultiplier));
					});
					yPts = yPtsArray.reverse();
					zeroLine =
						this.height - getZeroIndex(yPts) * intervalHeight;
					positions = firstArr.positions;
				}

				this.state.yAxis.push({
					axisID: key || "left-axis",
					labels: yPts,
					title: yAxisConfigObject.title,
					pos: yAxisAlignment,
					scaleMultiplier,
					zeroLine,
					positions,
				});
			}

			// the labels are not aligned in length between the two yAxis objects,
			// we need to run some new calculations.
			if (
				this.state.yAxis[1] &&
				this.state.yAxis[0].labels.length !==
					this.state.yAxis[1].labels.length
			) {
				const newYptsArr = [];
				// find the shorter array
				const shortest = this.state.yAxis.reduce(
					(p, c) => {
						return p.length > c.labels.length ? c : p;
					},
					{ length: Infinity }
				);
				// return the longest
				const longest = this.state.yAxis.reduce(
					(p, c) => {
						return p.length < c.labels.length ? p : c;
					},
					{ length: Infinity }
				);

				// we now need to populate the shortest obj with the new scale multiplier
				// with the positions of the longest obj.
				longest.positions.forEach((pos) => {
					// calculate a new yPts
					newYptsArr.push(Math.ceil(pos / shortest.scaleMultiplier));
				});

				shortest.labels = newYptsArr.reverse();
				shortest.positions = longest.positions;
			}
		}

		// Dependent if above changes
		this.calcDatasetPoints();
		this.calcYExtremes();
		this.calcYRegions();
	}

	calcDatasetPoints() {
		let s = this.state;
		let scaleAll = (values, id) => {
			return values.map((val) => {
				let { yAxis } = s;

				if (yAxis instanceof Array) {
					yAxis =
						yAxis.length > 1
							? yAxis.find((axis) => id === axis.axisID)
							: s.yAxis[0];
				}

				return scale(val, yAxis);
			});
		};

		s.barChartIndex = 1;
		s.datasets = this.data.datasets.map((d, i) => {
			let values = d.values;
			let cumulativeYs = d.cumulativeYs || [];

			return {
				name:
					d.name &&
					d.name.replace(/<|>|&/g, (char) =>
						char == "&" ? "&amp;" : char == "<" ? "&lt;" : "&gt;"
					),
				index: i,
				barIndex:
					d.chartType === "bar" ? s.barChartIndex++ : s.barChartIndex,
				chartType: d.chartType,

				values: values,
				yPositions: scaleAll(values, d.axisID),
				id: d.axisID,

				cumulativeYs: cumulativeYs,
				cumulativeYPos: scaleAll(cumulativeYs, d.axisID),
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
		s.datasets.map((d) => {
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
			this.state.yMarkers = this.data.yMarkers.map((d) => {
				d.position = scale(d.value, s.yAxis);
				if (!d.options) d.options = {};
				// if(!d.label.includes(':')) {
				// 	d.label += ': ' + d.value;
				// }
				return d;
			});
		}
		if (this.data.yRegions) {
			this.state.yRegions = this.data.yRegions.map((d) => {
				d.startPos = scale(d.start, s.yAxis);
				d.endPos = scale(d.end, s.yAxis);
				if (!d.options) d.options = {};
				return d;
			});
		}
	}

	getAllYValues() {
		let key = "values";
		let multiAxis = this.config.yAxisConfig ? true : false;
		let allValueLists = multiAxis ? {} : [];

		let groupBy = (arr, property) => {
			return arr.reduce((acc, cur) => {
				acc[cur[property]] = [...(acc[cur[property]] || []), cur];
				return acc;
			}, {});
		};

		let generateCumulative = (arr) => {
			let cumulative = new Array(this.state.datasetLength).fill(0);
			arr.forEach((d, i) => {
				let values = arr[i].values;
				d[key] = cumulative = cumulative.map((c, i) => {
					return c + values[i];
				});
			});
		};

		if (this.barOptions.stacked) {
			key = "cumulativeYs";
			// we need to filter out the different yAxis ID's here.
			if (multiAxis) {
				const groupedDataSets = groupBy(this.data.datasets, "axisID");
				// const dataSetsByAxis = this.data.dd
				for (var axisID in groupedDataSets) {
					generateCumulative(groupedDataSets[axisID]);
				}
			} else {
				generateCumulative(this.data.datasets);
			}
		}

		// this is the trouble maker, we don't want to merge all
		// datasets since we are trying to run two yAxis.
		if (multiAxis) {
			this.data.datasets.forEach((d) => {
				// if the array exists already just push more data into it.
				// otherwise create a new array into the object.
				allValueLists[d.axisID || key]
					? allValueLists[d.axisID || key].push(...d[key])
					: (allValueLists[d.axisID || key] = [...d[key]]);
			});
		} else {
			allValueLists = this.data.datasets.map((d) => {
				return d[key];
			});
		}

		if (this.data.yMarkers && !multiAxis) {
			allValueLists.push(this.data.yMarkers.map((d) => d.value));
		}

		if (this.data.yRegions && !multiAxis) {
			this.data.yRegions.map((d) => {
				allValueLists.push([d.end, d.start]);
			});
		}

		return multiAxis ? allValueLists : [].concat(...allValueLists); //return [].concat(...allValueLists); master
	}

	setupComponents() {
		let componentConfigs = [
			[
				"xAxis",
				{
					mode: this.config.xAxisMode,
					height: this.height,
					// pos: 'right'
				},
				function () {
					let s = this.state;
					s.xAxis.calcLabels = getShortenedLabels(
						this.width,
						s.xAxis.labels,
						this.config.xIsSeries
					);

					return s.xAxis;
				}.bind(this),
			],

			[
				"yRegions",
				{
					width: this.width,
					pos: "right",
				},
				function () {
					return this.state.yRegions;
				}.bind(this),
			],
		];

		// if we have multiple yAxisConfigs we need to update the yAxisDefault
		// components to multiple yAxis components.
		if (this.config.yAxisConfig && this.config.yAxisConfig.length) {
			this.config.yAxisConfig.forEach((yAxis) => {
				componentConfigs.push([
					"yAxis",
					{
						mode: yAxis.yAxisMode || "span",
						width: this.width,
						height: this.baseHeight,
						shortenNumbers: this.config.shortenYAxisNumbers,
						pos: yAxis.position || "left",
					},
					function () {
						return this.state.yAxis;
					}.bind(this),
				]);
			});
		} else {
			componentConfigs.push([
				"yAxis",
				{
					mode: this.config.yAxisMode,
					width: this.width,
					height: this.baseHeight,
					shortenNumbers: this.config.shortenYAxisNumbers,
				},
				function () {
					return this.state.yAxis;
				}.bind(this),
			]);
		}

		let barDatasets = this.state.datasets.filter(
			(d) => d.chartType === "bar"
		);
		let lineDatasets = this.state.datasets.filter(
			(d) => d.chartType === "line"
		);

		let barsConfigs = barDatasets.map((d) => {
			let index = d.index;
			let barIndex = d.barIndex || index;
			return [
				"barGraph" + "-" + d.index,
				{
					index: index,
					color: this.colors[index],
					stacked: this.barOptions.stacked,

					// same for all datasets
					valuesOverPoints: this.config.valuesOverPoints,
					minHeight: this.height * MIN_BAR_PERCENT_HEIGHT,
				},
				function () {
					let s = this.state;
					let { yAxis } = s;
					let d = s.datasets[index];
					let { id = "left-axis" } = d;
					let stacked = this.barOptions.stacked;

					let spaceRatio =
						this.barOptions.spaceRatio || BAR_CHART_SPACE_RATIO;
					let barsWidth = s.unitWidth * (1 - spaceRatio);
					let barWidth =
						barsWidth / (stacked ? 1 : barDatasets.length);

					// if there are multiple yAxis we need to return the yAxis with the
					// proper ID.
					if (yAxis instanceof Array) {
						// if the person only configured one yAxis in the array return the first.
						yAxis =
							yAxis.length > 1
								? yAxis.find((axis) => id === axis.axisID)
								: s.yAxis[0];
					}

					let xPositions = s.xAxis.positions.map(
						(x) => x - barsWidth / 2
					);

					if (!stacked) {
						xPositions = xPositions.map(
							(p) => p + barWidth * barIndex - barWidth
						);
					}

					let labels = new Array(s.datasetLength).fill("");
					if (this.config.valuesOverPoints) {
						if (stacked && d.index === s.datasets.length - 1) {
							labels = d.cumulativeYs;
						} else {
							labels = d.values;
						}
					}
					let offsets = new Array(s.datasetLength).fill(0);
					if (stacked) {
						offsets = d.yPositions.map(
							(y, j) => y - d.cumulativeYPos[j]
						);
					}

					return {
						xPositions: xPositions,
						yPositions: d.yPositions,
						offsets: offsets,
						// values: d.values,
						labels: labels,

						zeroLine: yAxis.zeroLine,
						barsWidth: barsWidth,
						barWidth: barWidth,
					};
				}.bind(this),
			];
		});

		let lineConfigs = lineDatasets.map((d) => {
			let index = d.index;
			return [
				"lineGraph" + "-" + d.index,
				{
					index: index,
					color: this.colors[index],
					svgDefs: this.svgDefs,
					heatline: this.lineOptions.heatline,
					regionFill: this.lineOptions.regionFill,
					spline: this.lineOptions.spline,
					hideDots: this.lineOptions.hideDots,
					hideLine: this.lineOptions.hideLine,

					// same for all datasets
					valuesOverPoints: this.config.valuesOverPoints,
				},
				function () {
					let s = this.state;
					let d = s.datasets[index];

					// if we have more than one yindex lets map the values
					const yAxis = s.yAxis.length
						? s.yAxis.find((axis) => d.id === axis.axisID) ||
						  s.yAxis[0]
						: s.yAxis;

					let minLine =
						yAxis.positions[0] < yAxis.zeroLine
							? yAxis.positions[0]
							: yAxis.zeroLine;

					return {
						xPositions: s.xAxis.positions,
						yPositions: d.yPositions,

						values: d.values,

						zeroLine: minLine,
						radius: this.lineOptions.dotSize || LINE_CHART_DOT_SIZE,
					};
				}.bind(this),
			];
		});

		let markerConfigs = [
			[
				"yMarkers",
				{
					width: this.width,
					pos: "right",
				},
				function () {
					return this.state.yMarkers;
				}.bind(this),
			],
		];

		componentConfigs = componentConfigs.concat(
			barsConfigs,
			lineConfigs,
			markerConfigs
		);

		let optionals = ["yMarkers", "yRegions"];
		this.dataUnitComponents = [];

		this.components = new Map(
			componentConfigs
				.filter(
					(args) =>
						!optionals.includes(args[0]) || this.state[args[0]]
				)
				.map((args) => {
					let component = getComponent(...args);
					if (
						args[0].includes("lineGraph") ||
						args[0].includes("barGraph")
					) {
						this.dataUnitComponents.push(component);
					}
					return [args[0], component];
				})
		);
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
					formatted: formatY ? formatY(value) : value,
				};
			});

			this.dataByIndex[index] = {
				label: label,
				formattedLabel: formatX ? formatX(label) : label,
				xPos: s.xAxis.positions[index],
				values: values,
				yExtreme: s.yExtremes[index],
			};
		});
	}

	bindTooltip() {
		// NOTE: could be in tooltip itself, as it is a given functionality for its parent
		this.container.addEventListener("mousemove", (e) => {
			let m = this.measures;
			let o = getOffset(this.container);
			let relX = e.pageX - o.left - getLeftOffset(m);
			let relY = e.pageY - o.top;

			if (
				relY < this.height + getTopOffset(m) &&
				relY > getTopOffset(m)
			) {
				this.mapTooltipXPosition(relX);
			} else {
				this.tip.hideTip();
			}
		});
	}

	mapTooltipXPosition(relX) {
		let s = this.state;
		if (!s.yExtremes) return;

		let index = getClosestInArray(relX, s.xAxis.positions, true);
		if (index >= 0) {
			let dbi = this.dataByIndex[index];

			this.tip.setValues(
				dbi.xPos + this.tip.offset.x,
				dbi.yExtreme + this.tip.offset.y,
				{ name: dbi.formattedLabel, value: "" },
				dbi.values,
				index
			);

			this.tip.showTip();
		}
	}

	renderLegend() {
		let s = this.data;
		if (s.datasets.length > 1) {
			super.renderLegend(s.datasets);
		}
	}

	// Legacy
	/* 	renderLegend() {
		let s = this.data;
		if (s.datasets.length > 1) {
			this.legendArea.textContent = "";
			console.log(s.datasets);
			s.datasets.map((d, i) => {
				let barWidth = LEGEND_ITEM_WIDTH;
				// let rightEndPoint = this.baseWidth - this.measures.margins.left - this.measures.margins.right;
				// let multiplier = s.datasets.length - i;
				let rect = legendBar(
					// rightEndPoint - multiplier * barWidth,	// To right align
					barWidth * i,
					"0",
					barWidth,
					this.colors[i],
					d.name,
					this.config.truncateLegends
				);
				this.legendArea.appendChild(rect);
			});
		}
	} */

	makeLegend(data, index, x_pos, y_pos) {
		return legendDot(
			x_pos,
			y_pos + 5, // Extra offset
			12, // size
			3, // dot radius
			this.colors[index], // fill
			data.name, //label
			null, // value
			8.75, // base_font_size
			this.config.truncateLegends // truncate legends
		);
	}

	// Overlay
	makeOverlay() {
		if (this.init) {
			this.init = 0;
			return;
		}
		if (this.overlayGuides) {
			this.overlayGuides.forEach((g) => {
				let o = g.overlay;
				o.parentNode.removeChild(o);
			});
		}

		this.overlayGuides = this.dataUnitComponents.map((c) => {
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
		this.overlayGuides.map((d) => {
			let currentUnit = d.units[this.state.currentIndex];

			d.overlay = makeOverlay[d.type](currentUnit);
			this.drawArea.appendChild(d.overlay);
		});
	}

	updateOverlayGuides() {
		if (this.overlayGuides) {
			this.overlayGuides.forEach((g) => {
				let o = g.overlay;
				o.parentNode.removeChild(o);
			});
		}
	}

	bindOverlay() {
		this.parent.addEventListener("data-select", () => {
			this.updateOverlay();
		});
	}

	bindUnits() {
		this.dataUnitComponents.map((c) => {
			c.units.map((unit) => {
				unit.addEventListener("click", () => {
					let index = unit.getAttribute("data-point-index");
					this.setCurrentDataPoint(index);
				});
			});
		});

		// Note: Doesn't work as tooltip is absolutely positioned
		this.tip.container.addEventListener("click", () => {
			let index = this.tip.container.getAttribute("data-point-index");
			this.setCurrentDataPoint(index);
		});
	}

	updateOverlay() {
		this.overlayGuides.map((d) => {
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
			values: s.datasets.map((d) => d.values[index]),
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
		this.data.datasets.map((d) => {
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
