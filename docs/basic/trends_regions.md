## Area Chart
An area chart is derived from a line chart, by marking the area between the X axis and the line plot. It is usually used to compare the areas under the curve for two or more different plots.

```js
lineOptions: {
	areaFill: 1 // default: 0
},
```
<project-demo data="1"
	v-bind:config="{
		type: 'line',
		height: 240,
		colors: ['violet'],
		lineOptions: {
			areaFill: 1
		},
	}">
</project-demo>

## Plotting Trends
Line charts are great to show trends. One of the reasons they are interesting is because the data involved usually involves a large number of data points. For so many points, we'd really like to keep the plot as less detailed as we can, while also using the already present color to advantage. Let's see how we can change some properties of a default line chart can reduce clutter.

## Continuity
The X axis (often the time axis) is usually continuous. That means we can reduce the redundancy of rendering every X label by allowing for only a few periodic ones.


We can skip X labels by setting the `xIsSeries` property in `axisOptions` to `true`.



```js
axisOptions: {
	xIsSeries: true // default: false
},
```
This results only some of the X ticks having a label.
<project-demo data="trends-data"
	v-bind:config="{
		type: 'line',
		height: 180,
		colors: ['violet'],
		axisOptions: {
			xAxisMode: 'tick',
			xIsSeries: 1
		}
	}">
</project-demo>

The line plot in the above plot could still be simplified. For example, to maintain uniformity, we could opt out of showing the dots at all, with `hideDots`.
```js
lineOptions: {
	hideDots: 1 // default: 0
},
```
<project-demo data="trends-data"
	v-bind:config="{
		type: 'line',
		height: 180,
		colors: ['violet'],
		axisOptions: {
			xAxisMode: 'tick',
			xIsSeries: 1
		},
		lineOptions: {
			hideDots: 1
		},
	}">
</project-demo>

Or you could just choose to show only the dots instead.
```js
lineOptions: {
	hideLine: 1 // default: 0
},
```
<project-demo data="trends-data"
	v-bind:config="{
		type: 'line',
		height: 180,
		colors: ['violet'],
		axisOptions: {
			xAxisMode: 'tick',
			xIsSeries: 1
		},
		lineOptions: {
			hideLine: 1
		},
	}">
</project-demo>
Needless to say, turning both of them on would be too amusing to be of any use :)

A subtle way to show gradation of values is to render a change in color with the magnitude of the values. The property that does this is called `heatline`.
```js
lineOptions: {
	heatline: 1 // default: 0
},
```
<project-demo data="trends-data"
	v-bind:config="{
		type: 'line',
		height: 180,
		colors: ['violet'],
		axisOptions: {
			xAxisMode: 'tick',
			xIsSeries: 1
		},
		lineOptions: {
			hideDots: 1,
			heatline: 1
		},
	}">
</project-demo>

## Combinations
Here's a demo using different combinations of the line options.

<project-demo data="trends-data"
	v-bind:config="{
		type: 'line',
		height: 200,
		colors: ['violet'],
		axisOptions: {
			xAxisMode: 'tick',
			xIsSeries: 1
		}
	}"x
    v-bind:options="[
		{
			name: 'lineOptions',
			path: ['lineOptions'],
			type: 'Map',
			mapKeys: ['hideLine', 'hideDots', 'heatline', 'areaFill'],
			states: {
				'Line': [0, 1, 0, 0],
				'Dots': [1, 0, 0, 0],
				'HeatLine': [0, 1, 1, 0],
				'Area': [0, 1, 0, 1]
			},
			activeState: 'Area'
		}
    ]">
</project-demo>

Next up, we'll start to annotate the data in charts.



































