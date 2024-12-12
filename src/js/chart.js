import "../css/charts.scss";

import PercentageChart from "./charts/PercentageChart";
import PieChart from "./charts/PieChart";
import Heatmap from "./charts/Heatmap";
import AxisChart from "./charts/AxisChart";
import DonutChart from "./charts/DonutChart";
import RadarChart from "./charts/RadarChart";

const chartTypes = {
  bar: AxisChart,
  line: AxisChart,
  percentage: PercentageChart,
  heatmap: Heatmap,
  pie: PieChart,
  donut: DonutChart,
  radar: RadarChart,
};

function getChartByType(chartType = "line", parent, options) {
  if (chartType === "axis-mixed") {
    options.type = "line";
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
    const chart = getChartByType(options.type, parent, options);
    if (!frappe.charts) {
      frappe.charts = [];
    }
    frappe.charts.push(chart);
    return chart;
  }
}

export { Chart, PercentageChart, PieChart, DonutChart, Heatmap, AxisChart, RadarChart };
