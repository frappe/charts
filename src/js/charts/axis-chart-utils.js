import { floatTwo, fillArray } from '../utils/helpers';
import { DEFAULT_AXIS_CHART_TYPE } from '../utils/constants';

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

		// Set index
		d.index = i;

		// Set type
		if(!d.chartType ) {
			d.chartType = type || DEFAULT_AXIS_CHART_TYPE;
		}
	});

	// Markers
	// Regions

	return data;
}