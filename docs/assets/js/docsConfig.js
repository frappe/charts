import { sampleData, trendsData } from './data';

export const docSections = [
	{
		name: "start",
		contentBlocks: [
			// Intro
			{
				type: "text",
				content: `A chart is generally a 2D rendition of data. For example,
					for a set of values across items, the data could look like:`
			},
			{
				type: "code",
				content: `  data = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
	  { values: [18, 40, 30, 35, 8, 52, 17, -4] }
    ]
  }`
			},

			// type: 'bar'
			{
				type: "text",
				content: `Plug that in with a type <b>bar</b>, a color and height:`
			},
			{
				type: "code",
				content: `  new frappe.Chart( "#chart", {
    data: data,
    type: 'bar',
    height: 140,
    colors: ['red']
  });`
			},
			{
				type: "demo",
				config: {
                    data: sampleData[0],
                    type: 'bar',
                    height: 140,
                    colors: ['red'],
                },
			},

			// type: 'line'
			{
				type: "text",
				content: `And similarly, a <b>line</b> chart:`
			},
			{
				type: "code",
				content: `  ...
  type: 'line',
  ...`
			},
			{
				type: "demo",
				config: {
                    data: sampleData[0],
                    type: 'line',
                    height: 140,
                    colors: ['red'],
                },
			},

			// Axes lines:
			{
				type: "text",
				content: `Axes lines are configurable. By default they are long
					<b>span</b>ning lines, but can also be short <b>tick</b>s:`
			},
			{
				type: "code",
				content: `  ...
  axisOptions: {
    xAxisMode: 'tick' // default: 'span'
  },
  ...`
			},
			{
				type: "demo",
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

			// Bar width:
			{
				type: "text",
				content: `The bar <b>width</b> can be set by defining the <b>ratio of the space</b>
					between bars to the bar width.`
			},
			{
				type: "code",
				content: `  ...
  barOptions: {
    spaceRatio: 0.2 // default: 1
  },
  ...`
			},
			{
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

			// Dot radius:
			{
				type: "text",
				content: 'So can the <b>dot size</b> on a line graph, with the `dotSize` property in `lineOptions`.'
			},
			{
				type: "code",
				content: `  ...
  lineOptions: {
    dotRadius: 8 // default: 4
  },
  ...`
			},
			{
				type: "demo",
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
		]
	},
	{
		title: "Trends and region charts",
		name: "trends-and-region",
		contentBlocks: [
			{
				type: "text",
				content: 'lineOptions` have a bunch of other properties too. Region charts are'
			},
			{
				type: "code",
				content: `  ...
  data: {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      { name: "Dataset 1", values: [18, 40, 30, 35, 8, 52, 17, -4] },
      { name: "Dataset 2", values: [30, 50, -10, 15, 18, 32, 27, 14] }
    ]
  },
  ...`
			},
			{
				type: "demo",
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
			}
		]
	},
	{
		title: "Adding more datasets",
		name: "multi-dataset",
		contentBlocks: [
			{
				type: "text",
				content: `A chart can have multiple datasets. In an axis chart, every dataset is represented individually.`
			},
			{
				type: "code",
				content: `  ...
  data: {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      { name: "Dataset 1", values: [18, 40, 30, 35, 8, 52, 17, -4] },
      { name: "Dataset 2", values: [30, 50, -10, 15, 18, 32, 27, 14] }
    ]
  },
  ...`
			},
			{
				type: "demo",
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
			}
		]
	}
]