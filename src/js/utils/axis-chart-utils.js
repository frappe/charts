import { fillArray } from '../utils/helpers';
import { DEFAULT_AXIS_CHART_TYPE, AXIS_DATASET_CHART_TYPES, DEFAULT_CHAR_WIDTH } from '../utils/constants';

export function dataPrep(data, type) {
	data.labels = data.labels || [];

	let datasetLength = data.labels.length;

	// Datasets
	let datasets = data.datasets;
	let zeroArray = new Array(datasetLength).fill(0);
	if(!datasets) {
		// default
		datasets = [{
			values: zeroArray
		}];
	}

	datasets.map(d=> {
		// Set values
		if(!d.values) {
			d.values = zeroArray;
		} else {
			// Check for non values
			let vals = d.values;
			vals = vals.map(val => (!isNaN(val) ? val : 0));

			// Trim or extend
			if(vals.length > datasetLength) {
				vals = vals.slice(0, datasetLength);
			} else {
				vals = fillArray(vals, datasetLength - vals.length, 0);
			}
			d.values = vals;
		}

		// Set type
		if(!d.chartType ) {
			if(!AXIS_DATASET_CHART_TYPES.includes(type)) type === DEFAULT_AXIS_CHART_TYPE;
			d.chartType = type;
		}

	});

	// Markers

	// Regions
	// data.yRegions = data.yRegions || [];
	if(data.yRegions) {
		data.yRegions.map(d => {
			if(d.end < d.start) {
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
		datasets: realData.datasets.map(d => {
			return {
				name: '',
				values: zeroArray.slice(0, -1),
				chartType: d.chartType
			};
		}),
	};

	if(realData.yMarkers) {
		zeroData.yMarkers = [
			{
				value: 0,
				label: ''
			}
		];
	}

	if(realData.yRegions) {
		zeroData.yRegions = [
			{
				start: 0,
				end: 0,
				label: ''
			}
		];
	}

	return zeroData;
}

export function getShortenedLabels(chartWidth, labels=[], isSeries=true) {
	let allowedSpace = chartWidth / labels.length;
	if(allowedSpace <= 0) allowedSpace = 1;
	let allowedLetters = allowedSpace / DEFAULT_CHAR_WIDTH;

	let seriesMultiple;
	if(isSeries) {
		// Find the maximum label length for spacing calculations
		let maxLabelLength = Math.max(...labels.map(label => label.length));
		seriesMultiple = Math.ceil(maxLabelLength/allowedLetters);
	}

	let calcLabels = labels.map((label, i) => {
		label += "";
		if(label.length > allowedLetters) {

			if(!isSeries) {
				if(allowedLetters-3 > 0) {
					label = label.slice(0, allowedLetters-3) + " ...";
				} else {
					label = label.slice(0, allowedLetters) + '..';
				}
			} else {
				if(i % seriesMultiple !== 0) {
					label = "";
				}
			}
		}
		return label;
	});

	return calcLabels;
}
