import '../scss/charts.scss';

import MultiAxisChart from './charts/MultiAxisChart';
import PercentageChart from './charts/PercentageChart';
import PieChart from './charts/PieChart';
import Heatmap from './charts/Heatmap';
import AxisChart from './charts/AxisChart';

// if (ENV !== 'production') {
// 	// Enable LiveReload
// 	document.write(
// 		'<script src="http://' + (location.host || 'localhost').split(':')[0] +
// 		':35729/livereload.js?snipver=1"></' + 'script>'
// 	);
// }

// If type is bar




const chartTypes = {
	// multiaxis: MultiAxisChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart
};

function getChartByType(chartType = 'line', options) {
	if(chartType === 'line') {
		options.type = 'line';
		return new AxisChart(options);
	} else if (chartType === 'bar') {
		options.type = 'bar';
		return new AxisChart(options);
	} else if (chartType === 'axis-mixed') {
		options.type = 'line';
		return new AxisChart(options);
	}

	if (!chartTypes[chartType]) {
		console.error("Undefined chart type: " + chartType);
		return;
	}

	return new chartTypes[chartType](options);
}

export default class Chart {
	constructor(args) {
		return getChartByType(args.type, arguments[0]);
	}
}
