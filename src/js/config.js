import Chart from './chart';

const ALL_CHART_TYPES = ['line', 'scatter', 'bar', 'percentage', 'heatmap', 'pie'];

const COMPATIBLE_CHARTS = {
	bar: ['line', 'scatter', 'percentage', 'pie'],
	line: ['scatter', 'bar', 'percentage', 'pie'],
	pie: ['line', 'scatter', 'percentage', 'bar'],
	scatter: ['line', 'bar', 'percentage', 'pie'],
	percentage: ['bar', 'line', 'scatter', 'pie'],
	heatmap: []
};

// Needs structure as per only labels/datasets
const COLOR_COMPATIBLE_CHARTS = {
	bar: ['line', 'scatter'],
	line: ['scatter', 'bar'],
	pie: ['percentage'],
	scatter: ['line', 'bar'],
	percentage: ['pie'],
	heatmap: []
};

export function getDifferentChart(type, current_type, parent, args) {
	if(type === current_type) return;

	if(!ALL_CHART_TYPES.includes(type)) {
		console.error(`'${type}' is not a valid chart type.`);
	}

	if(!COMPATIBLE_CHARTS[current_type].includes(type)) {
		console.error(`'${current_type}' chart cannot be converted to a '${type}' chart.`);
	}

	// whether the new chart can use the existing colors
	const useColor = COLOR_COMPATIBLE_CHARTS[current_type].includes(type);

	// Okay, this is anticlimactic
	// this function will need to actually be 'changeChartType(type)'
	// that will update only the required elements, but for now ...

	args.type = type;
	args.colors = useColor ? args.colors : undefined;

	return new Chart(parent, args);
}