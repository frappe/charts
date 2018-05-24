Annotations are for special values (like range points). They are defined within the `data` property itself.

## Markers

To highlight certain values on the Y axis, `yMarkers` can be set. They will shown ad dotted lines on the graph.

```js
data = {
	// labels: [],
	// datasets: [],
	yMarkers: [
		{
			label: "Marker",
			value: 43,
			options: { labelPos: 'right' }
		}
	]
}
```

[demo only marker]

## Regions

2D counterparts to markers, they have a `start` and `end` instead of value:

```js
yRegions: [
	{
		label: "Region",
		start: -10,
		end: 50,
		options: { labelPos: 'left' }
	},
],
```
Shown as a a greyed out area between the extremes.

[demo only region]

## Tooltips

Tooltips are by default
[demo format]
