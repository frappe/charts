## Day-based Month-wise data

The heatmap is a representation of day-wise data (similar to [the GitHub Contribution Graph]()). It spaces out data values linearly, across 5 levels (zero data kept exclusive).

In this case, the data has three parts,

```js
let heatmapData = {
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
(We are working on making the start date and end date implicit and optional). [tip]

The chart is rendered by the type `heatmap`:

```js

```

