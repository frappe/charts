import '../scss/charts.scss';

// import MultiAxisChart from './charts/MultiAxisChart';
import PercentageChart from './charts/PercentageChart';
import PieChart from './charts/PieChart';
import Heatmap from './charts/Heatmap';
import AxisChart from './charts/AxisChart';

const chartTypes = {
	// multiaxis: MultiAxisChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart
};

function getChartByType(chartType = 'line', parent, options) {
	if(chartType === 'line') {
		options.type = 'line';
		return new AxisChart(parent, options);
	} else if (chartType === 'bar') {
		options.type = 'bar';
		return new AxisChart(parent, options);
	} else if (chartType === 'axis-mixed') {
		options.type = 'line';
		return new AxisChart(parent, options);
	}

	if (!chartTypes[chartType]) {
		console.error("Undefined chart type: " + chartType);
		return;
	}

	return new chartTypes[chartType](parent, options);
}

export default class Chart {
	constructor(parent, options) {
		return getChartByType(options.type, parent, options);
	}
}
