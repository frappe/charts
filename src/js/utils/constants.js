export const ALL_CHART_TYPES = ['line', 'scatter', 'bar', 'percentage', 'heatmap', 'pie'];

export const COMPATIBLE_CHARTS = {
	bar: ['line', 'scatter', 'percentage', 'pie'],
	line: ['scatter', 'bar', 'percentage', 'pie'],
	pie: ['line', 'scatter', 'percentage', 'bar'],
	percentage: ['bar', 'line', 'scatter', 'pie'],
	heatmap: []
};

export const DATA_COLOR_DIVISIONS = {
	bar: 'datasets',
	line: 'datasets',
	pie: 'labels',
	percentage: 'labels',
	heatmap: HEATMAP_DISTRIBUTION_SIZE
};

export const BASE_CHART_TOP_MARGIN = 10;
export const BASE_CHART_LEFT_MARGIN = 20;
export const BASE_CHART_RIGHT_MARGIN = 20;

export const Y_AXIS_LEFT_MARGIN = 60;
export const Y_AXIS_RIGHT_MARGIN = 40;

export const INIT_CHART_UPDATE_TIMEOUT = 700;
export const CHART_POST_ANIMATE_TIMEOUT = 400;

export const DEFAULT_AXIS_CHART_TYPE = 'line';
export const AXIS_DATASET_CHART_TYPES = ['line', 'bar'];

export const BAR_CHART_SPACE_RATIO = 0.5;
export const MIN_BAR_PERCENT_HEIGHT = 0.01;

export const LINE_CHART_DOT_SIZE = 4;
export const DOT_OVERLAY_SIZE_INCR = 4;

export const DEFAULT_CHAR_WIDTH = 7;

// Universal constants
export const ANGLE_RATIO = Math.PI / 180;
export const FULL_ANGLE = 360;

// Fixed 5-color theme,
// More colors are difficult to parse visually
export const HEATMAP_DISTRIBUTION_SIZE = 5;

export const HEATMAP_SQUARE_SIZE = 10;
export const HEATMAP_GUTTER_SIZE = 2;

const HEATMAP_COLORS = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
const DEFAULT_CHART_COLORS = ['light-blue', 'blue', 'violet', 'red', 'orange',
	'yellow', 'green', 'light-green', 'purple', 'magenta', 'light-grey', 'dark-grey'];

export const DEFAULT_COLORS = {
	bar: DEFAULT_CHART_COLORS,
	line: DEFAULT_CHART_COLORS,
	pie: DEFAULT_CHART_COLORS,
	percentage: DEFAULT_CHART_COLORS,
	heatmap: HEATMAP_COLORS
};