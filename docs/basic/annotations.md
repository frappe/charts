## Annotations
Special values (like range points) on a chart can be annotated for quick comparisions. As they are among the components of a graph that can be updated, they are defined within the `data` property itself. There are two kinds of annotations that can be used to mark the vertical axis values: **markers** and **regions**.

#### Markers

To highlight certain values on the Y axis, `yMarkers` can be set. They will shown as dashed lines on the graph.

```js
data = {
	// labels: [],
	// datasets: [],
	yMarkers: [
		{
			label: "Threshold",
			value: 650,
			options: { labelPos: 'left' } // default: 'right'
		}
	]
}
```
<chart-demo data="ymarkers"
	v-bind:config="{
		type: 'line',
		height: 180,
		colors: ['violet'],
		axisOptions: {
			yAxisMode: 'tick'
		},
	}">
</chart-demo>

#### Regions

2D counterparts to markers, they have a `start` and `end` instead of value:

```js
yRegions: [
	{
		label: "Optimum Value",
		start: 100,
		end: 600,
		options: { labelPos: 'right' }
	}
],
```
Shown as a greyed-out area between the extremes.
<chart-demo data="yregions"
	v-bind:config="{
		type: 'line',
		height: 180,
		colors: ['violet'],
		axisOptions: {
			yAxisMode: 'tick'
		},
	}">
</chart-demo>

## Tooltips

Frappe Charts are known for their [awesome tooltips](https://twitter.com/Elijah_Meeks/status/934338534143488000). What's more, they are also customizable for the format of the label and value displayed on them.

```js
tooltipOptions: {
	formatTooltipX: d => (d + '').toUpperCase(),
	formatTooltipY: d => d + ' pts',
}
```

<chart-demo data="0"
	v-bind:config="{
		type: 'line',
		height: 150,
		colors: ['violet'],
		axisOptions: {
			yAxisMode: 'tick'
		},
		tooltipOptions: {
			formatTooltipX: d => (d + '').toUpperCase(),
			formatTooltipY: d => d + ' pts',
		}
	}">
</chart-demo>

For a non-web or static interface, where tooltips are absent, `valuesOverPoints` is a useful tweak to show value information at a glance.

```js
{
	valuesOverPoints: 1 // default: 0
}
```
<chart-demo data="1" v-bind:config="{
        type: 'line',
        height: 200,
        colors:['violet', 'magenta'],
		valuesOverPoints: 1
    }"
    v-bind:options="[
        {
            name: 'type',
            path: ['type'],
            type: 'string',
            states: { 'Bar': 'bar', 'Line': 'line' },
            activeState: 'Bar'
        }
    ]">
</chart-demo>

Next up we'll look at perhaps one the more exciting parts in axis charts: **Mixed Charts**.
