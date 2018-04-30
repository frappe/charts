import { lineCompositeData, barCompositeData, typeData, getUpdateData,
    getAddUpdateData, trendsData, eventsData, moonData, heatmapData } from './data';
import { HEATMAP_COLORS_YELLOW, HEATMAP_COLORS_BLUE } from '../../../src/js/utils/constants';

export const lineComposite = {
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
}

export const barComposite = {
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
}

export const demoSections = [
    {
        title: "Create a Chart",
        name: "demo-main",
        contentBlocks: [
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
                    data: typeData,
                    type: "axis-mixed",
                    height: 300,
                    colors: ["purple", "magenta", "light-blue"],
                    maxSlices: 10,

                    tooltipOptions: {
                        formatTooltipX: d => (d + '').toUpperCase(),
                        formatTooltipY: d => d + ' pts',
                    }
                },
                options: [
                    {
                        name: "type",
                        path: ["type"],
                        type: "string",
                        states: {
                            "Mixed": 'axis-mixed',
                            "Line": 'line',
                            "Bar": 'bar',
                            "Pie Chart": 'pie',
                            "Percentage Chart": 'percentage',
                        },
                        activeState: "Mixed"
                    }
                ],
                actions: [{ name: "Export ...", fn: "export", args: [] }],
            }
        ]
    },

    {
        title: "Update Values",
        name: "updates-chart",
        contentBlocks: [
            {
                type: "demo",
                config: {
                    data: getUpdateData(),
                    type: 'line',
                    height: 300,
                    colors: ['#ff6c03'],
                    lineOptions: {
                        regionFill: 1
                    }
                },
                actions: [
                    {
                        name: "Random Data",
                        fn: "update",
                        args: [getUpdateData()]
                    },
                    {
                        name: "Add Value",
                        fn: "addDataPoint",
                        args: getAddUpdateData()
                    },
                    {
                        name: "Remove Value",
                        fn: "removeDataPoint",
                        args: []
                    },
                    {
                        name: "Export ...",
                        fn: "export",
                        args: []
                    }
                ]
            }
        ]
    },

	{
        title: "Plot Trends",
        name: "trends-plot",
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

    {
        title: "Listen to state change",
        name: "state-change",
        contentBlocks: [
            {
                type: "demo",
                config: {
                    title: "Jupiter's Moons: Semi-major Axis (1000 km)",
                    data: eventsData,
                    type: 'bar',
                    height: 330,
                    colors: ['grey'],
                    isNavigable: 1,
                },
                sideContent: `<div class="image-container border">
                    <img class="moon-image" src="./assets/img/europa.jpg">
                </div>
                <div class="content-data mt1">
                    <h6 class="moon-name">Europa</h6>
                    <p>Semi-major-axis: <span class="semi-major-axis">671034</span> km</p>
                    <p>Mass: <span class="mass">4800000</span>  x 10^16 kg</p>
                    <p>Diameter: <span class="diameter">3121.6</span> km</p>
                </div>`,
                postSetup: (chart, figure, row) => {
                    chart.parent.addEventListener('data-select', (e) => {
                        let i = e.index;
                        let name = moonData.names[i];
                        row.querySelector('.moon-name').innerHTML = name;
                        row.querySelector('.semi-major-axis').innerHTML = moonData.distances[i] * 1000;
                        row.querySelector('.mass').innerHTML = moonData.masses[i];
                        row.querySelector('.diameter').innerHTML = moonData.diameters[i];
                        row.querySelector('img').src = "./assets/img/" + name.toLowerCase() + ".jpg";
                    });
                }
            },
            {
                type: "code",
                lang: "javascript",
                content: `  ...
    isNavigable: 1, // Navigate across data points; default 0
  ...

  chart.parent.addEventListener('data-select', (e) => {
    update_moon_data(e.index); // e contains index and value of current datapoint
  });`,
            }
        ]
    },

	{
        title: "And a Month-wise Heatmap",
        name: "heatmap",
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
    },

    {
        title: "Demo",
        name: "codepen",
        contentBlocks: [
            {
                type: "custom",
                html: `<p data-height="299" data-theme-id="light" data-slug-hash="wjKBoq" data-default-tab="js,result"
                    data-user="pratu16x7" data-embed-version="2" data-pen-title="Frappe Charts Demo" class="codepen">
                    See the Pen <a href="https://codepen.io/pratu16x7/pen/wjKBoq/">Frappe Charts Demo</a>
                    by Prateeksha Singh (<a href="https://codepen.io/pratu16x7">@pratu16x7</a>) on
                    <a href="https://codepen.io">CodePen</a>.
                </p>`
            }
        ]
    },
    {
        title: "Available Options",
        name: "options",
        contentBlocks: [
            {
                type: "code",
                lang: "javascript",
                content: `
  ...
  {
    data: {
      labels: [],
      datasets: [],
      yRegions: [],
      yMarkers: []
    }
    title: '',
    colors: [],
    height: 200,

    tooltipOptions: {
      formatTooltipX: d => (d + '').toUpperCase(),
      formatTooltipY: d => d + ' pts',
    }

    // Axis charts
    isNavigable: 1,        // default: 0
    valuesOverPoints: 1,   // default: 0
    barOptions: {
      spaceRatio: 1        // default: 0.5
      stacked: 1           // default: 0
    }

    lineOptions: {
      dotSize: 6,          // default: 4
      hideLine: 0,         // default: 0
      hideDots: 1,         // default: 0
      heatline: 1,         // default: 0
      regionFill: 1        // default: 0
    }

    axisOptions: {
      yAxisMode: 'span',   // Axis lines, default
      xAxisMode: 'tick',   // No axis lines, only short ticks
      xIsSeries: 1         // Allow skipping x values for space
                           // default: 0
    },

    // Pie/Percentage charts
    maxLegendPoints: 6,    // default: 20
    maxSlices: 10,         // default: 20

    // Percentage chart
    barOptions: {
      height: 15           // default: 20
      depth: 5             // default: 2
    }

    // Heatmap
    discreteDomains: 1,    // default: 1
  }
  ...

  // Updating values
  chart.update(data);

  // Axis charts:
  chart.addDataPoint(label, valueFromEachDataset, index)
  chart.removeDataPoint(index)
  chart.updateDataset(datasetValues, index)

  // Exporting
  chart.export();

  // Unbind window-resize events
  chart.unbindWindowEvents();

  `
            }
        ]
    },

    {
        title: "Install",
        name: "installation",
        contentBlocks: [
            { type: "text", content: 'Install via npm' },
            { type: "code", lang: "console", content: `  npm install frappe-charts` },

            { type: "text", content: 'And include it in your project' },
            { type: "code", lang: "javascript", content: `  import { Chart } from "frappe-charts` },

            { type: "text", content: 'Use as:' },
            {
                type: "code",
                lang: "javascript",
                content: `  new Chart();          // ES6 module
                        // or
  new frappe.Chart();   // Browser`,
            },

            { type: "text", content: '... or include it directly in your HTML' },
            {
                type: "code",
                lang: "html",
                content: `  &lt;script src="https://unpkg.com/frappe-charts@1.1.0"&gt;&lt;/script&gt;`,
            },
        ]
    }
]
