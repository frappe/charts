// Composite Chart
// ================================================================================
let report_count_list = [17, 40, 33, 44, 126, 156,
	324, 333, 478, 495, 176];

let bar_composite_data = {
	labels: ["2007", "2008", "2009", "2010", "2011", "2012",
		"2013", "2014", "2015", "2016", "2017"],

	yMarkers: [
		{
			label: "Marker 1",
			value: 420,
		},
		{
			label: "Marker 2",
			value: 250,
		}
	],

	yRegions: [
		{
			label: "Region Y 1",
			start: 100,
			end: 300
		},
	],

	datasets: [{
		"name": "Events",
		"values": report_count_list,
		// "formatted": report_count_list.map(d => d + " reports")
	}]
};

let line_composite_data = {
	labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	datasets: [{
		"values": [36, 46, 45, 32, 27, 31, 30, 36, 39, 49, 0, 0],
		// "values": [36, 46, 45, 32, 27, 31, 30, 36, 39, 49, 40, 40],
		// "values": [-36, -46, -45, -32, -27, -31, -30, -36, -39, -49, -40, -40],
	}]
};

let more_line_data = [
	[4, 0, 3, 1, 1, 2, 1, 2, 1, 0, 1, 1],
	// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[2, 3, 3, 2, 1, 4, 0, 1, 2, 7, 11, 4],
	[7, 7, 2, 4, 0, 1, 5, 3, 1, 2, 0, 1],
	[0, 2, 6, 2, 2, 1, 2, 3, 6, 3, 7, 10],
	[9, 10, 8, 10, 6, 5, 8, 8, 24, 15, 10, 13],
	[9, 13, 16, 9, 4, 5, 7, 10, 14, 22, 23, 24],
	[20, 22, 28, 19, 28, 19, 14, 19, 51, 37, 29, 38],
	[29, 20, 22, 16, 16, 19, 24, 26, 57, 31, 46, 27],
	[36, 24, 38, 27, 15, 22, 24, 38, 32, 57, 139, 26],
	[37, 36, 32, 33, 12, 34, 52, 45, 58, 57, 64, 35],
	[36, 46, 45, 32, 27, 31, 30, 36, 39, 49, 0, 0],
	// [36, 46, 45, 32, 27, 31, 30, 36, 39, 49, 40, 40]
	// [-36, -46, -45, -32, -27, -31, -30, -36, -39, -49, -40, -40]
];

let c1 = document.querySelector("#chart-composite-1");
let c2 = document.querySelector("#chart-composite-2");

let bar_composite_chart = new Chart (c1, {
	title: "Fireball/Bolide Events - Yearly (more than 5 reports)",
	data: bar_composite_data,
	type: 'bar',
	height: 180,
	colors: ['orange'],
	isNavigable: 1,
	isSeries: 1,
	valuesOverPoints: 1,
	yAxisMode: 'tick'
	// regionFill: 1
});

let line_composite_chart = new Chart (c2, {
	data: line_composite_data,
	type: 'line',
	lineOptions: {
		dotSize: 10
	},
	height: 180,
	colors: ['green'],
	isSeries: 1,
	valuesOverPoints: 1,
});

bar_composite_chart.parent.addEventListener('data-select', (e) => {
	line_composite_chart.updateDataset(more_line_data[e.index]);
});


// Demo Chart (bar, linepts, scatter(blobs), percentage)
// ================================================================================
let type_data = {
	labels: ["12am-3am", "3am-6am", "6am-9am", "9am-12pm",
		"12pm-3pm", "3pm-6pm", "6pm-9pm", "9pm-12am"],

	yMarkers: [
		{
			label: "Marker 1",
			value: 42,
			type: 'dashed'
		},
		{
			label: "Marker 2",
			value: 25,
			type: 'dashed'
		}
	],

	yRegions: [
		{
			label: "Region Y 1",
			start: -10,
			end: 50
		},
	],

	// will depend on series code for calculating X values
	// xRegions: [
	// 	{
	// 		label: "Region X 2",
	// 		start: ,
	// 		end: ,
	// 	}
	// ],

	datasets: [
		{
			name: "Some Data",
			values: [18, 40, 30, 35, 8, 52, 17, -4],
			axisPosition: 'right',
			chartType: 'bar'
		},
		{
			name: "Another Set",
			values: [30, 50, -10, 15, 18, 32, 27, 14],
			axisPosition: 'right',
			chartType: 'bar'
		},
		{
			name: "Yet Another",
			values: [15, 20, -3, -15, 58, 12, -17, 37],
			chartType: 'line'
		}

		// temp : Stacked
		// {
		// 	name: "Some Data",
		// 	values:[25, 30, 50, 45, 18, 12, 27, 14]
		// },
		// {
		// 	name: "Another Set",
		// 	values: [18, 20, 30, 35, 8, 7, 17, 4]
		// },
		// {
		// 	name: "Another Set",
		// 	values: [11, 8, 19, 15, 3, 4, 10, 2]
		// },
	]
};

let type_chart = new Chart("#chart-types", {
	// title: "My Awesome Chart",
	data: type_data,
	type: 'bar',
	height: 250,
	colors: ['purple', 'magenta', 'light-blue'],
	isSeries: 1,
	xAxisMode: 'tick',
	yAxisMode: 'span',
	valuesOverPoints: 1,
	barOptions: {
		stacked: 1
	}
    // formatTooltipX: d => (d + '').toUpperCase(),
    // formatTooltipY: d => d + ' pts'
});

Array.prototype.slice.call(
	document.querySelectorAll('.chart-type-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let type = btn.getAttribute('data-type');

		let newChart = type_chart.getDifferentChart(type);
		if(newChart){
			type_chart = newChart;
		}
		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
});

// Trends Chart
// ================================================================================
let trends_data = {
	labels: [1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976,
		1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986,
		1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996,
		1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006,
		2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016] ,
	datasets: [
		{
			"values": [132.9, 150.0, 149.4, 148.0,  94.4,  97.6,  54.1,  49.2,  22.5, 18.4,
				39.3, 131.0, 220.1, 218.9, 198.9, 162.4,  91.0,  60.5,  20.6,  14.8,
				33.9, 123.0, 211.1, 191.8, 203.3, 133.0,  76.1,  44.9,  25.1,  11.6,
				28.9,  88.3, 136.3, 173.9, 170.4, 163.6,  99.3,  65.3,  45.8,  24.7,
				12.6,   4.2,   4.8,  24.9,  80.8,  84.5,  94.0, 113.3,  69.8,  39.8]
		}
	]
};

let plot_chart_args = {
	title: "Mean Total Sunspot Count - Yearly",
	data: trends_data,
	type: 'line',
	height: 250,
	colors: ['blue'],
	isSeries: 1,
	lineOptions: {
		hideDots: 1,
		heatline: 1,
	},
	xAxisMode: 'tick',
	yAxisMode: 'span'
};

new Chart("#chart-trends", plot_chart_args);

Array.prototype.slice.call(
	document.querySelectorAll('.chart-plot-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let type = btn.getAttribute('data-type');
		let config = [];

		if(type === 'line') {
			config = [0, 0, 0];
		} else if(type === 'region') {
			config = [0, 0, 1];
		} else {
			config = [0, 1, 0];
		}

		plot_chart_args.hideDots = config[0];
		plot_chart_args.heatline = config[1];
		plot_chart_args.regionFill = config[2];

		plot_chart_args.init = false;

		new Chart("#chart-trends", plot_chart_args);

		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
});

// Update values chart
// ================================================================================
let update_data_all_labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue",
	"Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri",
	"Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
let update_data_all_values = Array.from({length: 30}, () => Math.floor(Math.random() * 75 - 15));

// We're gonna be shuffling this
let update_data_all_indices = update_data_all_labels.map((d,i) => i);

let get_update_data = (source_array, length=10) => {
	let indices = update_data_all_indices.slice(0, length);
	return indices.map((index) => source_array[index]);
};

let update_data = {
	labels: get_update_data(update_data_all_labels),
	datasets: [{
		"values": get_update_data(update_data_all_values)
	}],
	"specific_values": [
		{
			name: "Altitude",
			// name: "A very long text",
			line_type: "dashed",
			value: 38
		},
	]
};

let update_chart = new Chart("#chart-update", {
	data: update_data,
	type: 'line',
	height: 250,
	colors: ['red'],
	isSeries: 1,
	lineOptions: {
		regionFill: 1
	},
});

let chart_update_buttons = document.querySelector('.chart-update-buttons');

chart_update_buttons.querySelector('[data-update="random"]').addEventListener("click", (e) => {
	shuffle(update_data_all_indices);
	let data = {
		labels: update_data_all_labels.slice(0, 10),
		datasets: [{values: get_update_data(update_data_all_values)}],
	}
	update_chart.update(data);
});

chart_update_buttons.querySelector('[data-update="add"]').addEventListener("click", (e) => {
	let index = update_chart.state.datasetLength; // last index to add
	if(index >= update_data_all_indices.length) return;
	update_chart.addDataPoint(
		update_data_all_labels[index], [update_data_all_values[index]]
	);
});

chart_update_buttons.querySelector('[data-update="remove"]').addEventListener("click", (e) => {
	update_chart.removeDataPoint();
});


// Event chart
// ================================================================================
let moon_names = ["Ganymede", "Callisto", "Io", "Europa"];
let masses = [14819000, 10759000, 8931900, 4800000];
let distances = [1070.412, 1882.709, 421.700, 671.034];
let diameters = [5262.4, 4820.6, 3637.4, 3121.6];

let jupiter_moons = {
	'Ganymede': {
		mass: '14819000 x 10^16 kg',
		'semi-major-axis': '1070412 km',
		'diameter': '5262.4 km'
	},
	'Callisto': {
		mass: '10759000 x 10^16 kg',
		'semi-major-axis': '1882709 km',
		'diameter': '4820.6 km'
	},
	'Io': {
		mass: '8931900 x 10^16 kg',
		'semi-major-axis': '421700 km',
		'diameter': '3637.4 km'
	},
	'Europa': {
		mass: '4800000 x 10^16 kg',
		'semi-major-axis': '671034 km',
		'diameter': '3121.6 km'
	},
};

let events_data = {
	labels: ["Ganymede", "Callisto", "Io", "Europa"],
	datasets: [
		{
			"values": distances,
			"formatted": distances.map(d => d*1000 + " km")
		}
	]
};

let events_chart = new Chart("#chart-events", {
	title: "Jupiter's Moons: Semi-major Axis (1000 km)",
	data: events_data,
	type: 'bar',
	height: 250,
	colors: ['grey'],
	isNavigable: 1,
});

let data_div = document.querySelector('.chart-events-data');

events_chart.parent.addEventListener('data-select', (e) => {
	let name = moon_names[e.index];
	data_div.querySelector('.moon-name').innerHTML = name;
	data_div.querySelector('.semi-major-axis').innerHTML = distances[e.index] * 1000;
	data_div.querySelector('.mass').innerHTML = masses[e.index];
	data_div.querySelector('.diameter').innerHTML = diameters[e.index];
	data_div.querySelector('img').src = "./assets/img/" + name.toLowerCase() + ".jpg";
});

// Aggregation chart
// ================================================================================
let aggr_data = {
	labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	datasets: [
		{
			"values": [25, 40, 30, 35, 8, 52, 17]
		},
		{
			"values": [25, 50, 10, 15, 18, 32, 27],
		}
	]
};

let aggr_chart = new Chart("#chart-aggr", {
	data: aggr_data,
	type: 'bar',
	height: 250,
	colors: ['light-green', 'blue'],
	valuesOverPoints: 1,
	barOptions: {
		// stacked: 1
	}
});

document.querySelector('[data-aggregation="sums"]').addEventListener("click", (e) => {
	if(e.target.innerHTML === "Show Sums") {
		aggr_chart.show_sums();
		e.target.innerHTML = "Hide Sums";
	} else {
		aggr_chart.hide_sums();
		e.target.innerHTML = "Show Sums";
	}
});

document.querySelector('[data-aggregation="average"]').addEventListener("click", (e) => {
	if(e.target.innerHTML === "Show Averages") {
		aggr_chart.show_averages();
		e.target.innerHTML = "Hide Averages";
	} else {
		aggr_chart.hide_averages();
		e.target.innerHTML = "Show Averages";
	}
});

// Heatmap
// ================================================================================

let heatmap_data = {};
let current_date = new Date();
let timestamp = current_date.getTime()/1000;
timestamp = Math.floor(timestamp - (timestamp % 86400)).toFixed(1); // convert to midnight
for (var i = 0; i< 375; i++) {
	heatmap_data[parseInt(timestamp)] = Math.floor(Math.random() * 5);
	timestamp = Math.floor(timestamp - 86400).toFixed(1);
}

new Chart("#chart-heatmap", {
	data: heatmap_data,
	type: 'heatmap',
	legend_scale: [0, 1, 2, 4, 5],
	height: 115,
	discrete_domains: 1
});

Array.prototype.slice.call(
	document.querySelectorAll('.heatmap-mode-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let mode = btn.getAttribute('data-mode');
		let discrete_domains = 0;

		if(mode === 'discrete') {
			discrete_domains = 1;
		}

		let colors = [];
		let colors_mode = document
			.querySelector('.heatmap-color-buttons .active')
			.getAttribute('data-color');
		if(colors_mode === 'halloween') {
			colors = ['#ebedf0', '#fdf436', '#ffc700', '#ff9100', '#06001c'];
		}

		new Chart("#chart-heatmap", {
			data: heatmap_data,
			type: 'heatmap',
			legend_scale: [0, 1, 2, 4, 5],
			height: 115,
			discrete_domains: discrete_domains,
			legend_colors: colors
		});

		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
});

Array.prototype.slice.call(
	document.querySelectorAll('.heatmap-color-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		let btn = e.target;
		let colors_mode = btn.getAttribute('data-color');
		let colors = [];

		if(colors_mode === 'halloween') {
			colors = ['#ebedf0', '#fdf436', '#ffc700', '#ff9100', '#06001c'];
		}

		let discrete_domains = 1;

		let view_mode = document
			.querySelector('.heatmap-mode-buttons .active')
			.getAttribute('data-mode');
		if(view_mode === 'continuous') {
			discrete_domains = 0;
		}

		new Chart("#chart-heatmap", {
			data: heatmap_data,
			type: 'heatmap',
			legend_scale: [0, 1, 2, 4, 5],
			height: 115,
			discrete_domains: discrete_domains,
			legend_colors: colors
		});

		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
			el.classList.remove('active');
		});
		btn.classList.add('active');
	});
});

// Helpers
// ================================================================================
function shuffle(array) {
	// https://stackoverflow.com/a/2450976/6495043
	// Awesomeness: https://bost.ocks.org/mike/shuffle/

	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}


