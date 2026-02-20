import { fillArray } from "../utils/helpers";
import {
	DEFAULT_AXIS_CHART_TYPE,
	AXIS_DATASET_CHART_TYPES,
	DEFAULT_CHAR_WIDTH,
	SERIES_LABEL_SPACE_RATIO,
} from "../utils/constants";

export function dataPrep(data, type, config) {
	data.labels = data.labels || [];

	let datasetLength = data.labels.length;

	// Datasets
	let datasets = data.datasets;
	let zeroArray = new Array(datasetLength).fill(0);
	if (!datasets) {
		// default
		datasets = [
			{
				values: zeroArray,
			},
		];
	}

	datasets.map((d) => {
		// Set values
		if (!d.values) {
			d.values = zeroArray;
		} else {
			// Check for non values
			let vals = d.values;
			vals = vals.map((val) => (!isNaN(val) ? val : 0));

			// Trim or extend
			if (vals.length > datasetLength) {
				vals = vals.slice(0, datasetLength);
			}
			if (config) {
				vals = fillArray(vals, datasetLength - vals.length, null);
			} else {
				vals = fillArray(vals, datasetLength - vals.length, 0);
			}
			d.values = vals;
		}

		// Set type
		if (!d.chartType) {
			if (!AXIS_DATASET_CHART_TYPES.includes(type))
				type = DEFAULT_AXIS_CHART_TYPE;
			d.chartType = type;
		}
	});

	// Markers

	// Regions
	// data.yRegions = data.yRegions || [];
	if (data.yRegions) {
		data.yRegions.map((d) => {
			if (d.end < d.start) {
				[d.start, d.end] = [d.end, d.start];
			}
		});
	}

	return data;
}

export function zeroDataPrep(realData) {
	let datasetLength = realData.labels.length;
	let zeroArray = new Array(datasetLength).fill(0);

	let zeroData = {
		labels: realData.labels.slice(0, -1),
		datasets: realData.datasets.map((d) => {
			const { axisID } = d;
			return {
				axisID,
				name: "",
				values: zeroArray.slice(0, -1),
				chartType: d.chartType,
			};
		}),
	};

	if (realData.yMarkers) {
		zeroData.yMarkers = [
			{
				value: 0,
				label: "",
			},
		];
	}

	if (realData.yRegions) {
		zeroData.yRegions = [
			{
				start: 0,
				end: 0,
				label: "",
			},
		];
	}

	return zeroData;
}

export function getShortenedLabels(labels = []) {
	const MAX_LABEL_LENGTH = 20;
	
	const calcLabels = labels.map((label) => {
		label += "";
		if (label.length > MAX_LABEL_LENGTH) {
			label = label.slice(0, MAX_LABEL_LENGTH - 3) + "...";
		}
		return label;
	});

	return calcLabels;
}
