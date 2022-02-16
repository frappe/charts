import '../css/charts.scss';

// import MultiAxisChart from './charts/MultiAxisChart';
import PercentageChart from './charts/PercentageChart';
import PieChart from './charts/PieChart';
import Heatmap from './charts/Heatmap';
import AxisChart from './charts/AxisChart';
import DonutChart from './charts/DonutChart';

const chartTypes = {
	bar: AxisChart,
	line: AxisChart,
	// multiaxis: MultiAxisChart,
	percentage: PercentageChart,
	heatmap: Heatmap,
	pie: PieChart,
	donut: DonutChart,
};

function getChartByType(chartType = 'line', parent, options) {
	if (chartType === 'axis-mixed') {
		options.type = 'line';
		return new AxisChart(parent, options);
	}

	if (!chartTypes[chartType]) {
		console.error("Undefined chart type: " + chartType);
		return;
	}

	return new chartTypes[chartType](parent, options);
}

class Chart {
	constructor(parent, options) {
		return getChartByType(options.type, parent, options);
	}
}

export { Chart, PercentageChart, PieChart, Heatmap, AxisChart };