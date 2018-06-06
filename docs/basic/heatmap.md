## Day-based Month-wise data

The heatmap is a representation of day-wise data (similar to [the GitHub Contribution Graph]()). It spaces out data values linearly, across 5 levels (zero data kept exclusive).

In this case, the data has three parts,

```js
let data = {
	dataPoints: {
		"1426744959": 20,
		"1463673055": 113,
		"1476892421": 57,
		// ...
	},
	start: startDate, // a JS date object
	end: endDate
}
```
(We are working on making the start date and end date implicit and optional).

The chart is rendered by the type `heatmap`:

```js
let chart = new Chart("#heatmap", {
    type: 'heatmap',
    data: data,
})
```
<project-demo data="heatmap-data" v-bind:config="{
		title: 'Monthly Distribution',
        type: 'heatmap',
	}">
</project-demo>

Setting `discreteDomains` to `0` allows for a continous distribution of heat squares (as on GitHub), rather than showing the month-wise separation. A different set of colors can also be specified.

```js
discreteDomains: 0, // default 1
colors: ['#ebedf0', '#c0ddf9', '#73b3f3', '#3886e1', '#17459e'],
```

<project-demo data="heatmap-data" v-bind:config="{
		title: 'Monthly Distribution',
        type: 'heatmap',
        height: 200,
		discreteDomains: 1,
		countLabel: 'Level',
		colors: ['#ebedf0', '#c0ddf9', '#73b3f3', '#3886e1', '#17459e'],
	}"
	v-bind:options="[
		{
			name: 'Discrete domains',
			path: ['discreteDomains'],
			type: 'Boolean',
			// boolNames: ['Continuous', 'Discrete'],
			states: { 'Discrete': 1, 'Continuous': 0 }
		},
		{
			name: 'Colors',
			path: ['colors'],
			type: 'Array',
			states: {
				'Green (Default)': [],
				'Blue': ['#ebedf0', '#c0ddf9', '#73b3f3', '#3886e1', '#17459e'],
				'Halloween': ['#ebedf0', '#fdf436', '#ffc700', '#ff9100', '#06001c']
			}
		}
	]">
</project-demo>

