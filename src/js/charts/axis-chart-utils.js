import { floatTwo, fillArray } from '../utils/helpers';
import { DEFAULT_AXIS_CHART_TYPE, AXIS_DATASET_CHART_TYPES } from '../utils/constants';

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

	datasets.map((d, i)=> {
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
		}

		// Set labels
		//

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
				[d.start, d.end] = [d.end, start];
			}
		});
	}

	return data;
}

export function zeroDataPrep(realData) {
	let datasetLength = realData.labels.length;
	let zeroArray = new Array(datasetLength).fill(0);

	let zeroData = {
		labels: realData.labels,
		datasets: realData.datasets.map(d => {
			return {
				name: '',
				values: zeroArray,
				chartType: d.chartType
			}
		}),
		yRegions: [
			{
				start: 0,
				end: 0,
				label: ''
			}
		],
		yMarkers: [
			{
				value: 0,
				label: ''
			}
		]
	};

	return zeroData;
}