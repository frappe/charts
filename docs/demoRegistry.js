import { sampleData, trendsData } from './assets/js/data';

export const demoRegistry = {
	'bar-basic-1': {
		config: {
			data: sampleData[0],
			type: 'bar',
			height: 140,
			colors: ['red'],
		}
	},

	'line-basic-1': {
		config: {
			data: sampleData[0],
			type: 'line',
			height: 140,
			colors: ['red'],
		}
	},

	'bar-axis-tick': {
		config: {
			data: sampleData[2],
			type: 'bar',
			height: 140,
			colors: ['blue'],
			axisOptions: {
				xAxisMode: "tick",
			},
		},
	},

	'bar-barwidth': {
		config: {
			data: sampleData[3],
			type: 'bar',
			height: 140,
			colors: ['orange'],
			axisOptions: {
				xAxisMode: "tick"
			},
			barOptions: {
				spaceRatio: 0.2
			},
		},
		options: [
			{
				name: "barOptions",
				path: ["barOptions"],
				type: "map",
				mapKeys: ['spaceRatio'],
				states: {
					"0.2": [0.2],
					"0.5": [0.5],
					"1": [1],
					"1.5": [1.5]
				},
				activeState: "0.2"
			}
		]
	},

	'line-dotsize': {
		config: {
			data: sampleData[2],
			type: 'line',
			height: 140,
			colors: ['orange'],
			axisOptions: {
				xAxisMode: "tick"
			},
			lineOptions: {
				dotSize: 8
			}
		},
		options: [
			{
				name: "lineOptions",
				path: ["lineOptions"],
				type: "map",
				mapKeys: ['dotSize'],
				states: {
					"3": [3],
					"4": [4],
					"8": [8],
					"10": [10],
				},
				activeState: "8"
			}
		]
	},

	'line-trends-region-toggle': {
		config: {
			data: trendsData,
			type: 'line',
			height: 180,
			colors: ['violet'],
			axisOptions: {
				xAxisMode: 'tick',
				yAxisMode: 'span',
				xIsSeries: 1
			}
		},
		options: [
			{
				name: "lineOptions",
				path: ["lineOptions"],
				type: "map",
				mapKeys: ['hideLine', 'hideDots', 'heatline', 'regionFill'],
				states: {
					"Line": [0, 1, 0, 0],
					"Dots": [1, 0, 0, 0],
					"HeatLine": [0, 1, 1, 0],
					"Region": [0, 1, 0, 1]
				},
				activeState: "HeatLine"
			}
		]
	},

	'multi-dataset-line-bar': {
		config: {
			data: sampleData[1],
			type: 'line',
			height: 200,
			colors: ['green', 'light-green'],
		},
		options: [
			{
				name: "type",
				path: ["type"],
				type: "string",
				states: {
					"Line": 'line',
					"Bar": 'bar',
				},
				activeState: "Mixed"
			}
		],
	},

	// '': {},
};