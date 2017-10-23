let bar_data = {
	// "labels": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
	"labels": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
	"datasets": [{
			"color": "orange",
			// "values": [50804, 10000, 20000, -61500, 82936.88, 24010, 4000, 6000, 25840, 50804.82, 116820, 6000],
			"values": [50804, 10000, 20000, 61500, 82936.88, 24010, 40000, 60000, 25840, 50804.82, 116820],
			// "values": [-108048, 0, 0, -101500, -50000.88, 24010, 0, 0, 25840, 108048.82, 51682, 0],
			"formatted": ["₹ 0.00", "₹ 0.00", "₹ 0.00", "₹ 61,500.00", "₹ 82,936.88", "₹ 24,010.00", "₹ 0.00", "₹ 0.00", "₹ 25,840.00", "₹ 5,08,048.82", "₹ 1,16,820.00", "₹ 0.00"],
		}
		,
		{
			"color": "blue",
			// "values": [-108048, 0, 0, -101500, -50000.88, 24010, 0, 0, 25840, 108048.82, 51682, 0],
			"values": [108048, 0, 0, 101500, 50000.88, 24010, 0, 0, 25840, 108048.82, 51682],
			"formatted": ["₹ 0.00", "₹ 0.00", "₹ 0.00", "₹ 61,500.00", "₹ 82,936.88", "₹ 24,010.00", "₹ 0.00", "₹ 0.00", "₹ 25,840.00", "₹ 5,08,048.82", "₹ 1,16,820.00", "₹ 0.00"],
		}
	]
}

let line_data = {
	"labels": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	"datasets": [{
			"color": "green",
			"values": [25, 40, 30, 35, 48, 52, 17],
			// "values": [25, -90, -30, 35, 48, 52, -17]

		},
		// {
		// 	"color": "yellow",
		// 	// "values": [25, 40, 30, 35, 48, 52, 17],
		// 	"values": [25, -90, -30, 35, 48, 52, -17]

		// }
	]
};

let more_line_data = {
	0: [{values: [25, -90, -30, 35, 48, 52, -17]}, ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]],
	1: [{values: [25, -40, -30, 35, 48, 52]}, ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]],
	2: [{values: [5, 48, -52, 17, -25, 40, 30, 20, -25, 40, 30, 20]}, ["Thu", "Fri", "Sat", "Sun", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]],
	// 3: {
	// 	values: [25, 40, 30, 35, 48, 52, 17, 20, 30, 40]
	// },
	// 4: {
	// 	values: [35, 48, 40, 30, 52, 17, 72]
	// },
	// 5: {
	// 	values: [5, 48, 52, 17, 72, 40, 30]
	// },
	// 6: {
	// 	values: [72, 40, 30, 35, 48, 52, 17]
	// },
	// 7: {
	// 	values: [35, 48, 40, 30, 52, 17, 25]
	// },
	// 8: {
	// 	values: [5, 48, 52, 17, 25, 40, 30]
	// },
	// 9: {
	// 	values: [25, 40, 30, 35, 48, 52, 17]
	// },
	// 10: {
	// 	values: [35, 48, 40, 30, 52, 17, 25]
	// },
	// 11: {
	// 	values: [5, 48, 52, 17, 25, 40, 30]
	// }
}

let line_chart = new frappe.chart.FrappeChart ({
	parent: "#charts-2",
	data: line_data,
	type: 'line',
	height: 340,
	region_fill: 1,
	// y_axis_mode: 'tick'
})

let bar_chart = new frappe.chart.FrappeChart ({
	parent: "#charts-1",
	data: bar_data,
	type: 'bar',
	height: 140,
	is_navigable: 1,
	// region_fill: 1
})

bar_chart.parent.addEventListener('data-select', (e) => {
	line_chart.update_values([more_line_data[e.index][0]], more_line_data[e.index][1]);
});

// console.log("chart", bar_chart);

let percentage_data = {};

let heatmap_data = {};

// update_test() {
// 	setTimeout(() => {
// 		this.update_values([{values: [0, 0, 0, 21500, 50000.88, 24010, 0, 0, 25840, 108048.82, 516820, 0]},
// 			{values: [0, 0, 0, 21500, 80000.88, 24010, 20000, 20000, 15840, 508048.82, 116820, 0]}]);
// 		setTimeout(() => {
// 			this.update_values([{values: [0, 0, 0, 21500, 80000.88, 24010, 20000, 20000, 15840, 508048.82, 116820, 0]},
// 				{values: [0, 0, 0, 21500, 50000.88, 24010, 0, 0, 25840, 108048.82, 516820, 0]}]);
// 			setTimeout(() => {
// 				this.update_values([{values: [0, 0, 0, 101500, 50000.88, 24010, 0, 0, 25840, 108048.82, 516820, 0]},
// 					{values: [0, 0, 0, 21500, 80000.88, 24010, 20000, 20000, 15840, 508048.82, 116820, 0]}]);

// 			}, 300);
// 		}, 300);
// 	}, 300);
// }