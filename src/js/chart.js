import '../scss/charts.scss';

import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';
import ScatterChart from './charts/ScatterChart';
import MultiAxisChart from './charts/MultiAxisChart';
import PercentageChart from './charts/PercentageChart';
import PieChart from './charts/PieChart';
import Heatmap from './charts/Heatmap';

// if (ENV !== 'production') {
// 	// Enable LiveReload
// 	document.write(
// 		'<script src="http://' + (location.host || 'localhost').split(':')[0] +
// 		':35729/livereload.js?snipver=1"></' + 'script>'
// 	);
// }

const chartTypes = {
	line: LineChart,
	bar: BarChart,
	multiaxis: MultiAxisChart,
	scatter: ScatterChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart
};

function getChartByType(chartType = 'line', options) {
	if (!chartTypes[chartType]) {
		return new LineChart(options);
	}

	return new chartTypes[chartType](options);
}

export default class Chart {
	constructor(args) {
		return getChartByType(args.type, arguments[0]);
	}
}
