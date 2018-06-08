import { lineCompositeData, barCompositeData } from './data';

export default {
	lineComposite: {
		elementID: "#chart-composite-1",
		options: {
			title: "Fireball/Bolide Events - Yearly (reported)",
			data: lineCompositeData,
			type: "line",
			height: 190,
			colors: ["green"],
			isNavigable: 1,
			valuesOverPoints: 1,

			lineOptions: {
				dotSize: 8
			}
		}
	},

	barComposite: {
		elementID: "#chart-composite-2",
		options: {
			data: barCompositeData,
			type: "bar",
			height: 210,
			colors: ["violet", "light-blue", "#46a9f9"],
			valuesOverPoints: 1,
			axisOptions: {
				xAxisMode: "tick"
			},
			barOptions: {
				stacked: 1
			}
		}
	},

	demoMain: {
		elementID: "",
		options: {
			title: "My Awesome Chart",
			data: "typeData",
			type: "axis-mixed",
			height: 300,
			colors: ["purple", "magenta", "light-blue"],
			maxSlices: 10,

			tooltipOptions: {
				formatTooltipX: d => (d + '').toUpperCase(),
				formatTooltipY: d => d + ' pts',
			}
		}
	}
}