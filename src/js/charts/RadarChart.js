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
import { getPositionByAngle } from "../utils/helpers";
import { legendDot, makeOverlay, updateOverlay } from "../utils/draw";
import {
	getTopOffset,
	getLeftOffset,
	LINE_CHART_DOT_SIZE,
	LEGEND_ITEM_WIDTH,
} from "../utils/constants";

export default class RadarChart extends BaseChart {
	constructor(parent, options) {
		super(parent, options);
		this.type = options.type || "radar";
		this.init = 1;
		this.setup();
	}

	configure(options) {
		super.configure(options);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseLeave = this.mouseLeave.bind(this);
		// angles are always with up = 0 degrees
		this.config.radarOptions = {
			hasStroke: false,
			opacity: 0.8,
			clockWise: true,
			startAngle: 0,
		};
		Object.assign(this.config.radarOptions, options.radarOptions);
		this.config.rAxisOptions = {
			// always clockwise
			axisAngle: 90,
			alignment: "outside",
			className: "",
		};
		Object.assign(this.config.rAxisOptions, options.rAxisOptions);
		this.config.thetaAxisOptions = {
			radius: 4,
			color: "#98A1A9", //gray500
		};
		Object.assign(this.config.thetaAxisOptions, options.thetaAxisOptions);
		this.config.legendRowHeight = 60;
	}

	calc(onlyWidthChange = false) {
		// x is right, y is down, getPositionByAngle: 0deg is down and anticlockwise
		super.calc(onlyWidthChange);
		let s = this.state;
		s.center = {x: this.width / 2, y: this.height / 2};
		s.radius = this.height > this.width ? s.center.x : s.center.y;
		s.datasetLength = this.data.labels.length;
		const segments = this.data.labels.length;
		let angleIncrement = 360 / segments;
		angleIncrement = this.config.radarOptions.clockWise ? angleIncrement : -angleIncrement;

		let minValue = 0;
		s.maxValue = 0;
		for (let dataset of this.data.datasets) {
			for (let value of dataset.values) {
				minValue = Math.min(minValue, value);
				s.maxValue = Math.max(s.maxValue, value);
			}
		}
		if (minValue < 0) console.warn("RadarChart: Found negative value: %s", minValue);
		if (s.maxValue === 0) console.warn("RadarChart: Maximum value not greater than zero");
		const range = s.maxValue - minValue;

		s.radars = [];
		s.theta = [];
		let labelPoint;
		let theta_done = false;
		let point;
		let points;
		let angle;
		for (let dataset of this.data.datasets) {
			if (dataset.values.length !== segments) console.error("RadarChart: Dataset %s not the same length as labels", dataset.name);
			angle = this.config.radarOptions.startAngle;
			points = [];
			for (let value of dataset.values) {
				point = getPositionByAngle(angle, ((value - minValue) / range) * s.radius);
				// Convert angle by negating y value
				point.y = -point.y;
				point.x += s.center.x;
				point.y += s.center.y;
				points.push(point);
				if (!theta_done) {
					labelPoint = getPositionByAngle(angle, s.radius);
					labelPoint.y = -labelPoint.y;
					labelPoint.x += s.center.x;
					labelPoint.y += s.center.y;
					s.theta.push(labelPoint);
				}
				angle += angleIncrement;
			}
			theta_done = true;
			s.radars.push({points: points});
		}

		this.init = 0;
	}

	setupComponents() {
		// getComponent takes: name, constants & getData function
		let componentConfigs = this.state.radars.map((data, index) => {
			return [
				"radarChart",
				{
					index: index,
					hasStroke: this.config.radarOptions.hasStroke,
					colour: this.colors[index],
					opacity: this.config.radarOptions.opacity,
				},
				function getData() {
					return this.state.radars[index];
				}.bind(this)
			]
		});

		let rAxisConstants = {
			radius: this.state.radius,
			center: this.state.center,
		};
		Object.assign(rAxisConstants, this.config.rAxisOptions);
		componentConfigs.push([
			"rAxis",
			rAxisConstants,
			function getData() {
				return {
					maxValue: this.state.maxValue,
				};
			}.bind(this)
		]);

		let thetaAxisConstants = {
			center: this.state.center,
		};
		Object.assign(thetaAxisConstants, this.config.thetaAxisOptions);
		componentConfigs.push([
			"thetaAxis",
			thetaAxisConstants,
			function getData() {
				return {
					points: this.state.theta,
					labels: this.data.labels,
				};
			}.bind(this)
		]);

		this.components = new Map(
			componentConfigs.map((args) => {
				const component = getComponent(...args);
				let key = args[0];
				key += args[1].index !== undefined ? args[1].index : "";
				return [key, component];
			})
		);
	}

	renderLegend() {
		super.renderLegend(this.data.datasets);
	}
	makeLegend(data, index, x_pos, y_pos) {
		// requires this.config.legendRowHeight
		return legendDot(
			x_pos,
			y_pos,
			12, // size
			3, // dot radius
			this.colors[index], // fill
			data.name || `Dataset${index}`, // label
			null, // value
			null, // base_font_size
			this.config.truncateLegends // truncate_legends
		);
	}

	bindTooltip() {}
	mouseMove(e) {}
	mouseLeave() {}

	// API
	// TODO
	makeOverlay() {}
	updateOverlay() {}
	bindOverlay() {}
	bindUnits() {}

	onLeftArrow() {}
	onRightArrow() {}
	onUpArrow() {}
	onDownArrow() {}
	onEnterKey() {}

	getDataPoint() {}
	setCurrentDataPoint() {}

	updateDataset() {}
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

	updateDatasets(datasets) {
		this.data.datasets.map((d, i) => {
			if (datasets[i]) {
				d.values = datasets[i];
			}
		});
		this.update(this.data);
	}
}
