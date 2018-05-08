import { sampleData } from './data';

export const docSections = [
	{
		name: "start",
		contentBlocks: [
			{
				type: "text",
				content: `A chart is generally a 2D rendition of data. For example, f
					or a set of values across items, the data could look like:`
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
			{
				type: "text",
				content: `Plug that in with a type 'bar', a color and height:`
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
                    type: 'line',
                    height: 140,
                    colors: ['red'],
                },
			},
			{
				type: "text",
				content: `Similar is a 'line' chart:`
			},
			{
				type: "code",
				content: `    ...
    type: 'line',
    ...`
			},
			{
				type: "demo",
				config: {
                    data: sampleData[0],
                    type: 'bar',
                    height: 140,
                    colors: ['blue'],
                },
			}
		]
	},
	{
		title: "Adding more datasets",
		name: "multi-dataset",
		contentBlocks: [
			{
				type: "text",
				content: `Having more datasets, as in an axis chart, every dataset is represented individually.`
			},
			{
				type: "demo",
				config: {
                    data: sampleData[1],
                    type: 'line',
                    height: 200,
                    colors: ['yellow', 'light-green'],
                },
			}
		]
	}
]