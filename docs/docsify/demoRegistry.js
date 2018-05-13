import { sampleData, trendsData } from '../assets/js/data';

export const demoRegistry = {
	demo1: {
		type: "demo",
		config: {
			data: sampleData[0],
			type: 'bar',
			height: 140,
			colors: ['red'],
		},
	},

	demo2: {
		type: "demo",
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
};