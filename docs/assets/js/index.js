// Composite Chart
// ================================================================================
let report_count_list = [17, 40, 33, 44, 126, 156,
	324, 333, 478, 495, 373];

let bar_composite_data = {
	"labels": ["2007", "2008", "2009", "2010", "2011", "2012",
		"2013", "2014", "2015", "2016", "2017"],

	"datasets": [{
		"title": "Reports",
		"color": "orange",
		"values": report_count_list,
		// "formatted": report_count_list.map(d => d + " reports")
	}]
};

let line_composite_data = {
	"labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	"datasets": [{
		"color": "green",
		"values": [36, 46, 45, 32, 27, 31, 30, 36, 39, 49, 0, 0],
		// "formatted": ["₹ 0.00", "₹ 0.00", "₹ 0.00", "₹ 61,500.00", "₹ 82,936.88", "₹ 24,010.00", "₹ 0.00", "₹ 0.00", "₹ 25,840.00", "₹ 5,08,048.82", "₹ 1,16,820.00", "₹ 0.00"],
	}]
};

let more_line_data = {
	0: {values: [4, 0, 3, 1, 1, 2, 1, 2, 1, 0, 1, 1]},
	1: {values: [2, 3, 3, 2, 1, 4, 0, 1, 2, 7, 11, 4]},
	2: {values: [7, 7, 2, 4, 0, 1, 5, 3, 1, 2, 0, 1]},
	3: {values: [0, 2, 6, 2, 2, 1, 2, 3, 6, 3, 7, 10]},
	4: {values: [9, 10, 8, 10, 6, 5, 8, 8, 24, 15, 10, 13]},
	5: {values: [9, 13, 16, 9, 4, 5, 7, 10, 14, 22, 23, 24]},
	6: {values: [20, 22, 28, 19, 28, 19, 14, 19, 51, 37, 29, 38]},
	7: {values: [29, 20, 22, 16, 16, 19, 24, 26, 57, 31, 46, 27]},
	8: {values: [36, 24, 38, 27, 15, 22, 24, 38, 32, 57, 139, 26]},
	9: {values: [37, 36, 32, 33, 12, 34, 52, 45, 58, 57, 64, 35]},
	10: {values: [36, 46, 45, 32, 27, 31, 30, 36, 39, 49, 0, 0]}
};

let bar_composite_chart = new Chart ({
	parent: "#chart-composite-1",
	title: "Reposrts",
	data: bar_composite_data,
	type: 'bar',
	height: 180,
	is_navigable: 1
	// region_fill: 1
});

let line_composite_chart = new Chart ({
	parent: "#chart-composite-2",
	data: line_composite_data,
	type: 'line',
	height: 180
});

bar_composite_chart.parent.addEventListener('data-select', (e) => {
	line_composite_chart.update_values([more_line_data[e.index]]);
});


// Demo Chart (bar, linepts, scatter(blobs), percentage)
// ================================================================================
let type_data = {
	"labels": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	"datasets": [{
			"color": "light-blue",
			"values": [25, 40, 30, 35, 8, 52, 17]
		},
		{
			"color": "violet",
			"values": [25, 50, -10, 15, 18, 32, 27]

		},
		{
			"color": "blue",
			"values": [15, 20, -3, -15, 58, 12, -17]
		}
	]
};

let update_data_all_labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
	"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed",
	"Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];
let update_data_all_values = [25, 40, 30, 35, 48, 52, 17, 15, 20, -3, -15, 58,
	12, -17, 35, 48, 40, 30, 52, 17, 25, 5, 48, 52, 17];

// We're gonna be shuffling this
let update_data_all_indices = update_data_all_labels.map((d,i) => i);

let get_update_data = (source_array, length=10) => {
	let indices = update_data_all_indices.slice(0, length);
	return indices.map((index) => source_array[index]);
};

let update_data = {
	"labels": get_update_data(update_data_all_labels),
	"datasets": [{
		"color": "red",
		"values": get_update_data(update_data_all_values)
	}],
	"specific_values": [
		{
			title: "Altitude",
			// title: "Altiteragrwst ude",
			line_type: "dashed",
			value: 38
		},
	]
};

let events_data = {
	"labels": ["Sun", "Mon", "Tue", "Wed", "Thu"],
	"datasets": [{
			"color": "light-green",
			"values": [25, 40, 30, 35, 48]
		}
	]
};

let aggr_data = {
	"labels": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	"datasets": [{
			"color": "purple",
			"values": [25, 40, 30, 35, 8, 52, 17]
		},
		{
			"color": "orange",
			"values": [25, 50, -10, 15, 18, 32, 27]

		}
	]
};

let heatmap_data = {
	1479753000.0: 1,
	1498588200.0: 1,
	1499193000.0: 1,
	1499625000.0: 2,
	1500921000.0: 1,
	1501612200.0: 1,
	1502994600.0: 1,
	1503858600.0: 1,
	1504809000.0: 3,
	1505241000.0: 1,
	1506277800.0: 2
};


// Charts
// ================================================================================


let type_chart = new Chart({
	parent: "#chart-types",
	data: type_data,
	type: 'bar',
	height: 250,
	// region_fill: 1,
	// y_axis_mode: 'tick'
});

let update_chart = new Chart({
	parent: "#chart-update",
	data: update_data,
	type: 'line',
	height: 250,
	region_fill: 1
});

let events_chart = new Chart({
	parent: "#chart-events",
	data: events_data,
	type: 'bar',
	height: 250,
	is_navigable: 1,
});

let aggr_chart = new Chart({
	parent: "#chart-aggr",
	data: aggr_data,
	type: 'bar',
	height: 250
});

let heatmap = new Chart({
	parent: "#chart-heatmap",
	data: heatmap_data,
	type: 'heatmap',
	height: 100,
	// discrete_domains: 1
});

// Events
// ================================================================================

Array.prototype.slice.call(
	document.querySelectorAll('.chart-type-buttons button')
).map(el => {
	el.addEventListener('click', (e) => {
		btn = e.target;
		let type = btn.getAttribute('data-type');

		type_chart = type_chart.get_different_chart(type);

		Array.prototype.slice.call(
			btn.parentNode.querySelectorAll('button')).map(el => {
				el.classList.remove('active');
			});
		btn.classList.add('active');
	});
});



let chart_update_buttons = document.querySelector('.chart-update-buttons');

chart_update_buttons.querySelector('[data-update="random"]').addEventListener("click", (e) => {
	shuffle(update_data_all_indices);
	update_chart.update_values(
		[{values: get_update_data(update_data_all_values)}],
		get_update_data(update_data_all_labels)
	);
});

chart_update_buttons.querySelector('[data-update="add"]').addEventListener("click", (e) => {
	// NOTE: this ought to be problem, labels stay the same after update
	let index = update_chart.x.length; // last index to add
	if(index >= update_data_all_indices.length) return;
	update_chart.add_data_point(
		[update_data_all_values[index]], update_data_all_labels[index]
	);
});

chart_update_buttons.querySelector('[data-update="remove"]').addEventListener("click", (e) => {
	update_chart.remove_data_point();
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
	if(e.target.innerHTML === "Show Average") {
		aggr_chart.show_average();
		e.target.innerHTML = "Hide Average";
	} else {
		aggr_chart.hide_average();
		e.target.innerHTML = "Show Average";
	}
});

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
