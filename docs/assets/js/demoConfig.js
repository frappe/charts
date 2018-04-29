import { lineCompositeData, barCompositeData, trendsData, heatmapData } from './data';
import { HEATMAP_COLORS_YELLOW, HEATMAP_COLORS_BLUE } from '../../../src/js/utils/constants';

export default {
	lineComposite: {
		config: {
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
		config: {
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
        title: "Creating a Chart",
        contentBlocks: [
            {
                type: "text",
                content: `Booga wooga wooga Booga Booga wooga`,
            },
            {
                type: "code",
                lang: "html",
                content: `  &lt!--HTML--&gt;
  &lt;figure id="frost-chart"&gt;&lt;/figure&gt;`,
            },
            {
                type: "code",
                lang: "javascript",
                content: `  // Javascript
  let chart = new frappe.Chart( "#frost-chart", { // or DOM element
    data: {
    labels: ["12am-3am", "3am-6am", "6am-9am", "9am-12pm",
      "12pm-3pm", "3pm-6pm", "6pm-9pm", "9pm-12am"],

    datasets: [
      {
        name: "Some Data", chartType: 'bar',
        values: [25, 40, 30, 35, 8, 52, 17, -4]
      },
      {
        name: "Another Set", chartType: 'bar',
        values: [25, 50, -10, 15, 18, 32, 27, 14]
      },
      {
        name: "Yet Another", chartType: 'line',
        values: [15, 20, -3, -15, 58, 12, -17, 37]
      }
    ],

    yMarkers: [{ label: "Marker", value: 70,
      options: { labelPos: 'left' }}],
    yRegions: [{ label: "Region", start: -10, end: 50,
      options: { labelPos: 'right' }}]
    },

    title: "My Awesome Chart",
    type: 'axis-mixed', // or 'bar', 'line', 'pie', 'percentage'
    height: 300,
    colors: ['purple', '#ffa3ef', 'light-blue'],

    tooltipOptions: {
      formatTooltipX: d => (d + '').toUpperCase(),
      formatTooltipY: d => d + ' pts',
    }
  });

  chart.export();`,
            },
            {
                type: "demo",
                config: {
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
                },
                sideContent: {},
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
                ],
                actions: [{ name: "Export ...", fn: "export", args: [] }],
            }
        ]
    },

    updateValues: { },

	trendsPlot: {
        title: "Plot Trends",
        contentBlocks: [
            {
                type: "demo",
                config: {
                    title: "Mean Total Sunspot Count - Yearly",
                    data: trendsData,
                    type: 'line',
                    height: 300,
                    colors: ['#238e38'],
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
                ],
                actions: [{ name: "Export ...", fn: "export", args: [] }]
            }
        ],

    },

    stateChange: {},

	heatmap: {
        title: "And a Month-wise Heatmap",
        contentBlocks: [
            {
                type: "demo",
                config: {
                    title: "Monthly Distribution",
                    data: heatmapData,
                    type: 'heatmap',
                    discreteDomains: 1,
                    countLabel: 'Level',
                    colors: HEATMAP_COLORS_BLUE,
                    legendScale: [0, 1, 2, 4, 5]
                },
                options: [
                    {
                        name: "Discrete domains",
                        path: ["discreteDomains"],
                        type: 'boolean',
                        // boolNames: ["Continuous", "Discrete"],
                        states: { "Discrete": 1, "Continuous": 0 }
                    },
                    {
                        name: "Colors",
                        path: ["colors"],
                        type: "object",
                        states: {
                            "Green (Default)": [],
                            "Blue": HEATMAP_COLORS_BLUE,
                            "GitHub's Halloween": HEATMAP_COLORS_YELLOW
                        }
                    }
                ],
                actions: [{ name: "Export ...", fn: "export", args: [] }]
            },
            {
                type: "code",
                lang: "javascript",
                content: `  let heatmap = new frappe.Chart("#heatmap", {
    type: 'heatmap',
    title: "Monthly Distribution",
    data: {
    dataPoints: {'1524064033': 8, /* ... */},
                        // object with timestamp-value pairs
      start: startDate
      end: endDate      // Date objects
    },
    countLabel: 'Level',
    discreteDomains: 0  // default: 1
    colors: ['#ebedf0', '#c0ddf9', '#73b3f3', '#3886e1', '#17459e'],
                // Set of five incremental colors,
                // preferably with a low-saturation color for zero data;
                // def: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
  });`,
            }
        ],
    }
}
